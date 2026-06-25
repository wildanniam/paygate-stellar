# PayGate Dashboard Workspace V2 Lock

Date: 2026-06-25

## Locked Visual Baseline

Baseline image:

```txt
docs/evidence/ui/dashboard-v2/dashboard-v2-visual-baseline.png
```

This image is the target direction for the real `/dashboard` page. The dashboard should feel like the production version of the locked landing-page dashboard preview, not like a marketing page with operational cards.

## Design Direction

- Premium dark fintech workspace.
- PayGate purple remains the primary action color, matching the custom button gradient.
- Green is reserved for success values, deltas, live state, and revenue, not broad panel washes.
- The dashboard is an app cockpit: compact, scan-friendly, and data-first.
- No oversized marketing hero headline inside the authenticated dashboard.
- No random floating decoration or console-like generic AI styling.

## Target Information Architecture

1. Global app navbar remains at the top.
2. Main dashboard becomes a bordered workspace shell.
3. Workspace shell contains:
   - left sidebar with PayGate brand, internal nav, and live Stellar MPP status,
   - topbar with `API revenue`, date/range controls, refresh, and create endpoint action,
   - four revenue/call metrics,
   - two primary panels: `API registry` and `Activity ledger`,
   - bottom escrow/withdraw strip.
4. Wallet state is context, not the main visual object.
5. Payment history and request log merge into one activity ledger so the user can understand the request/payment/revenue lifecycle quickly.

## Implementation Acceptance Criteria

- `/dashboard` first fold matches the locked workspace baseline in structure and visual hierarchy.
- The old giant `API revenue command center` hero is removed from the authenticated dashboard.
- API registry and activity ledger are visible above the financial strip on desktop.
- Mobile uses card/timeline-style activity presentation rather than squeezed desktop tables.
- Existing behavior remains intact:
  - wallet auth,
  - refresh,
  - create endpoint link,
  - endpoint detail links,
  - copy proxy URL,
  - withdraw flow,
  - explorer links.
- Verification must include:
  - `npm --prefix frontend run build`,
  - `git diff --check`,
  - desktop screenshot,
  - mobile screenshot.

## Commit

Recommended commit after successful verification:

```txt
refactor: redesign dashboard workspace
```
