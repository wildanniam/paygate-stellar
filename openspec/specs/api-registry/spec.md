# api-registry Specification

## Purpose

Let authenticated developers register normal upstream APIs and receive PayGate paid proxy endpoints, encrypted upstream secrets, and setup verification state.

## Requirements

### Requirement: Require wallet session for registry actions

API registry routes SHALL require a valid PayGate wallet session.

#### Scenario: Unauthenticated registry request

- GIVEN no valid session cookie exists
- WHEN a client calls `GET /api/apis`, `POST /api/apis`, `GET /api/apis/:apiId`, `PATCH /api/apis/:apiId`, `DELETE /api/apis/:apiId`, or `POST /api/apis/:apiId/verify`
- THEN PayGate returns HTTP 401

### Requirement: Store API registry in Supabase

PayGate SHALL store registered API configuration in Supabase by default.

#### Scenario: API registered

- GIVEN a logged-in developer submits API name, upstream base URL, path, and price
- WHEN `POST /api/apis` succeeds
- THEN PayGate stores the API config
- AND associates it with the developer wallet
- AND returns a paid proxy URL
- AND returns the setup secret one time for onboarding

### Requirement: Validate registered API input

PayGate SHALL validate API name, upstream base URL, path, and price before creating an API.

#### Scenario: Invalid registration body

- GIVEN a request body is missing required fields or has invalid values
- WHEN `POST /api/apis` validates the body
- THEN PayGate returns HTTP 400
- AND includes field-level validation details

### Requirement: Encrypt API secrets

PayGate SHALL encrypt per-API secret headers at rest.

#### Scenario: Secret generated

- GIVEN a developer registers an API
- WHEN PayGate creates the API secret
- THEN the secret is unique for that API
- AND the stored value is encrypted
- AND the decrypted value is available only to authenticated detail/setup flows and paid forwarding

### Requirement: Reserve endpoints only after verification

PayGate SHALL allow unverified developers to attempt setup without globally reserving an endpoint. Only one active API may own the same normalized method, upstream base URL, and path. One wallet may have only one non-expired pending claim for the same endpoint.

#### Scenario: Pending claim by another wallet

- GIVEN wallet A has a pending setup claim for an endpoint
- WHEN wallet B registers the same endpoint before either claim is verified
- THEN wallet B receives its own pending setup record
- AND neither pending record is public through the paid proxy

#### Scenario: Same owner duplicate pending claim

- GIVEN a wallet has a non-expired pending claim for an endpoint
- WHEN the same wallet registers the endpoint again
- THEN PayGate returns HTTP 409 with the existing API id

#### Scenario: Atomic active ownership

- GIVEN multiple wallets have pending claims for the same endpoint
- WHEN setup verification races
- THEN at most one record transitions atomically to `active`
- AND later activation attempts return a conflict without displacing the verified owner

#### Scenario: Pending claim expiry

- GIVEN a pending setup claim has passed its seven-day expiry
- WHEN registry cleanup or a later registration runs
- THEN the expired claim is archived
- AND it no longer blocks the same wallet from starting setup again

### Requirement: Track API lifecycle states

PayGate SHALL expose registered APIs as `pending_setup`, `active`, or `archived`.

#### Scenario: New API starts pending

- GIVEN a developer registers an API
- WHEN registration succeeds
- THEN the API status is `pending_setup`
- AND the paid proxy is not public yet

#### Scenario: Setup verification activates API

- GIVEN a pending API has the upstream guard installed
- WHEN `POST /api/apis/:apiId/verify` sends a fresh unpredictable invalid `X-PayGate-Secret`
- AND the upstream deliberately rejects it with HTTP 401 or 403
- AND the upstream accepts the registered secret with a successful valid JSON response
- THEN PayGate marks the API as `active`
- AND the paid proxy can return MPP payment challenges

#### Scenario: Setup verification fails

- GIVEN the upstream API is unreachable, accepts an invalid secret, returns an unrelated error for an invalid secret, rejects the registered secret, or returns an invalid or non-JSON success response
- WHEN `POST /api/apis/:apiId/verify` runs
- THEN PayGate keeps the API pending
- AND returns an actionable setup error

### Requirement: Delete unused APIs and archive APIs with history

PayGate SHALL hard-delete APIs with no activity and archive APIs that already have requests or payments.

#### Scenario: Unused API removal

- GIVEN an API has no proxy requests and no payments
- WHEN the owner deletes it
- THEN PayGate removes the API record

#### Scenario: API with history removal

- GIVEN an API has proxy requests or payments
- WHEN the owner deletes it
- THEN PayGate marks it `archived`
- AND preserves history for dashboard evidence

## Known Limitations

- V1 only supports `GET` endpoints.
- V1 only supports REST/JSON-style upstream APIs.
- API ownership is scoped to the connected wallet.
