---
name: Express 5 CORS wildcard
description: How to configure CORS in Express 5 — bare wildcard routes crash at startup.
---

Express 5 uses path-to-regexp 8, which rejects `"*"` and `"/(.*)"` as route patterns with a `PathError`.

**Rule:** Use `app.use(cors({ origin: true, credentials: true }))` only — the cors middleware handles OPTIONS preflight automatically (`preflightContinue: false` is the default). Do NOT add `app.options("*", ...)` or any wildcard `app.options` call.

**Why:** path-to-regexp 8 removed bare wildcard support. The cors middleware already intercepts OPTIONS before routes run, so a manual `app.options` is redundant and will crash the server.

**How to apply:** In `artifacts/api-server/src/app.ts`, the single `app.use(cors(...))` line is sufficient for full CORS support including preflight.
