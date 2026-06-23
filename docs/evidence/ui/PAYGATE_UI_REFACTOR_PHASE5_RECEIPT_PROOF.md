# PayGate UI Refactor - Phase 5 Receipt Proof

Date: 2026-06-23

## Scope

Phase 5 repositions and reshapes the request receipt section so it comes after the upstream protection story.

The section no longer acts as another paid-call flow diagram. Its job is auditability: show that every successful paid call leaves request identity, payment verification, upstream result, and revenue split evidence.

## Locked Baseline

- `docs/evidence/ui/landing-baselines/phase-5-receipt-proof-baseline.png`

## Implemented Shape

- Moved the receipt proof section after `Protected paid calls`.
- Updated the left narrative:
  - `REQUEST RECEIPT`
  - `Every paid call leaves a receipt.`
  - copy focused on request identity, payment verification, upstream forwarding, and posted revenue.
- Replaced the old bottom chip strip with three proof reasons:
  - `Request identity`
  - `Payment verification`
  - `Upstream result`
- Reshaped the right side to match the baseline:
  - large live request receipt panel,
  - four request lifecycle rows,
  - live region/latency/forwarded footer,
  - horizontal revenue split panel under the receipt.

## Verification

- `npm --prefix frontend run build` passed.
- `git diff --check` passed.
- Copy interaction returned `data-copy-state="copied"`.
- Desktop section screenshot: `output/playwright/paygate-phase5-receipt-proof-desktop-1440-v4.png`
- Hover-state screenshot: `output/playwright/paygate-phase5-receipt-proof-hover-1440-v4.png`
- Mobile section screenshot: `output/playwright/paygate-phase5-receipt-proof-mobile-390-v4.png`

Screenshot note: the Playwright evidence screenshots hide the sticky marketing navbar only during capture, so the section can be compared directly against the locked section baseline.

## Visual Acceptance

- Desktop matches the baseline's narrative-left, receipt-right, revenue-under-receipt structure.
- The heading now wraps into the same two-line rhythm as the baseline.
- Receipt row labels and values remain readable without text overlap.
- Revenue split appears as a horizontal proof panel instead of the previous tall right-side card.
- Mobile stacks the narrative, proof reasons, receipt panel, and revenue split without navbar overlap.
- The section no longer repeats the hero/transformation story; it proves what happened after a paid request.

## Deferred By Plan

- Dashboard preview remains in the hero for now and will be developed as the dedicated operating-workspace section in the next phase.
- The old generic feature section remains below the new narrative sections until the later use-case/final CTA phase replaces it.
