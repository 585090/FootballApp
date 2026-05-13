# FootyGuru Roadmap

Curated feature list. Tiered by urgency relative to **FIFA World Cup 2026** (kickoff June 2026).

## Tier 1 — Must-have before kickoff

The gap between "demo" and "playable app". These five close the core gameplay loop.

| # | Feature | Status | Notes |
| --- | --- | --- | --- |
| 1 | Real Matchday screen | ✅ Done | Next 7 days of matches; tap → score (+ first-scorer for WC) |
| 2 | Real Matches list | ✅ Done | Browse by matchweek (PL) or stage (WC) |
| 3 | Real Dashboard | ✅ Done | Real points, rank, group count, next match |
| 4 | Group-stage server persistence | ✅ Done | Bulk save via `/api/wc/group-predictions/bulk` |
| 5 | Real Scoreboard | ✅ Done | Global top 50 with your row highlighted |

## Tier 2 — Should-have (engagement multipliers)

The tournament still works without these, but they make the app sticky.

| # | Feature | Status | Description |
| --- | --- | --- | --- |
| 6 | Lock-in deadlines + countdowns | ✅ Done | Countdown pills on cards, server rejects late saves. |
| 7 | Match details view | ✅ Done | "Everyone's predictions" reveals on the match screen after kickoff. |
| 8 | Live score during matches | ✅ Done | Match screen polls every 60s while a match is `ongoing`. |
| 9 | Push notifications | Deferred | "Brazil vs Argentina kicks off in 30 min". Needs Expo dev build + server scheduler. Wait until native runtime is set up. |

## Tier 3 — Nice-to-have (polish & social)

| # | Feature | Description |
| --- | --- | --- |
| 10 | Group activity feed | ✅ Done. Recent activity (predictions, joins, creates) on group detail. |
| 11 | Share group via system share sheet | ✅ Done. Uses RN's built-in `Share.share`. |
| 12 | Deep links for join codes | ✅ Done. `footyguru://group/join?code=R7HKQ4` auto-prefills the join screen. |
| 13 | Achievements / streaks | "3-in-a-row correct streak", "First perfect prediction". Server-side state, mobile badges. |
| 14 | Avatar upload | Replace initial-circle with a real photo. Multer or direct upload to S3/Cloudinary. |
| 15 | Forgot password | Email-based reset. Needs Resend/Mailgun + new route. |
| 16 | Onboarding tour | ✅ Done. Welcome card on Home for users with zero groups. |
| 17 | Search/filter groups | For users who are in many groups. |
| 18 | Per-gamemode scoreboards | ✅ Done. `?gamemode=2` (PL) or `?gamemode=3` (WC) on leaderboard endpoint. |
| 19 | Match-by-match prediction history | ✅ Done. `/predictions` screen linked from Profile. |
| 20 | Profile favorite team flair | Small team-color accent on user's name in group leaderboards. |

## Tier 4 — Deferred (post-tournament)

- WC Bracket predictor (R32 → Final)
- WC Tournament Picks (Golden Boot, Golden Glove, winner, dark horse)
- Multi-language / i18n
- Dark mode
- Group chat / reactions
- Public groups, group search
- Multi-tournament/league expansion (Bundesliga, Serie A, La Liga, CL, etc.)
- Account deletion
- Owner transfer (currently owners can't leave their own group)

## Technical debt / cleanup

- **Hosting**: Move backend off Render. Candidates: Fly.io, Railway, Vercel functions, small VPS.
- **Auth**: Add JWT or session tokens. Currently mobile just stashes player record locally; no real session enforcement.
- **CORS**: Add the production mobile-web origin to allowlist when ready to deploy.
- **Root `package.json`**: Contains web-only deps (`@heroicons/react`, `react-beautiful-dnd`, `docker`, `python`). Prune.
- **Web client (`client/`)**: Old gamemode IDs (1=Predict table, 2=Predict scores). New mobile uses (2=PL, 3=WC). Unify or document the mismatch.
- **Tests**: There are none. Worth adding at least integration tests on the server's prediction-scoring path.
