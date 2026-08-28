# PayGate V1 Testnet Beta Readiness

Date: 2026-08-28
Branch: `codex/paygate-v1-hardening` (based on `origin/main`)
Scope: testnet production-beta hardening

## Readiness Verdict

The V1 implementation is regression-clean and is a testnet beta candidate. The local product, browser, contract, package-audit, and secret-scan gates pass.

The hardened branch is deployed and replayed successfully in the isolated staging environment at `https://project-02fi8.vercel.app`. The production Vercel project has its future-only origin, cron secret, and Upstash integration configured, but no production deployment was triggered.

Production release is still gated by Supabase availability. The production project is paused, and Supabase reports that a member of its organization has reached the two-active-free-project limit. PayGate staging belongs to a separate organization and does not count toward that member's limit; pausing staging does not unblock production. Affected organization members must free a slot from one of their own active projects or upgrade before production can resume. Do not label the production URL production-beta until that gate and the final evidence capture are complete.

This is not a mainnet billing product. It remains testnet-only and does not claim refund, compliance, fiat, marketplace, buyer-account, or production incident-response readiness.

## Hardening Completed

- Supabase-backed wallet challenges are the deployment default and are consumed atomically.
- Vercel SPA rewrites cover `/dashboard`, dashboard subroutes, `/apis/new`, and `/apis/:apiId`.
- React Router 7 route behavior is covered for logged-out and authenticated desktop/mobile states.
- Upstream guard verification uses a fresh invalid secret and rejects ambiguous upstream failures.
- Serverless rate limiting fails closed unless an endpoint explicitly opts into a documented fail-open policy; Upstash is required for deployment.
- Direct and Vercel Marketplace Upstash environment names are supported, with counters isolated by deployment origin when staging and production share a Redis service.
- Redis aliases resolve as complete URL/token pairs; partial or conflicting pairs are rejected instead of being combined across services.
- Session tokens have strict shape, timestamp, lifetime, and cookie-decoding validation.
- Pending endpoint claims expire after seven days, do not globally reserve unverified third-party endpoints, and are unique only per owner. Atomic activation lets one verified API win the global active endpoint claim.
- Paid forwarding uses a conditional database claim and a stable upstream `Idempotency-Key`, preventing concurrent serverless retries from forwarding the same request together.
- Escrow credits persist their exact signed XDR before submission, recover ambiguous Stellar outcomes by transaction hash, and serialize the shared operator source account with a Supabase lease.
- Withdrawal rows are unique by transaction hash and recover ambiguous insert responses by rereading the existing record.
- Dashboard totals come from an exact Supabase aggregate RPC rather than capped recent feeds; only credited payments count as revenue and daily buckets remain chronological.
- Escrow instance storage, developer balances, platform fees, and processed-payment markers renew TTL during use; the contract test advances the ledger beyond the renewal threshold.
- Dependency review, CodeQL, and Dependabot configuration complement the package/Rust audits.
- Withdrawal preparation expires before the underlying Stellar transaction, leaving a submission buffer.
- New payment IDs use 120 bits of CSPRNG entropy and fit the escrow contract's Soroban `Symbol` key.
- JavaScript audits run independently across root, frontend, backend, and the Express example; RustSec runs separately for the contract lockfile.
- GitHub Actions dependencies are pinned to immutable commit SHAs.
- Generated `frontend/node_modules` and `frontend/dist` content remains untracked.

## Verification Record

Commands were run from the repository root on 2026-08-28.

| Gate | Result |
|---|---|
| `npm run test:beta` | Pass: all phase smokes, payment-ID compatibility, frontend production build, 6 contract tests, and diff check |
| `npm run test:browser` | Pass: 9 logged-out routes and 6 authenticated routes across 2 viewports |
| `npm run audit:prod` | Pass: 0 vulnerabilities across all 4 JavaScript packages |
| `npm run audit:all` | Pass: 0 vulnerabilities across all 4 JavaScript packages, including dev dependencies |
| `npm run audit:rust` | Pass with 3 allowed maintenance warnings; no RustSec vulnerabilities |
| `npm run scan:secrets` | Pass: tracked-file scan found no committed credentials |
| `cargo fmt --all -- --check` | Pass |
| `npm run test:distributed-state:supabase` | Pass against isolated staging; atomic claims, leases, exact analytics, and cleanup verified |
| `npm run test:staging:live-replay` | Pass against deployed staging: direct `401`, unpaid `402`, real paid `200`, credit, dashboard, and withdrawal |
| `npm run beta:preflight` | Release-gated for production; staging schema/runtime checks and live replay passed |

## Production Release Gate

Production Vercel configuration was prepared without deploying or printing secret values.

| Item | Status |
|---|---|
| `CRON_SECRET` | Configured for the next production deployment |
| `PAYGATE_PUBLIC_ORIGIN` | Configured as `https://frontend-ten-drab-92.vercel.app` for the next production deployment |
| Upstash REST configuration | Linked to production through Vercel Marketplace aliases; namespace isolation is verified |
| Production Supabase | Paused; Supabase blocks resume because a production-organization member is at the active free-project limit |

Release sequence:

1. Affected production-organization members must pause or delete an active project they explicitly choose, or upgrade the applicable Supabase organization. PayGate staging does not need to be paused.
2. Resume the existing PayGate production Supabase project.
3. Verify and, where absent, apply these migrations in order:
   - `supabase/migrations/20260604000000_paygate_v1_registry.sql`
   - `supabase/migrations/20260604000001_paygate_v1_paid_proxy.sql`
   - `supabase/migrations/20260611000000_paygate_api_lifecycle_status.sql`
   - `supabase/migrations/20260611000001_paygate_api_unique_live_endpoint.sql`
   - `supabase/migrations/20260628050000_paygate_withdrawal_preparations.sql`
   - `supabase/migrations/20260828000000_paygate_distributed_state_hardening.sql`
