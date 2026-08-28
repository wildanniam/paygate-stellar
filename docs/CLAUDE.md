# CLAUDE.md

This file is the project memory for Claude Code and other Claude-based agents working in this repository.

## Source of Truth

Read these in order before making code changes:

1. `PAYGATE_V1_PRODUCT_SPEC.md` — locked V1 product concept for the `codex/paygate-v1` branch.
2. `PAYGATE_V1_DEVELOPMENT_PLAN.md` — locked V1 technical development plan and phase-by-phase execution guide.
3. `PAYGATE_V1_DEMO_GUIDE.md` — current replay guide, evidence index, screenshot checklist, and demo script.
4. `TECHNICAL_SPEC.md` — canonical implementation plan for the original PayGate 30-day V0/SOW POC.
5. `PAYGATE_NEXT_PLAN.md` — product/SOW/grant handoff, next plan, and testing playbook.
6. `../openspec/README.md` and relevant `../openspec/specs/*/spec.md` files — capability-level requirements.
7. This file — persistent project context, scope boundaries, and agent behavior rules.
8. `../frontend/PayGate_LandingPage_Brief.md` — landing page visual/copy reference only.
9. `README.md` — useful overview, but it may lag behind the technical spec.

If any file conflicts with `TECHNICAL_SPEC.md`, follow `TECHNICAL_SPEC.md` for V0/SOW work. For the V1 branch, follow `PAYGATE_V1_PRODUCT_SPEC.md` where it intentionally conflicts with the old stateless generator scope.

## V1 Product Direction

Wildan approved the V1 gateway pivot on the original `codex/paygate-v1` branch. The V1 gateway is now the current product direction; do not infer product scope from an old branch name.

PayGate V1 is a **pay-per-call gateway for APIs**:

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

This V1 direction intentionally adds database, wallet auth, paid proxy, and smart contract work that were outside the original V0/SOW constraints.

## Project Context

PayGate started as a web tool that helps developers monetize Node.js/Express API endpoints with Stellar Machine Payments Protocol (MPP) micropayments. The original V0 developer flow is:

1. Fill a 3-field form: API base URL, endpoint path, price per request in USDC.
2. Click Generate.
3. Copy the generated middleware and integration snippet into an Express server.
4. Monitor USDC earnings and request/payment history from a Stellar testnet wallet.

The SOW context is a 30-day Instawards execution sprint, planned to start on May 1, 2026. PayGate has passed review and was accepted for a **$5,000 Instaward in XLM** through the Stellar Ambassador program, per the SCF email dated May 14, 2026. The project must produce a working, demonstrable POC rather than open-ended exploration.

The V1 product direction was chosen because V0 felt too much like a simple code generator and did not place PayGate in the transaction value chain. V1 should make the business concept clearer while still preserving SOW evidence history.

Official Instawards context from the SCF handbook:

- Instawards fund clearly scoped, execution-focused work that moves a Stellar project meaningfully forward.
- Sprint scope and award amount are agreed in advance.
- Scope should typically be achievable within 30 days or less.
- Progress is measured against agreed deliverables, not future plans.
- Disbursement requires successful SDF KYC/compliance procedures.
- Completion evidence should emphasize working deliverables, demo readiness, and verifiable Stellar activity.

## SOW-Backed Deliverables

The project has three required deliverables:

1. MPP Code Generator
   - Backend accepts `endpointUrl`, `path`, and `price`.
   - Returns copy-paste-ready Node.js/Express MPP middleware plus a route integration snippet.
   - Primary value: reduce MPP integration from weeks of manual work to under 5 minutes.

2. Website Frontend
   - Browser-accessible React app.
   - Form page, generated-code result page, syntax-highlighted code blocks, one-click copy.
   - No Stellar knowledge should be required from the user.

3. Monitoring Dashboard
   - User inputs Stellar wallet address.
   - Dashboard pulls live testnet data from Stellar Horizon.
   - Shows total USDC received, request/payment count, transaction history, and explorer links.

## Scope Boundaries

These were the original V0/SOW boundaries. The user has explicitly changed scope for V1, so do not use this list to block V1 database/auth/contract work:

- No database.
- No authentication or user accounts.
- No server-side sessions.
- Stateless backend: request input -> generated code output.
- Stellar testnet only.
- USDC only.
- Node.js/Express only.
- Charge intent only.
- No Python/multi-language support in this sprint.
- No fiat on/off ramp.
- No mobile app.
- No production analytics system beyond the Horizon-backed dashboard.
- No smart contracts in this 30-day POC unless the user separately requests them.

## Technical Direction

The final architecture from `TECHNICAL_SPEC.md` is:

- Historical V0 spec baseline: React 18 + Vite 5 + Tailwind CSS + React Router v6 + lucide-react. These are not the current installed version pins.
- `backend/`: Node.js 20 ES modules + Express 4 + Zod + CORS + express-rate-limit.
- Deployment target: VPS with Nginx serving frontend static assets and proxying `/api/*` to backend on port `3001`.
- Process manager: PM2 via root `ecosystem.config.cjs`.
- Dashboard data source: `https://horizon-testnet.stellar.org`.

When implementing, preserve the existing landing page look unless the user asks for visual changes. The landing page started as a single-file app, but the current spec requires migrating it into a routed SPA.

