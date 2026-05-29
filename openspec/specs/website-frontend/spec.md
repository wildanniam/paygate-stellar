# website-frontend Specification

## Purpose

Provide a no-install browser experience where developers can understand PayGate, generate MPP code, copy it, and navigate to dashboard monitoring.

## Requirements

### Requirement: Provide routed React SPA

The frontend SHALL be a React SPA with routes for landing, generator, result, and dashboard.

#### Scenario: Route availability

- GIVEN the frontend app is running
- WHEN a developer opens `/`
- THEN the landing page renders
- WHEN they open `/generate`
- THEN the generator page renders
- WHEN they open `/dashboard`
- THEN the dashboard page renders

### Requirement: Preserve landing page visual quality

The landing page SHALL preserve the polished PayGate dark developer-tool aesthetic from the original landing page phase.

#### Scenario: Landing page migration

- GIVEN the app has been migrated to React Router
- WHEN a developer opens `/`
- THEN the original landing page content and visual direction are still present
- AND the app navbar used on internal pages is not shown on the landing page

### Requirement: Submit generator form

The generator page SHALL collect endpoint URL, path, and price, then call `/api/generate`.

#### Scenario: Valid form submit

- GIVEN a developer fills all three fields with valid values
- WHEN they click `Generate Code`
- THEN the frontend sends a JSON request to `/api/generate`
- AND navigates to `/result` after success

#### Scenario: Empty form submit

- GIVEN one or more fields are empty
- WHEN the developer tries to submit
- THEN the frontend shows field-level `Required` errors
- AND does not call the backend

### Requirement: Display generated result

The result page SHALL show the generated middleware and integration snippet with copy controls.

#### Scenario: Result from navigation state

- GIVEN `/api/generate` returned code
- WHEN the frontend navigates to `/result`
- THEN the result page displays metadata for endpoint, path, and price
- AND shows a `mpp-middleware.js` code block
- AND shows a `server.js (snippet)` code block

### Requirement: Persist result through refresh

The result page SHALL survive browser refresh using `sessionStorage`.

#### Scenario: Refresh result page

- GIVEN a developer generated code and is viewing `/result`
- WHEN they refresh the page
- THEN the generated code still renders from `sessionStorage`

#### Scenario: Direct result visit without data

- GIVEN no generated result exists in navigation state or `sessionStorage`
- WHEN a developer opens `/result`
- THEN they are redirected to `/generate`

### Requirement: Share internal app navbar

Internal app pages SHALL share a navbar with links to generator, dashboard, and GitHub.

#### Scenario: Internal page navigation

- GIVEN a developer is on `/generate`, `/result`, or `/dashboard`
- WHEN the navbar renders
- THEN it includes a PayGate logo link to `/`
- AND a `Generator` link
- AND a `Dashboard` link
- AND a GitHub link

