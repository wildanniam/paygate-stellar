# PayGate V1 Phase 4 Demo Upstream API Proof

> Date: 2026-06-04.
> Phase: Demo Upstream API.
> Result: A normal protected upstream API exists without MPP code.

## Scope

Phase 4 needed to provide an API that PayGate can register and proxy later.

This API intentionally does not contain MPP payment code. It only checks a shared secret header, like a developer-owned API would.

## Route

```text
GET /api/upstream/market-signal
```

Required header:

```text
X-PayGate-Secret: <secret>
```

Required env:

```text
PAYGATE_DEMO_UPSTREAM_SECRET=<same secret registered in PayGate>
```

## Success Response

```json
{
  "signal": "bullish",
  "confidence": 0.82,
  "source": "PayGate demo upstream API"
}
```

## Verification

Commands:

```bash
npm run test:upstream
npm run test:registry
npm run test:auth
git diff --check
```

Results:

- `npm run test:upstream`: passed.
- `npm run test:registry`: passed.
- `npm run test:auth`: passed.
- `git diff --check`: passed.

The upstream smoke test covers:

- Missing `X-PayGate-Secret` returns `401`.
- Wrong `X-PayGate-Secret` returns `401`.
- Correct `X-PayGate-Secret` returns `200`.
- Response JSON matches the expected market signal.
- Source file does not import `@stellar/mpp`.
- Source file does not import `mppx`.

## Registration Docs

See:

```text
docs/demo-upstream-api.md
```

Use that note when registering the demo API in PayGate during later phases.
