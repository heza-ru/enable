<!-- Copilot instructions for AI coding agents working on Enable -->
# Enable — Copilot instructions

Purpose: quick, actionable onboarding for AI coding agents to be productive in this repo.

- Big picture
  - Client-first Next.js 14 app (App Router + React Server Components). See app/layout.tsx and README.md for architecture notes.
  - All AI work is client-side: direct Anthropic/Claude integration. See `components/google-auth.tsx`, `lib/ai/` and `components/chat.tsx`.
  - Local-first storage: chat history & keys use IndexedDB and optional encrypted localStorage. See `lib/storage/` and `components/google-auth.tsx`.

- Key workflows (discoverable & repeatable)
  - Dev server: `pnpm install` then `pnpm dev` (README and `package.json` scripts).
  - Tests: Playwright E2E via `pnpm test` (check `playwright.config.ts` and `tests/e2e`).
  - Lint/format: `pnpm run lint` / `pnpm run format` (ultracite configured in `package.json`).
  - Deploy: static export to Vercel — no server env vars required (README deploy section).

- Project-specific conventions and patterns
  - No server-side API key storage — changes that introduce server-side key handling are a major design deviation.
  - Feature surfaces are componentized: look under `components/` for UI + `hooks/` for behavior (example: `components/messages.tsx` + `hooks/use-messages.tsx`).
  - Artifacts (code, sheet, image) follow an `artifacts/` area — coordinated with `components/artifact.tsx` and `artifacts/*` folders.
  - Use existing UI patterns (shadcn/ui + Tailwind). Follow existing classname/cva patterns (see `components/*` for examples).

- Integration & external deps to be careful about
  - Anthropic/Claude SDKs: changes to request flows must preserve client-only key usage. See `@ai-sdk/anthropic` in `package.json` and `lib/ai/`.
  - Telemetry & OTEL: `@vercel/otel` and `@opentelemetry/*` appear in deps — preserve initialization in `instrumentation.ts`.
  - Playwright tests assume a running dev server and local storage flows; avoid tests that require backend state.

- Code patterns to follow (concrete examples)
  - Server components vs client components: check `use client` usage at top of files in `components/` to determine hydration boundaries.
  - Prompt/context stacking: customer context flows from `components/context-panel.tsx` into chat payloads — search for `pin`/`context` in `components/`.
  - Token & cost accounting: logic lives in `lib/` (search for “token” or “cost”) — mirror approach when adding new AI calls.

- When making changes
  - Preserve client-only key handling and IndexedDB behavior.
  - Add/modify Playwright tests under `tests/e2e` for any UX path changes; run `pnpm test` locally.
  - Update README.md if developer-visible workflows change (dev, test, deploy).

- Where to look first (quick navigation)
  - App shell & routes: `app/` and `components/`
  - AI glue: `lib/ai/`, `components/chat.tsx`, `hooks/use-messages.tsx`
  - Storage & keys: `lib/storage/`, `components/google-auth.tsx`
  - Tests: `tests/e2e`, `playwright.config.ts`

If anything above is unclear or you'd like more detail on a specific area (e.g., test setup, AI call flow, or storage internals), tell me which part and I'll expand with file-level examples.
