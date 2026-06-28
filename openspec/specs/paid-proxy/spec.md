# paid-proxy Specification

## Purpose

Gate API calls behind MPP payment, forward paid requests to the developer's upstream API, and record request/payment lifecycle evidence.

## Requirements

### Requirement: Expose paid proxy endpoints

PayGate SHALL expose a paid proxy URL for each active registered API.

#### Scenario: Active API proxy URL

- GIVEN an API is active
- WHEN a client calls `/api/pay/:apiId`
- THEN PayGate resolves the API configuration
- AND evaluates the request for payment

#### Scenario: Pending, archived, or unknown API

- GIVEN an API is pending setup, archived, or unknown
- WHEN a client calls `/api/pay/:apiId`
- THEN PayGate returns HTTP 404
- AND does not create a public paid proxy challenge

### Requirement: Return MPP challenge for unpaid requests

PayGate SHALL return HTTP 402 Payment Required for active paid proxy requests without payment credentials.

#### Scenario: Unpaid request

- GIVEN an active API exists
- WHEN an agent requests `/api/pay/:apiId` without a valid payment credential
- THEN PayGate creates a proxy request row with status `challenge_sent`
- AND creates a PayGate payment id
- AND returns HTTP 402
- AND includes MPP challenge data
- AND includes `X-PayGate-Request-Id` and `X-PayGate-Payment-Id`

### Requirement: Verify MPP payment credentials

PayGate SHALL verify payment credentials against the existing PayGate request and expected API.

#### Scenario: Valid paid retry

- GIVEN an agent previously received a PayGate payment challenge
- AND the agent retries with valid MPP credentials for the same payment id and API
- WHEN `/api/pay/:apiId` verifies the credential
- THEN PayGate marks the request `payment_verified`
- AND records payment metadata

#### Scenario: Credential mismatch

- GIVEN a credential is missing a PayGate payment id, references a missing request, or belongs to another API
- WHEN `/api/pay/:apiId` receives it
- THEN PayGate returns HTTP 402
- AND does not forward upstream

#### Scenario: Credential replay

- GIVEN a credential was already used for a forwarded or recorded request
- WHEN `/api/pay/:apiId` receives it again
- THEN PayGate returns HTTP 409
- AND does not double-credit the payment

### Requirement: Credit escrow before forwarding

PayGate SHALL credit the Soroban escrow balance after valid payment verification and before upstream forwarding.

#### Scenario: Escrow credit succeeds

- GIVEN payment verification succeeds
- WHEN PayGate credits escrow
- THEN PayGate records gross amount, developer amount, platform fee, payment tx hash, and credit tx hash
- AND continues to upstream forwarding

#### Scenario: Escrow credit fails

- GIVEN payment verification succeeds
- AND escrow credit fails
- WHEN PayGate handles the request
- THEN PayGate returns HTTP 502
- AND includes the MPP payment receipt when available
- AND does not forward upstream

### Requirement: Forward paid requests with upstream secret

PayGate SHALL forward paid requests to the original API with `X-PayGate-Secret`.

#### Scenario: Upstream forwarding

- GIVEN payment verification and escrow credit succeed
- WHEN PayGate calls the upstream API
- THEN the request is a `GET`
- AND includes `X-PayGate-Secret`
- AND preserves query parameters other than `apiId`

#### Scenario: Upstream success

- GIVEN the upstream API returns success
- WHEN PayGate receives the upstream response
- THEN PayGate marks the proxy request `forwarded`
- AND returns the upstream status, content type, body, and `Payment-Receipt` header

#### Scenario: Upstream failure

- GIVEN the upstream API returns an error or fails
- WHEN PayGate receives the failure
- THEN PayGate marks the proxy request `upstream_failed`
- AND returns the upstream failure or HTTP 502
- AND automatic refund is not attempted in V1

## Known Limitations

- V1 paid proxy supports `GET` only.
- V1 forwards request bodies/uploads/streaming out of scope.
- V1 credits before forwarding; refunds or delayed settlement are future work.
- V1 uses Stellar testnet USDC MPP Charge only.
