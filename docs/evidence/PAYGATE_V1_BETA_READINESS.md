# PayGate V1 Testnet Beta Readiness

Date: 2026-08-27
Branch: `codex/paygate-v1-hardening` (based on `origin/main`)
Scope: testnet production-beta hardening

## Readiness Verdict

The V1 implementation is regression-clean and is a testnet beta candidate. The local product, browser, contract, package-audit, and secret-scan gates pass.

The current environment is **not deployment-ready yet**. `npm run beta:preflight` reports five external configuration failures: four required deployment values are absent, and the configured Supabase project hostname does not resolve. Do not label a deployment production-beta until this command reports zero failures and the live replay evidence is refreshed.

This is not a mainnet billing product. It remains testnet-only and does not claim refund, compliance, fiat, marketplace, buyer-account, or production incident-response readiness.

## Hardening Completed

- Supabase-backed wallet challenges are the deployment default and are consumed atomically.
- Vercel SPA rewrites cover `/dashboard`, dashboard subroutes, `/apis/new`, and `/apis/:apiId`.
- React Router 7 route behavior is covered for logged-out and authenticated desktop/mobile states.
- Upstream guard verification uses a fresh invalid secret and rejects ambiguous upstream failures.
- Serverless rate limiting fails closed unless an endpoint explicitly opts into a documented fail-open policy; Upstash is required for deployment.
- Session tokens have strict shape, timestamp, lifetime, and cookie-decoding validation.
- Withdrawal preparation expires before the underlying Stellar transaction, leaving a submission buffer.
- New payment IDs use 120 bits of CSPRNG entropy and fit the escrow contract's Soroban `Symbol` key.
- JavaScript audits run independently across root, frontend, backend, and the Express example; RustSec runs separately for the contract lockfile.
- GitHub Actions dependencies are pinned to immutable commit SHAs.
- Generated `frontend/node_modules` and `frontend/dist` content remains untracked.

## Verification Record

Commands were run from the repository root on 2026-08-27.

| Gate | Result |
|---|---|
| `npm run test:beta` | Pass: all phase smokes, payment-ID compatibility, frontend production build, 5 contract tests, and diff check |
| `npm run test:browser` | Pass: 9 logged-out routes and 6 authenticated routes across 2 viewports |
| `npm run audit:prod` | Pass: 0 vulnerabilities across all 4 JavaScript packages |
| `npm run audit:all` | Pass: 0 vulnerabilities across all 4 JavaScript packages, including dev dependencies |
| `npm run audit:rust` | Pass with 3 allowed maintenance warnings; no RustSec vulnerabilities |
| `npm run scan:secrets` | Pass: tracked-file scan found no committed credentials |
| `cargo fmt --all -- --check` | Pass |
| `npm run beta:preflight` | Blocked: 5 external configuration failures listed below |

## Deployment Preflight Blockers

The local `.env.local` was checked without printing any values.

| Blocker | Required action |
|---|---|
| `CRON_SECRET` is absent | Generate a stable random value of at least 16 characters and add it to Vercel environments |
| `PAYGATE_PUBLIC_ORIGIN` is absent | Set the final HTTPS deployment origin without a path |
| `UPSTASH_REDIS_REST_URL` is absent | Create or link the deployment Redis database and add its REST URL |
| `UPSTASH_REDIS_REST_TOKEN` is absent | Add the matching Redis REST token server-side |
| Supabase REST hostname returns `ENOTFOUND` | Re-copy the active project URL or restore or unpause the project, then rerun all table checks |

After fixing those items, run:

```bash
npm run beta:preflight
npm run test:auth:supabase
```

Both commands automatically load `.env.local` when it exists. Real values must remain untracked.

## Dependency Risk Record

`cargo audit` reports no known RustSec vulnerabilities. It does report two unmaintained transitive crates (`derivative 2.2.0`, `paste 1.0.15`) and one yanked transitive crate (`spin 0.9.8`) through the Soroban SDK dependency graph.

The lockfile also contains `soroban-env-host 25.0.1`, which is affected by low-severity [GHSA-pm4j-7r4q-ccg8](https://github.com/stellar/rs-soroban-env/security/advisories/GHSA-pm4j-7r4q-ccg8) and is fixed in 26.0.0. PayGate's escrow does not use `MuxedAddress`; the advisory describes rare transaction failure with full rollback and no state-corruption risk. For this testnet beta, the mitigation is retrying a failed transaction and retaining transaction evidence. Moving to Soroban SDK 26 requires a separate compatibility review, contract build, redeploy, and live settlement replay; it must not be hidden inside a forced dependency update.

## Existing Live Testnet Evidence

The following evidence predates this hardening branch and proves the underlying testnet flows. It does not replace a fresh deployed replay of the hardened build.

| Flow | Evidence |
|---|---|
| Escrow deploy/init/withdraw/platform fee | `docs/evidence/PAYGATE_V1_PHASE1_SETTLEMENT_PROOF.md` |
| Paid proxy real MPP payment and contract credit | `docs/evidence/PAYGATE_V1_PHASE6_PAID_PROXY_PROOF.md` |
| Dashboard implementation proof | `docs/evidence/PAYGATE_V1_PHASE7_DASHBOARD_PROOF.md` |
| Withdrawal implementation proof | `docs/evidence/PAYGATE_V1_PHASE8_WITHDRAWAL_PROOF.md` |

| Action | Existing tx hash |
|---|---|
| Agent pays escrow through MPP | `c7cc23efa9130c1178343d22bd98a0fd5f6e23fde2a2224715a0a7a99b3734a6` |
| PayGate credits escrow ledger | `db5e1e1c6d9e6b9d24887ac96cb18a227fd7866d044da6d0db8ccc45c8708ee1` |
| Developer withdraw proof | `8f0647f5595020a394df833b1545e2d4c0e192af960db2b1e3c68dfd679d50d7` |
| Platform fee withdraw proof | `0bf30b3fd0b5385f933dd9b22de39a6c8167e2c6405ac075a2bd13466a26d04b` |

## Fresh Replay Evidence Slots

Fill these after deploying the hardened branch and replaying the entire flow.

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

Initialize a timestamped evidence folder with `npm run evidence:init` and follow `docs/evidence/PAYGATE_V1_LIVE_REPLAY_TEMPLATE.md`.

## Known Limitations

- Testnet and USDC only.
- V1 paid proxy supports GET JSON APIs only.
- Buyer behavior is represented by an agent/client script.
- No automatic refund when upstream fails after payment.
- No external-user beta, mainnet, fiat checkout, marketplace, buyer accounts, compliance workflow, or production incident response.
- `PAYGATE_OPERATOR_SECRET` remains a privileged server-side testnet signer.
- A complete post-hardening deployed replay, screenshot set, and demo video are still outstanding.
