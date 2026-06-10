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

## Deployment Evidence

Live Vercel replay completed on 2026-06-09 against the production alias.

| Item | Value |
|---|---|
| Live URL | `https://frontend-ten-drab-92.vercel.app` |
| Deployment URL | `https://frontend-83bjgky0w-argalumunon9-9369s-projects.vercel.app` |
| Vercel deployment id | `dpl_ARxeJ7XUAYVHxK9VSiHGCsy8pnBY` |
| Registered API id | `7854e637-a1f6-406d-8d88-0761a78ed60e` |
| Paid proxy URL | `https://frontend-ten-drab-92.vercel.app/api/pay/7854e637-a1f6-406d-8d88-0761a78ed60e` |
| Direct upstream `401` | Passed by terminal replay |
| Paid proxy `402` | Passed by terminal replay |
| Agent paid `200` | Passed by terminal replay |
| Payment tx hash | `1540f83dcdfc1793d7d1d34bb00ea52b27614933f2f46f37a4e4a6ba31b3772d` |
| Credit tx hash | `6d057380f813fd47ce8ed9aab70c5337bf1b6cdcacacddb794a7d458026e9c65` |
| Developer withdrawal tx hash | `1d3996dcfb94bd11e12409e27f123cedc91abaeb12c7879d15b6f0e571c81b73` |
| Operator USDC trustline tx hash | `a547d58013a46eda4372fc21c2b4032543dce8d63bf55c74d155f407a0ba2486` |
| Platform fee withdrawal tx hash | `39f081ba4bc0ed7d1f1dae106c9cd353bacf9c1a110ff25c4f8d4b0998b45f1b` |
| Dashboard evidence | API replay confirmed dashboard summary: `calls=2`, `success=1`, `payments=1`, withdrawable `0.0090000` before withdrawal and `0.0000000` after withdrawal |
| Screenshot/video evidence | Not captured in this automated replay |

Run folder: `docs/evidence/runs/2026-06-09-live-vercel-e2e/`.

Post-replay verification:

| Check | Result |
|---|---|
| `node --env-file=.env.local scripts/beta-preflight.mjs` | Passed, `0 failure(s), 0 warning(s)` |
| Deployed SPA route check for `/`, `/dashboard`, `/apis/new`, `/apis/<apiId>`, `/api/auth/me` | Passed, all returned `200` |
| `npm run test:beta` | Passed |
| `npm run audit:prod` | Passed, `0 vulnerabilities` across root, frontend, backend, and example production installs |
| `npm run test:browser` | Passed route smoke for 4 routes across 2 viewports, plus mocked-Freighter wallet login/API registration/API detail browser flow |

Replay notes:

- The live replay used throwaway funded Stellar testnet wallets for developer and payer roles.
- The developer withdrawal was signed programmatically with the throwaway developer keypair, exercising the same `/api/withdraw/prepare` and `/api/withdraw/submit` deployed endpoints. A Freighter popup was not visually recorded during this automated replay.
- The replay surfaced one operator setup gap: the current operator account did not have a USDC trustline, so the first platform fee withdrawal failed with a token transfer trustline error. Creating the operator USDC trustline fixed the gap, and the platform fee withdrawal then succeeded.
- The deployment used `codex/paygate-v1` at `5988686dffbb16c7159ea20bc9f57872d9330ce9` plus the current `.vercelignore` deployment exclusion for generated/heavy artifacts and the legacy V0 demo API function.

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

Future live deployment replays require Vercel/Supabase/Stellar testnet secrets and either a funded agent payer wallet or the throwaway testnet funding flow used in the 2026-06-09 replay. Do not commit secret keys.

## Known Limitations

- Testnet only.
- USDC only.
- GET JSON APIs only.
- Buyer is represented by a local agent/client script.
- No refund flow if upstream fails after payment.
- No mainnet, compliance, fiat checkout, marketplace, buyer account, or non-Web3 payment abstraction.
- `PAYGATE_OPERATOR_SECRET` is required server-side for live escrow crediting and platform fee withdrawal.
- The full frontend `npm audit` still reports a dev-only Vite/esbuild advisory; production audits pass with `--omit=dev`, and npm only offers a semver-major Vite upgrade path.
