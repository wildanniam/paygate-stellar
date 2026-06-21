---
title: PayGate UI/UX Refactor Phase 2 Hero Reference Alignment
date: 2026-06-21
status: accepted
commit_scope: feat
---

# PayGate UI/UX Refactor Phase 2 Hero Reference Alignment

This corrective pass keeps the centered hero copy but rebuilds the animated hero visual so it matches the locked reference more closely.

## Changed Scope

- Replaced the compact rail card with a larger product diagram.
- Added long source and paid endpoint URL pills.
- Added a central branded PayGate node using the PayGate mark asset.
- Added dashed blue request-flow connectors and chevrons.
- Reworked lifecycle states into numbered chips:
  - `1 402 Required`
  - `2 MPP Paid`
  - `3 200 OK`
- Added a revenue split card:
  - `+0.009 USDC developer`
  - `+0.001 fee PayGate fee`
- Added a cropped dashboard preview beneath the flow to make the product feel operational.
- Updated the GSAP sequence to animate the actual product lifecycle:
  - PayGate node reveal
  - source/proxy URL pills
  - connector draw
  - status lifecycle
  - revenue split
  - dashboard preview
- Kept the hero copy centered as requested.

## Verification

Build command:

```bash
npm --prefix frontend run build
```

Result: passed.

Screenshot artifacts:

| View | Artifact |
| --- | --- |
| Desktop accepted | `output/playwright/ui-refactor-phase2-hero-reference-align-desktop-final.png` |
| Mobile accepted | `output/playwright/ui-refactor-phase2-hero-reference-align-mobile-final.png` |

Artifacts are intentionally kept out of git unless requested.

## Visual Review

### Passed

- The hero visual now closely follows the locked reference's product diagram structure.
- The visual clearly explains PayGate as the paid proxy between a user's API URL and a paid endpoint.
- The central PayGate node is now the focal object.
- The animation sequence maps to the actual PayGate lifecycle rather than generic staggered cards.
- Desktop URL pills, lifecycle chips, revenue split, and dashboard preview are visible in the first viewport.
- Mobile keeps the centered copy and preserves the core flow without horizontal overflow.

### Deferred

- The marketing nav still uses the current lightweight nav instead of the full reference nav.
- The rest of the landing page still uses older sections and will be handled in later phases.

## Acceptance Check

- [x] Centered hero copy preserved.
- [x] Hero visual rebuilt around source URL -> PayGate -> paid endpoint.
- [x] 402 -> MPP paid -> 200 lifecycle is visually explicit.
- [x] Revenue split is visible.
- [x] Dashboard preview is visible on desktop.
- [x] GSAP animation sequence matches product meaning.
- [x] Desktop screenshot reviewed.
- [x] Mobile screenshot reviewed.
- [x] Build passes.
- [x] Screenshot artifacts are not staged.

Recommended commit message:

```txt
feat: align landing hero visual flow
```

