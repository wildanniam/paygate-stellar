# PayGate V1 Phase 7 Full Demo Flow Proof

Date: 2026-06-11

## Scenario Proven

This smoke test verifies the internal production-demo story at the application logic level:

1. Developer registers a new upstream API.
2. PayGate creates the API in `pending_setup`.
3. Pending API proxy is not publicly payable yet.
4. Developer installs the generated `X-PayGate-Secret` guard.
5. Developer verifies setup.
6. PayGate activates the API.
7. Unpaid agent request receives `402 Payment Required`.
8. Paid agent request receives `200 OK` and upstream JSON.
9. Dashboard summary includes API, successful call, and payment history.
10. Demo reset archives the paid API instead of deleting history.
11. The same upstream endpoint can be registered again after archive.

## Evidence Command

```bash
npm run test:demo-flow
```

## Result

```text
Phase 7 full demo flow smoke test passed
```

## Notes

- The test uses the memory registry store and mock MPP verification.
- The upstream API still enforces a real `X-PayGate-Secret` guard in the local HTTP server.
- This does not replace a live testnet/Vercel demo, but it proves the product logic path is internally coherent.
