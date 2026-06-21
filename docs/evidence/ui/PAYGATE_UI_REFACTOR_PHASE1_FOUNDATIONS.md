---
title: PayGate UI/UX Refactor Phase 1 Foundations
date: 2026-06-21
status: accepted
commit_scope: style
---

# PayGate UI/UX Refactor Phase 1 Foundations

Phase 1 establishes the design foundation for the premium PayGate refactor. It does not attempt to redesign the landing hero yet; that is reserved for the next phase.

## Changed Scope

- Added semantic color, typography, radius, and shadow tokens.
- Switched the frontend font direction from Inter to `DM Sans` plus `JetBrains Mono`.
- Added reusable UI primitives:
  - Button
  - Panel
  - Badge
  - Field/Input
  - DataTable
  - Metric
  - Notice
  - Section/Container
- Updated shared components to start using the foundation:
  - `CopyButton`
  - `ApiStatusBadge`
  - `CodeBlock`
  - `ValueRow`
- Added reduced-motion safety at the global CSS level.
- Softened old decorative global styles so they stop drifting or shimmering by default.

## Verification

Build command:

```bash
npm --prefix frontend run build
```

Result: passed.

Screenshot artifacts:

| Route | Artifact |
| --- | --- |
| `/` desktop | `output/playwright/ui-refactor-phase1-foundation-landing-desktop.png` |
| `/` mobile | `output/playwright/ui-refactor-phase1-foundation-landing-mobile.png` |
| `/dashboard` desktop | `output/playwright/ui-refactor-phase1-foundation-dashboard-desktop.png` |
| `/apis/new` mobile | `output/playwright/ui-refactor-phase1-foundation-create-mobile.png` |

Artifacts are intentionally kept out of git unless requested.

## Visual Review

### Passed

- The global typography is more refined and less default SaaS.
- Dashboard and auth panels now feel calmer because the base surfaces are slightly cooler and more structured.
- Mobile create-endpoint screen still fits without text overlap.
- Buttons and status badges have a clearer foundation for later phases.
- Motion safety is improved with a global `prefers-reduced-motion` fallback.

### Still Pending By Design

- Landing hero is still terminal-first and still says `Register API`.
- The URL transformation rail from the locked hero concept is not implemented yet.
- Navigation still needs the later workspace-shell refactor.
- Major page layouts still use legacy inline styling.

These are not Phase 1 failures; they are scheduled for later phases.

## Acceptance Check

- [x] Shared design tokens exist.
- [x] Shared UI primitives exist.
- [x] Existing shared components are compatible with the new foundation.
- [x] Build passes.
- [x] Desktop screenshot reviewed.
- [x] Mobile screenshot reviewed.
- [x] No new visible overlap was introduced.
- [x] Screenshot artifacts are not staged.

Recommended commit message:

```txt
style: add PayGate design foundations
```

