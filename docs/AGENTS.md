# Hero demo placement — 15 September 2026

Owner accepts the separate hero placement study and requests implementation. Standard UI increment on issue #5 / draft PR #6; do not merge. Visual target: `hero-placement-study.html` in the 13 September visualization session. Keep centered hero, existing brand/media and the five-section narrative.

Place a shallow demo surface at the lower hero transition. Group the request strip, example price and one stable action; use a smaller gateway and a larger response. Remove the separate playback bar and duplicate reset. Payment state belongs to the gateway, delivery state to the response. Keep a polite live status and optional payload. The existing simulation must still pause at402, credit before forwarding, and cancel stale runs; no wallet/network actions. On phones, request/action → compact gateway → response; controls ≥44px and readable supporting text. Native signal travel/verification trace/response reveal follow actual state, with stable layout and motion-off/reduced-motion alternatives. Existing fiber stack fades into shared ink behind the demo; no regenerated media or dependencies. Verify desktop/tablet/390/320px, explicit payment/replay, rapid clicks, payload, keyboard, scroll entry and motion off; build and existing19tests.

Implementation and verification completed: shallow grouped demo, stable46px action, larger response, bounded background mask and native state-driven signals. Final build and19 regression tests pass; Chrome desktop/tablet/390/320px and explicit payment/replay/keyboard/motion-off checked. Full record: `docs/design/interaction-choreography.md#hero-demo-placement--15-september-2026`. Owner approval covers the study direction; assembled visual feedback remains open.

---

# Setup selection and card feedback — 14 September 2026

Owner asks for unmistakable active setup artwork, smoother step changes, and whole-card pricing hover. Standard UI increment; reuse issue #5 / draft PR #6, no merge. Preserve existing palette, artwork, five sections and payment truth.

Target: selected setup stage has a persistent Viewing marker, bright tab plate, stronger shield material and a quiet grounding light. Inactive hover must stay weaker than selection. Keep artwork DOM mounted; transition from current transforms over 420ms instead of remounting/restarting all objects. Caption uses three persistent overlapping rows; mobile crossfades one stage at a time with hidden inactive controls. Keyboard focus remains distinct. Pricing cards lift 4px with edge light/shadow in 220ms on fine-pointer hover, native controls retain focus/press. No card-wide click action or tilt. Motion-off/reduced-motion removes travel while preserving visual state. No new media/dependency. Verify rapid switching, keyboard, desktop/mobile, hover leave, exact pricing and motion-off.

---

# Surface blending and cloud candidate — 14 September 2026

Owner reports hard color patches inside the pricing artwork and across surrounding sections, and rejects the contour cloud. Scope: correct compositing and produce a better cloud study in the existing five-section preview; issue #5 / draft PR #6, no merge.

Verified cause: price art is inset 5% from the top and 14% from the bottom, while the card, baked image background and opaque gradient end used different ink values. The overlay ended abruptly at those inset bounds. Section glows also extended beyond clipped containers. Shared `--lp-art-surface: #090613` and `--lp-art-rgb: 9, 6, 19` now anchor pricing/access/setup; alpha masks feather the whole media stack (poster plus pointer canvas), replacing the price's opaque gradient. Pricing/receipt glows fade before all section edges; closing uses the existing canvas token. Keep intentional lavender share-card hierarchy and semantic payment states.

One Higgsfield still replaces the rejected contour cloud: natural asymmetrical cumulus volume, pearl/lavender light, indigo shadows and partly hidden lilac sun; no concentric cavity. This is an AI-selected candidate now integrated for owner review, NOT owner-approved artwork. Exact prompt, job and sources: `docs/design/weather-volume-asset.json`. Full WebP about 20 KB, small about 6.5 KB; no video or dependency added. Pricing retains native pointer response, while the hero uses the matching thumbnail. Earlier proposal-only notes below are historical and superseded by this actual integration.

Validation: production build and all 19 motion/simulation tests pass; desktop 1470px and mobile 390px inspected, exact .05/.045/.005 relationship checked, motion-off compositing and hero thumbnail verified. No financial behavior or homepage route changed.

---

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

## Landing Design Preview — 2026-09-14

Latest pricing feedback: implement real wave deformation on hover and price change, preserving 27/3 bars and immediate financial values. See `design/interaction-choreography.md#pricing-feedback-follow-up`. The owner rejects the contour cloud form; the volumetric replacement brief is an AI proposal, not a generated or approved replacement. Continue issue #5 / draft PR #6 with no merge.

Latest owner authorization: implement and evaluate the five-section motion audit. `design/interaction-choreography.md` is the current interaction record: visible-scroll-first hero, state-aware atmosphere, linked pricing, native installation objects with one active mobile stage, stable payment/animated response evidence, and fiber-textured native closing. One accepted Higgsfield weather still replaces the rainy mismatch; two image attempts are recorded in `design/interaction-assets.json`. Continue draft PR #6, no UI merge or additional section. Visual feedback on this implementation remains pending.


