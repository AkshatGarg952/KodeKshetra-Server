# KodeKshetra

A 1v1 competitive coding platform. Two players are matched on rating, get the same problem at the same second, and race to pass every test case. Whoever submits a correct solution first wins; the loser's rating drops a little, and both walk away with updated stats, streaks and badges.

The repo holds four services that run as separate processes. They were originally four repos and were folded into one monorepo, which is why each still has its own `package.json` (or `requirements.txt`), its own `.env`, and its own README with the finer details.

## The four services

| Directory | Stack | Default port | What it does |
|---|---|---|---|
| `KodeKshetra-Client` | React 18, Vite, Tailwind | 5173 | The whole UI: landing page, dashboard, battle arena, leaderboard |
| `KodeKshetra-Server` | Node, Express 5, Socket.IO, MongoDB, Redis | 5000 | Auth, matchmaking, battle state, XP and stats, problem imports |
| `Code-Runner` | Node, Express 5, Judge0 CE | 9000 | Compiles and runs submitted code against test cases |
| `HiddenForces` | FastAPI, LangGraph, Gemini | 8000 | Generates hidden test inputs for imported problems |

Only the server talks to the two backend services. The browser never reaches Code-Runner or HiddenForces directly — `/run` and `/submit` on the server are proxies, so the Judge0 key and the Gemini key stay server-side.

```
Browser ──websocket + REST──> KodeKshetra-Server ──HTTP──> Code-Runner ──> Judge0 CE
                                     │
                                     ├──> HiddenForces ──> Gemini
                                     ├──> MongoDB   (users, battles, problems, daily stats)
                                     └──> Redis     (queues, locks, live battle state, leaderboard)
```

Server-to-server calls carry an `x-internal-token` header. Set `INTERNAL_SERVICE_TOKEN` to the same value in all three backends. If you leave it blank, the check is skipped and Code-Runner and HiddenForces will answer anyone who can reach them, which is fine on localhost and a bad idea anywhere else.

## Running it locally

You need Node 18+, Python 3.8+, a MongoDB you can write to, a Redis instance, a Judge0 CE key (RapidAPI or self-hosted), and a Google Gemini key.

Every service ships a `.env.example`. Copy it to `.env` and fill it in before starting anything — the server refuses to boot without `MONGO_URI`, `JWT_SECRET` and `CODE_RUNNER_URL`, Code-Runner throws without `JUDGE0_API_KEY`, and HiddenForces exits without `GOOGLE_API_KEY`.

Start them in this order, one terminal each:

```bash
# 1. Code-Runner
cd Code-Runner && npm install && npm run dev

# 2. HiddenForces
cd HiddenForces && python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt && python run.py

# 3. Server
cd KodeKshetra-Server && npm install && npm run dev

# 4. Client
cd KodeKshetra-Client && npm install && npm run dev
```

Then open http://localhost:5173. `GET /api/health` and `GET /api/redis-health` on the server are the quickest way to confirm the backend came up cleanly.

Two things worth knowing before you spend an hour debugging:

- Vite inlines `VITE_*` variables at build time. Changing `.env` in the client and restarting the dev server is usually enough, but for a production build you have to rebuild, not just redeploy.
- The server reads a lot of tuning values from `process.env` at import time. `dotenv/config` is deliberately the first import in `index.js`; moving it below the other imports will silently give you default TTLs and rate limits instead of your configured ones.

Redis is not strictly required for the app to boot — the server falls back to in-memory state — but matchmaking, distributed locks and the leaderboard all behave properly only with Redis running. Treat it as required for anything beyond poking at the UI.

## How a battle actually runs

