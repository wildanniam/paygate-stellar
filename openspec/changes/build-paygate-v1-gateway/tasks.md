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

- [ ] Create paid proxy route.
- [ ] Resolve API config by API id.
- [ ] Return 402 for unpaid request.
- [ ] Verify MPP payment credential.
- [ ] Credit contract balance.
- [ ] Forward to upstream API with `X-PayGate-Secret`.
- [ ] Log request success/failure.

## 7. Dashboard

- [ ] Show registered API list.
- [ ] Show paid proxy URL.
- [ ] Show total paid calls.
- [ ] Show gross revenue.
- [ ] Show 10% platform fee.
- [ ] Show withdrawable balance from contract.
- [ ] Show request/payment logs.
- [ ] Add developer withdraw action through Freighter.

## 8. Demo Evidence

- [ ] Demo API protected by secret header.
- [ ] Agent unpaid request returns 402.
- [ ] Agent paid request returns 200 JSON.
- [x] Contract balance updates.
- [x] Developer withdrawal works.
- [x] Platform fee withdrawal works.
- [x] Tx hashes saved.
- [ ] Demo video recorded.