4. Build the reviewed escrow WASM, deploy and initialize a fresh TTL-aware testnet contract with the production operator and testnet USDC SAC, and update production `ESCROW_CONTRACT_ID`. The existing contract does not acquire new code from a Vercel deployment.
5. Run the production preflight and Supabase auth/distributed-state smokes before any production deployment:

```bash
npm run beta:preflight
npm run test:auth:supabase
npm run test:distributed-state:supabase
```

6. Deploy production, replay the live flow, and capture the final screenshots and video evidence.

Both commands automatically load `.env.local` when it exists. Real values must remain untracked. No database transfer or staging-to-production data swap is required.

## Production Infrastructure Probe

Read-only probes against the existing production Vercel deployment on 2026-08-27 produced the expected split result for a paused database:

| Probe | Result |
|---|---|
| Landing page | `200` |
| Direct refresh `/dashboard` | `200` |
| Direct refresh `/apis/new` | `200` |
| Supabase-backed `POST /api/auth/challenge` | `503`; production Supabase is paused |
| Staging `POST /api/auth/challenge` after restoration | `200` |

This proves that the current production Vercel routing is available, but it cannot prove database-backed production behavior until Supabase permits the project to resume.

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

## Hardened Staging Replay

The isolated staging deployment completed a fresh end-to-end testnet replay after the withdrawal reconciliation fix.

| Action | Fresh staging evidence |
|---|---|
| Stable staging URL | `https://project-02fi8.vercel.app` |
| Agent pays escrow through MPP | `cc3ca30779097200af3d25f945a19ad84ec0a94d7b9cbb8049310773d78edd92` |
| PayGate credits escrow ledger | `43fad6b081e50bf32e15217217f3bce3ee9a2b2148deb6fa53363047be617e5f` |
| Developer withdrawal | `ff373f0a96f99156c6ca16fe0ab011be280ff44629e3c685702847767427330f` |
| Reconciled prior chain-success/database-failure withdrawal | `aa3c463308b8b0b2ad117383018348d853e3c3c657d818a2af45e6d911198e9b` |

## Distributed-State Hardening Replay

On 2026-08-28, the isolated staging project received the distributed-state migration and a fresh contract built from the current TTL-aware source. No production database, Vercel deployment, environment, or contract was changed.

| Item | Evidence |
|---|---|
| Staging Supabase project ref | `bdsahlijbhipzekhtyjq` |
| Stable staging URL | `https://project-02fi8.vercel.app` |
| Staging Vercel deployment | `dpl_4RTpauce5J9XPVMKkENxqBz1Z2sz` |
| Escrow WASM SHA-256 | `f0565cd5a3cbd9ab32ef8dbd01804432cae9ae729bd3ff1660136343649c6c12` |
| Fresh escrow contract | `CA5EI464RMAR55BQ6RYV3O6XX2LWGTI5CYGABDIXFKUKLCERQRGEQWPD` |
| WASM upload tx | `fb0e8a61e4be56ca3f4d5c8b66318856921dad45deb4fde545b78ebeca9f56ac` |
| Contract deploy tx | `547118d714735e7b675a83a0c175883891a7d9b0341e390c906af7f481207f05` |
| Contract init tx | `e4131ae4f0221c51aadf71ec2f87a13b6485fd0f9d8215543c1dcd0f2da62adb` |
| Real MPP payment tx | `379d490016bd7820365c84d3df3c61a9f2cec81e1e5c74b7010997be03f12ebb` |
| Crash-safe escrow credit tx | `eeff9ab24fe12bddc7930f74b44a715654e13b65d84aaa235dc3e935ec86d469` |
| Developer withdrawal tx | `ee985b7936912308a253e2ca6c8911be76b5fecea40d0e259a884b762283268a` |
| Remaining platform fee | `0.0001000 USDC` (10% of the `0.0010000 USDC` replay payment) |

The replay used the deployed HTTP surface, not local route handlers. It verified the guarded upstream without a secret returns `401`, the unpaid proxy returns `402`, the MPP client pays and receives protected JSON with `200`, the payment reaches `credited`, dashboard totals and both transaction hashes are correct, and the signed withdrawal clears the developer escrow balance. The temporary API, developer, withdrawal, and MPP replay rows were then confirmed absent from staging.

## Production Replay Evidence Slots

Fill these after deploying the exact reviewed commit to production and replaying the entire flow.

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
- Atomic forwarding plus a stable `Idempotency-Key` prevents concurrent PayGate forwards. Exactly-once side effects still depend on the upstream honoring that key if PayGate dies after the upstream commits but before the response state is stored.
- Contract entries renew to approximately 30 days when used. A completely inactive deployment still needs maintenance traffic or a restore procedure before archived state expires.
- No external-user beta, mainnet, fiat checkout, marketplace, buyer accounts, compliance workflow, or production incident response.
- `PAYGATE_OPERATOR_SECRET` remains a privileged server-side testnet signer.
- The production Supabase project is currently paused; an affected production-organization member must free an active-project slot or upgrade before release.
- A production replay, screenshot set, and demo video are still outstanding. Both the hardened staging transaction replay and the newer distributed-state replay are complete.
