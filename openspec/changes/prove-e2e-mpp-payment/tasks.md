# Tasks: prove-e2e-mpp-payment

## 1. Sample API

- [ ] Create `examples/express-paid-api/package.json`.
- [ ] Create `examples/express-paid-api/server.js`.
- [ ] Create `examples/express-paid-api/.env.example`.
- [ ] Generate `mpp-middleware.js` from PayGate and place a copy in the example.
- [ ] Add a paid route returning JSON via `res.json()`.
- [ ] Verify server starts with env vars configured.
- [ ] Verify missing env vars fail with clear PayGate errors.

## 2. No-Payment Challenge Test

- [ ] Start sample API.
- [ ] Call paid route without payment.
- [ ] Confirm HTTP 402 response.
- [ ] Capture response headers/body for documentation.

## 3. Testnet Wallet Setup

- [ ] Create or identify recipient Stellar testnet account.
- [ ] Fund recipient with testnet XLM.
- [ ] Create or identify payer Stellar testnet account.
- [ ] Fund payer with testnet XLM.
- [ ] Ensure payer has USDC testnet balance/trustline as needed.
- [ ] Record public keys and keep secret keys out of git.

## 4. MPP Client

- [ ] Create `examples/express-paid-api/client.js`.
- [ ] Configure it with payer secret key via env var.
- [ ] Request paid endpoint through the MPP client.
- [ ] Confirm successful protected API response.
- [ ] Print or capture payment/transaction evidence.

## 5. Dashboard Proof

- [ ] Open PayGate `/dashboard`.
- [ ] Input recipient wallet address.
- [ ] Confirm payment appears in table.
- [ ] Confirm total USDC updates.
- [ ] Confirm total paid requests/payments updates.
- [ ] Open tx hash in Stellar Expert testnet.
- [ ] Capture dashboard screenshot.

## 6. Documentation And Evidence

- [ ] Add example README with setup and test instructions.
- [ ] Update root README to reflect generator, result page, dashboard, and example flow.
- [ ] Add known limitations around paid request counting and in-memory store.
- [ ] Add tx hash evidence note if appropriate.
- [ ] Update `PAYGATE_NEXT_PLAN.md` with completed scenario results.

## 7. Acceptance

- [ ] `npm run build` passes in `frontend`.
- [ ] Backend generate endpoint still passes valid/invalid smoke tests.
- [ ] Sample API no-payment request returns 402.
- [ ] Sample API paid request returns protected data.
- [ ] Dashboard shows the real payment.
- [ ] Evidence is sufficient for the SOW demo video.