## Current Repository State

As of August 27, 2026:

- Current V1 frontend runtime is React 18, React Router 7, Tailwind CSS 3, Vite 7, GSAP, and lucide-react. Root Vercel Functions use Node.js 22+ and Express 5 where applicable; the legacy generator backend remains on Express 4.

- `frontend/src/App.jsx` is now the React Router root.
- The original landing page has moved to `frontend/src/pages/Landing.jsx`.
- `frontend/src/pages/Generate.jsx`, `Result.jsx`, and `Dashboard.jsx` exist.
- Shared frontend files exist at `frontend/src/colors.js`, `components/AppNavbar.jsx`, and `components/CodeBlock.jsx`.
- `backend/` exists with Express, Zod validation, generator route, and code templates.
- React Router 7 is installed, and browser smoke coverage includes logged-out and authenticated route states across desktop and mobile viewports.
- `frontend/vite.config.js` proxies `/api` to `localhost:3001`.
- `ecosystem.config.cjs` exists for PM2 deployment.
- `../frontend/CLAUDE.md` is legacy guidance from the landing-page-only phase.
- PayGate is now an accepted $5,000 SCF Instaward project; future work should prioritize delivery proof, KYC/compliance follow-through, and demo evidence.
- V1 direction is locked: paid proxy + Freighter login + Supabase API registry + Soroban escrow settlement.
- `PAYGATE_V1_PRODUCT_SPEC.md` records the locked decisions.
- `PAYGATE_V1_DEVELOPMENT_PLAN.md` is locked for implementation by Wildan as of June 4, 2026.
- `contracts/` has been scaffolded for the `paygate-escrow` Soroban spike.
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

Update this section when major milestones land, so future agents inherit accurate context.

## Implementation Priorities

Recommended order:

1. Migrate frontend safely:
   - Extract shared colors to `frontend/src/colors.js`.
   - Move current landing page to `frontend/src/pages/Landing.jsx`.
   - Replace `frontend/src/App.jsx` with React Router root.
   - Add `Generate`, `Result`, and `Dashboard` pages.
   - Add `AppNavbar` and `CodeBlock` shared components.

2. Build backend generator:
   - Add `backend/package.json`.
   - Add Express app in `backend/src/index.js`.
   - Add Zod validator for the three inputs.
   - Add generator route at `POST /api/generate`.
   - Add template functions for middleware and integration snippet.

3. Connect frontend to backend:
   - `POST /api/generate` from `/generate`.
   - Store generated result in `sessionStorage`.
   - Render result page with copy buttons.

4. Build dashboard:
   - Validate Stellar public address format.
   - Store wallet address in `localStorage`.
   - Fetch Horizon operations directly from the browser.
   - Auto-refresh every 30 seconds.

5. Add deployment config and update docs.

## MPP Integration Caution

MPP is new and library APIs may shift. `TECHNICAL_SPEC.md` currently requires generated middleware to use `mppx/express`, `@stellar/mpp/charge/server`, and `USDC_SAC_TESTNET`.

If official Stellar docs or installed package exports disagree with the spec, do not silently improvise. Verify the package/docs, explain the mismatch, and ask the user whether to follow the spec strictly or update the implementation to match the latest official API.

## Validation And Testing

Before claiming completion, run the relevant checks:

- Frontend: `cd frontend && npm run build`.
- Backend, once added: `cd backend && npm run dev` or `npm start`.
- API smoke test: `POST http://localhost:3001/api/generate` with valid and invalid payloads.
- End-to-end browser check for `/`, `/generate`, `/result`, and `/dashboard`.
- Confirm `/result` survives refresh via `sessionStorage`.
- Confirm `/dashboard` handles invalid address, missing testnet account, empty transactions, and real transaction rows.

Use the checklist in `TECHNICAL_SPEC.md` section 10 as the acceptance checklist.

## Agent Behavior

- Treat this as an accepted grant/SOW deliverable with a fixed 30-day execution scope.
- Favor simple, shippable implementation over speculative architecture.
- Keep V0 generator work stateless. For V1 work, Wildan has explicitly approved persistence, wallet sessions, paid proxy state, and contract settlement; follow `PAYGATE_V1_DEVELOPMENT_PLAN.md` after it is locked.
- Do not add dependencies casually; use the stack specified in `TECHNICAL_SPEC.md`.
- Preserve existing visual polish on the landing page during migration.
- Update this file when major architectural decisions or scope changes are made.

## Product Reporting Style

When Wildan asks for a PayGate progress report as if the agent is a product developer reporting to him as CEO, answer in business/product language first.

Do:

- Explain what a user can do with the product today.
- Separate "usable now" from "not proven yet".
- State the product readiness verdict clearly.
- Name the next product milestone.

Do not lead with code files, architecture, or implementation details unless Wildan asks for technical detail.

Preferred short verdict:

> PayGate V1 is a testnet beta candidate. Its hosted gateway loop is proven in isolated staging from guarded API through real MPP payment, escrow credit, dashboard evidence, and withdrawal. Production release is still gated by production Supabase recovery, the hardening migration/contract rollout, and final screenshots/video; mainnet and refund guarantees remain out of scope.
