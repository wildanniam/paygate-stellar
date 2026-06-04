# PayGate V1 Phase 5 Paid Proxy Unpaid Proof

> Date: 2026-06-04.
> Phase: Paid Proxy Unpaid Flow.
> Result: Public paid proxy can resolve an API, log a request, and return a valid MPP 402 challenge.

## Scope

Phase 5 needed to prove the public paid proxy entrypoint before building the paid success/forwarding path.

Implemented flow:

```text
agent calls GET /api/pay/:apiId
-> PayGate resolves active API config
-> PayGate creates proxy_requests row
-> PayGate generates short payment id
-> PayGate returns 402 Payment Required with Stellar MPP challenge
```

The proxy intentionally does not forward to upstream yet. If a paid credential reaches the success branch, the current response is `501` until Phase 6 implements forwarding.

## Route

```text
GET /api/pay/:apiId
```

## Response Headers

Unpaid requests include:

```text
WWW-Authenticate: Payment ...
X-PayGate-Request-Id: <proxy request id>
X-PayGate-Payment-Id: <short payment id>
```

The MPP challenge uses:

| Field | Value |
|---|---|
| Method | `stellar` |
| Network | `stellar:testnet` |
| Currency | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |
| Recipient | `PAYGATE_ESCROW_CONTRACT_ID` |

## Verification

Commands:

```bash
npm run test:proxy-unpaid
npm run test:registry
npm run test:auth
npm run test:upstream
git diff --check
```

Results:

- `npm run test:proxy-unpaid`: passed.
- `npm run test:registry`: passed.
- `npm run test:auth`: passed.
- `npm run test:upstream`: passed.
- `git diff --check`: passed.

The proxy unpaid smoke test covers:

- Unknown API id returns `404`.
- Inactive API returns `404`.
- Active API without payment returns `402`.
- Challenge includes Stellar MPP method.
- Challenge amount is converted to USDC stroops.
- Challenge currency is official testnet USDC SAC.
- Challenge recipient is escrow contract id.
- `proxy_requests` row is created with `challenge_sent`.
- Response includes PayGate request id and payment id headers.

## Required Environment

Production and Vercel preview deployments must set:

```text
SUPABASE_URL=<supabase project url>
SUPABASE_SERVICE_ROLE_KEY=<server-only service role key>
MPP_SECRET_KEY=<strong random secret>
PAYGATE_ESCROW_CONTRACT_ID=<deployed escrow C... contract>
```

## Important Limitation

Phase 5 proves unpaid challenge generation only. Payment verification, `creditPayment`, and upstream forwarding are Phase 6.