Previous owner lock: the CTA/FAQ/interactive-wordmark study is accepted and may now be implemented as the fifth, closing section. `design/closing-section.md` records the approved composition, native material, pointer light, responsive/keyboard/motion contract and checks. It supersedes the four-section-only/fifth-section exclusion in historical entries below. Preserve the existing four sections, homepage and draft/unmerged PR #6. No new video or Higgsfield generation is required for the accepted finish.

Previous content lock: revise the four existing sections, with no new section at that time. Runtime belongs to the hero; pricing/90–10 split to capabilities; provider setup to the spatial scene; independent payment/response evidence to the receipt. Implemented in `design/content-revision.md`: remove repeated hero earnings, price → share → access DOM/mobile order, direct setup tabs without Next/Replay, and two Weather API records (delivered or credited payment plus upstream failure). Preserve the approved dark/violet assets and cursor behavior. This supersedes earlier three-receipt and serial-setup instructions. No new generation, homepage replacement or UI merge. Visual feedback on this revision is pending.

Previous interaction milestone: apply local cursor response to the existing Higgsfield media and analyze other assets. This is implemented with shared `PointerFlow` / `pointerFlowRenderer`, no new library or generation. Hero/receipt get local displacement, weather/setup a gentler response, shield light only. Fine-pointer desktop enhancement; native text/data stay stable, touch retains ambient media, motion-off/offscreen removes renderers. Read `design/pointer-flow.md` for asset rationale, lifecycle rules and checks. Visual approval remains pending; scope stays four sections.

Issue #5 / draft PR #6 provide the isolated lazy `/design-preview` route. The owner accepts the visual sections 2–3 and now asks to continue with exactly one next section after the hero/navigation revision. The preview has four sections: an open hero transaction scene, artwork-led capabilities, spatial setup, and an inspectable payment receipt. The new receipt section awaits owner visual feedback. Read `../frontend/DESIGN.md`, `design/payment-records.md` and `design/payment-records-assets.json`; earlier design notes preserve superseded history.

Keep the original dark/purple tokens. Quality-led Higgsfield credit use is authorized. Exact data and controls stay native; receipt IDs and amounts are clearly illustrative, with payment credit separate from API delivery. `StoryMedia` accepts an optional `basePath` (default `/brand/visual-story`) for section-specific media, with poster fallback, viewport/visibility pause and global motion preference. Animations never determine product state. Preview controls do not run wallet/API/payment operations. A fifth section, homepage replacement, backend/dependency changes, release and merge remain outside scope.

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
- Beta hardening utilities now exist: `npm run beta:preflight` for deployed env/Supabase/rewrite checks, `npm run test:auth:supabase` for optional Supabase auth challenge regression, `npm run test:browser` for local desktop/mobile SPA route smoke, and `npm run evidence:init` for timestamped live replay evidence folders.
- Vercel SPA rewrites include `/apis/new` and `/apis/:apiId`, so direct refreshes of V1 app routes should resolve to the React app after deployment.
- API lifecycle hardening is implemented as of June 11, 2026. New registered APIs start as `pending_setup`; they become `active` only after `/api/apis/:apiId/verify` confirms the upstream responds with the generated `X-PayGate-Secret`; used APIs can be archived and unused APIs can be deleted.
- Live duplicate registrations are blocked by normalized upstream base URL + method + path. Archived APIs are intentionally reusable so Wildan can repeat demos with the same demo upstream.
- Direct PATCH activation is blocked. `PATCH /api/apis/:apiId` is for safe metadata updates such as name; activation must go through Verify setup.
- Dashboard/API detail UX now exposes lifecycle badges, setup guidance, `Verify setup`, and delete/archive reset controls. Navbar active states were fixed so `Dashboard` and `Register API` are not ambiguous. Evidence: `docs/evidence/ui/PHASE5_API_LIFECYCLE_UX.md` and `docs/evidence/ui/PHASE6_NAVBAR_ACTIVE_STATE.md`.
- Full internal V1 demo proof is covered by `npm run test:demo-flow`: register API -> pending setup -> verify setup -> unpaid `402` -> paid `200` -> dashboard update -> archive/delete reset -> re-register archived endpoint. Evidence: `docs/evidence/PAYGATE_V1_PHASE7_FULL_DEMO_FLOW_PROOF.md`.
- `frontend/node_modules` and `frontend/dist` are ignored and should remain untracked. Use `npm run build` to regenerate build output locally.
- `npm run test:beta` is the consolidated local beta smoke command.

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

Dependency security maintenance (September 2026): see `DEPENDENCY_SECURITY.md`. Use Node >=22, retain MPP/SDK compatibility and the documented parser overrides, run `npm run audit:prod` across all four lockfiles plus `npm --prefix frontend audit` for build tooling, and run `npm run test:dependencies`, `npm run test:beta`, and `npm run test:browser` for dependency changes. Router is now declarative v7 with React 18. Finish installs/builds before browser tests; do not mutate their node_modules concurrently. Passing mocked payment tests does not establish a new live settlement proof.

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

## Landing preview scope — 13 September 2026

Current authority is the visual revision described at the top of this file and in `frontend/DESIGN.md`. The previous capabilities acceptance and setup workspace are superseded by explicit owner criticism. The hero remains accepted; revised capabilities/setup await feedback on draft PR #6. Preserve actual product prerequisites and distinguish illustrations from real operations.
