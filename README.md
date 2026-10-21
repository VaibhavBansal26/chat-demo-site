# Chat demo site

A small website hosted on **GitHub Pages** with the Conversations live-chat widget embedded. Visitors click the chat bubble;
your team answers from the Conversations inbox.

Live site: `https://<your-github-user>.github.io/chat-demo-site/` (for this repo: https://vaibhavbansal26.github.io/chat-demo-site/)

## Turn the chat on (3 steps)
1. **Create a widget token for this site** in your Conversations app: *Settings > Chat widget > Install > create a token*.
   The domain to enter is **`vaibhavbansal26.github.io`** (just the host: no `https://`, no `/chat-demo-site`).
   A token only works on the domain it was created for, so it is safe to put in a public page.
2. **Save the token as a repository variable**: this repo's *Settings > Secrets and variables > Actions > Variables > New repository variable*,
   name `WIDGET_TOKEN`, value the token (it starts with `cvt_`).
3. **Redeploy**: *Actions > deploy-pages > Run workflow* (any push to `main` redeploys too).

Until a token is set, the page shows a short "chat is not set up yet" note and loads nothing from the chat server.

## Settings
| Variable | Needed | What it is |
|---|---|---|
| `WIDGET_TOKEN` | yes, for chat | the embed token, `cvt_...`. A malformed value fails the build. |
| `CONVERSATIONS_URL` | no | your Conversations app address; defaults to the one in `config.js`. Must be `https`. |

## Try it locally
```bash
npm test
npm run dev          # http://localhost:8123
```
For local testing create a second token for the domain `localhost:8123` and put it in `config.js` (do not commit it).

## Good to know
- **First chat can be slow.** On free hosting the Conversations server sleeps when idle. The page wakes it on load, so the first visitor may wait up to about a minute.
- **Ad blockers and strict corporate networks** can block the widget script; the rest of the page still works.
- **Content-Security-Policy.** This page sets none. If you add one, allow `script-src`, `connect-src` (https and wss) and `frame-src` for your Conversations origin.
- **Domains.** `www` and the bare domain are different origins: create a token per domain, or use a wildcard such as `*.example.com` if the token screen allows it.
- **Change the look** of the bubble in Conversations under *Settings > Chat widget*.

## How it works
`config.js` holds the settings, `src/widget.js` validates them and adds one `<script src=".../widget.js" data-token="...">` tag, and the
workflow rebuilds `config.js` from the repository variables. Tests cover the validation, the loader and the build (`npm test`).
