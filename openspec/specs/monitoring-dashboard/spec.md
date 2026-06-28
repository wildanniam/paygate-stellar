# monitoring-dashboard Specification

## Purpose

Provide an authenticated PayGate workspace where developers can understand API revenue, endpoint state, request/payment activity, and payout readiness from one wallet-scoped dashboard.

## Requirements

### Requirement: Require wallet authentication

The dashboard SHALL require a PayGate wallet session before showing wallet-scoped operational data.

#### Scenario: Wallet not connected

- GIVEN no valid PayGate session exists
- WHEN a developer opens `/dashboard`, `/dashboard/endpoints`, `/dashboard/activity`, or `/dashboard/payouts`
- THEN the dashboard shows a wallet-required state
- AND prompts the developer to connect Freighter
- AND does not present wallet-scoped tables or metrics as usable live data

#### Scenario: Wallet connected

- GIVEN a valid PayGate session exists
- WHEN the dashboard loads
- THEN it fetches `GET /api/dashboard/summary`
- AND renders workspace data scoped to the connected wallet

### Requirement: Provide dashboard workspace navigation

The dashboard SHALL provide meaningful workspace views rather than decorative menu items.

#### Scenario: Overview view

- GIVEN the developer opens `/dashboard`
- WHEN the dashboard renders
- THEN the side navigation highlights `Overview`
- AND the page focuses on high-level revenue, API count, paid-call count, endpoint preview, recent activity, and payout readiness

#### Scenario: Endpoints view

- GIVEN the developer opens `/dashboard/endpoints`
- WHEN the dashboard renders
- THEN the side navigation highlights `Endpoints`
- AND the page focuses on registered paid endpoints, setup state, price, calls, success, revenue, and selected endpoint details

#### Scenario: Activity view

- GIVEN the developer opens `/dashboard/activity`
- WHEN the dashboard renders
- THEN the side navigation highlights `Activity`
- AND the page focuses on request/payment lifecycle events and recent revenue events

#### Scenario: Payouts view

- GIVEN the developer opens `/dashboard/payouts`
- WHEN the dashboard renders
- THEN the side navigation highlights `Payouts`
- AND the page focuses on escrow balance, withdrawable balance, withdrawal action, and withdrawal history

### Requirement: Summarize wallet-scoped metrics

The dashboard SHALL summarize the connected developer wallet's API and revenue state.

#### Scenario: Summary response loaded

- GIVEN `GET /api/dashboard/summary` returns data
- WHEN the dashboard maps the response
- THEN it can show total APIs, active APIs, total calls, successful calls, failed calls, gross revenue, developer revenue, platform fee, last payment time, and escrow balances

### Requirement: Support client-side range filters

The dashboard SHALL let users compare 7D, 30D, and 90D ranges using loaded summary data.

#### Scenario: Date range changed

- GIVEN dashboard data is loaded
- WHEN the user selects `7D`, `30D`, or `90D`
- THEN range-derived cards and tables update client-side
- AND the app does not require a separate Horizon wallet lookup

### Requirement: Show endpoint registry and details

The Endpoints view SHALL help developers inspect registered paid endpoints and setup requirements.

#### Scenario: Endpoint selected

- GIVEN one or more APIs exist
- WHEN a developer selects an endpoint row
- THEN the right-side detail panel shows API name, lifecycle status, proxy URL, required header, price per call, paid calls, success rate, and revenue
- AND long proxy/secret values are truncated safely with copy affordances

#### Scenario: Endpoint setup required

- GIVEN an endpoint is `pending_setup`
- WHEN the endpoint detail panel renders
- THEN it clearly indicates setup is pending
- AND shows the required upstream guard information

### Requirement: Show activity ledger

The Activity view SHALL show request/payment events in a scannable ledger.

#### Scenario: Activity rows exist

- GIVEN proxy requests or payments exist
- WHEN the Activity view renders
- THEN rows show time, endpoint, event, result, revenue, request/payment identifiers, and tx links when available

#### Scenario: Activity filters used

- GIVEN activity data is loaded
- WHEN the user filters by all events, paid, 402, forwarded, failed, or endpoint
- THEN the ledger updates without changing wallet scope

### Requirement: Support payouts and withdrawal history

The Payouts view SHALL show withdrawable balance and enable developer withdrawals through Freighter.

#### Scenario: Withdrawable balance exists

- GIVEN escrow balance is positive
- WHEN the developer clicks withdraw
- THEN PayGate prepares a withdrawal transaction
- AND asks Freighter to sign
- AND submits the signed transaction
- AND records the withdrawal result

#### Scenario: No withdrawals yet

- GIVEN there is no withdrawal history
- WHEN the Payouts view renders
- THEN it shows an empty state explaining when withdrawals will appear

### Requirement: Show loading, empty, and error states

Dashboard views SHALL clearly show loading, empty, and recoverable error states.

#### Scenario: Dashboard API error

- GIVEN `GET /api/dashboard/summary` fails
- WHEN the dashboard receives the error
- THEN it shows a safe PayGate error message
- AND does not display raw provider HTML or Cloudflare error pages

## Known Limitations

- The dashboard is scoped to the authenticated wallet, not arbitrary wallet address lookup.
- Analytics are derived from PayGate registry/payment/request rows plus escrow balance reads.
- V1 supports testnet USDC and GET endpoints only.
- Dashboard filters are client-side over the currently loaded summary payload.
