# Build PayGate V1 Gateway

## Why

The original PayGate SOW/V0 scope proves that developers can generate MPP middleware and monitor Stellar testnet payments. After product review, Wildan decided that the code-generator-only model is too weak as a business because PayGate does not sit in the transaction flow and cannot naturally monetize per call.

V1 should make the product concept clearer:

> PayGate is a pay-per-call gateway for APIs.

Developers should register APIs in PayGate. AI agents should call PayGate paid proxy endpoints. PayGate should handle MPP payment, track calls/revenue, forward requests to the original API, take a 10% platform fee, and let developers withdraw from Soroban escrow.

## What Changes

- Add Freighter wallet login with sign-message challenge.
- Add Supabase-backed API registry.
- Add paid proxy endpoint behavior.
- Add per-API unique encrypted secret header.
- Add Soroban escrow contract for developer balances, PayGate fee balance, processed payment IDs, and withdrawal.
- Add AI-agent/client demo flow.
- Make V1 demo use GET, REST, JSON, USDC testnet only.

## Out Of Scope For V1 Demo

- Mainnet.
- Human checkout UI.
- Automatic refund.
- Streaming/file upload proxying.
- Multi-method/multi-currency support.
- Marketplace/listing discovery.
- Full production compliance claims.

## Success Criteria

- Developer can connect Freighter and register an API.
- PayGate creates a paid proxy endpoint.
- Unpaid agent request gets HTTP 402.
- Agent pays via Stellar MPP Charge.
- Payment reaches a Soroban escrow contract recipient.
- Backend credits developer balance in the contract.
- PayGate forwards request to the original API with `X-PayGate-Secret`.
- Dashboard shows request/payment state, gross revenue, 10% fee, withdrawable balance, and tx hash.
- Developer can withdraw balance through Freighter.
