# CLAUDE.md

This file is the project memory for Claude Code and other Claude-based agents working in this repository.

## Source of Truth

Read these in order before making code changes:

1. `TECHNICAL_SPEC.md` — canonical implementation plan for the current PayGate 30-day POC.
2. This file — persistent project context, scope boundaries, and agent behavior rules.
3. `frontend/PayGate_LandingPage_Brief.md` — landing page visual/copy reference only.
4. `README.md` — useful overview, but it may lag behind the technical spec.

If any file conflicts with `TECHNICAL_SPEC.md`, follow `TECHNICAL_SPEC.md` and note the conflict.

## Project Context

PayGate is a web tool that helps developers monetize Node.js/Express API endpoints with Stellar Machine Payments Protocol (MPP) micropayments. The intended developer flow is:

1. Fill a 3-field form: API base URL, endpoint path, price per request in USDC.
2. Click Generate.
3. Copy the generated middleware and integration snippet into an Express server.
4. Monitor USDC earnings and request/payment history from a Stellar testnet wallet.

The SOW context is a 30-day Instawards execution sprint, planned to start on May 1, 2026. The project must produce a working, demonstrable POC rather than open-ended exploration.

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

Stay tightly inside the POC scope unless the user explicitly changes it:

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

As of April 26, 2026:

- `frontend/src/App.jsx` is now the React Router root.
- The original landing page has moved to `frontend/src/pages/Landing.jsx`.
- `frontend/src/pages/Generate.jsx`, `Result.jsx`, and `Dashboard.jsx` exist.
- Shared frontend files exist at `frontend/src/colors.js`, `components/AppNavbar.jsx`, and `components/CodeBlock.jsx`.
- `backend/` exists with Express, Zod validation, generator route, and code templates.
- React Router is installed in `frontend/package.json`.
- `frontend/vite.config.js` proxies `/api` to `localhost:3001`.
- `ecosystem.config.cjs` exists for PM2 deployment.
- `frontend/CLAUDE.md` is legacy guidance from the landing-page-only phase.

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

- Treat this as a grant/SOW deliverable with a fixed 30-day execution scope.
- Favor simple, shippable implementation over speculative architecture.
- Keep the app stateless unless the user explicitly changes the scope.
- Do not add dependencies casually; use the stack specified in `TECHNICAL_SPEC.md`.
- Preserve existing visual polish on the landing page during migration.
- Update this file when major architectural decisions or scope changes are made.
