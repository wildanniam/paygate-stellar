# AGENTS.md

This file gives Codex and other coding agents the durable project context for PayGate.

## Read First

Before editing code, read:

1. `PAYGATE_V1_PRODUCT_SPEC.md` — locked V1 product concept for the `codex/paygate-v1` branch.
2. `PAYGATE_V1_DEVELOPMENT_PLAN.md` — locked V1 technical development plan and phase-by-phase execution guide.
3. `PAYGATE_V1_DEMO_GUIDE.md` — current replay guide, evidence index, screenshot checklist, and demo script.
4. `TECHNICAL_SPEC.md` — canonical build spec for the original 30-day V0/SOW POC.
5. `PAYGATE_NEXT_PLAN.md` — product/SOW/grant handoff, next plan, and testing playbook.
6. `../openspec/README.md` and relevant `../openspec/specs/*/spec.md` files — capability-level requirements.
7. `AGENTS.md` — this project memory and agent operating guide.
8. `CLAUDE.md` — same project context for Claude-based agents.
9. `../frontend/PayGate_LandingPage_Brief.md` — only when changing landing page copy or visuals.

`README.md` may be stale. For V0/SOW generator work, `TECHNICAL_SPEC.md` wins. For the V1 branch, `PAYGATE_V1_PRODUCT_SPEC.md` wins where it intentionally conflicts with V0 constraints.

## V1 Product Direction

Wildan approved the V1 gateway pivot on the original `codex/paygate-v1` branch. The V1 gateway is now the current product direction; do not infer product scope from an old branch name.

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

- Historical V0 spec baseline: React 18, React Router v6, Tailwind CSS v3, Vite 5, and lucide-react. These are not the current installed version pins.
- Backend: Node.js 20 ES modules, Express 4, Zod, CORS, express-rate-limit.
- V0 backend should remain a pure generator service: no persistence, no auth, no wallet secrets.
- Frontend calls backend with relative `/api/generate`.
- Dashboard calls Horizon testnet directly from the browser.
- Deployment target is Nginx static frontend plus `/api/*` proxy to Express on port `3001`.

## Current State Snapshot

As of August 27, 2026:

- Current V1 frontend runtime is React 18, React Router 7, Tailwind CSS 3, Vite 7, GSAP, and lucide-react. Root Vercel Functions use Node.js 22+ and Express 5 where applicable; the legacy generator backend remains on Express 4.

