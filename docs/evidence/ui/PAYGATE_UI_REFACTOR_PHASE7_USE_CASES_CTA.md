# PayGate UI Refactor - Phase 7 Use Cases And Final CTA

Date: 2026-06-23

## Scope

Phase 7 replaces the old generic feature grid and separate final CTA with a single audience-and-conversion close.

The section's job is to help the right users recognize themselves, then give them one decisive next action: create a paid endpoint.

## Locked Baseline

- `docs/evidence/ui/landing-baselines/phase-7-use-cases-cta-baseline.png`

## Implemented Shape

- Replaced the old `Built for developers who want to ship` feature grid.
- Replaced the separate `Your API has value` CTA block.
- Added the locked audience section:
  - `BUILT FOR API OWNERS`
  - `Monetize the endpoints your users already call.`
  - supporting copy focused on paid machine-readable access without rebuilding billing, metering, and revenue operations.
- Added four audience-fit rows:
  - Indie API builders.
  - Agent-facing API builders.
  - Startup API owners.
  - Data/API sellers.
- Added the right-side PayGate conversion card:
  - `Create your first paid endpoint`
  - primary `Create paid endpoint`
  - secondary `View docs`
  - compact API URL to paid endpoint readiness preview.
- Added the trust note strip:
  - `Built on Stellar MPP`
  - `Request receipts included`
  - `Upstream guard supported`

## Verification

- `npm --prefix frontend run build` passed.
- `git diff --check` passed.
- Desktop section screenshot: `output/playwright/paygate-phase7-use-cases-cta-desktop-1440-v3.png`
- CTA hover screenshot: `output/playwright/paygate-phase7-use-cases-cta-hover-1440-v3.png`
- Mobile section screenshot: `output/playwright/paygate-phase7-use-cases-cta-mobile-390-v3.png`

Screenshot note: the Playwright evidence screenshots hide the sticky marketing navbar and fixed scroll progress only during capture, so the section can be compared directly against the locked section baseline.

## Visual Acceptance

- Desktop matches the baseline's centered heading, left audience-fit rows, right PayGate CTA card, and bottom trust notes.
- The section now answers `who is this for?` instead of repeating the hero paid-call lifecycle.
- The CTA card is the strongest object in the section, while the audience rows remain scannable and compact.
- Primary and secondary actions use the existing PayGate button system.
- URL text truncates cleanly with ellipsis on desktop and remains readable on mobile.
- Mobile stacks the audience rows, CTA card, and trust notes without overlap or horizontal overflow.

## Deferred By Plan

- Phase 8 will polish the full landing flow, reconcile navigation anchors, and capture full-page evidence after all locked landing sections are in place.
