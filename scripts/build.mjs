// Copies the site into dist/. WIDGET_TOKEN and CONVERSATIONS_URL (optional) overwrite dist/config.js, validated with the same rules the page uses.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { normalizeOrigin, validToken } from "../src/widget.js";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
for (const entry of ["index.html", "styles.css", "config.js", "src", "404.html"]) cpSync(entry, `dist/${entry}`, { recursive: true });

const url = process.env.CONVERSATIONS_URL;
const token = process.env.WIDGET_TOKEN;
if (url !== undefined || token !== undefined) {
  const config = { conversationsUrl: "https://conversations-app-jrvx.onrender.com", widgetToken: "" };
  if (url) {
    const origin = normalizeOrigin(url);
    if (!origin) throw new Error(`CONVERSATIONS_URL: "${url}" is not a valid https URL`);
    config.conversationsUrl = origin;
  }
  if (token) {
    if (!validToken(token)) throw new Error("WIDGET_TOKEN does not look like a widget token (cvt_...)");
    config.widgetToken = token.trim();
  }
  writeFileSync("dist/config.js", `window.SITE_CONFIG = ${JSON.stringify(config, null, 2)};\n`);
  console.log("Wrote dist/config.js from environment:", config.widgetToken ? "widget enabled" : "widget not configured");
}
console.log("Built dist/");
