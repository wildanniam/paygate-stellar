---
title: PayGate App UI Refactor Phase 1 Foundations
date: 2026-06-24
phase: app-ui-1
status: passed
---

# Phase 1 - App Interface Foundations

## Scope

This phase adds shared app-surface primitives without redesigning the major pages yet.

Updated areas:

- Shared app CSS classes for workspace pages, app cards, metrics, copy fields, wallet panels, status dots, and operational tables.
- `WalletLoginPanel` now uses shared `Button` and `Notice` primitives.
- `DataTable` now renders through a responsive wrapper and supports per-column alignment/render functions.
- `Metric` now supports icons and semantic tones.
- New `CopyField` primitive for endpoint URLs, secrets, and request IDs.

## Verification

```bash
npm --prefix frontend run build
git diff --check
```

Result: passed.

## Screenshots

| State | Artifact |
| --- | --- |
| Dashboard wallet state desktop | `docs/evidence/ui/app-foundations/phase1-dashboard-wallet-foundation-desktop.png` |
| Dashboard wallet state mobile | `docs/evidence/ui/app-foundations/phase1-dashboard-wallet-foundation-mobile.png` |
| Create endpoint wallet state desktop | `docs/evidence/ui/app-foundations/phase1-create-endpoint-wallet-foundation-desktop.png` |

## Acceptance Check

- [x] App-level class foundation exists before major page rewrites.
- [x] Shared wallet panel no longer uses old inline button styling.
- [x] New copy-field/table/metric primitives are available for later phases.
- [x] Existing app routes still build.
- [x] Landing page is not intentionally changed in this phase.

