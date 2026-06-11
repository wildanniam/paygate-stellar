# Phase 5 API Lifecycle UX Evidence

Date: 2026-06-11

## Scope

Phase 5 improves PayGate V1 lifecycle UX so users can understand whether a registered API is still waiting for setup, ready for paid calls, or archived for history preservation.

## Screenshots

- `phase5-dashboard-lifecycle-desktop.png`
- `phase5-dashboard-lifecycle-mobile.png`
- `phase5-api-detail-pending-desktop.png`
- `phase5-api-detail-active-desktop.png`
- `phase5-register-success-pending-desktop.png`

## UX Review

- Dashboard now shows lifecycle counts in the API summary: active, setup, and archived.
- Registered API rows now use explicit lifecycle badges instead of ambiguous Active/Inactive text.
- Mobile dashboard uses compact API cards, so status badges are visible without horizontal scrolling.
- Register success now tells the user the proxy is created but not active yet.
- API detail now shows the current lifecycle state, explains the next action, and provides a `Verify setup` action for pending APIs.
- Manual activation was removed from the UI path; activation now depends on upstream ownership verification.
- Delete/archive action is present on the API detail page and explains that APIs with history are archived instead of hard deleted.

## Acceptance Criteria

- Pending setup, Active, and Archived states are visible in dashboard/API detail.
- Pending APIs clearly instruct users to install the upstream guard and verify setup.
- Active APIs communicate readiness for paid proxy calls.
- Archived APIs communicate that paid proxy access is disabled and history is preserved.
- Register success does not imply the API is immediately active.
- Mobile dashboard does not hide lifecycle status behind a horizontal table.

## Verification

- `npm --prefix frontend run build`
- `npm run test:browser`
