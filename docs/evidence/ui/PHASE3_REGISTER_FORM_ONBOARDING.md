---
title: PayGate V1 Register API Form Onboarding
date: 2026-06-11
phase: 3
status: passed
---

# Phase 3 - Register API Form Onboarding

## Scope

Improved the API registration form so first-time users do not confuse demo/example data with their own API data.

## Changes

- Removed hardcoded default values from the form.
- Moved examples into placeholders.
- Added helper text for every field.
- Added required browser-level validation for the core fields.
- Added an explicit `Fill demo API` button for users who want quick demo values.

## Screenshots

- `phase3-register-empty-desktop.png`
- `phase3-register-empty-mobile.png`
- `phase3-register-demo-filled-desktop.png`

## Screenshot Analysis

- Empty desktop form now clearly shows placeholders instead of prefilled user data.
- Empty mobile form remains readable and does not show fake values as saved data.
- `Fill demo API` is explicit, so demo values are opt-in.
- The local demo-fill screenshot uses `http://127.0.0.1:5173` because the button uses `window.location.origin`; on Vercel this will resolve to the deployed PayGate domain.

## Acceptance Check

- [x] Form fresh state has no hardcoded input values.
- [x] Examples appear as placeholders/helper text.
- [x] Demo values require an explicit user action.
- [x] Core fields are required before submit.
- [x] Desktop and mobile screenshots captured and reviewed.
- [x] `npm --prefix frontend run build` passed.

