# website-frontend Specification

## Purpose

Provide a premium React SPA for PayGate V1: explain the paid-proxy product, let developers create paid endpoints, manage API revenue, and preserve legacy generator evidence without making it the primary product flow.

## Requirements

### Requirement: Provide routed React SPA

The frontend SHALL be a React SPA with marketing, V1 app, dashboard workspace, endpoint creation/detail, and legacy generator routes.

#### Scenario: Route availability

- GIVEN the frontend app is running
- WHEN a developer opens `/`
- THEN the marketing landing page renders
- WHEN they open `/apis/new`
- THEN the create paid endpoint page renders
- WHEN they open `/apis/:apiId`
- THEN the endpoint control page renders
- WHEN they open `/dashboard`, `/dashboard/endpoints`, `/dashboard/activity`, or `/dashboard/payouts`
- THEN the dashboard workspace renders the appropriate view
- WHEN they open `/generate` or `/result`
- THEN the legacy generator flow remains available

### Requirement: Preserve premium marketing landing page

The landing page SHALL present PayGate as a real pay-per-call API gateway, not only a hackathon generator.

#### Scenario: Landing page renders

- GIVEN a visitor opens `/`
- WHEN the landing page renders
- THEN it uses the PayGate marketing navbar
- AND the primary CTA points to `/apis/new`
- AND the hero communicates "Paste an API URL. Charge per call."
- AND the page includes sections for transformation, protected paid calls, request receipt proof, workspace/dashboard preview, and target users/CTA

### Requirement: Use marketing navigation on landing only

The landing page SHALL use section-aware marketing navigation, while app pages SHALL use the compact app navbar.

#### Scenario: Marketing navbar active section

- GIVEN a visitor scrolls the landing page
- WHEN a known landing section crosses the navigation threshold
- THEN the matching marketing nav item is highlighted

#### Scenario: App navbar dashboard active state

- GIVEN a developer opens any route under `/dashboard`
- WHEN the app navbar renders
- THEN the Dashboard nav item remains active

### Requirement: Create paid endpoint flow

The create endpoint page SHALL guide an authenticated developer from wallet connection to API registration.

#### Scenario: Wallet required

- GIVEN no wallet session exists
- WHEN a developer opens `/apis/new`
- THEN the page shows a wallet-required panel
- AND the connect button is appropriately sized for the panel
- AND no form is shown as usable until wallet connection succeeds

#### Scenario: API registration

- GIVEN a developer is authenticated
- WHEN they submit API name, upstream base URL, endpoint path, and price
- THEN the frontend calls `POST /api/apis`
- AND shows field-level validation errors when present
- AND shows the created proxy URL and upstream secret when registration succeeds

### Requirement: Endpoint control page

The endpoint control page SHALL let developers inspect setup, copy credentials, verify upstream guard, and archive/remove endpoints.

#### Scenario: Pending endpoint

- GIVEN an endpoint is `pending_setup`
- WHEN the endpoint detail page renders
- THEN it shows the proxy URL, upstream secret, guard instructions, setup status, and Verify setup action

#### Scenario: Active endpoint

- GIVEN an endpoint is active
- WHEN the endpoint detail page renders
- THEN it shows the paid proxy endpoint, lifecycle status, and guard details

#### Scenario: Raw provider error is received

- GIVEN a backend/provider returns an HTML or gateway error string
- WHEN the endpoint page displays the error
- THEN the frontend shows a safe PayGate error message rather than raw HTML

### Requirement: Dashboard workspace views

The frontend SHALL provide dashboard views for overview, endpoints, activity, and payouts.

#### Scenario: Overview view

- GIVEN `/dashboard` is open
- WHEN the workspace renders
- THEN it shows summary metrics and previews of endpoint registry, activity ledger, and payout readiness

#### Scenario: Endpoints view

- GIVEN `/dashboard/endpoints` is open
- WHEN the workspace renders
- THEN it shows search/filter/sort controls, endpoint summary cards, endpoint list, and a selected endpoint detail panel
- AND the detail panel must not clip at supported desktop widths

#### Scenario: Activity view

- GIVEN `/dashboard/activity` is open
- WHEN the workspace renders
- THEN it shows activity filters, request/payment summary cards, ledger rows, and selected event details

#### Scenario: Payouts view

- GIVEN `/dashboard/payouts` is open
- WHEN the workspace renders
- THEN it shows escrow status, developer balance, platform fee balance, withdraw action, explorer link, and withdrawal history

### Requirement: Preserve legacy generator flow

The legacy generator pages SHALL remain available for SOW evidence but SHALL not be the primary PayGate V1 CTA.

#### Scenario: Legacy generate submit

- GIVEN a developer opens `/generate`
- WHEN they submit endpoint URL, path, and price
- THEN the frontend calls `/api/generate`
- AND navigates to `/result` after success

#### Scenario: Result persistence

- GIVEN `/api/generate` returned code
- WHEN the frontend navigates to `/result`
- THEN the result page displays the generated middleware and integration snippet
- AND survives refresh via `sessionStorage`

### Requirement: Copy affordances and safe truncation

Long URLs, secrets, request ids, payment ids, and tx hashes SHALL be copyable and visually constrained.

#### Scenario: Long value in compact panel

- GIVEN a long proxy URL or secret appears in dashboard or endpoint detail UI
- WHEN the panel renders at supported desktop widths
- THEN text truncates safely
- AND copy controls remain visible
- AND no content overflows the card boundary

## Known Limitations

- The V1 app is optimized for PayGate's testnet demo and early beta.
- Legacy `/generate` and `/result` remain for evidence, but product navigation should prefer `/apis/new`.
- Mobile support must remain clean, but the richest dashboard layout is desktop-first.
