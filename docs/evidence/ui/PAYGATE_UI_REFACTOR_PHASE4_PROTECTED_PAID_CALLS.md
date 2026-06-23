# PayGate UI Refactor - Phase 4 Protected Paid Calls

Date: 2026-06-23

## Scope

Phase 4 adds the locked `Protected paid calls` section after the transformation section.

The section answers the safety objection that the earlier hero and transformation sections do not fully cover: the upstream API stays private because PayGate blocks unpaid traffic and forwards only valid paid requests with the upstream secret header.

## Locked Baseline

- `docs/evidence/ui/landing-baselines/phase-4-protected-paid-calls-baseline.png`

## Implemented Shape

- Centered section header:
  - `PROTECTED PAID CALLS`
  - `Keep your upstream API private.`
  - supporting copy about payment verification and upstream secret forwarding.
- Desktop three-zone architecture:
  - `Machine client` card with paid endpoint request and typical client chips.
  - `PayGate guard` card with payment gate status rows.
  - `Protected upstream API` card with masked upstream URL and `X-PayGate-Secret` check.
- Two semantic request paths:
  - amber `Unpaid` path ending in `402 blocked`.
  - green `Paid` forwarding path from client to PayGate and upstream.
- Bottom guarantee strip:
  - `Unpaid traffic blocked`
  - `Upstream URL stays private`
  - `Secret header forwarding`
  - `Receipt per request`

## Verification

- `npm --prefix frontend run build` passed.
- `git diff --check` passed.
- Desktop section screenshot: `output/playwright/paygate-phase4-protected-paid-calls-desktop-1440-v4.png`
- Blocked path hover screenshot: `output/playwright/paygate-phase4-protected-paid-calls-blocked-hover-1440-v4.png`
- Mobile section screenshot: `output/playwright/paygate-phase4-protected-paid-calls-mobile-390-v4.png`

Screenshot note: the Playwright evidence screenshots hide the sticky marketing navbar only during capture, so the section can be compared directly against the locked section baseline.

## Visual Acceptance

- Desktop matches the baseline's three-zone architecture and dark premium material direction.
- The headline, supporting copy, guarded center card, masked upstream card, and guarantee strip match the locked content hierarchy.
- Amber blocked path and green forwarded path are visible without crossing critical card content.
- Hovering the blocked path strengthens the blocked state without changing the section structure.
- Mobile stacks the same story cleanly, with visible branch states and no navbar overlap in the evidence capture.
- No new heavy 3D, decorative blob/orb treatment, or generic AI section copy was introduced.

## Deferred By Plan

- The existing receipt proof section still appears earlier in the page and will be repositioned/refined in the next landing phase.
- The old generic feature section remains below the new narrative sections until the later use-case/final CTA phase replaces it.
