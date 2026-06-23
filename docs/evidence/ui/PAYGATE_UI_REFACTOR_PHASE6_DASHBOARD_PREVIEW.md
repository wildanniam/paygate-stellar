# PayGate UI Refactor - Phase 6 Dashboard Preview

Date: 2026-06-23

## Scope

Phase 6 adds the dedicated operating workspace section after the receipt proof section.

The section's role is different from the hero and transformation flow: it shows what the product feels like after launch, when an API owner is monitoring calls, revenue, payments, endpoints, and withdrawable balance from one workspace.

## Locked Baseline

- `docs/evidence/ui/landing-baselines/phase-6-dashboard-preview-baseline.png`

## Implemented Shape

- Added the `OPERATE API REVENUE` section with the locked headline:
  - `Monitor calls, revenue, and endpoints in one workspace.`
- Built a dashboard shell matching the baseline hierarchy:
  - left sidebar with PayGate brand, navigation, and live MPP status,
  - API revenue header with date range, range selector, and primary CTA,
  - four metric cards for calls, gross revenue, developer revenue, and withdrawable balance,
  - API registry table with status, price, calls, and revenue,
  - activity ledger table with request ID, event, result, and revenue,
  - withdraw strip with escrow balance and ready-to-withdraw state.
- Used the existing PayGate button system for the primary and withdraw actions, keeping the locked structure while preserving the current design system.

## Verification

- `npm --prefix frontend run build` passed.
- `git diff --check` passed.
- Desktop section screenshot: `output/playwright/paygate-phase6-dashboard-preview-desktop-1440-v5.png`
- Hover-state screenshot: `output/playwright/paygate-phase6-dashboard-preview-hover-1440-v5.png`
- Mobile section screenshot: `output/playwright/paygate-phase6-dashboard-preview-mobile-390-v5.png`

Screenshot note: the Playwright evidence screenshots hide the sticky marketing navbar and fixed scroll progress only during capture, so the section can be compared directly against the locked section baseline.

## Visual Acceptance

- Desktop matches the baseline's centered narrative, large dashboard shell, left sidebar, metrics grid, registry, ledger, and withdraw strip.
- API registry includes the baseline revenue column and no longer clips table content.
- The dashboard preview communicates the operating workspace instead of repeating the hero flow.
- Mobile stacks controls, metrics, registry, ledger, and withdraw content without text overlap.
- Custom PayGate buttons remain readable and consistent with the site button system.
- The result still feels premium and restrained: dark panels, purple state, green revenue, and no excessive neon wash.

## Deferred By Plan

- The old generic feature/use-case and final CTA area remains below the new narrative sections until the later landing cleanup phase replaces it.
