# PayGate V1 Demo Guide

Date: 2026-06-04
Branch: `codex/paygate-v1`

This guide is the replay script for the PayGate V1 demo.

Use it when Wildan or another agent needs to prove the product story:

```text
developer connects wallet
-> registers a normal API
-> PayGate creates a paid proxy
-> agent calls without payment and receives 402
-> agent pays USDC testnet through MPP
-> PayGate verifies payment and credits escrow
-> PayGate forwards to the upstream API
-> dashboard shows calls, revenue, fees, tx hashes, and withdrawable balance
-> developer withdraws balance with Freighter
```

## Product Story

PayGate V1 is a pay-per-call gateway for APIs.

Before PayGate, a developer who owns an API must build payment logic, wallet handling, MPP integration, request tracking, and settlement themselves.

With PayGate, the developer registers a normal API and receives a paid proxy URL. The API itself stays ordinary: it only checks `X-PayGate-Secret`. PayGate handles the payment challenge, payment verification, request forwarding, revenue tracking, and escrow accounting.

## Demo Roles

| Role | Description |
|---|---|
| Developer | Connects Freighter, registers API, receives 90% of paid calls |
| Agent / buyer | Calls paid proxy and pays per request through Stellar MPP |
| PayGate | Gateway, payment verifier, request forwarder, dashboard, and 10% platform fee recipient |
| Escrow contract | Holds USDC and tracks developer/platform balances |

Known testnet addresses from existing evidence:

| Role | Address |
|---|---|
| Escrow contract | `CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM` |
| PayGate operator | `GAGUU5KHTCX23KGVPQALUKRDYA5DF7KUTOBGGLCPV3LMUPRBCMOX7RNS` |
| Developer wallet | `GD5BCBBDALI3W35QY5DXB6JNP7SAZEXKEMOJJ4AJPTJABL4MTSZUSJKM` |
| Agent payer wallet | `GBGXIGC36FD6COHDTBOA6KU4BW3U7UBVABMHKNRB4CRUHCIKH42IILLW` |

Do not commit secret keys.

## Required Environment

Vercel / server env:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
API_SECRET_ENCRYPTION_KEY=
SESSION_SECRET=
MPP_SECRET_KEY=
ESCROW_CONTRACT_ID=
PAYGATE_OPERATOR_SECRET=
PAYGATE_DEMO_UPSTREAM_SECRET=
STELLAR_NETWORK=stellar:testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

Local agent/client env:

```text
STELLAR_SECRET=
PAYGATE_SAMPLE_URL=
```

`STELLAR_SECRET` is only for the local agent/client. Never put payer secrets in Vercel.

## Demo Setup

1. Deploy or run PayGate V1 with the env above.
2. Open the frontend.
3. Connect Freighter with the developer wallet.
4. Register the demo upstream API:

```text
Name: PayGate Demo Market Signal
Upstream Base URL: https://<your-paygate-domain>
Path: /api/upstream/market-signal
Price: 0.01 USDC
```

5. Copy the generated secret and set it as:

```text
PAYGATE_DEMO_UPSTREAM_SECRET=<generated secret>
```

6. Use the paid proxy URL from dashboard/API detail:

```text
https://<your-paygate-domain>/api/pay/<apiId>
```

## Demo Script

### 1. Show Developer Registration

Open:

```text
https://<your-paygate-domain>/dashboard
```

Show:

- connected developer wallet,
- registered API,
- paid proxy URL,
- current revenue and escrow balance.

### 2. Prove Upstream API Is Normal And Protected

Call without secret:

```bash
curl -i https://<your-paygate-domain>/api/upstream/market-signal
```

Expected:

```text
401 Unauthorized
```

Call with secret:

```bash
curl -i https://<your-paygate-domain>/api/upstream/market-signal \
  -H "X-PayGate-Secret: <generated secret>"
```

Expected:

```json
{
  "signal": "bullish",
  "confidence": 0.82,
  "source": "PayGate demo upstream API"
}
```

### 3. Prove Paid Proxy Returns 402 Without Payment

```bash
curl -i https://<your-paygate-domain>/api/pay/<apiId>
```

Expected:

```text
402 Payment Required
```

Evidence to save:

- response status,
- MPP challenge headers/body,
- PayGate payment/request id.

### 4. Prove Agent Paid Request Returns 200

Run the local agent/client against the paid proxy URL:

```bash
cd examples/express-paid-api
PAYGATE_SAMPLE_URL=https://<your-paygate-domain>/api/pay/<apiId> npm run client
```

Expected:

```text
Response status: 200
```

Expected JSON:

```json
{
  "signal": "bullish",
  "confidence": 0.82,
  "source": "PayGate demo upstream API"
}
```

Evidence to save:

- payment tx hash,
- PayGate credit tx hash,
- final `200` response.

### 5. Prove Dashboard Updates

Refresh dashboard.

Show:

- total calls increased,
- gross revenue increased,
- 10% platform fee shown,
- payment tx hash link,
- credit tx hash link,
- request status `forwarded`,
- withdrawable contract balance.

### 6. Prove Developer Withdrawal

Click `Withdraw` on dashboard.

Expected flow:

```text
prepare transaction
-> Freighter prompts developer signature
-> submit signed XDR
-> withdrawal succeeds
-> dashboard refreshes
```

Show:

- developer balance becomes `0`,
- withdrawal history row appears,
- withdrawal tx hash opens in Stellar Expert testnet.

### 7. Prove Platform Fee Withdrawal

From operator environment:

```bash
npm run admin:withdraw-fees
```

Expected:

```text
PayGate platform fee withdrawal submitted
Amount: <amount> USDC
Tx: <tx hash>
```

This requires `PAYGATE_OPERATOR_SECRET`.

## Evidence Index

Existing evidence files:

| Phase | File |
|---|---|
| Phase 1 settlement proof | `docs/evidence/PAYGATE_V1_PHASE1_SETTLEMENT_PROOF.md` |
| Phase 2 wallet auth | `docs/evidence/PAYGATE_V1_PHASE2_WALLET_AUTH_PROOF.md` |
| Phase 3 API registry | `docs/evidence/PAYGATE_V1_PHASE3_REGISTRY_PROOF.md` |
| Phase 4 upstream API | `docs/evidence/PAYGATE_V1_PHASE4_UPSTREAM_API_PROOF.md` |
| Phase 5 unpaid proxy | `docs/evidence/PAYGATE_V1_PHASE5_PROXY_UNPAID_PROOF.md` |
| Phase 6 paid proxy | `docs/evidence/PAYGATE_V1_PHASE6_PAID_PROXY_PROOF.md` |
| Phase 7 dashboard | `docs/evidence/PAYGATE_V1_PHASE7_DASHBOARD_PROOF.md` |
| Phase 8 withdrawal | `docs/evidence/PAYGATE_V1_PHASE8_WITHDRAWAL_PROOF.md` |

Important Phase 6 live tx hashes:

| Action | Tx hash |
|---|---|
| Agent pays escrow through MPP | `c7cc23efa9130c1178343d22bd98a0fd5f6e23fde2a2224715a0a7a99b3734a6` |
| PayGate credits escrow ledger | `db5e1e1c6d9e6b9d24887ac96cb18a227fd7866d044da6d0db8ccc45c8708ee1` |

Important Phase 1 settlement tx hashes:

| Action | Tx hash |
|---|---|
| Developer withdraw proof | `8f0647f5595020a394df833b1545e2d4c0e192af960db2b1e3c68dfd679d50d7` |
| Platform fee withdraw proof | `0bf30b3fd0b5385f933dd9b22de39a6c8167e2c6405ac075a2bd13466a26d04b` |

## Screenshot Checklist

Capture these during a live demo:

- Freighter connected wallet on dashboard.
- API registration/detail page showing proxy URL.
- Terminal `401` for direct upstream without secret.
- Terminal `402` for unpaid paid proxy call.
- Terminal agent/client `200` response.
- Dashboard payment history with tx hash.
- Dashboard request log with `forwarded`.
- Dashboard escrow balance before withdrawal.
- Freighter withdrawal signing prompt.
- Dashboard withdrawal history after withdrawal.
- Stellar Expert page for payment tx.
- Stellar Expert page for credit/withdraw tx.

## Video Checklist

Record one short demo video with this order:

1. State the problem: APIs are hard to monetize per call, especially for AI agents.
2. Show developer connecting wallet.
3. Register normal API.
4. Show unpaid agent request returning `402`.
5. Run paid agent/client request returning `200`.
6. Show dashboard revenue and tx hashes.
7. Withdraw developer balance.
8. End with Stellar Expert tx proof.

## Final Verification Commands

Run from repo root:

```bash
npm run test:auth
npm run test:registry
npm run test:upstream
npm run test:proxy-unpaid
npm run test:proxy-paid
npm run test:dashboard
npm run test:withdrawal
npm --prefix frontend run build
git diff --check
```

Optional command smoke:

```bash
PAYGATE_REGISTRY_STORE=memory \
PAYGATE_ESCROW_WITHDRAW_MODE=memory \
PAYGATE_MOCK_PLATFORM_FEE_BALANCE_BASE_UNITS=20000 \
npm run admin:withdraw-fees
```

## Known Limitations

- Testnet only.
- USDC only.
- GET API endpoints only.
- AI agent/client is represented by a local script, not a full LLM agent.
- No external user beta yet.
- No fiat checkout.
- No refund flow if upstream fails after payment.
- Auth challenge storage is still memory-based unless migrated to Supabase in a later production-hardening pass.
- Admin/operator secret must stay server-side.
- V1 is demo/POC quality, not mainnet billing infrastructure.
