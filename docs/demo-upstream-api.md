# PayGate Demo Upstream API

This is the normal API used for the PayGate V1 internal demo.

It is intentionally not an MPP-paid endpoint. It behaves like a developer-owned API that only trusts PayGate when PayGate forwards a paid request with the correct secret header.

## Route

```text
GET /api/upstream/market-signal
```

## Required Environment

```text
PAYGATE_DEMO_UPSTREAM_SECRET=<same secret registered in PayGate>
```

## Auth

The endpoint requires:

```text
X-PayGate-Secret: <secret>
```

Without the header, or with the wrong value, the API returns:

```text
401 Unauthorized
```

## Success Response

```json
{
  "signal": "bullish",
  "confidence": 0.82,
  "source": "PayGate demo upstream API"
}
```

## How To Register In PayGate

Use these values in the API registry:

```text
Name: PayGate Demo Market Signal
Upstream Base URL: https://<your-vercel-domain>
Path: /api/upstream/market-signal
Method: GET
Price: 0.01 USDC
```

Set the generated PayGate secret as `PAYGATE_DEMO_UPSTREAM_SECRET` in the deployment that hosts this upstream endpoint.
