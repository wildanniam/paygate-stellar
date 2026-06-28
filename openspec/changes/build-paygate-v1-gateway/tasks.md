# PayGate V1 Gateway Tasks

## 1. Product And Agent Memory

- [x] Create `docs/PAYGATE_V1_PRODUCT_SPEC.md`.
- [x] Create and lock `docs/PAYGATE_V1_DEVELOPMENT_PLAN.md`.
- [x] Update `docs/AGENTS.md`.
- [x] Update `docs/CLAUDE.md`.
- [x] Add this OpenSpec change.

## 2. Soroban Escrow Spike

- [x] Scaffold `contracts/` workspace.
- [x] Replace sample contract with `paygate-escrow` skeleton.
- [x] Run contract unit tests (`cargo test`, 4 passed).
- [x] Build contract WASM (`stellar contract build`, hash `b17921b9446d6155d38d7cf9c842082f92c0d01027a59aadc6802a4c9d74d751`).
- [x] Deploy escrow contract on Soroban testnet.
- [x] Confirm USDC testnet token contract address.
- [x] Prove escrow contract can hold USDC testnet.
- [x] Prove `withdraw` sends USDC to developer wallet.
- [x] Prove `withdrawPlatformFee` sends fee to PayGate admin wallet.

## 3. MPP-To-Contract Spike

- [x] Configure MPP Charge recipient as escrow `C...` contract address.
- [x] Run agent/client payment to escrow contract.
- [x] Capture tx hash.
- [x] Confirm MPP verification accepts contract recipient.
- [x] Confirm backend can call `creditPayment` after payment.

## 4. Wallet Auth

- [x] Add Freighter connection.
- [x] Add sign-message challenge endpoint.
- [x] Verify signature server-side.
- [x] Create session for wallet owner.

## 5. API Registry

- [x] Add Supabase project/env configuration docs.
- [x] Create API registry schema.
- [x] Encrypt per-API secret header.
- [x] Allow one wallet to register multiple APIs.
- [x] Auto-fill API owner/payout wallet from connected wallet.

## 6. Paid Proxy

- [x] Create paid proxy route.
- [x] Resolve API config by API id.
- [x] Return 402 for unpaid request.
- [x] Verify MPP payment credential.
- [x] Credit contract balance.
- [x] Forward to upstream API with `X-PayGate-Secret`.
- [x] Log request success/failure.

## 7. Dashboard

- [x] Show registered API list.
- [x] Show paid proxy URL.
- [x] Show total paid calls.
- [x] Show gross revenue.
- [x] Show 10% platform fee.
- [x] Show withdrawable balance from contract.
- [x] Show request/payment logs.
- [x] Add developer withdraw action through Freighter.

## 8. Demo Evidence

- [x] Demo API protected by secret header.
- [x] Agent unpaid request returns 402.
- [x] Agent paid request returns 200 JSON.
- [x] Contract balance updates.
- [x] Developer withdrawal works.
- [x] Platform fee withdrawal works.
- [x] Tx hashes saved.
- [ ] Demo video recorded.

## 9. Testnet Beta Hardening

- [x] Persist wallet auth challenges in Supabase by default.
- [x] Keep memory auth challenge storage only for deterministic local smoke tests.
- [x] Add Vercel SPA rewrites for `/apis/new` and `/apis/:apiId`.
- [x] Add friendly unauthenticated states to V1 API registration/detail pages.
- [x] Add proxy URL and API secret copy affordances to registration/detail pages.
- [x] Remove `frontend/node_modules` and `frontend/dist` from Git tracking.
- [x] Add consolidated `npm run test:beta` local verification command.
- [x] Add beta readiness evidence document.

## 10. Regression And Evidence Tooling

- [x] Add deployed beta preflight for required env, Supabase tables, Vercel rewrites, and generated artifact hygiene.
- [x] Add optional Supabase auth challenge regression for atomic consume and expired challenge rejection.
- [x] Add browser route smoke automation for desktop/mobile SPA refresh states.
- [x] Add live replay evidence template and run-folder initializer.
- [x] Mark older V0/SOW planning docs as historical so current V1 beta gaps remain clear.

## 11. OpenSpec Canonical Alignment

- [x] Promote V1 wallet auth, API registry, paid proxy, and escrow settlement requirements into canonical OpenSpec specs.
- [x] Rewrite the monitoring dashboard spec from Horizon wallet lookup to the current authenticated PayGate workspace.
- [x] Rewrite the website frontend spec to cover the current marketing landing page, `/apis/new`, `/apis/:apiId`, and dashboard subroutes.
- [x] Mark generator and generated middleware specs as legacy V0/SOW compatibility capabilities.
