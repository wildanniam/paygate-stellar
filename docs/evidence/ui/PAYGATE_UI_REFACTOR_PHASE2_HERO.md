---
title: PayGate UI/UX Refactor Phase 2 Hero
date: 2026-06-21
status: accepted
commit_scope: feat
---

# PayGate UI/UX Refactor Phase 2 Hero

Phase 2 replaces the old terminal-first landing hero with the locked PayGate hero direction: a clear API URL to paid endpoint transformation.

## Changed Scope

- Added `gsap` and `@gsap/react`.
- Replaced the old hero headline with:

```txt
Paste an API URL. Charge per call.
```

- Replaced the terminal/code hero with an implementable URL transformation rail:
  - Original API URL
  - PayGate gateway
  - Price per call
  - Paid proxy URL
  - `402 Required`
  - `MPP paid`
  - `200 OK`
  - Developer revenue
- Updated the hero CTA to `Create paid endpoint`.
- Added a lightweight GSAP sequence for the rail reveal.
- Added reduced-motion-safe behavior through existing global motion controls and non-animated fallback visibility.
- Tuned mobile layout so the hero remains compact and shows a hint of the next section.

## Verification

Build command:

```bash
npm --prefix frontend run build
```

Result: passed.

Runtime dependency audit:

```bash
npm --prefix frontend audit --omit=dev
```

Result: found 0 vulnerabilities.

Screenshot artifacts:

| View | Artifact |
| --- | --- |
| Desktop accepted | `output/playwright/ui-refactor-phase2-hero-desktop-final.png` |
| Mobile accepted | `output/playwright/ui-refactor-phase2-hero-mobile-accepted-v2.png` |

Artifacts are intentionally kept out of git unless requested.

## Visual Review

### Passed

- The hero now communicates PayGate's product promise in the first viewport.
- The main message is no longer terminal-first or generic AI-console oriented.
- The hero visual shows the core product transformation directly.
- Purple is used as brand accent and paid endpoint emphasis, while blue/green/amber carry semantic product states.
- Desktop composition feels calmer and more premium.
- Mobile rail fits without awkward URL wrapping.
- Mobile first viewport now shows a visible hint of the next section.
- No heavy 3D or decorative blob/orb treatment was introduced.

### Deferred

- The rest of the landing page still uses the old section structure.
- The old problem/features/final CTA sections still need later refactor phases.
- The global nav still uses the brace-style PayGate wordmark until the workspace/nav phase.

## Acceptance Check

- [x] Hero headline matches locked direction.
- [x] Hero uses URL transformation rail instead of terminal/code block.
- [x] GSAP is used only for useful sequencing.
- [x] Reduced-motion users still get readable content.
- [x] Desktop screenshot reviewed.
- [x] Mobile screenshot reviewed and iterated.
- [x] Mobile hero leaves next-section hint visible.
- [x] Build passes.
- [x] Runtime dependency audit passes.
- [x] Screenshot artifacts are not staged.

Recommended commit message:

```txt
feat: refactor landing hero around paid API flow
```

