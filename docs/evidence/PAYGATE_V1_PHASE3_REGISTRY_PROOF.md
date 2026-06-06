# PayGate V1 Phase 3 API Registry Proof

> Date: 2026-06-04.
> Phase: Supabase API Registry.
> Result: Logged-in developers can register and manage APIs through server-side registry endpoints.

## Scope

Phase 3 needed to let a wallet-authenticated developer register a normal API and receive a paid proxy URL plus setup secret.

Implemented flow:

```text
developer has PayGate wallet session
-> developer submits API metadata
-> backend auto-fills owner wallet from session
-> backend generates unique X-PayGate-Secret
-> backend encrypts secret server-side
-> backend stores API registry row
-> developer receives proxy URL and setup instructions
-> developer can view API detail and toggle active state
```

## Backend

Added registry routes:

| Route | Method | Result |
|---|---|---|
| `/api/apis` | `GET` | Lists APIs owned by the current wallet session |
| `/api/apis` | `POST` | Registers a new GET API |
| `/api/apis/:apiId` | `GET` | Returns API detail for the owner |
| `/api/apis/:apiId` | `PATCH` | Updates owner-controlled metadata, currently `active` and `name` |

Added server helpers:

- Supabase service-role registry adapter.
- Explicit memory adapter for local smoke tests only.
- AES-256-GCM API secret encryption.
- API secret generation with `pgsec_` prefix.
- Owner-session guard using Phase 2 session cookie.

## Supabase

Added migration:

```text
supabase/migrations/20260604000000_paygate_v1_registry.sql
```

The migration creates:

- `developers`
- `auth_challenges`
- `apis`
- `proxy_requests`
- `payments`
- `withdrawals`

RLS is enabled on all tables. Vercel Functions use the Supabase service role key server-side.

Historical note: Phase 3 created the `auth_challenges` table before the auth endpoints moved off memory storage. Beta hardening on 2026-06-06 now uses Supabase-backed auth challenges by default, with memory mode reserved for local smoke tests.

## Frontend

Added pages:

| Route | Purpose |
|---|---|
| `/apis/new` | Register an API |
| `/apis/:apiId` | View API detail, proxy URL, secret, setup snippet, active toggle |

Updated primary navigation:

- V1 nav now links to Dashboard and New API.
- V0 generator remains available at `/generate`, but is no longer primary navigation.

## Verification

Commands:

```bash
npm run test:registry
npm run test:auth
npm --prefix frontend run build
git diff --check
```

Results:

- `npm run test:registry`: passed.
- `npm run test:auth`: passed.
- `npm --prefix frontend run build`: passed.
- `git diff --check`: passed.

The registry smoke test covers:

- Unauthenticated user cannot create API.
- Logged-in wallet can create API.
- API owner wallet is filled from session.
- API secret is not stored plaintext.
- Encrypted secret fields are stored.
- Developer can list only owned APIs.
- API detail decrypts secret for the owner.
- Other wallet cannot update owner API.
- Active/inactive state works.

## Required Environment

Production and Vercel preview deployments must set:

```text
SESSION_SECRET=<random string, at least 32 chars>
SUPABASE_URL=<supabase project url>
SUPABASE_SERVICE_ROLE_KEY=<server-only service role key>
API_SECRET_ENCRYPTION_KEY=<random string, base64 32-byte key, or 64-char hex key>
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `API_SECRET_ENCRYPTION_KEY` to the frontend.

## Important Limitation

The paid proxy endpoint is not implemented in Phase 3. Registered APIs receive a proxy URL shape, but `/api/pay/:apiId` is intentionally reserved for Phase 5 and Phase 6.