- `frontend/src/App.jsx` is now the React Router root.
- The polished landing page has moved to `frontend/src/pages/Landing.jsx`.
- `/generate`, `/result`, and `/dashboard` pages exist.
- Shared `colors`, `AppNavbar`, and `CodeBlock` frontend modules exist.
- `backend/` exists with Express, Zod validation, generator route, and templates.
- React Router 7 is installed, and browser smoke coverage includes logged-out and authenticated route states across desktop and mobile viewports.
- Vite proxy for `/api` is configured.
- PM2 `ecosystem.config.cjs` exists.
- `../frontend/CLAUDE.md` is legacy guidance from the landing-page-only phase.
- PayGate is now an accepted $5,000 SCF Instaward project; delivery evidence and KYC/compliance completion are now part of the execution context.
- A V1 branch direction has been locked: paid proxy + Freighter login + Supabase API registry + Soroban escrow settlement.
- A `contracts/` Soroban workspace has been scaffolded for `paygate-escrow`.
- `PAYGATE_V1_DEVELOPMENT_PLAN.md` is locked for implementation by Wildan as of June 4, 2026.
- Phase 1 settlement proof is complete on Stellar testnet. MPP Charge successfully paid the deployed escrow `C...` contract, the contract received USDC testnet, and `creditPayment` updated the 90/10 developer/platform ledger. Evidence: `docs/evidence/PAYGATE_V1_PHASE1_SETTLEMENT_PROOF.md`.
- Phase 2 wallet auth is implemented. The dashboard can connect Freighter, sign a login challenge, verify the signature server-side, set an HTTP-only signed session cookie, load `/api/auth/me`, and logout. Evidence: `docs/evidence/PAYGATE_V1_PHASE2_WALLET_AUTH_PROOF.md`.
- Wallet auth challenge storage is now Supabase-backed by default through the `auth_challenges` table when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured. Local smoke tests opt into memory storage with `PAYGATE_AUTH_CHALLENGE_STORE=memory`.
- Phase 3 API registry is implemented. Authenticated developers can create/list/view/update owned APIs through `/api/apis`, secrets are generated and encrypted server-side, and Supabase migrations exist. Evidence: `docs/evidence/PAYGATE_V1_PHASE3_REGISTRY_PROOF.md`.
- Phase 4 demo upstream API is implemented at `/api/upstream/market-signal`. It is a normal secret-protected API with no MPP code. Evidence: `docs/evidence/PAYGATE_V1_PHASE4_UPSTREAM_API_PROOF.md`; registration guide: `docs/demo-upstream-api.md`.
- Phase 5 paid proxy unpaid flow is implemented at `/api/pay/:apiId`. It resolves active APIs, logs `proxy_requests` with `challenge_sent`, and returns Stellar MPP 402 challenges with PayGate request/payment headers. Evidence: `docs/evidence/PAYGATE_V1_PHASE5_PROXY_UNPAID_PROOF.md`.
- Phase 6 paid proxy success flow is implemented. Paid retries map MPP `externalId` to PayGate `payment_id`, verify the MPP credential, save payment rows and tx hashes, credit the escrow ledger, decrypt the upstream secret, forward to the registered API, and log `forwarded` or `upstream_failed`. Evidence: `docs/evidence/PAYGATE_V1_PHASE6_PAID_PROXY_PROOF.md`.
- The Phase 6 smoke test uses memory-only mock MPP/escrow modes for deterministic local verification. Production mode still requires real `@stellar/mpp` verification, persistent Supabase MPP store, `ESCROW_CONTRACT_ID`, and `PAYGATE_OPERATOR_SECRET`.
- Phase 7 developer dashboard is implemented. Authenticated wallet owners can load API list, paid proxy URLs, request counts, gross revenue, 10% platform fee, payment/request history, tx links, and contract withdrawable balance from `/api/dashboard/summary`. Evidence: `docs/evidence/PAYGATE_V1_PHASE7_DASHBOARD_PROOF.md`.
- Phase 8 escrow withdrawal flow is implemented. Dashboard can prepare a withdrawal, Freighter signs the transaction XDR, `/api/withdraw/submit` submits it to Soroban RPC, and withdrawal rows are recorded. Admin fee withdrawal is available through `npm run admin:withdraw-fees`. Evidence: `docs/evidence/PAYGATE_V1_PHASE8_WITHDRAWAL_PROOF.md`.
- Live admin fee withdrawal still requires `PAYGATE_OPERATOR_SECRET` in the operator environment; do not expose that secret to the frontend.
- Phase 9 demo guide is documented in `docs/PAYGATE_V1_DEMO_GUIDE.md`. Testnet beta readiness evidence is tracked in `docs/evidence/PAYGATE_V1_BETA_READINESS.md`. Demo video is still not recorded in this repository.
- Beta hardening utilities include `npm run beta:preflight`, `npm run test:auth:supabase`, `npm run test:distributed-state:supabase`, the guarded real `npm run test:staging:live-replay`, `npm run test:browser`, and `npm run evidence:init`.
- Vercel SPA rewrites include `/apis/new` and `/apis/:apiId`, so direct refreshes of V1 app routes should resolve to the React app after deployment.
- API lifecycle hardening is implemented as of June 11, 2026. New registered APIs start as `pending_setup`; they become `active` only after `/api/apis/:apiId/verify` confirms the upstream responds with the generated `X-PayGate-Secret`; used APIs can be archived and unused APIs can be deleted.
- Only a verified active API globally reserves a normalized endpoint. Different wallets may create seven-day pending claims without squatting it; one wallet gets one pending claim per endpoint, and atomic verification chooses one active winner. Archived APIs remain reusable.
- Direct PATCH activation is blocked. `PATCH /api/apis/:apiId` is for safe metadata updates such as name; activation must go through Verify setup.
- Dashboard/API detail UX now exposes lifecycle badges, setup guidance, `Verify setup`, and delete/archive reset controls. Navbar active states were fixed so `Dashboard` and `Register API` are not ambiguous. Evidence: `docs/evidence/ui/PHASE5_API_LIFECYCLE_UX.md` and `docs/evidence/ui/PHASE6_NAVBAR_ACTIVE_STATE.md`.
- Full internal V1 demo proof is covered by `npm run test:demo-flow`: register API -> pending setup -> verify setup -> unpaid `402` -> paid `200` -> dashboard update -> archive/delete reset -> re-register archived endpoint. Evidence: `docs/evidence/PAYGATE_V1_PHASE7_FULL_DEMO_FLOW_PROOF.md`.
- `frontend/node_modules` and `frontend/dist` are ignored and should remain untracked. Use `npm run build` to regenerate build output locally.
- `npm run test:beta` is the consolidated local beta smoke command.
- Production rate limiting fails closed when Upstash storage is missing; memory rate limits remain local-smoke-only.
- Upstream setup verification uses a fresh unpredictable invalid secret and distinguishes a confirmed guard rejection from unrelated upstream errors.
- Session parsing rejects malformed, oversized, future-issued, and overlong tokens without breaking a neighboring valid cookie.
- New payment IDs contain 120 bits of cryptographic randomness while remaining compatible with MPP wire formats and the escrow contract's Soroban `Symbol` key.
- Paid forwarding is conditionally claimed in Supabase and carries a stable request-scoped `Idempotency-Key`. Escrow credit persists signed XDR before submission, reconciles ambiguous outcomes by tx hash, and leases the operator source account to avoid Stellar sequence contention.
- Withdrawal accounting is unique by tx hash. Dashboard totals use an exact Supabase RPC, recent feeds remain capped for payload size, and only credited payments count as revenue.
- The escrow contract renews instance and active persistent storage around a 29-day threshold to approximately 30 days; fully inactive state still needs maintenance or restore planning.
- GitHub security coverage includes pinned audit workflows, PR dependency review, CodeQL, and Dependabot. Enable branch protection after the PR establishes the final required check names.
- On 2026-08-28, isolated staging completed a real deployed MPP payment, escrow credit, dashboard read, and signed withdrawal against the fresh TTL-aware contract. Production Vercel, Supabase, and contract state were not changed.
- `npm run audit:prod`, `npm run audit:all`, `npm run audit:rust`, and the pinned GitHub Actions security workflow are the current dependency gates.
- A deployment is not beta-ready until its own preflight, migration, contract, and live replay gates pass. Staging passes; production remains externally gated and must follow `docs/evidence/PAYGATE_V1_BETA_READINESS.md`.

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

> PayGate V1 is a testnet beta candidate. Its hosted gateway loop is proven in isolated staging from guarded API through real MPP payment, escrow credit, dashboard evidence, and withdrawal. Production release is still gated by production Supabase recovery, the hardening migration/contract rollout, and final screenshots/video; mainnet and refund guarantees remain out of scope.
