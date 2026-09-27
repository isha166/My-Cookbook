# My Cookbook

An interactive kitchen journal that turns a user's moment, mood, and pantry into a personalized dinner experience.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- `pnpm --filter @workspace/my-cookbook run dev` — run the My Cookbook web app

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/my-cookbook/src/App.tsx` — interactive cookbook experience and local recipe logic
- `artifacts/my-cookbook/src/index.css` — kitchen-journal visual system, responsive layout, and motion
- `artifacts/my-cookbook/.replit-artifact/artifact.toml` — app artifact metadata and managed web workflow
- `artifacts/api-server/` — shared API service scaffold, currently unused by the first My Cookbook build
- `lib/api-spec/openapi.yaml` — shared API contract source of truth

## Architecture decisions

- The first build is frontend-first and self-contained so the demo remains useful without an external AI provider.
- Recipe generation is local and context-aware, with a curated fallback path for the hero Italian rainy comfort dinner.
- Personal data is persisted in browser localStorage for saved recipes, notes, pantry items, shopping checks, and the latest meal context.
- The app uses a single immersive shell with view transitions rather than conventional dashboard pages.

## Product

- Guided meal creation from cuisine, weather, mood, occasion, time, budget, party size, dietary preference, and pantry ingredients
- Personalized menu reveal with main, side, drink, dessert, timing, servings, cost, and substitutions
- Cook-along mode with step progression, ingredient interaction, and connected timers
- Shopping list, pantry inventory, explore surface, and saved cookbook pages with favorites and notes
- Responsive desktop/mobile layouts with reduced-motion support and accessible labels

## User preferences

- App name is “My Cookbook”.

## Gotchas

- The shared API workflow is scaffolded but is not required by the current frontend-only experience.
- The artifact workflow supplies `PORT` and `BASE_PATH`; do not run the Vite dev command from the workspace root.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
