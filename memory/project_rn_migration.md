---
name: project-rn-migration
description: Active migration (started 2026-05-11) — building an Expo React Native app in a new `mobile/` folder alongside the existing web `client/`, targeting iOS + Android for World Cup 2026. MVP feature parity + modernized design, palette preserved.
metadata:
  type: project
---

Started 2026-05-11: building an Expo (managed workflow) React Native app for iOS + Android in a new `mobile/` folder. The existing `client/` (Create React App) stays live during the migration. Backend (`server/`, Express + MongoDB on Render) is unchanged.

**Why:** User wanted mobile-first experience for WC 2026 but couldn't risk losing the working web client before the tournament. Expo chosen because solo dev under ~5-week deadline can't afford bare-RN setup overhead.

**How to apply:**
- New mobile code goes in `mobile/`, never inside `client/`.
- Mobile app hits the deployed API at `https://footballapp-u80w.onrender.com` — same endpoints as web (`/api/players`, `/api/predictions`, `/api/matches`, `/api/groups`, `/api/teams`).
- Color palette must match `client/src/assets/themes.css` exactly: primary `#D32F2F`, secondary `#1976D2`, highlight `#FFC107`, bg `#F9F9F9`, text `#212121`.
- Scope is MVP parity: auth, dashboard, matches, matchday predictions, scoreboard, groups list, group detail, account. Drag-and-drop and ag-grid features can be deferred or simplified.
- See [[project-footyguru]] for the broader project context.
