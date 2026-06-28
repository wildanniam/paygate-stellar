# Change Proposal: prove-e2e-mpp-payment

## Summary

Historical V0/SOW proof track: prove the original generator-based PayGate flow end-to-end:

1. Generate middleware from the PayGate web app.
2. Install the generated middleware into a sample Express API.
3. Trigger a paid API request.
4. Execute a real MPP charge payment on Stellar testnet.
5. Confirm the paid API request succeeds.
6. Confirm PayGate dashboard shows the received USDC payment and transaction hash.

## Why

At the time of this change, PayGate was a functional alpha. The generator, frontend, backend, and dashboard shell existed, but the most important business claim was not proven yet:

> A developer can generate code, paste it into an API, receive a Stellar testnet USDC payment, and monitor that payment in PayGate.

The SOW requires demo evidence, tx hashes, and a dashboard showing real on-chain activity. Without this change, PayGate is still perceived as a code generator mockup rather than a working MPP integration tool.

Current status: PayGate V1 has moved beyond this generator-first path. The current product direction is the hosted paid proxy: wallet auth, API registry, `/api/pay/:apiId`, escrow settlement, and the wallet-scoped dashboard workspace. Use this change only as historical evidence for the earlier SOW path.

## Scope

In scope:

- Sample Express paid API under `examples/express-paid-api/`.
- Sample MPP charge client or clear executable client instructions.
- Testnet wallet setup documentation.
- End-to-end testing instructions.
- Evidence capture: tx hash, dashboard screenshot, and demo notes.
- Small product copy adjustment if needed to avoid overclaiming per-endpoint analytics.

Out of scope:

- Database.
- Authentication.
- Mainnet.
- Multi-currency support.
- Non-Express framework support.
- MPP session/channel intent.
- Production-grade analytics.
- Smart contracts.

## Success Criteria

- Requesting the sample paid endpoint without payment returns HTTP 402.
- Requesting the sample paid endpoint with valid MPP payment returns the protected JSON response.
- A real Stellar testnet tx hash is produced.
- The tx hash opens in Stellar Expert testnet.
- PayGate dashboard shows the payment row for the recipient wallet.
- Demo script can be followed by a human or agent.
