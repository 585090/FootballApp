---
name: reference-deployments
description: Deployed FootyGuru URLs — web client on Netlify, API server on Render.
metadata:
  type: reference
---

- Web client: https://footyguru.netlify.app (Netlify, deploys from `client/`)
- API server: https://footballapp-u80w.onrender.com (Render, deploys from `server/`) — free tier, may cold-start
- Both URLs are in the server's CORS allowlist (`server/Server.js`). Adding a new client origin requires updating that list.
