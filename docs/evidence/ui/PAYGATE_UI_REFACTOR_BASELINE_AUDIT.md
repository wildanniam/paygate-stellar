---
title: PayGate UI/UX Refactor Baseline Audit
date: 2026-06-21
status: captured
commit_scope: chore
---

# PayGate UI/UX Refactor Baseline Audit

This audit captures the current UI before the premium PayGate refactor starts. It is the baseline for the section-by-section redesign described in `docs/PAYGATE_UI_UX_REFACTOR_DEVELOPMENT_PLAN.md`.

## Verification

Build command:

```bash
npm --prefix frontend run build
```

Result: passed.

Local server:

```txt
http://127.0.0.1:5173/
```

Screenshot artifacts were captured to `output/playwright/` and are intentionally not committed unless requested.

## Captured Screens

| Route | Desktop artifact | Mobile artifact |
| --- | --- | --- |
| `/` | `output/playwright/ui-refactor-baseline-landing-desktop.png` | `output/playwright/ui-refactor-baseline-landing-mobile.png` |
| `/dashboard` | `output/playwright/ui-refactor-baseline-dashboard-desktop.png` | `output/playwright/ui-refactor-baseline-dashboard-mobile.png` |
| `/apis/new` | `output/playwright/ui-refactor-baseline-create-endpoint-desktop.png` | `output/playwright/ui-refactor-baseline-create-endpoint-mobile.png` |
| `/generate` | `output/playwright/ui-refactor-baseline-legacy-generator-desktop.png` | `output/playwright/ui-refactor-baseline-legacy-generator-mobile.png` |

## Baseline Findings

### Landing

- The current hero is readable and visually coherent, but it still feels like a generic purple/cyan developer SaaS page.
- The headline says "Turn APIs into paid proxy endpoints", which is correct but less direct than the locked message: "Paste an API URL. Charge per call."
- The hero visual is a terminal/code block. This makes the page feel developer-tool generic and does not immediately show the value transformation from ordinary API URL to paid endpoint.
- The badge, shimmer border, dot grid, and gradient headline all push the page toward familiar AI-tool aesthetics.
- The primary CTA still says "Register API"; the new product action should be "Create paid endpoint".
- Mobile layout is functional, but the terminal card begins immediately after the hero CTA and reinforces the wrong primary metaphor.

### Dashboard

- The dashboard contains the right product concepts: API revenue, calls, escrow balance, wallet auth, and registered APIs.
- The unauthenticated state is clear, but the page still feels like a console screen rather than an operating workspace.
- The heading is large and useful, but hierarchy below it is mostly stacked panels.
- The global navigation gives `Register API` equal product prominence instead of making `Create paid endpoint` the core action.
- Empty/auth states need stronger product guidance once the workspace shell is introduced.

### Create Endpoint Flow

- The current route is structurally correct, but the language is still "Register an API" rather than "Create a paid endpoint".
- The unauthenticated state is understandable, but it does not yet make the Bitly/Linktree-like simplicity obvious.
- The form flow cannot be reviewed fully without wallet auth, so Phase 11 must preserve existing auth behavior while improving the post-auth flow.

### Legacy Generator

- The legacy generator is already labeled as legacy, which is good.
- It still shares the main visual system and primary nav presence with the V1 product, so it must be visually demoted later.
- The page should remain functional but should not define PayGate's product identity.

## Design Risks Confirmed

- Purple is currently too dominant as the primary brand expression.
- The current UI relies on code/terminal metaphors more than product workflow metaphors.
- The layout language is mostly centered hero plus panels, not a distinctive product workspace.
- There is no shared design foundation strong enough yet to support a high-quality section-by-section refactor.

## Acceptance Check

- [x] Build passes before UI refactor.
- [x] Baseline desktop screenshots captured.
- [x] Baseline mobile screenshots captured.
- [x] Current route responsibilities documented.
- [x] Visual gaps documented against the locked design direction.
- [x] No product behavior changed.

## Next Step

Start Phase 1: design foundations.

Recommended commit message for this baseline:

```txt
chore: capture UI refactor baseline
```

