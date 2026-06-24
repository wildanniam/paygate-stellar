---
title: PayGate App UI Refactor Phase 5 Create Paid Endpoint
date: 2026-06-24
phase: app-ui-5
status: passed
---

# Phase 5 - Create Paid Endpoint Flow

## Scope

This phase redesigns `/apis/new` from a generic API registration form into a paid-endpoint creation workflow.

Updated areas:

- Form language now follows the locked PayGate story: paste upstream URL, set per-call price, generate proxy.
- Demo loading remains explicit through `Fill demo API`.
- The right side previews the transformation from ordinary upstream API to PayGate paid endpoint.
- Success state now highlights paid endpoint URL, upstream secret, pending setup, and endpoint-control next action.
- Existing submit behavior and API contract remain unchanged.

## Verification

```bash
npm --prefix frontend run build
git diff --check
```

Result: passed.

## Screenshots

Authenticated create-page screenshots were captured with Playwright route mocking for `/api/auth/me` and the submit response.

| State | Artifact |
| --- | --- |
| Create endpoint form desktop | `docs/evidence/ui/app-create/phase5-create-form-desktop.png` |
| Create endpoint form mobile | `docs/evidence/ui/app-create/phase5-create-form-mobile.png` |
| Create endpoint success desktop | `docs/evidence/ui/app-create/phase5-create-success-desktop.png` |

## Acceptance Check

- [x] Page no longer reads as generic `Register API`.
- [x] Workflow communicates Bitly-like simplicity for APIs.
- [x] Result state gives proxy URL and upstream secret as copyable fields.
- [x] Upstream guard requirement remains explicit.
- [x] Mobile layout remains stacked and readable.

