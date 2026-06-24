# App UI Refactor Phase 6 - API Detail Control Center

## Scope
- Refactored the API detail page into an endpoint control center.
- Replaced legacy inline copy rows with reusable `CopyField` controls for paid endpoint, upstream target, and upstream secret.
- Added status-aware control card styling for `pending_setup`, `active`, and `archived` endpoints.
- Converted `UpstreamGuardGuide` from inline legacy styling into shared class-based app styling.
- Separated destructive archive/delete behavior into a quieter danger panel below the primary endpoint controls.

## Acceptance Checks
- Detail page uses the locked app shell, PayGate logo, dark operational surface, and glossy purple action button system.
- Proxy URL, upstream URL, secret, and price are scannable and copyable.
- Pending setup state clearly shows the verify action and warning copy.
- Active state removes the pending warning and keeps the page calm.
- Guard guide visually matches the rest of the app and no longer feels like a leftover console card.
- Mobile layout stacks cleanly with no horizontal overflow.

## Verification
- `npm --prefix frontend run build`
- `git diff --check`
- Playwright mocked detail screenshots:
  - `docs/evidence/ui/app-detail/phase6-api-detail-pending-desktop.png`
  - `docs/evidence/ui/app-detail/phase6-api-detail-active-desktop.png`
  - `docs/evidence/ui/app-detail/phase6-api-detail-pending-mobile.png`
- Playwright copy interaction:
  - First detail copy button reached `data-state="copied"`.
  - Horizontal overflow check returned `false` for desktop and mobile.

