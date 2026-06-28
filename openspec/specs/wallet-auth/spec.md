# wallet-auth Specification

## Purpose

Use a Stellar Freighter wallet as the developer identity for PayGate V1, without adding a username/password account system.

## Requirements

### Requirement: Create signed wallet login challenges

PayGate SHALL create a short-lived sign-message challenge for a valid Stellar public key.

#### Scenario: Challenge created

- GIVEN a developer submits a valid `G...` wallet address
- WHEN `POST /api/auth/challenge` succeeds
- THEN the response includes `challengeId`, `walletAddress`, `message`, and `expiresAt`
- AND the challenge is stored in Supabase by default

#### Scenario: Invalid wallet address

- GIVEN a developer submits an invalid wallet address
- WHEN `POST /api/auth/challenge` runs validation
- THEN PayGate returns HTTP 400
- AND no challenge is created

### Requirement: Support memory challenge storage only for local smoke tests

PayGate SHALL use Supabase challenge storage by default and SHALL only use memory storage when explicitly configured for local tests.

#### Scenario: Local memory challenge mode

- GIVEN `PAYGATE_AUTH_CHALLENGE_STORE=memory`
- WHEN a local smoke test creates and consumes a challenge
- THEN PayGate uses in-memory challenge storage
- AND this mode is not documented as a production deployment option

### Requirement: Verify Freighter signatures

PayGate SHALL verify the signed message returned by Freighter before creating a session.

#### Scenario: Valid signature

- GIVEN a challenge exists for wallet `G...`
- AND the developer signs the challenge with the same wallet
- WHEN `POST /api/auth/verify` receives the signature
- THEN PayGate verifies the signature
- AND consumes the challenge
- AND sets a wallet session cookie
- AND returns the authenticated wallet address

#### Scenario: Reused or expired challenge

- GIVEN a challenge is already used or expired
- WHEN `POST /api/auth/verify` is called
- THEN PayGate rejects the request
- AND does not create a session

### Requirement: Expose session state

PayGate SHALL let the frontend check whether a wallet session exists.

#### Scenario: Authenticated session

- GIVEN a valid PayGate session cookie exists
- WHEN `GET /api/auth/me` is called
- THEN the response includes `authenticated: true`, `walletAddress`, and `expiresAt`

#### Scenario: Unauthenticated visitor

- GIVEN no valid PayGate session cookie exists
- WHEN `GET /api/auth/me` is called
- THEN the response includes `authenticated: false`

### Requirement: Logout clears session

PayGate SHALL clear the wallet session on logout.

#### Scenario: Logout

- GIVEN a developer is authenticated
- WHEN `POST /api/auth/logout` succeeds
- THEN the session cookie is cleared
- AND subsequent protected API calls require authentication

## Known Limitations

- Freighter is the only supported developer wallet in V1.
- Wallet identity is also the API owner and payout wallet.
- There is no email/password account recovery.
