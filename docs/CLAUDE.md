# CLAUDE.md

This file is the project memory for Claude Code and other Claude-based agents working in this repository.

## Source of Truth

Read these in order before making code changes:

1. `PAYGATE_V1_PRODUCT_SPEC.md` — locked V1 product concept for the `codex/paygate-v1` branch.
2. `PAYGATE_V1_DEVELOPMENT_PLAN.md` — locked V1 technical development plan and phase-by-phase execution guide.
3. `TECHNICAL_SPEC.md` — canonical implementation plan for the original PayGate 30-day V0/SOW POC.
4. `PAYGATE_NEXT_PLAN.md` — product/SOW/grant handoff, next plan, and testing playbook.
5. `../openspec/README.md` and relevant `../openspec/specs/*/spec.md` files — capability-level requirements.
6. This file — persistent project context, scope boundaries, and agent behavior rules.
7. `../frontend/PayGate_LandingPage_Brief.md` — landing page visual/copy reference only.
8. `README.md` — useful overview, but it may lag behind the technical spec.

If any file conflicts with `TECHNICAL_SPEC.md`, follow `TECHNICAL_SPEC.md` for V0/SOW work. For the V1 branch, follow `PAYGATE_V1_PRODUCT_SPEC.md` where it intentionally conflicts with the old stateless generator scope.

## V1 Branch Direction

Wildan has approved the V1 pivot on `codex/paygate-v1`.

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

- `frontend/`: React 18 + Vite 5 + Tailwind CSS + React Router v6 + lucide-react.
- `backend/`: Node.js 20 ES modules + Express 4 + Zod + CORS + express-rate-limit.
- Deployment target: VPS with Nginx serving frontend static assets and proxying `/api/*` to backend on port `3001`.
- Process manager: PM2 via root `ecosystem.config.cjs`.
- Dashboard data source: `https://horizon-testnet.stellar.org`.

When implementing, preserve the existing landing page look unless the user asks for visual changes. The landing page started as a single-file app, but the current spec requires migrating it into a routed SPA.

## Current Repository State

As of June 2, 2026:

- `frontend/src/App.jsx` is now the React Router root.
- The original landing page has moved to `frontend/src/pages/Landing.jsx`.
- `frontend/src/pages/Generate.jsx`, `Result.jsx`, and `Dashboard.jsx` exist.
- Shared frontend files exist at `frontend/src/colors.js`, `components/AppNavbar.jsx`, and `components/CodeBlock.jsx`.
- `backend/` exists with Express, Zod validation, generator route, and code templates.
- React Router is installed in `frontend/package.json`.
- `frontend/vite.config.js` proxies `/api` to `localhost:3001`.
- `ecosystem.config.cjs` exists for PM2 deployment.
- `../frontend/CLAUDE.md` is legacy guidance from the landing-page-only phase.
- PayGate is now an accepted $5,000 SCF Instaward project; future work should prioritize delivery proof, KYC/compliance follow-through, and demo evidence.
- V1 direction is locked: paid proxy + Freighter login + Supabase API registry + Soroban escrow settlement.
- `PAYGATE_V1_PRODUCT_SPEC.md` records the locked decisions.
- `PAYGATE_V1_DEVELOPMENT_PLAN.md` is locked for implementation by Wildan as of June 4, 2026.
- `contracts/` has been scaffolded for the `paygate-escrow` Soroban spike.

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

> PayGate is a functional alpha. Users can try the generator and dashboard, but it is not yet fully ready for real API monetization until one end-to-end Stellar testnet payment is proven from generated middleware to dashboard evidence.
