import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const TOKEN = "cvt_" + "a1B2c3D4".repeat(4);
const build = (env) => execFileSync("node", ["scripts/build.mjs"], { cwd: root, env: { PATH: process.env.PATH, ...env }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const built = () => readFileSync(join(root, "dist", "config.js"), "utf8");

test("without variables the repository config.js is copied", () => {
  build({});
  assert.equal(built(), readFileSync(join(root, "config.js"), "utf8"));
});

test("WIDGET_TOKEN and CONVERSATIONS_URL are written into the built config", () => {
  build({ WIDGET_TOKEN: TOKEN, CONVERSATIONS_URL: "https://chat.example.com/ignored/path" });
  const cfg = built();
  assert.match(cfg, new RegExp(`"widgetToken": "${TOKEN}"`));
  assert.match(cfg, /"conversationsUrl": "https:\/\/chat\.example\.com"/);
});

test("an empty WIDGET_TOKEN leaves the widget disabled instead of failing", () => {
  build({ WIDGET_TOKEN: "" });
  assert.match(built(), /"widgetToken": ""/);
});

test("a malformed token or URL fails the build instead of shipping", () => {
  assert.throws(() => build({ WIDGET_TOKEN: "not-a-token" }), /does not look like a widget token/);
  assert.throws(() => build({ WIDGET_TOKEN: '"};alert(1);//' }), /does not look like a widget token/);
  for (const bad of ["javascript:alert(1)", "http://chat.example.com", "https://u:p@x.example"]) {
    assert.throws(() => build({ CONVERSATIONS_URL: bad }), /not a valid https URL/, bad);
  }
});

test("the page loads config.js before the module that reads it, and has the status element", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");
  assert.ok(html.indexOf('src="config.js"') < html.indexOf('src="src/widget.js"'));
  assert.match(html, /id="chat-status"/);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="viewport"/);
});
