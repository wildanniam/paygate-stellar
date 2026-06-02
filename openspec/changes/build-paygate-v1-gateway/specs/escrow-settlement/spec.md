# escrow-settlement Specification Delta

## ADDED Requirements

### Requirement: Hold payment funds in Soroban escrow

PayGate SHALL use a Soroban escrow contract for V1 demo settlement.

#### Scenario: Payment recipient

- GIVEN a paid proxy challenge is created
- WHEN the MPP payment request is configured
- THEN the payment recipient is the escrow contract address

### Requirement: Credit developer balance after valid payment

PayGate SHALL credit developer balance in the escrow contract after a valid payment.

#### Scenario: Credit payment

- GIVEN MPP payment is valid
- WHEN PayGate maps the payment to an API owner
- THEN backend calls `creditPayment`
- AND the contract credits 90% to developer balance
- AND the contract credits 10% to platform fee balance

### Requirement: Prevent duplicate payment credit

The escrow contract SHALL reject duplicate payment IDs.

#### Scenario: Duplicate payment ID

- GIVEN payment ID `pay1` was already credited
- WHEN `creditPayment(pay1, ...)` is called again
- THEN the contract rejects the call

### Requirement: Developer withdraws own balance

Developers SHALL withdraw their own balance by signing with Freighter.

#### Scenario: Developer withdrawal

- GIVEN a developer has a positive escrow balance
- WHEN they sign and call `withdraw`
- THEN the contract transfers their balance to their wallet
- AND resets their balance to zero

### Requirement: PayGate admin withdraws platform fee

PayGate admin SHALL be able to withdraw accumulated platform fees.

#### Scenario: Platform fee withdrawal

- GIVEN platform fee balance is positive
- WHEN PayGate admin calls `withdrawPlatformFee`
- THEN the contract transfers fee balance to the admin wallet
- AND resets platform fee balance to zero
