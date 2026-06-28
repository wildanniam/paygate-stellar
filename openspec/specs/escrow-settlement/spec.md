# escrow-settlement Specification

## Purpose

Use a Soroban escrow contract to hold paid-call funds, split developer revenue and PayGate fees, and support developer withdrawals.

## Requirements

### Requirement: Hold payment funds in Soroban escrow

PayGate SHALL configure MPP Charge so the payment recipient is the escrow contract address.

#### Scenario: Payment challenge recipient

- GIVEN PayGate creates an MPP challenge for a paid proxy request
- WHEN the challenge is serialized
- THEN the payment recipient is `ESCROW_CONTRACT_ID`
- AND the currency is Stellar testnet USDC

### Requirement: Credit developer and platform balances

PayGate SHALL credit a valid payment into escrow after payment verification.

#### Scenario: Credit payment

- GIVEN MPP payment is valid
- WHEN PayGate maps the payment to an API owner
- THEN backend/operator calls the escrow credit operation
- AND the contract credits 90% to developer balance
- AND the contract credits 10% to PayGate platform fee balance

### Requirement: Prevent duplicate payment credit

The escrow contract SHALL reject duplicate payment IDs.

#### Scenario: Duplicate payment id

- GIVEN payment id `pay1` was already credited
- WHEN `creditPayment(pay1, ...)` is called again
- THEN the contract rejects the call

### Requirement: Read escrow balances for dashboard

PayGate SHALL read the authenticated developer's withdrawable balance and platform fee balance for dashboard display.

#### Scenario: Dashboard balance read

- GIVEN a developer is authenticated
- WHEN `GET /api/dashboard/summary` loads
- THEN the response includes escrow configuration state
- AND includes developer withdrawable USDC balance
- AND includes PayGate platform fee USDC balance when available

### Requirement: Prepare developer withdrawals

PayGate SHALL prepare a Freighter-signable withdrawal transaction for the authenticated developer.

#### Scenario: Withdrawal preparation

- GIVEN a developer has a positive escrow balance
- WHEN `POST /api/withdraw/prepare` succeeds
- THEN PayGate returns transaction XDR and balance metadata

#### Scenario: No withdrawable balance

- GIVEN a developer has zero escrow balance
- WHEN `POST /api/withdraw/prepare` is called
- THEN PayGate returns HTTP 400
- AND explains that there is no withdrawable balance

### Requirement: Submit developer withdrawals

PayGate SHALL submit a Freighter-signed withdrawal transaction and record withdrawal history.

#### Scenario: Withdrawal submitted

- GIVEN a developer signs the prepared transaction
- WHEN `POST /api/withdraw/submit` succeeds
- THEN PayGate records a withdrawal row
- AND returns the withdrawal tx hash
- AND dashboard history can show the withdrawal

### Requirement: PayGate admin withdraws platform fee

PayGate admin SHALL be able to withdraw accumulated platform fees through the operator/admin flow.

#### Scenario: Platform fee withdrawal

- GIVEN platform fee balance is positive
- WHEN PayGate admin calls the platform fee withdrawal command
- THEN the contract transfers fee balance to the admin wallet
- AND resets platform fee balance to zero

## Known Limitations

- Testnet only for V1.
- Mock escrow credit/withdraw modes are allowed only for memory-store local smoke tests.
- Automatic refunds are not part of V1.
