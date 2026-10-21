// Loads the Conversations chat widget on this page from the settings in config.js.
// Pure helpers are exported for tests; the DOM part only runs in a browser.

// Tokens are base64url: letters, digits, '-' and '_' (a real token looks like cvt_CnrVdPdabGmasPxvZ5BY-AzRDMGcmYnh).
const TOKEN_RE = /^cvt_[A-Za-z0-9_-]{16,64}$/;
const DEFAULT_TIMEOUT_MS = 5000;

/** A plain https origin (or http on localhost for local testing), without path, credentials or query; otherwise null. */
export function normalizeOrigin(value) {
  if (typeof value !== "string") return null;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return null;
  if (url.username || url.password) return null;
  return url.origin;
}

export function validToken(value) {
  return typeof value === "string" && TOKEN_RE.test(value.trim());
}

/** Decides what the page should do: embed the widget, or explain what is missing. */
export function plan(config) {
  const c = config && typeof config === "object" ? config : {};
  const origin = normalizeOrigin(c.conversationsUrl);
  if (!origin) return { action: "setup", missing: "conversationsUrl" };
  if (!c.widgetToken) return { action: "setup", missing: "widgetToken" };
  if (!validToken(c.widgetToken)) return { action: "setup", missing: "widgetToken", invalid: true };
  return { action: "embed", origin, token: c.widgetToken.trim() };
}

export function start(win = window, doc = document) {
  const result = plan(win.SITE_CONFIG);
  const note = doc.getElementById("chat-status");
  if (result.action === "setup") {
    if (note) {
      note.hidden = false;
      note.textContent = result.invalid
        ? "The chat token in the site settings does not look right. Copy it again from Conversations > Settings > Chat widget > Install."
        : "The chat widget is not set up yet. Create a token for this site in Conversations (Settings > Chat widget > Install), then add it as the WIDGET_TOKEN repository variable and redeploy.";
    }
    return result;
  }
  // The Conversations server sleeps on free hosting: wake it as soon as the page opens so the first chat does not wait.
  try {
    win.fetch(`${result.origin}/healthz`, { mode: "no-cors", cache: "no-store" }).catch(() => {});
  } catch {
    /* warming is best effort */
  }
  const script = doc.createElement("script");
  script.src = `${result.origin}/widget.js`;
  script.async = true;
  script.dataset.token = result.token;
  doc.body.appendChild(script);
  if (note) note.hidden = true;
  return result;
}

if (typeof window !== "undefined" && typeof document !== "undefined" && !window.__CHAT_DEMO_TEST__) start();
