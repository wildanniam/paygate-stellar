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

### Requirement: Prevent duplicate live endpoint registrations

PayGate SHALL prevent duplicate live registrations for the same normalized method, upstream base URL, and path.

#### Scenario: Duplicate endpoint

- GIVEN an active or pending API already exists for a normalized endpoint
- WHEN a developer registers the same endpoint again
- THEN PayGate returns HTTP 409
- AND indicates whether the duplicate belongs to the same wallet when possible

### Requirement: Track API lifecycle states

PayGate SHALL expose registered APIs as `pending_setup`, `active`, or `archived`.

#### Scenario: New API starts pending

- GIVEN a developer registers an API
- WHEN registration succeeds
- THEN the API status is `pending_setup`
- AND the paid proxy is not public yet

#### Scenario: Setup verification activates API

- GIVEN a pending API has the upstream guard installed
- WHEN `POST /api/apis/:apiId/verify` reaches the upstream API with `X-PayGate-Secret`
- THEN PayGate marks the API as `active`
- AND the paid proxy can return MPP payment challenges

#### Scenario: Setup verification fails

- GIVEN the upstream API is unreachable or rejects the secret
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
