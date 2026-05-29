# generated-middleware Spec Delta

## ADDED Requirements

### Requirement: Run in sample Express API

Generated middleware SHALL be executable in a minimal Express API example.

#### Scenario: Sample API startup

- GIVEN generated middleware has been copied into `examples/express-paid-api/mpp-middleware.js`
- AND `STELLAR_RECIPIENT` is configured
- AND `MPP_SECRET_KEY` is configured
- WHEN the sample Express API starts
- THEN the server starts without middleware import/runtime errors

### Requirement: Challenge unpaid requests

Generated middleware SHALL return an MPP payment challenge for unpaid requests.

#### Scenario: Request without payment

- GIVEN the sample Express API is running
- WHEN a client requests the protected route without MPP credentials
- THEN the response is HTTP 402
- AND the response contains an MPP payment challenge

### Requirement: Allow paid requests

Generated middleware SHALL allow a request with valid MPP payment credentials to reach the protected route handler.

#### Scenario: Request with valid payment

- GIVEN a payer client has completed the Stellar testnet MPP charge flow
- WHEN it requests the protected route with valid payment credentials
- THEN the route handler runs
- AND the response body contains protected JSON data
- AND the response includes a payment receipt when supported by the middleware

