---
title: PayGate V1 Upstream Guard Guidance
date: 2026-06-11
phase: 4
status: passed
---

# Phase 4 - Upstream Guard Guidance

## Scope

Added in-product developer guidance explaining that API registration is not complete until the upstream API checks `X-PayGate-Secret`.

## Changes

- Added reusable `UpstreamGuardGuide` component.
- Replaced the old single code snippet with:
  - protection explanation,
  - bypass warning,
  - setup checklist,
  - `.env` secret snippet,
  - Express guard snippet,
  - curl test commands.
- Displayed the guide after successful API registration.
- Displayed the same guide on API detail pages.

## Screenshots

- `phase4-register-success-guard-desktop.png`
- `phase4-register-success-guard-mobile.png`
- `phase4-register-success-guard-mobile-scrolled.png`
- `phase4-api-detail-guard-desktop.png`

## Screenshot Analysis

- Desktop success state now immediately shows the proxy URL, secret, and upstream protection warning.
- The warning clearly explains the bypass risk if the upstream API remains public.
- Mobile success state requires scrolling after the form, but the guard section is readable and does not overlap with the success card.
- API detail page now carries the same setup guidance, so users can return later and still understand what to do.

## Acceptance Check

- [x] User is told that upstream API must reject direct non-PayGate requests.
- [x] User sees where to store the API secret.
- [x] User gets copyable Express guard code.
- [x] User gets `401`, `402`, and `200` testing expectations.
- [x] Guide appears after registration and on API detail.
- [x] Desktop and mobile screenshots captured and reviewed.
- [x] `npm --prefix frontend run build` passed.

