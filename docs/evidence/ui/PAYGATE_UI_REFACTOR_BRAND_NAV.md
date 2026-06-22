# PayGate UI Refactor - Brand And Navbar

Date: 2026-06-22

## Decision

Use the X account logo direction as the canonical PayGate brand direction:

- Strong geometric `P` silhouette.
- Purple-to-blue body.
- Cyan endpoint node and short payment/API rail.
- Transparent product-ready SVG assets for the website.

The older local logo variants were removed because they created too many competing marks and made the brand system feel inconsistent.

## Asset Set

Kept the brand folder intentionally small:

- `frontend/public/brand/paygate-mark.svg` - canonical transparent logo mark for product UI.
- `frontend/public/brand/paygate-avatar.svg` - circular transparent avatar-style mark for social/OG contexts.
- `frontend/public/brand/paygate-wordmark.svg` - standalone wordmark helper.
- `frontend/public/brand/paygate-asset-api.svg` - supporting API badge.
- `frontend/public/brand/paygate-asset-code.svg` - supporting code badge.
- `frontend/public/brand/paygate-asset-chart.svg` - supporting revenue chart badge.
- `frontend/public/brand/paygate-asset-signal.svg` - supporting machine/signal badge.
- `frontend/public/favicon.svg` - SVG favicon.

## Placement

Do not add the banner's floating `API`, code, chart, and signal components to the hero right now. The hero already has the strongest product explanation: original API URL to PayGate to paid endpoint, with `402`, `MPP Paid`, `200 OK`, and revenue proof.

Instead, use the banner components as supporting feature-card icons in the section below. This keeps the hero clean and lets the broader visual language show up as the page unfolds.

## Verification

- `npm --prefix frontend run build` passed.
- Desktop hero/navbar screenshot: `output/playwright/paygate-brand-nav-hero-1440x900.png`
- Feature asset screenshot: `output/playwright/paygate-brand-feature-assets-1440x900.png`
- Mobile navbar screenshot: `output/playwright/paygate-brand-nav-mobile-390x844.png`
- Browser console showed 0 errors. Only React Router future-flag development warnings remain.
