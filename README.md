# Skill-to-Job Gap Visualizer

This repository contains the first implementation pass of the PDF spec:

- Next.js 15 + TypeScript app-router foundation
- premium dark glassmorphism design system
- landing hero, dashboard, gap analysis, GitHub intelligence, resume ATS, roadmap, market trends, projects, interview prep, profile, and settings routes
- API routes now flow through a typed server repository layer
- Prisma schema scaffold aligned to the described data model
- seed-backed fallback mode so the app still runs before Supabase/Postgres is connected

## Environment

Copy `.env.example` to `.env.local` when you are ready to connect services.

- `DATABASE_URL`: enables Prisma-backed repository reads
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: prepare Supabase auth/client wiring
- `SUPABASE_SERVICE_ROLE_KEY`: reserved for privileged server workflows
- `OLLAMA_BASE_URL` and `OLLAMA_MODEL`: enable free local resume intelligence via Ollama
- `OPENAI_API_KEY` and `GITHUB_TOKEN`: optional legacy/provider envs for external integrations

Without env configuration, the app runs in seeded mode and surfaces that state in the dashboard/settings UI.

## Local AI With Ollama

If you want resume rewrites and interview-style text generation without paying for an API, use Ollama locally:

1. Install Ollama
2. Pull a model such as:
   `ollama pull qwen2.5:7b-instruct`
3. Keep Ollama running locally
4. Set:
   - `OLLAMA_BASE_URL="http://127.0.0.1:11434"`
   - `OLLAMA_MODEL="qwen2.5:7b-instruct"`

If Ollama is not running, the app automatically falls back to local heuristic rewriting instead of failing hard.

## Planned next steps

- connect Supabase auth and persistent user sessions
- add migrations and a real seed flow for Prisma/Supabase
- replace seed-backed repository responses with live database and service integrations
- add richer animations and true 3D graph rendering
- add tests, lint config polish, and deployment wiring
