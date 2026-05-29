# monitoring-dashboard Specification

## Purpose

Allow developers to monitor Stellar testnet USDC payments received by the wallet used in their generated PayGate middleware.

## Requirements

### Requirement: Accept Stellar wallet address

The dashboard SHALL allow the user to enter a Stellar public key and SHALL validate its format before fetching data.

#### Scenario: Valid Stellar address

- GIVEN a user enters a 56-character public key starting with `G`
- WHEN they click `Load Dashboard`
- THEN the wallet is accepted
- AND the dashboard fetches Horizon data

#### Scenario: Invalid Stellar address

- GIVEN a user enters an invalid address
- WHEN they click `Load Dashboard`
- THEN the dashboard shows an error explaining that the address must start with `G` and be 56 characters
- AND Horizon is not fetched for that invalid value

### Requirement: Persist wallet address

The dashboard SHALL persist the latest submitted wallet address in `localStorage`.

#### Scenario: Refresh dashboard

- GIVEN a user loaded a wallet address
- WHEN they refresh `/dashboard`
- THEN the wallet address remains in the input
- AND dashboard loading can resume for that wallet

### Requirement: Fetch operations from Horizon testnet

The dashboard SHALL fetch operations from `https://horizon-testnet.stellar.org/accounts/{address}/operations?order=desc&limit=200`.

#### Scenario: Existing account

- GIVEN the wallet exists on Stellar testnet
- WHEN the dashboard fetches operations
- THEN it reads records from Horizon
- AND filters them for relevant USDC transfers

#### Scenario: Missing account

- GIVEN the wallet does not exist on Stellar testnet
- WHEN Horizon returns HTTP 404
- THEN the dashboard shows an informative missing-account error

### Requirement: Filter incoming USDC Soroban transfers

The dashboard SHALL filter operations to incoming USDC transfers from Soroban invoke host function operations.

#### Scenario: Incoming MPP payment

- GIVEN an operation has `type_i === 24`
- AND includes `asset_balance_changes`
- AND one balance change has `type === transfer`
- AND `to` equals the monitored wallet address
- AND `code === USDC`
- WHEN the dashboard maps operations
- THEN it includes that operation as a payment row

### Requirement: Show summary cards

The dashboard SHALL show total USDC, total paid requests/payments, and last payment time after data is loaded.

#### Scenario: Payments loaded

- GIVEN one or more payment rows are loaded
- WHEN summary cards render
- THEN total USDC is the sum of payment amounts
- AND total paid requests/payments equals the number of rows
- AND last payment uses the newest payment timestamp

### Requirement: Show transaction history

The dashboard SHALL show a transaction table with timestamp, sender, amount, and transaction hash link.

#### Scenario: Transaction row

- GIVEN a payment row has a transaction hash
- WHEN the table renders
- THEN the hash is shortened in the UI
- AND links to `https://stellar.expert/explorer/testnet/tx/{txHash}`

### Requirement: Show empty, loading, and error states

The dashboard SHALL clearly show loading, empty, and error states.

#### Scenario: No payments

- GIVEN a valid wallet exists
- AND no matching USDC MPP payments are found
- WHEN the dashboard finishes loading
- THEN it shows an empty state explaining that no MPP payment has been received yet

#### Scenario: Horizon error

- GIVEN Horizon returns an unexpected non-OK response
- WHEN the dashboard fetches data
- THEN it shows an error message with the Horizon status

### Requirement: Auto-refresh data

The dashboard SHALL refresh loaded wallet data every 30 seconds.

#### Scenario: Wallet is active

- GIVEN a wallet has been loaded
- WHEN 30 seconds pass
- THEN the dashboard fetches Horizon data again

## Known Limitations

- The dashboard currently treats each matching payment as one paid request.
- The dashboard does not yet provide true per-endpoint breakdown because Horizon operations do not include endpoint metadata by default.
- The Horizon query only reads the latest 200 operations.
- USDC filtering uses `code === 'USDC'` for the POC.

