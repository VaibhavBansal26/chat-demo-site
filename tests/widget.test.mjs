import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeOrigin, plan, start, validToken } from "../src/widget.js";

const TOKEN = "cvt_" + "a1B2c3D4".repeat(4);

test("normalizeOrigin keeps only a plain https origin", () => {
  assert.equal(normalizeOrigin("https://chat.example.com/some/path?x=1#y"), "https://chat.example.com");
  assert.equal(normalizeOrigin("  https://chat.example.com  "), "https://chat.example.com");
  assert.equal(normalizeOrigin("http://localhost:3000"), "http://localhost:3000");
});

test("normalizeOrigin rejects unsafe or malformed values", () => {
  for (const bad of ["javascript:alert(1)", "http://chat.example.com", "ftp://x.example", "//x.example", "chat.example.com", "https://u:p@x.example", "", null, undefined, 5, {}]) {
    assert.equal(normalizeOrigin(bad), null, String(bad));
  }
});

test("validToken accepts widget tokens only", () => {
  assert.equal(validToken(TOKEN), true);
  for (const bad of ["", "cvt_", "cvt_short", "abc_" + "a".repeat(32), "cvt_" + "a".repeat(80), "cvt_ " + "a".repeat(32), "cvt_<script>alert(1)</script>", null, 7]) {
    assert.equal(validToken(bad), false, String(bad));
  }
});

test("plan decides between embedding and explaining what is missing", () => {
  assert.deepEqual(plan({ conversationsUrl: "https://c.example", widgetToken: TOKEN }), { action: "embed", origin: "https://c.example", token: TOKEN });
  assert.deepEqual(plan({ conversationsUrl: "https://c.example", widgetToken: "" }), { action: "setup", missing: "widgetToken" });
  assert.deepEqual(plan({ conversationsUrl: "https://c.example", widgetToken: "nope" }), { action: "setup", missing: "widgetToken", invalid: true });
  assert.deepEqual(plan({ conversationsUrl: "javascript:1", widgetToken: TOKEN }), { action: "setup", missing: "conversationsUrl" });
  for (const bad of [undefined, null, "x", 3, []]) assert.equal(plan(bad).action, "setup");
});

function fakeDom() {
  const appended = [];
  const note = { hidden: true, textContent: "" };
  const doc = {
    getElementById: (id) => (id === "chat-status" ? note : null),
    createElement: () => ({ dataset: {} }),
    body: { appendChild: (el) => appended.push(el) },
  };
  const fetched = [];
  const win = { SITE_CONFIG: undefined, fetch: (url, opts) => (fetched.push([url, opts]), Promise.resolve()) };
  return { doc, win, note, appended, fetched };
}

test("start embeds the widget script with the token and warms the server up", () => {
  const { doc, win, note, appended, fetched } = fakeDom();
  win.SITE_CONFIG = { conversationsUrl: "https://c.example", widgetToken: TOKEN };
  assert.equal(start(win, doc).action, "embed");
  assert.equal(appended.length, 1);
  assert.equal(appended[0].src, "https://c.example/widget.js");
  assert.equal(appended[0].dataset.token, TOKEN);
  assert.equal(appended[0].async, true);
  assert.equal(note.hidden, true);
  assert.equal(fetched[0][0], "https://c.example/healthz");
  assert.equal(fetched[0][1].mode, "no-cors");
});

test("start without a token shows the setup note and loads nothing", () => {
  const { doc, win, note, appended, fetched } = fakeDom();
  win.SITE_CONFIG = { conversationsUrl: "https://c.example", widgetToken: "" };
  assert.equal(start(win, doc).action, "setup");
  assert.equal(appended.length, 0);
  assert.equal(fetched.length, 0);
  assert.equal(note.hidden, false);
  assert.match(note.textContent, /WIDGET_TOKEN/);
});

test("a failing warm-up request never breaks the page", () => {
  const { doc, win, appended } = fakeDom();
  win.SITE_CONFIG = { conversationsUrl: "https://c.example", widgetToken: TOKEN };
  win.fetch = () => {
    throw new Error("offline");
  };
  assert.equal(start(win, doc).action, "embed");
  assert.equal(appended.length, 1);
});
