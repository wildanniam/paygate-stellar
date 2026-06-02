# wallet-auth Specification Delta

## ADDED Requirements

### Requirement: Connect Freighter wallet

PayGate SHALL use Freighter wallet as developer identity for V1.

#### Scenario: Wallet connected

- GIVEN a developer opens the V1 app
- WHEN they connect Freighter
- THEN PayGate reads their Stellar public key

### Requirement: Verify wallet ownership with signed challenge

PayGate SHALL verify wallet ownership through a sign-message challenge.

#### Scenario: Challenge signed

- GIVEN PayGate created a login challenge
- WHEN the developer signs it with Freighter
- THEN PayGate verifies the signature
- AND creates a session for that wallet

### Requirement: Use wallet as API owner and payout wallet

PayGate SHALL use the connected wallet as the API owner and payout wallet.

#### Scenario: Register API

- GIVEN a developer is logged in with wallet `G...`
- WHEN they register an API
- THEN the API owner is wallet `G...`
- AND the payout wallet is wallet `G...`
