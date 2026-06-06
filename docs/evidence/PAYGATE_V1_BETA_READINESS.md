# PayGate V1 Testnet Beta Readiness

Date: 2026-06-06
Branch: `codex/paygate-v1`
Scope: testnet production-beta hardening

## Readiness Verdict

PayGate V1 is a testnet beta candidate. The codebase now supports the full V1 product loop with deploy-safe route handling, Supabase-backed wallet auth challenges, API registry persistence, paid proxy logging, escrow crediting, dashboard reporting, and Freighter-signed withdrawal.

This is not a mainnet billing product. It remains testnet-only and should be presented as a beta/demo system until mainnet, refund, compliance, incident response, and security review work are explicitly scoped.

## Beta Hardening Completed

- Auth challenges default to Supabase `auth_challenges` storage when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Local smoke tests opt into memory auth challenge storage with `PAYGATE_AUTH_CHALLENGE_STORE=memory`.
- Challenge consumption is atomic at storage level: a used or expired challenge cannot create another session.
- Vercel SPA rewrites cover `/dashboard`, `/apis/new`, and `/apis/:apiId`.
- API registration and API detail pages show a Freighter login panel instead of raw unauthenticated API errors.
- Proxy URL and API secret copy controls are available on registration/detail pages.
- `frontend/node_modules` and `frontend/dist` are removed from Git tracking and remain ignored.
- `npm run test:beta` runs the local beta verification suite.
- `npm run beta:preflight` checks deployed env, Supabase tables, Vercel rewrites, and generated-artifact hygiene.
- `npm run test:browser` provides a local desktop/mobile SPA route smoke for `/`, `/dashboard`, `/apis/new`, and `/apis/:apiId`.
- `npm run evidence:init` creates a timestamped live replay evidence folder from `PAYGATE_V1_LIVE_REPLAY_TEMPLATE.md`.
- Safe dependency cleanup was applied. Root, backend, frontend production, and example production audits are expected to pass with `--omit=dev`.

## Existing Live Testnet Evidence

| Flow | Evidence |
|---|---|
| Escrow deploy/init/withdraw/platform fee | `docs/evidence/PAYGATE_V1_PHASE1_SETTLEMENT_PROOF.md` |
| Paid proxy real MPP payment and contract credit | `docs/evidence/PAYGATE_V1_PHASE6_PAID_PROXY_PROOF.md` |
| Dashboard implementation proof | `docs/evidence/PAYGATE_V1_PHASE7_DASHBOARD_PROOF.md` |
| Withdrawal implementation proof | `docs/evidence/PAYGATE_V1_PHASE8_WITHDRAWAL_PROOF.md` |

Important live tx hashes already captured:

| Action | Tx hash |
|---|---|
| Agent pays escrow through MPP | `c7cc23efa9130c1178343d22bd98a0fd5f6e23fde2a2224715a0a7a99b3734a6` |
| PayGate credits escrow ledger | `db5e1e1c6d9e6b9d24887ac96cb18a227fd7866d044da6d0db8ccc45c8708ee1` |
| Developer withdraw proof | `8f0647f5595020a394df833b1545e2d4c0e192af960db2b1e3c68dfd679d50d7` |
| Platform fee withdraw proof | `0bf30b3fd0b5385f933dd9b22de39a6c8167e2c6405ac075a2bd13466a26d04b` |

## Deployment Evidence Slots

Fill these after replaying the beta on the deployed Vercel project with real environment variables.

| Item | Value |
|---|---|
| Live URL | `TBD` |
| Registered API id | `TBD` |
| Paid proxy URL | `TBD` |
| Direct upstream `401` screenshot | `TBD` |
| Paid proxy `402` screenshot | `TBD` |
| Agent paid `200` screenshot | `TBD` |
| Payment tx hash | `TBD` |
| Credit tx hash | `TBD` |
| Withdrawal tx hash | `TBD` |
| Dashboard screenshot | `TBD` |
| Demo video link | `TBD` |

## Verification Commands

Run from the repo root:

```bash
npm run test:beta
npm run audit:prod
npm run test:browser
npm audit --omit=dev
npm --prefix frontend audit --omit=dev
npm --prefix backend audit --omit=dev
npm --prefix examples/express-paid-api audit --omit=dev
git diff --check
```

Optional deployed checks:

```bash
npm run beta:preflight
npm run test:auth:supabase
```

Live deployment replay still requires user-provided Vercel/Supabase/Stellar testnet secrets and a funded agent payer wallet. Do not commit secret keys.

## Known Limitations

- Testnet only.
- USDC only.
- GET JSON APIs only.
- Buyer is represented by a local agent/client script.
- No refund flow if upstream fails after payment.
- No mainnet, compliance, fiat checkout, marketplace, buyer account, or non-Web3 payment abstraction.
- `PAYGATE_OPERATOR_SECRET` is required server-side for live escrow crediting and platform fee withdrawal.
- The full frontend `npm audit` still reports a dev-only Vite/esbuild advisory; production audits pass with `--omit=dev`, and npm only offers a semver-major Vite upgrade path.
