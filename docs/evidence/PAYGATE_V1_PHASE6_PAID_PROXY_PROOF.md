# PayGate V1 Phase 6 Paid Proxy Proof

> Date: 2026-06-04.
> Phase: Paid Proxy Success Flow.
> Result: Implemented, smoke-tested locally, and live-tested on Stellar testnet.

This document records the Phase 6 evidence for the locked PayGate V1 plan.

## Scope

Phase 6 completes the core product loop after the unpaid `402 Payment Required` challenge:

```text
agent retries with payment credential
-> PayGate maps MPP externalId to proxy request
-> PayGate verifies payment
-> PayGate records tx hash
-> PayGate credits escrow ledger
-> PayGate decrypts X-PayGate-Secret
-> PayGate forwards request to upstream API
-> agent receives upstream JSON
```

## Implemented Behavior

- Paid proxy still creates `proxy_requests` rows for unpaid calls.
- MPP challenges now include `externalId = paymentId`.
- Paid retry reads `externalId` from the submitted MPP credential.
- Credential must map to an existing PayGate request for the same API.
- MPP verification saves receipt tx hash.
- Payment rows save gross amount, developer amount, platform fee, payment tx hash, and contract credit tx hash.
- Backend calls `credit_payment` on the escrow contract in real mode.
- Backend decrypts the registered API secret and forwards to upstream with `X-PayGate-Secret`.
- Upstream success updates request status to `forwarded`.
- Upstream failure updates request status to `upstream_failed`.
- Duplicate payment/retry cannot create a second payment row or double-credit.

## Local Smoke Verification

Command:

```bash
npm run test:proxy-paid
```

Result:

```text
Phase 6 paid proxy success smoke test passed
```

The smoke test uses memory-only mock verification for deterministic local testing:

```text
PAYGATE_REGISTRY_STORE=memory
PAYGATE_MPP_VERIFY_MODE=mock
PAYGATE_ESCROW_CREDIT_MODE=memory
```

The mock mode is blocked in production and only allowed with the memory registry store. The production path still uses:

- `@stellar/mpp` Charge verification,
- persistent MPP replay store,
- Soroban `credit_payment` contract invocation through `PAYGATE_OPERATOR_SECRET`.

## Live Testnet Verification

A live local proxy was run with:

```text
PAYGATE_REGISTRY_STORE=memory
ESCROW_CONTRACT_ID=CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM
PAYGATE_OPERATOR_SECRET=<local testnet operator secret>
STELLAR_SECRET=<local testnet payer secret>
```

The test used the Phase 1 local testnet identities and real `@stellar/mpp` pull-mode Charge verification.

| Action | Tx hash |
|---|---|
| Agent pays escrow through MPP | `c7cc23efa9130c1178343d22bd98a0fd5f6e23fde2a2224715a0a7a99b3734a6` |
| PayGate backend credits escrow ledger | `db5e1e1c6d9e6b9d24887ac96cb18a227fd7866d044da6d0db8ccc45c8708ee1` |

Result:

```text
Phase 6 live testnet paid proxy test passed
```

The live test proved:

- unpaid proxy request returns `402`,
- agent pays real USDC testnet to the escrow contract,
- PayGate verifies the MPP payment,
- PayGate records the payment tx hash,
- PayGate calls `credit_payment` on the escrow contract,
- PayGate records the credit tx hash,
- PayGate forwards to the secret-protected upstream API,
- agent receives `200` JSON.

## Tested Scenarios

The Phase 6 smoke test verifies:

- unpaid request returns `402`,
- challenge includes PayGate `paymentId` as MPP `externalId`,
- paid credential returns `200`,
- upstream JSON is returned to the agent,
- `Payment-Receipt` tx hash is returned,
- proxy request is logged as `forwarded`,
- payer wallet is saved,
- payment row is saved,
- 90/10 fee split is calculated,
- contract credit tx hash is saved,
- duplicate paid retry returns `409`,
- duplicate paid retry does not create another payment row,
- credential for one API is rejected against another API.

## Required Production Env

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
API_SECRET_ENCRYPTION_KEY=
MPP_SECRET_KEY=
ESCROW_CONTRACT_ID=
PAYGATE_OPERATOR_SECRET=
STELLAR_NETWORK=stellar:testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

`PAYGATE_OPERATOR_SECRET` must never be exposed to the frontend.

## Remaining Work

- Replay the live agent payment through the deployed Vercel production proxy after environment variables are configured.
- Surface paid calls, revenue, and tx hashes in the V1 dashboard.
- Add developer withdrawal flow through Freighter.
- Replace memory auth challenge storage with Supabase-backed challenge storage before relying on multi-instance production behavior.
