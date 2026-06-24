---
title: PayGate App UI Refactor Phase 0 Baseline
date: 2026-06-24
phase: app-ui-0
status: passed
---

# Phase 0 - App UI Baseline

## Scope

This captures the non-landing app surfaces before the PayGate App UI Refactor track begins.

Routes captured:

- `/dashboard`
- `/apis/new`
- `/apis/demo-api`

The landing page is intentionally out of scope for this track unless shared UI changes cause a regression.

## Verification

```bash
npm --prefix frontend run build
```

Result: passed.

Local server:

```txt
http://127.0.0.1:5173/
```

## Baseline Screenshots

| Route | Desktop | Mobile |
| --- | --- | --- |
| `/dashboard` | `docs/evidence/ui/app-baselines/phase0-dashboard-desktop.png` | `docs/evidence/ui/app-baselines/phase0-dashboard-mobile.png` |
| `/apis/new` | `docs/evidence/ui/app-baselines/phase0-create-endpoint-desktop.png` | `docs/evidence/ui/app-baselines/phase0-create-endpoint-mobile.png` |
| `/apis/demo-api` | `docs/evidence/ui/app-baselines/phase0-api-detail-desktop.png` | `docs/evidence/ui/app-baselines/phase0-api-detail-mobile.png` |

## Baseline Findings

- App pages still look like centered marketing/console pages instead of an operational PayGate workspace.
- Navigation uses the older `Register API` language instead of the locked product action, `Create paid endpoint`.
- Dashboard first fold spends too much space on a large headline and not enough on operational value.
- Wallet empty states are functional but repetitive and do not preview what users get after connecting.
- Register API language and layout underplay the Bitly-like product promise: paste an upstream URL and get a paid endpoint.
- API detail is structurally useful but still reads as a raw admin detail page rather than an endpoint control center.
- The app pages still rely heavily on inline styles, creating visual drift from the landing design system.

## Acceptance Check

- [x] Build passes before app UI refactor.
- [x] Desktop and mobile baseline screenshots captured.
- [x] Route responsibilities documented.
- [x] Landing page excluded from active scope.
- [x] No product behavior changed.

