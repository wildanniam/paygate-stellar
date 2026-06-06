# PayGate V1 Phase 2 Wallet Auth Proof

> Date: 2026-06-04.
> Phase: Wallet Auth.
> Result: Developer identity can be proven with a Freighter-compatible sign-message flow.

## Scope

Phase 2 needed to prove that PayGate can identify the API owner through a wallet session before building the API registry.

Implemented flow:

```text
frontend requests Freighter access
-> backend creates challenge
-> Freighter signs challenge message
-> backend verifies signature
-> backend sets signed HTTP-only session cookie
-> frontend can load current session
-> developer can logout
```

## Routes

| Route | Method | Result |
|---|---|---|
| `/api/auth/challenge` | `POST` | Creates a short-lived wallet challenge |
| `/api/auth/verify` | `POST` | Verifies signed challenge and sets session cookie |
| `/api/auth/me` | `GET` | Returns current wallet session |
| `/api/auth/logout` | `POST` | Clears session cookie |

## Frontend

The dashboard now includes a developer wallet panel:

- Connect Freighter.
- Sign PayGate login challenge.
- Show connected wallet.
- Logout.

The connected wallet also fills the dashboard wallet monitor so the existing payment monitor remains usable.

## Session Design

- Cookie name: `paygate_session`.
- Cookie flags: `HttpOnly`, `SameSite=Lax`, `Path=/`.
- `Secure` is enabled in production / HTTPS.
- Session payload contains wallet address, issued time, and expiry.
- Session is signed with `SESSION_SECRET`.
- Wallet private keys are never stored by PayGate.

## Verification

Commands:

```bash
npm run test:auth
npm --prefix frontend run build
```

Results:

- `npm run test:auth`: passed.
- `npm --prefix frontend run build`: passed.

The smoke test covers:

- Invalid wallet challenge rejected.
- Wrong signature rejected.
- Expired challenge rejected.
- Reused challenge rejected.
- Valid signature accepted.
- HTTP-only session cookie created.
- `/api/auth/me` returns authenticated wallet.
- Logout clears cookie.

## Historical Phase Limitation

For Phase 2, `auth_challenges` uses an in-memory store so auth behavior can be proven before introducing Supabase.

This is acceptable for the phase checkpoint, but not final production behavior. During Phase 3, move challenge persistence to Supabase together with the API registry so single-use challenge guarantees survive serverless cold starts and multiple Vercel instances.

Beta hardening update, 2026-06-06: auth challenges are now Supabase-backed by default when Supabase service-role env is configured. Memory challenge storage is only used when `PAYGATE_AUTH_CHALLENGE_STORE=memory` is explicitly set for local smoke tests.

## Required Environment

Production and Vercel preview deployments must set:

```text
SESSION_SECRET=<random string, at least 32 chars>
```
