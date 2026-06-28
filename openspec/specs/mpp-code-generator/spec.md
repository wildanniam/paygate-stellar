# mpp-code-generator Specification

## Purpose

Legacy V0/SOW capability: allow a developer to submit three fields and receive copy-paste-ready Express MPP integration code without needing to understand Stellar internals.

The current PayGate V1 product no longer treats this generator as the primary monetization flow. V1 monetization is covered by `api-registry`, `paid-proxy`, `wallet-auth`, `escrow-settlement`, `monitoring-dashboard`, and `website-frontend`: users connect a wallet, register an upstream API, receive a hosted PayGate proxy URL, and monitor paid traffic from the dashboard. This spec remains canonical only for the still-present `/api/generate` compatibility endpoint and the historical SOW demo path.

## Requirements

### Requirement: Generate code from three inputs

The system SHALL generate PayGate code from `endpointUrl`, `path`, and `price`.

#### Scenario: Valid generator request

- GIVEN a developer submits `endpointUrl` as an HTTPS base URL
- AND `path` starts with `/`
- AND `price` is a valid USDC decimal string
- WHEN the backend receives `POST /api/generate`
- THEN it returns HTTP 200
- AND the response includes `middleware`
- AND the response includes `integration`

### Requirement: Reject invalid endpoint URL

The system SHALL reject endpoint URLs that are missing, not valid URLs, not HTTPS, or contain a path beyond an optional trailing slash.

#### Scenario: HTTP endpoint is submitted

- GIVEN a developer submits `endpointUrl` as `http://api.example.com`
- WHEN the backend validates the request
- THEN it returns HTTP 400
- AND `details.endpointUrl` explains that HTTPS is required

#### Scenario: URL contains a path

- GIVEN a developer submits `endpointUrl` as `https://api.example.com/v1`
- WHEN the backend validates the request
- THEN it returns HTTP 400
- AND `details.endpointUrl` explains that the value must be a base URL without path

### Requirement: Reject invalid path

The system SHALL reject paths that are missing, do not start with `/`, or contain characters outside letters, numbers, `/`, `-`, `_`, and `:`.

#### Scenario: Path without leading slash

- GIVEN a developer submits `path` as `v1/data`
- WHEN the backend validates the request
- THEN it returns HTTP 400
- AND `details.path` explains that the path must start with `/`

#### Scenario: Express path parameter

- GIVEN a developer submits `path` as `/users/:id`
- WHEN the backend validates the request
- THEN the path is accepted

### Requirement: Reject invalid price

The system SHALL reject prices that are missing, negative, below `0.0001`, above `1000`, or use more than seven decimal places.

#### Scenario: Minimum valid price

- GIVEN a developer submits `price` as `0.0001`
- WHEN the backend validates the request
- THEN the price is accepted

#### Scenario: Negative price

- GIVEN a developer submits `price` as `-1`
- WHEN the backend validates the request
- THEN it returns HTTP 400
- AND `details.price` explains that the minimum price is `0.0001 USDC`

### Requirement: Stateless generator service

The backend SHALL generate code as a pure function of the request body and SHALL NOT require a database, authentication, session, or server-side persistence.

#### Scenario: Repeat same request

- GIVEN the same valid request body is submitted twice
- WHEN the backend processes both requests
- THEN both responses contain equivalent generated code
- AND no user account or stored project state is required

## Known Limitations

- This flow generates self-hosted Express middleware and does not create a PayGate-hosted proxy URL.
- This flow does not create a wallet-scoped API registry record.
- This flow does not power the current V1 dashboard, endpoint detail pages, or payout workflow.
- Rate limiting is not specified by this legacy generator implementation; deployment-level protection may be added separately.
