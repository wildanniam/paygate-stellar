# Design: prove-e2e-mpp-payment

## Current State

PayGate currently has:

- React generator page at `/generate`.
- Result page at `/result`.
- Backend `POST /api/generate`.
- Generated Express middleware using:
  - `mppx/express`
  - `@stellar/mpp/charge/server`
  - `USDC_SAC_TESTNET`
  - `Store.memory()`
- Dashboard fetching Horizon testnet operations.

The missing proof is that the generated code works in a real Express API and produces dashboard-visible Stellar testnet payment data.

## Proposed Test Harness

Create:

```text
examples/express-paid-api/
├── package.json
├── server.js
├── client.js
├── mpp-middleware.js
├── .env.example
└── README.md
```

### Sample Server

The server should:

- Use Express.
- Load env vars with `dotenv/config`.
- Import `paywall` from `mpp-middleware.js`.
- Mount a paid route such as `/v1/data`.
- Return JSON via `res.json()`.

### Sample Client

The client should:

- Use `@stellar/mpp/charge/client`.
- Use a payer testnet secret key.
- Request the paid route.
- Handle the payment challenge through MPP client behavior.
- Print the API response and any useful transaction/payment evidence.

If a fully automated client is blocked by SDK uncertainty, document the exact blocker and provide the closest manual/CLI sequence possible.

## Wallets And Environment

Required env vars for sample API:

```bash
STELLAR_RECIPIENT=G...
MPP_SECRET_KEY=...
```

Required env vars for sample client:

```bash
STELLAR_PAYER_SECRET=S...
PAYGATE_SAMPLE_URL=http://localhost:4000/v1/data
```

The recipient and payer should be Stellar testnet accounts.

## Dashboard Validation

After successful payment:

1. Open PayGate `/dashboard`.
2. Input `STELLAR_RECIPIENT`.
3. Confirm the payment appears.
4. Confirm total USDC and paid requests update.
5. Open tx hash in Stellar Expert testnet.

## Product Copy Consideration

The current dashboard counts matching payments as requests. For the POC, this is acceptable if the UI labels it as `Total Paid Requests` or `Total Payments`.

Do not claim true per-endpoint analytics until endpoint metadata is implemented.

## Risks

- MPP SDK APIs are new and may differ from docs.
- Circle faucet or testnet liquidity may interrupt testing.
- Dashboard filter may need adjustment after inspecting real Horizon operation shape.
- In-memory store is acceptable for POC but not durable across restarts.

