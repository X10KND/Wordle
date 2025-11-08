# Wordle Multiplayer (Next.js + Cloudflare Pages + D1)

Dark-mode-only, online multiplayer Wordle with rooms, rounds, and a simple polling-based realtime. Deploys to Cloudflare Pages and uses Cloudflare D1 for storage.

## Stack
- Next.js 14 (App Router), React 18
- Tailwind CSS
- Cloudflare Pages with OpenNext Cloudflare adapter (`@opennextjs/cloudflare`)
- Cloudflare D1 (SQLite) for persistence

## Features
- Create or join a room using a short code
- Host chooses round length (3–10); classic 5-letter words
- Lobby shows players and progress squares
- Start game: every player gets the same words in the same order
- Scoring: fewest total guesses wins; tie-breaker is shortest time
- Leaderboard at end; host can start another match

## Local Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Install Wrangler (if not installed)
   ```bash
   npm install -g wrangler
   ```

3. Create a D1 database (one-time)
   ```bash
   wrangler d1 create wordle_d1
   ```
   Copy the returned `database_id` into `wrangler.toml` under the `[[d1_databases]]` section.

4. Run migrations
   ```bash
   wrangler d1 migrations apply wordle_d1
   ```

5. Dev
   ```bash
   npm run dev
   ```

Note: The Next.js dev server won’t connect to D1; for end-to-end local testing with D1, use Pages dev after building:

```bash
npm run cf:build
wrangler pages dev .open-next/cloudflare --compatibility-date=2024-01-01
```

To test against your remote D1 database (recommended), deploy a Pages Preview so the binding comes from your Pages project configuration:

```bash
npm run cf:build
npm run cf:deploy:preview
```

## Cloudflare Pages Deployment

1. Push to a Git repo and create a Pages project.
2. In Pages project settings:
   - Framework preset: None (use the adapter)
   - Build command: `npx @opennextjs/cloudflare@latest build`
   - Build output directory: `.open-next/cloudflare`
   - Functions directory: (leave blank)
3. Bind the D1 database in Pages → Settings → Functions → D1 bindings:
   - Variable name: `WORDLE_DB`
   - Select your `wordle_d1` database for both Production and Preview.
4. Trigger a deploy (push to main or manually).

## Schema
See `migrations/0001_init.sql`.

- `rooms(code, creator_player_id, rounds_count, status, created_at, started_at)`
- `players(id, room_code, name, is_creator, joined_at, total_guesses, total_time_ms, finished_at)`
- `rounds(id, room_code, round_index, word)`
- `guesses(id, room_code, player_id, round_index, guess, result, created_at)`

## Notes & Roadmap
- Realtime uses 1s polling to keep Pages-compatible. You can upgrade to Durable Objects + WebSockets later for push updates.
- Word list in `lib/words.ts` is a compact starter set; expand with your preferred open word list.
- UI mirrors Wordle’s dark style without using NYT assets; tweak Tailwind tokens in `tailwind.config.js`.

## Troubleshooting
- Ensure `WORDLE_DB` binding is configured in both Preview and Production.
- Migrations must run before the app touches the DB.
- If API routes error on Pages, check compatibility date (kept in `wrangler.toml`) and the adapter version.
