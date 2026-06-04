# AGENTS.md

This file gives Codex and other coding agents the durable project context for PayGate.

## Read First

Before editing code, read:

1. `PAYGATE_V1_PRODUCT_SPEC.md` — locked V1 product concept for the `codex/paygate-v1` branch.
2. `PAYGATE_V1_DEVELOPMENT_PLAN.md` — locked V1 technical development plan and phase-by-phase execution guide.
3. `TECHNICAL_SPEC.md` — canonical build spec for the original 30-day V0/SOW POC.
4. `PAYGATE_NEXT_PLAN.md` — product/SOW/grant handoff, next plan, and testing playbook.
5. `../openspec/README.md` and relevant `../openspec/specs/*/spec.md` files — capability-level requirements.
6. `AGENTS.md` — this project memory and agent operating guide.
7. `CLAUDE.md` — same project context for Claude-based agents.
8. `../frontend/PayGate_LandingPage_Brief.md` — only when changing landing page copy or visuals.

`README.md` may be stale. For V0/SOW generator work, `TECHNICAL_SPEC.md` wins. For the V1 branch, `PAYGATE_V1_PRODUCT_SPEC.md` wins where it intentionally conflicts with V0 constraints.

## V1 Branch Direction

Wildan has approved a V1 pivot on the `codex/paygate-v1` branch.

PayGate V1 is a **pay-per-call gateway for APIs**, not only a code generator. The locked V1 flow is:

1. Developer connects Freighter wallet.
2. Developer registers an API in PayGate.
3. PayGate stores API config in Supabase.
4. PayGate creates a paid proxy endpoint.
5. AI agent calls the paid proxy.
6. PayGate returns `402 Payment Required`.
7. Agent pays USDC via Stellar MPP Charge to a Soroban escrow contract.
8. PayGate backend verifies payment and calls `creditPayment`.
9. Contract splits 90% developer balance and 10% PayGate platform fee.
10. PayGate forwards request to the original API using a generated `X-PayGate-Secret`.
11. Developer withdraws balance by signing with Freighter.

V1 intentionally adds things that were non-goals in the original SOW:

- Freighter wallet login.
- Supabase database/API registry.
- Paid proxy backend.
- Soroban escrow smart contract.
- Encrypted per-API secret header.
- Platform fee accounting and withdrawal.

## What PayGate Is

PayGate started as a web tool for developers who want to monetize Node.js/Express APIs with Stellar Machine Payments Protocol (MPP) micropayments. The original V0 product promise was: fill 3 fields, generate MPP middleware, paste it into an Express server, and monitor USDC testnet earnings from a Stellar wallet.

The current V1 product direction is stronger: PayGate becomes a pay-per-call API gateway. Developers register APIs, PayGate creates paid proxy endpoints, AI agents pay per request, and settlement is tracked through a Soroban escrow contract.

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

These were non-goals for the original V0/SOW sprint. Wildan has now explicitly approved a V1 branch that includes database, wallet auth, and smart contract work. Do not apply this list blindly to V1 work.

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

These guardrails describe the original V0/SOW generator architecture. For V1 gateway work, use `PAYGATE_V1_DEVELOPMENT_PLAN.md` once locked.

- Frontend: React 18, React Router v6, Tailwind CSS v3, Vite 5, lucide-react.
- Backend: Node.js 20 ES modules, Express 4, Zod, CORS, express-rate-limit.
- V0 backend should remain a pure generator service: no persistence, no auth, no wallet secrets.
- Frontend calls backend with relative `/api/generate`.
- Dashboard calls Horizon testnet directly from the browser.
- Deployment target is Nginx static frontend plus `/api/*` proxy to Express on port `3001`.

## Current State Snapshot

As of June 4, 2026:

