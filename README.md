# Autopilot Studio for YouTube

Full-stack Next.js automation agent for hands-free YouTube publishing. Capture ideas, orchestrate AI-assisted metadata, queue uploads, and push finished videos directly to your channel.

## Features

- Secure credential vault for YouTube OAuth refresh tokens
- AI metadata co-pilot powered by OpenAI (optional)
- Upload queue with scheduling, drafts, and status tracking
- Autopilot executor that downloads remote media and posts to YouTube
- REST endpoints for Vercel Cron automation (`POST /api/cron`)
- SQLite persistence (via `better-sqlite3`) with instant server actions

## Tech Stack

- Next.js 14 (App Router, Server Components)
- Tailwind CSS UI
- SWR data layer
- Google APIs (YouTube Data v3)
- OpenAI Responses API (optional metadata generation)
- better-sqlite3 for local persistence

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local`:

   ```bash
   OPENAI_API_KEY=sk-...         # optional (AI metadata)
   DATABASE_PATH=./data/agent.db # optional override
   ```

   YouTube credentials are stored in the database. Generate them through the UI with a refresh token obtained from Google OAuth Playground or your own OAuth flow.

3. Run the development server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Production Setup

1. Provision persistent storage (e.g., Neon, Turso, PlanetScale) or ensure your runtime supports SQLite writes. Override `DATABASE_PATH` accordingly.
2. Add environment variables in Vercel:

   - `OPENAI_API_KEY` (optional)
   - `DATABASE_PATH` (e.g., `/var/task/data/agent.db` or remote driver)
   - Google OAuth client credentials if you prefer environment-driven bootstrap.

3. Configure a Vercel Cron job to hit the autopilot endpoint:

   ```
   vercel cron add autopilot "*/15 * * * *" https://agentic-15f8777f.vercel.app/api/cron
   ```

## Running Autopilot Locally

Trigger all due uploads:

```bash
curl -X POST http://localhost:3000/api/cron
```

Execute a single upload immediately:

```bash
curl -X POST http://localhost:3000/api/uploads/123/run
```

## Scripts

- `npm run dev` – start Next.js dev server
- `npm run build` – production build
- `npm start` – run production server
- `npm run lint` – lint codebase
- `npm run db:reset` – clear the SQLite database (local only)

## Deployment

Build locally, ensure `npm run build` passes, then deploy to Vercel:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-15f8777f
```

After deployment succeeds, verify:

```bash
curl https://agentic-15f8777f.vercel.app
```

## Security Notice

YouTube refresh tokens grant upload access. Store them securely, restrict access to this dashboard, and rotate as needed. Consider encrypting secrets at rest or connecting to a managed secret store for production.