1. From the dashboard a player picks a mode (`dsa` or `cp`) and a topic, and the client emits `joinQueue`.
2. The server pushes the player onto a Redis list keyed `mode:topic`, with a parallel set to stop the same user queueing twice.
3. A matcher acquires a distributed lock on that queue (`SET NX PX`), sorts waiting players by rating, and pairs the first adjacent pair within 200 rating points. Both are removed inside a single `MULTI` so two matchers can never claim the same player.
4. Both clients get `matchFound`, then `battleStart` with the problem and a shared deadline. Battles run 1800 seconds by default (`BATTLE_DURATION_SECONDS`).
5. `/run` executes against sample tests only. `/submit` runs samples plus the hidden suite. Python, Java and C++ are exposed in the editor; Code-Runner's language map covers more than that if you want to add them.
6. The first correct submission ends the battle. `claimBattleProcessing` is a lock that guarantees exactly one caller resolves the result, so a slow Judge0 response can't cause XP to be applied twice.

Refreshing the page mid-battle does not forfeit. On mount the client emits `resumeBattleState`; the server looks up the unresolved battle, computes the remaining time from the stored start timestamp, and pushes the problem back. Editor drafts are kept per problem and per language in `sessionStorage`, so switching language or reloading doesn't lose code.

Private rooms work the same way, minus the queue — one player creates a room and shares the code, the other joins.

## Rating, XP and stats

XP lives in `src/helper/XP/XPCalculator.js` and is intentionally simple: +10 for a win, -2 for a loss, 0 for a draw, +3 if the win landed inside the first ten minutes, +3 more if the player is on a win streak of three or better.

Streaks are computed from daily buckets in `user_daily_stats`. On each battle the server checks whether the player also played yesterday; if so the current streak increments, otherwise it resets to 1. The same collection feeds the 90-day activity heatmap on the profile.

The leaderboard is a Redis-backed ranking over two windows, 24 hours and 7 days, served from `GET /leaderboard/:period/:page` where period is `1` or `7`.

## Adding problems

Problems come from LeetCode and Codeforces through the importer at `/admin/importer` in the UI, backed by `POST /api/admin/addLCProblem` and `addCFProblem`. The importer detects the platform from the URL, scrapes and normalises the statement and constraints, and stores it.

Sample tests come from the problem statement. Hidden tests do not exist yet at that point, so the server asks HiddenForces for candidate inputs — a LangGraph generate-then-validate pass over Gemini, targeting boundaries, degenerate shapes and large inputs — then runs a reference solution against them in Code-Runner and stores the outputs as the expected results. That is why you also register a solution (`addLCSolution` / `addCFSolution`) alongside each problem: without one there is nothing to generate expected outputs from.

Access to those endpoints is gated on `ADMIN_EMAIL`. Set it explicitly. When it is unset the code falls back to `admin@gmail.com`, which means anyone who registers that address gets importer access.

`npm run seed:nov2025` in the server seeds users and battles if you want a populated dashboard and leaderboard to look at.

## Deployment notes

The client is set up for Vercel (`vercel.json` handles SPA routing). The three backends are ordinary long-lived processes and need somewhere that supports websockets and doesn't cold-start — Socket.IO on a serverless platform will not behave.

`CORS_ORIGINS` on the server and HiddenForces takes a comma-separated list of frontend origins; both default to localhost when unset, so remember to set them in production or the deployed client will fail every request with an opaque CORS error.

The server's `.env.example` documents the scaling knobs — Mongo pool size, per-route rate limits, Socket.IO ping timeouts, lock TTLs, Code-Runner socket caps. The defaults are aimed at roughly a thousand concurrent users. One caveat: Code-Runner calls are retried three times, so the worst-case latency of a submission is about four times `CODE_RUNNER_TIMEOUT_MS`, and `BATTLE_PROCESSING_LOCK_TTL_MS` is derived from that. Don't lower it without understanding why.

## Per-service documentation

Each directory has its own README with the full API surface, project layout and environment reference:

- [KodeKshetra-Client/README.md](KodeKshetra-Client/README.md)
- [KodeKshetra-Server/README.md](KodeKshetra-Server/README.md)
- [Code-Runner/README.md](Code-Runner/README.md)
- [HiddenForces/README.md](HiddenForces/README.md)

Built by Akshat Garg — https://github.com/AkshatGarg952
