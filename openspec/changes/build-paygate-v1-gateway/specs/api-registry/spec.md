# api-registry Specification Delta

## ADDED Requirements

### Requirement: Store API registry in Supabase

PayGate SHALL store registered API configuration in Supabase.

#### Scenario: API registered

- GIVEN a logged-in developer submits API name, upstream URL, path, method, and price
- WHEN registration succeeds
- THEN Supabase stores the API config
- AND associates it with the developer wallet

### Requirement: Encrypt API secrets

PayGate SHALL encrypt per-API secret headers at rest.

#### Scenario: Secret generated

- GIVEN a developer registers an API
- WHEN PayGate creates the API secret
- THEN the secret is unique for that API
- AND the stored value is encrypted

### Requirement: Support multiple APIs per wallet

PayGate SHALL allow one developer wallet to register multiple APIs.

#### Scenario: Multiple APIs

- GIVEN a developer already has one registered API
- WHEN they register another API
- THEN both APIs appear under the same wallet dashboard
