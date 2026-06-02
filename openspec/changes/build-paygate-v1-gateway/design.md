# PayGate V1 Gateway Design

## Product Model

PayGate V1 is a paid proxy gateway:

```text
AI agent
→ PayGate paid proxy
→ original developer API
```

PayGate is no longer only a generator. It owns the payment/checking/proxy experience and records usage.

## Data Split

Supabase stores product data:

- developer wallet address,
- API name,
- upstream URL,
- method,
- path,
- price,
- encrypted secret header,
- generated paid proxy URL,
- request logs,
- payment metadata,
- tx hashes.

Soroban contract stores financial state:

- developer withdrawable balance,
- PayGate platform fee balance,
- processed payment IDs,
- withdrawal state/events.

## Payment And Settlement Flow

1. Agent requests a paid proxy endpoint.
2. PayGate returns `402 Payment Required`.
3. Agent pays USDC testnet through Stellar MPP Charge.
4. MPP payment recipient is the Soroban escrow contract address.
5. Backend verifies the payment and maps it to the API owner.
6. Backend/operator calls `creditPayment(paymentId, developerWallet, grossAmount)`.
7. Contract splits 90% developer balance and 10% PayGate fee.
8. PayGate forwards request to upstream API.
9. Developer withdraws by signing with Freighter.

## Smart Contract

Minimum functions:

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

## API Protection

PayGate generates a unique secret header for every API:

```text
X-PayGate-Secret: <unique secret>
```

Original APIs should reject requests without this header. Secrets must be encrypted at rest in Supabase.

## Known Risk

For the V1 demo, credit timing is:

```text
payment valid
→ credit developer balance
→ forward upstream API
```

If the upstream API fails, request status is logged as failed but developer remains credited. Refund/pending-settlement is a future improvement.

## First Spike

Before large UI work:

- compile/test escrow contract,
- deploy escrow on testnet,
- prove MPP Charge can pay `C...` recipient,
- call `creditPayment`,
- withdraw through Freighter,
- prove paid proxy can forward after payment.
