# PayGate Express Paid API Demo

Internal demo lab untuk membuktikan flow PayGate end-to-end:

```text
PayGate generator -> protected Express API -> agent pays with Stellar testnet -> dashboard shows payment
```

## What This Demo Proves

- API owner can protect an Express endpoint with PayGate-generated middleware.
- Request without payment returns `402 Payment Required`.
- Agent/client can pay `0.01 USDC` on Stellar testnet using MPP Charge.
- Protected API returns JSON after payment.
- Recipient wallet payment can be checked in PayGate dashboard.

## Setup

Use Node.js 22+ for the current `@stellar/mpp` demo dependencies.

This demo uses Express 5 because current `mppx` middleware helpers expect `express >=5`.

```bash
cd examples/express-paid-api
npm install
cp .env.example .env
```

Fill `.env`:

```bash
PORT=4000
STELLAR_RECIPIENT=G...      # API owner public key
MPP_SECRET_KEY=...          # strong random string
STELLAR_SECRET=S...         # payer/agent secret key
PAYGATE_SAMPLE_URL=http://localhost:4000/v1/market-signal
```

Use Stellar Lab to create and fund testnet accounts:

- Create/fund testnet account: https://lab.stellar.org/account/fund
- Circle USDC faucet: https://faucet.circle.com

## Run The API

```bash
npm start
```

The paid endpoint is:

```text
GET http://localhost:4000/v1/market-signal
```

Production demo endpoint after Vercel deploy:

```text
GET https://your-vercel-domain.vercel.app/api/demo/market-signal
```

Successful paid response:

```json
{
  "signal": "bullish",
  "confidence": 0.82,
  "source": "PayGate demo API"
}
```

## Test No-Payment Challenge

In another terminal:

```bash
curl -i http://localhost:4000/v1/market-signal
```

Expected:

```text
HTTP/1.1 402 Payment Required
```

The response should include MPP payment challenge headers/body.

## Test Agent Payment

After setting `STELLAR_SECRET` for a funded payer wallet:

```bash
npm run client
```

To test against production Vercel instead of the local API:

```bash
PAYGATE_SAMPLE_URL=https://your-vercel-domain.vercel.app/api/demo/market-signal npm run client
```

Expected:

- client logs payer public key,
- MPP progress events appear,
- final HTTP status is `200`,
- response body contains the market signal JSON.

## Dashboard Proof

1. Open PayGate dashboard.
2. Enter `STELLAR_RECIPIENT`.
3. Confirm total USDC/payment count updates.
4. Open tx hash in Stellar Expert testnet.

## Known Limitations

- Testnet only.
- Charge mode only.
- Dashboard counts matching payments as paid requests.
- No user accounts, prepaid balance, or non-Web3 buyer abstraction yet.
- This demo uses an in-memory MPP store and is not production durable.
