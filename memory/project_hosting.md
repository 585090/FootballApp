---
name: project-hosting
description: User is planning to move the FootyGuru backend away from Render (current host). Decision pending as of 2026-05-12; flag this when making infra/deploy choices.
metadata:
  type: project
---

User mentioned 2026-05-12 they are looking to move the backend off Render (current host: footballapp-u80w.onrender.com). The target platform hasn't been decided yet — they want to discuss it later.

**Why:** Reason not stated. Render free tier has cold-start latency and limited cron reliability, both plausible motivators.

**How to apply:**
- Don't add Render-specific config (e.g. `render.yaml`, build commands tied to Render).
- Keep deploy scripts and env-loading generic (plain `dotenv`, `process.env.PORT`, etc.) so they port cleanly.
- When the hosting decision comes up, current candidates worth offering: Fly.io, Railway, Vercel (serverless functions), or a small VPS. Each has trade-offs around long-running cron jobs vs serverless.
- See [[reference-deployments]] for the current URLs while still on Render.
