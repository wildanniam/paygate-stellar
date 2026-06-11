# PayGate V1 Product Spec

> Status: locked product concept for the `codex/paygate-v1` development branch.
> Date locked: 2026-06-02.

This document records the product direction Wildan chose after reviewing the limitations of the original SOW/V0 code-generator concept.

`TECHNICAL_SPEC.md` remains the canonical spec for the original Instawards SOW deliverable. This V1 spec intentionally changes the product scope for the new branch.

---

## 1. Product Positioning

PayGate V1 is a **pay-per-call gateway for APIs**.

The product is no longer only a middleware/code generator. In V1, PayGate sits in front of a developer's API as a paid proxy:

```text
AI agent / machine client
→ PayGate paid proxy endpoint
→ original developer API
```

This makes the product easier to understand as a business:

- developers register APIs instead of integrating MPP manually,
- AI agents pay per API call,
- PayGate can track calls and revenue,
- PayGate can take a 10% platform fee,
- developers can withdraw their balance.

---

## 2. Locked Decisions

| Area | Decision |
|---|---|
| Target user | API owner / developer |
| Buyer | AI agent / machine client |
| Core product | Paid proxy gateway |
| Payment rail | Stellar MPP Charge |
| Network | Stellar/Soroban testnet for V1 demo |
| Asset | USDC testnet |
| Wallet login | Freighter |
| Auth | Connect wallet + sign message challenge |
| API registry | Supabase |
| Financial ledger | Soroban escrow smart contract |
| Fee | 10% platform fee |
| API protection | Unique PayGate-generated secret header per API |
| Buyer UX | Script/client only for demo |
| API scope | GET, REST, JSON only |
| Infra demo | Vercel Free + Supabase Free + Stellar/Soroban testnet |
| V0 generator | Do not carry into the V1 product experience; branch from current state and rebuild toward V1 |

---

## 3. Core Flow

```text
Developer connects Freighter wallet
→ Developer registers an API
→ PayGate stores API config in Supabase
→ PayGate creates a paid proxy endpoint
→ AI agent calls the paid proxy
→ PayGate returns 402 Payment Required
→ AI agent pays USDC via MPP to the escrow contract
→ PayGate verifies payment
→ PayGate backend calls creditPayment on the escrow contract
→ Contract splits 90% developer balance / 10% PayGate fee
→ PayGate forwards request to original API with X-PayGate-Secret
→ Agent receives the original JSON response
→ Developer sees call/payment in dashboard
→ Developer withdraws balance by signing with Freighter
```

---

## 4. API Registry

API registry means the list of APIs a developer has registered with PayGate.

Supabase stores API/product data:

- `apiId`,
- owner wallet,
- API name,
- upstream URL,
- method,
- path,
- price per call,
- encrypted secret header,
- lifecycle status: `pending_setup`, `active`, or `archived`,
- generated paid proxy URL,
- request logs,
- payment metadata,
- transaction hashes.

The API registry should not live in the smart contract because it contains mutable and sensitive product data. The smart contract only stores financial state.

Mental model:

```text
Supabase knows which API belongs to whom.
Smart contract knows who can withdraw how much.
```

---

## 5. Smart Contract Ledger

The Soroban escrow contract stores money-related state:

- developer withdrawable balance,
- PayGate platform fee balance,
- processed payment IDs,
- withdrawal execution/events.

The contract does not store:

- upstream URLs,
- API names,
- encrypted API secrets,
- request/response data,
- rich dashboard metadata.

### Minimum Contract Functions

The V1 spike starts with:

```text
init(admin, token)
creditPayment(paymentId, developerWallet, grossAmount)
withdraw()
withdrawPlatformFee()
balance(wallet)
platformFeeBalance()
processed(paymentId)
```

Only the PayGate operator/admin wallet can call `creditPayment`.

Developers withdraw their own balance by signing with Freighter.

PayGate admin/operator withdraws platform fee separately.

---

## 6. Fee Model

PayGate takes a 10% platform fee per paid call.

Example:

```text
API price: 0.01 USDC
Developer earning: 0.009 USDC
PayGate fee: 0.001 USDC
```

The contract records both balances:

```text
developerBalance += grossAmount * 90%
platformFeeBalance += grossAmount * 10%
```

Fee does not transfer to PayGate automatically on every request. It accumulates in the escrow contract until PayGate admin calls `withdrawPlatformFee`.

---

## 7. Secret Header Protection

To prevent buyers from bypassing PayGate and calling the original API directly, V1 uses a generated secret header.

PayGate generates a different secret for every registered API.

Developer API should reject requests without the secret:

```js
if (req.headers['x-paygate-secret'] !== process.env.PAYGATE_SECRET) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

Product requirement:

- Every API secret must be unique.
- Secrets must be encrypted at rest in Supabase.
- The UI must explain clearly that the original API should not remain publicly accessible without this protection.

---

## 8. Wallet Auth

V1 uses Freighter as the developer login mechanism.

Do not treat a plain public key read as full login. Use a sign-message challenge:

```text
frontend requests challenge from backend
backend creates nonce/message
developer signs message with Freighter
backend verifies signature
backend creates session for that wallet
```

This proves the user controls the connected wallet.

The connected wallet becomes:

- developer identity,
- API owner,
- payout wallet.

---

## 9. Credit Timing

For V1 demo:

```text
payment valid
→ credit developer balance in contract
→ forward request to upstream API
```

Known limitation:

If upstream API fails after payment is valid, the developer has already been credited. The request should be logged as failed, but refund is not implemented in V1 demo.

Future PR:

- add pending balance,
- credit only after upstream success,
- or implement refund/failed-delivery handling.

---

## 10. First Development Milestone

Before building a large UI, prove the technical spike:

1. Minimal Soroban escrow contract compiles and tests pass.
2. `@stellar/mpp` Charge can use a `C...` contract address as recipient.
3. Agent/client can pay USDC testnet to the escrow contract.
4. Backend can call `creditPayment`.
5. Developer can withdraw through Freighter.
6. PayGate can still proxy the original API after payment.

This is the first milestone for `codex/paygate-v1`.

---

## 11. V1 Demo Limitations

- Testnet only.
- USDC only.
- GET endpoints only.
- REST/JSON only.
- Buyer is script/agent client only.
- No human checkout UI.
- No automatic refund.
- No streaming or file upload.
- No mainnet production claim.
- No compliance claim yet.

---

## 12. Source Trail

- Original SOW: `/Users/wildanniam/Downloads/PayGate_SOW_Proposal.docx`
- Atlas Vault: `20 - Projects/PayGate/PayGate V1 Product Concept.md`
- Local repo: `/Users/wildanniam/Development/project/paygate`
- Research finding: installed `@stellar/mpp` docs state Charge recipient can be a `G...` account or `C...` contract address.