- `frontend/src/App.jsx` is now the React Router root.
- The polished landing page has moved to `frontend/src/pages/Landing.jsx`.
- `/generate`, `/result`, and `/dashboard` pages exist.
- Shared `colors`, `AppNavbar`, and `CodeBlock` frontend modules exist.
- `backend/` exists with Express, Zod validation, generator route, and templates.
- React Router is installed.
- Vite proxy for `/api` is configured.
- PM2 `ecosystem.config.cjs` exists.
- `../frontend/CLAUDE.md` is legacy guidance from the landing-page-only phase.
- PayGate is now an accepted $5,000 SCF Instaward project; delivery evidence and KYC/compliance completion are now part of the execution context.
- A V1 branch direction has been locked: paid proxy + Freighter login + Supabase API registry + Soroban escrow settlement.
- A `contracts/` Soroban workspace has been scaffolded for `paygate-escrow`.
- `PAYGATE_V1_DEVELOPMENT_PLAN.md` is locked for implementation by Wildan as of June 4, 2026.
- Phase 1 settlement proof is complete on Stellar testnet. MPP Charge successfully paid the deployed escrow `C...` contract, the contract received USDC testnet, and `creditPayment` updated the 90/10 developer/platform ledger. Evidence: `docs/evidence/PAYGATE_V1_PHASE1_SETTLEMENT_PROOF.md`.
- Phase 2 wallet auth is implemented. The dashboard can connect Freighter, sign a login challenge, verify the signature server-side, set an HTTP-only signed session cookie, load `/api/auth/me`, and logout. Evidence: `docs/evidence/PAYGATE_V1_PHASE2_WALLET_AUTH_PROOF.md`.
- Phase 2 challenge storage is still in-memory. Phase 3 added the `auth_challenges` table in Supabase, but the auth endpoints still need a later migration from memory store to Supabase before relying on production multi-instance behavior.
- Phase 3 API registry is implemented. Authenticated developers can create/list/view/update owned APIs through `/api/apis`, secrets are generated and encrypted server-side, and Supabase migrations exist. Evidence: `docs/evidence/PAYGATE_V1_PHASE3_REGISTRY_PROOF.md`.
- Phase 4 demo upstream API is implemented at `/api/upstream/market-signal`. It is a normal secret-protected API with no MPP code. Evidence: `docs/evidence/PAYGATE_V1_PHASE4_UPSTREAM_API_PROOF.md`; registration guide: `docs/demo-upstream-api.md`.
- Phase 5 paid proxy unpaid flow is implemented at `/api/pay/:apiId`. It resolves active APIs, logs `proxy_requests` with `challenge_sent`, and returns Stellar MPP 402 challenges with PayGate request/payment headers. Evidence: `docs/evidence/PAYGATE_V1_PHASE5_PROXY_UNPAID_PROOF.md`.
- Phase 6 paid proxy success flow is implemented. Paid retries map MPP `externalId` to PayGate `payment_id`, verify the MPP credential, save payment rows and tx hashes, credit the escrow ledger, decrypt the upstream secret, forward to the registered API, and log `forwarded` or `upstream_failed`. Evidence: `docs/evidence/PAYGATE_V1_PHASE6_PAID_PROXY_PROOF.md`.
- The Phase 6 smoke test uses memory-only mock MPP/escrow modes for deterministic local verification. Production mode still requires real `@stellar/mpp` verification, persistent Supabase MPP store, `ESCROW_CONTRACT_ID`, and `PAYGATE_OPERATOR_SECRET`.
- Phase 7 developer dashboard is implemented. Authenticated wallet owners can load API list, paid proxy URLs, request counts, gross revenue, 10% platform fee, payment/request history, tx links, and contract withdrawable balance from `/api/dashboard/summary`. Evidence: `docs/evidence/PAYGATE_V1_PHASE7_DASHBOARD_PROOF.md`.
- Developer withdrawal UI/action is still Phase 8 and must not be treated as complete yet.

Update this snapshot when the project materially changes.

## Preferred Build Order

For V1 work, follow `PAYGATE_V1_DEVELOPMENT_PLAN.md` once Wildan locks it. Until it is locked, do not start broad V1 implementation.

For V0/SOW generator work, use this order:

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
- For V0 generator work, do not introduce persistence or accounts. For V1 work, persistence and wallet sessions are approved and must follow `PAYGATE_V1_DEVELOPMENT_PLAN.md` after Wildan locks it.
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
