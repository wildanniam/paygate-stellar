# PayGate V1 Developer Guide

PayGate V1 is a **pay-per-call gateway for APIs**.

The main idea:

```text
Your API stays normal
-> PayGate creates a paid proxy URL
-> agents call the PayGate proxy
-> PayGate collects payment
-> PayGate forwards paid requests to your API
```

This guide explains what a developer must do after registering an API in PayGate.

---

## Quickstart

1. Open PayGate.
2. Connect Freighter on Stellar Testnet.
3. Go to `Register API`.
4. Enter:
   - API name,
   - upstream base URL,
   - GET path,
   - price per call in USDC.
5. Copy the generated **Proxy URL**.
6. Copy the generated **API Secret**.
7. Store the API Secret in your upstream API server env.
8. Add the guard code to your upstream API.
9. Test direct upstream access returns `401`.
10. Test PayGate proxy access returns `402` before payment.
11. Run the agent/client payment script and confirm `200`.

---

## Mental Model

### Before PayGate

```text
Buyer / agent
-> your API
```

If your API is public, anyone can call it directly.

### After PayGate

```text
Buyer / agent
-> PayGate proxy URL
-> your API
```

The buyer should not call your original API directly. They should call the PayGate proxy.

---

## Proxy URL

After registration, PayGate gives you a Proxy URL:

```text
https://paygate-stellar.vercel.app/api/pay/<apiId>
```

This is the URL you give to agents or machine clients.

Expected behavior:

| Request | Expected result |
|---|---|
| Proxy without payment | `402 Payment Required` |
| Proxy after valid MPP payment | `200 OK` + upstream JSON |

---

## API Secret

PayGate also gives you an API Secret.

This secret is shared between:

- PayGate proxy,
- your upstream API server.

PayGate sends it when forwarding paid requests:

```text
X-PayGate-Secret: <your-api-secret>
```

Your upstream API must check this header.

Why:

```text
If your upstream API stays public without a guard,
buyers can bypass PayGate and call your API without paying.
```

---

## Store the Secret

In your upstream API server env:

```env
PAYGATE_SECRET=copy_secret_from_paygate
```

Do not expose this secret in frontend code.

---

## Express Guard Example

Add this guard to the route you registered in PayGate:

```js
const PAYGATE_SECRET = process.env.PAYGATE_SECRET;

function requirePayGate(req, res, next) {
  if (req.get('X-PayGate-Secret') !== PAYGATE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

app.get('/v1/data', requirePayGate, (req, res) => {
  res.json({
    ok: true,
    source: 'Your paid API'
  });
});
```

This is not magic. It simply makes sure your API only responds when PayGate forwards a paid request.

---

## Testing

### 1. Direct upstream should reject

Call your original API directly:

```bash
curl -i https://api.yourservice.com/v1/data
```

Expected:

```text
401 Unauthorized
```

### 2. PayGate proxy should request payment

Call the PayGate proxy without payment:

```bash
curl -i https://paygate-stellar.vercel.app/api/pay/<apiId>
```

Expected:

```text
402 Payment Required
```

### 3. Agent/client should pay and receive data

Create local env for the buyer/client script:

```env
STELLAR_SECRET=S_SECRET_PAYER_TESTNET
PAYGATE_SAMPLE_URL=https://paygate-stellar.vercel.app/api/pay/<apiId>
```

Run:

```bash
cd examples/express-paid-api
npm run client
```

Expected:

```text
Response status: 200
```

The response body should be your upstream API JSON.

---

## SDK Middleware

SDK middleware is **not required** for V1.

Current V1 requirement:

```text
Add a small guard that checks X-PayGate-Secret.
```

Future SDK role:

```text
Install a package that wraps this guard for Express, Next.js, Hono, Fastify, and other frameworks.
```

For now, the manual guard is faster, clearer, and easier to debug.

---

## Demo API

PayGate includes a protected demo upstream:

```text
/api/upstream/market-signal
```

For hosted demo testing, the demo upstream expects:

```env
PAYGATE_DEMO_UPSTREAM_SECRET=<generated-secret>
```

Known caveat:

```text
If you register the built-in demo upstream manually,
the generated API secret must match PAYGATE_DEMO_UPSTREAM_SECRET.
```

This is demo-specific. A real developer puts the generated API secret into their own API server env.

---

## V1 Boundaries

Current V1 demo scope:

- Stellar testnet only.
- USDC testnet only.
- GET endpoints only.
- REST/JSON APIs only.
- No streaming.
- No file upload.
- No mainnet billing.
- No prepaid balance/account system yet.
- No fiat checkout yet.

---

## Troubleshooting

### Proxy returns `401`

Likely cause:

```text
PayGate forwarded to upstream, but upstream rejected the secret.
```

Check:

- Is `PAYGATE_SECRET` set in your upstream server?
- Does it match the API Secret shown in PayGate?
- Is the upstream guard checking `X-PayGate-Secret`?

### Proxy returns `402`

This is correct before payment.

Run the agent/client with a funded Stellar testnet payer wallet.

### Direct upstream returns `200`

This is bad for monetization.

It means buyers can bypass PayGate. Add the guard to your upstream API.

