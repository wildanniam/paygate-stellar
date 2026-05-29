# AGENTS.md

This file gives Codex and other coding agents the durable project context for PayGate.

## Read First

Before editing code, read:

1. `TECHNICAL_SPEC.md` — canonical build spec for the current 30-day POC.
2. `PAYGATE_NEXT_PLAN.md` — product/SOW/grant handoff, next plan, and testing playbook.
3. `openspec/README.md` and relevant `openspec/specs/*/spec.md` files — capability-level requirements.
4. `AGENTS.md` — this project memory and agent operating guide.
5. `CLAUDE.md` — same project context for Claude-based agents.
6. `frontend/PayGate_LandingPage_Brief.md` — only when changing landing page copy or visuals.

`README.md` may be stale. If docs conflict, `TECHNICAL_SPEC.md` wins.

## What PayGate Is

PayGate is a web tool for developers who want to monetize Node.js/Express APIs with Stellar Machine Payments Protocol (MPP) micropayments. The product promise is: fill 3 fields, generate MPP middleware, paste it into an Express server, and monitor USDC testnet earnings from a Stellar wallet.

The project exists because the SOW targets a 30-day Instawards sprint, planned to start on May 1, 2026. PayGate has passed review and was accepted for a **$5,000 Instaward in XLM** through the Stellar Ambassador program, per the SCF email dated May 14, 2026. The work must be concrete, demoable, and scoped to the agreed POC.

Official Instawards context:

- Instawards support clearly scoped, short-duration work that moves a Stellar project forward.
- Scopes are generally expected to be achievable within 30 days or less.
- Progress is measured against agreed deliverables, not future roadmap promises.
- Disbursement requires SDF KYC/compliance completion before funding is paid.
- Strong completion evidence matters: working product, documented progress, demo, and verifiable Stellar activity.

## Required Deliverables

1. MPP Code Generator
   - Backend receives `endpointUrl`, `path`, and `price`.
   - Backend returns generated middleware and integration snippet.
   - Generated code targets Node.js/Express and Stellar testnet USDC.

2. Website Frontend
   - React SPA with landing page, generator form, result page, and code copy UX.
   - The user should not need Stellar or blockchain knowledge to generate code.

3. Monitoring Dashboard
   - User inputs a Stellar wallet address.
   - Browser fetches Horizon testnet operations.
   - UI shows USDC earnings, payment/request count, transaction history, and Stellar Explorer links.

## Non-Goals For This Sprint

Do not implement these unless the user explicitly asks:

- Database.
- Auth/login/account system.
- Server sessions.
- Mainnet support.
- Multi-currency support.
- Python, Fastify, Hono, Next.js API routes, or other framework support.
- MPP Session/channel intent.
- Fiat on/off ramp.
- Mobile app.
- Smart contracts.
- Heavy analytics beyond the Horizon-backed dashboard.

## Architecture Guardrails

- Frontend: React 18, React Router v6, Tailwind CSS v3, Vite 5, lucide-react.
- Backend: Node.js 20 ES modules, Express 4, Zod, CORS, express-rate-limit.
- Backend should remain a pure generator service: no persistence, no auth, no wallet secrets.
- Frontend calls backend with relative `/api/generate`.
- Dashboard calls Horizon testnet directly from the browser.
- Deployment target is Nginx static frontend plus `/api/*` proxy to Express on port `3001`.

## Current State Snapshot

As of May 20, 2026:

- `frontend/src/App.jsx` is now the React Router root.
- The polished landing page has moved to `frontend/src/pages/Landing.jsx`.
- `/generate`, `/result`, and `/dashboard` pages exist.
- Shared `colors`, `AppNavbar`, and `CodeBlock` frontend modules exist.
- `backend/` exists with Express, Zod validation, generator route, and templates.
- React Router is installed.
- Vite proxy for `/api` is configured.
- PM2 `ecosystem.config.cjs` exists.
- `frontend/CLAUDE.md` is legacy guidance from the landing-page-only phase.
- PayGate is now an accepted $5,000 SCF Instaward project; delivery evidence and KYC/compliance completion are now part of the execution context.

Update this snapshot when the project materially changes.

## Preferred Build Order

1. Migrate the frontend to the final SPA structure without changing landing page behavior.
2. Add backend generator API and templates.
3. Connect `/generate` to `/api/generate` and render `/result`.
4. Build `/dashboard` with Horizon testnet fetching and auto-refresh.
5. Add deployment config, docs updates, and final acceptance testing.

## MPP API Caution

`TECHNICAL_SPEC.md` currently specifies generated code using `mppx/express`, `@stellar/mpp/charge/server`, and `USDC_SAC_TESTNET`. Because MPP libraries may change, verify package exports or official docs before making assumptions. If the official API conflicts with the spec, explain the mismatch and ask whether to follow the spec or update to the latest API.

## Verification

Use `TECHNICAL_SPEC.md` section 10 as the acceptance checklist. At minimum:

- Run `cd frontend && npm run build` after frontend changes.
- Once backend exists, smoke-test `POST /api/generate` with valid and invalid payloads.
- Check result persistence via `sessionStorage`.
- Check dashboard address validation, loading, error, empty, and transaction states.

## Working Style For Agents

- Keep changes scoped and shippable.
- Prefer existing style and design language.
- Do not remove the landing page polish during migration.
- Do not introduce persistence or accounts.
- Keep generated code copy-paste friendly.
- Document any important scope or API decision by updating this file and `CLAUDE.md`.

## Product Reporting Style

When Wildan asks for a PayGate progress report while positioning the agent as a product developer and himself as CEO, answer from a **user/product readiness** perspective, not a code-review perspective.

Use this framing:

- What can a real user do with PayGate today?
- What already works end-to-end in the product experience?
- What is only partially usable?
- What cannot be used yet?
- What is the next product milestone?

Avoid leading with file names, implementation details, or code references unless Wildan explicitly asks for technical detail. A good short report says:

> PayGate is a functional alpha. Users can open the app, generate Express middleware, copy the code, and open the dashboard. However, it is not yet fully usable for real API monetization because the generated middleware has not been proven in a sample API with a real Stellar testnet MPP payment and dashboard transaction evidence.
