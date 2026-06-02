# paid-proxy Specification Delta

## ADDED Requirements

### Requirement: Create paid proxy endpoints

PayGate SHALL create a paid proxy endpoint for each registered API.

#### Scenario: Paid proxy URL

- GIVEN a developer registers an API
- WHEN registration succeeds
- THEN PayGate provides a paid proxy URL
- AND AI agents call the paid proxy URL instead of the original API URL

### Requirement: Require payment before forwarding

PayGate SHALL require a valid MPP payment before forwarding a request to the original API.

#### Scenario: Unpaid request

- GIVEN an AI agent requests a paid proxy endpoint without payment credentials
- WHEN PayGate evaluates the request
- THEN it returns HTTP 402 Payment Required

#### Scenario: Paid request

- GIVEN an AI agent has completed a valid MPP payment
- WHEN it retries the paid proxy endpoint
- THEN PayGate verifies payment
- AND forwards the request to the original API
- AND returns the upstream JSON response

### Requirement: Forward secret header

PayGate SHALL forward requests to the original API with the API's configured secret header.

#### Scenario: Upstream secret

- GIVEN an API has an encrypted PayGate secret
- WHEN PayGate forwards a paid request upstream
- THEN the request includes `X-PayGate-Secret`

### Requirement: Log failed upstream after payment

PayGate SHALL log upstream failures after payment as failed paid requests.

#### Scenario: Upstream timeout

- GIVEN payment is valid
- AND the upstream API times out
- WHEN PayGate records the request
- THEN request status is `failed`
- AND automatic refund is not attempted in V1 demo
