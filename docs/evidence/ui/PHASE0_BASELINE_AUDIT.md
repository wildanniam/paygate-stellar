---
title: PayGate V1 UX Baseline Audit
date: 2026-06-11
phase: 0
status: captured
---

# PayGate V1 UX Baseline Audit

## Scope

This baseline captures the current production-oriented UX before V1 onboarding cleanup.

Screens captured locally from `http://127.0.0.1:5173`:

- `phase0-landing-desktop.png`
- `phase0-generate-desktop.png`
- `phase0-register-api-desktop.png`
- `phase0-landing-mobile.png`
- `phase0-register-api-mobile.png`

## Route Audit

| Route | Current role | UX finding |
|---|---|---|
| `/` | Landing page | Still sells the old V0 generator flow and sends users to `/generate`. |
| `/generate` | Legacy MPP Express middleware generator | Still visible from primary landing CTA, which conflicts with V1 proxy gateway positioning. |
| `/dashboard` | V1 developer console | Correct V1 surface, but not enough as a first-time onboarding path. |
| `/apis/new` | V1 API registration | Correct primary action, but hidden behind a small `New API` nav label and prefilled with demo values. |
| `/apis/:apiId` | V1 API detail | Correct V1 surface for proxy URL, API secret, and guard snippet. |

## Baseline Findings

1. Landing page primary CTA routes to `/generate`, so new users enter the old V0 paywall generator instead of the V1 API gateway flow.
2. Landing page copy still emphasizes "Generate Paywall", "Express paywall", and "MPP-ready middleware".
3. V1's actual primary action is hidden behind the small navbar label `New API`.
4. `/apis/new` opens with prefilled demo values, making it unclear whether the values are examples or user-owned data.
5. The register flow mentions a secret header, but does not yet give enough step-by-step guidance that the upstream API must add a guard for `X-PayGate-Secret`.

## Acceptance Check

- [x] Current V1/V0 route responsibilities documented.
- [x] Baseline screenshots captured.
- [x] No product behavior changed in this phase.

