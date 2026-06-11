---
title: PayGate V1 Developer Documentation
date: 2026-06-11
phase: 5
status: passed
---

# Phase 5 - Developer Documentation

## Scope

Added a developer-facing guide for integrating an upstream API with PayGate V1.

## Changes

- Added `docs/developer-guide.md`.
- Linked the guide from root `README.md`.
- Linked the guide from `docs/README.md`.

## Coverage

The guide explains:

- PayGate mental model.
- Proxy URL.
- API Secret.
- `X-PayGate-Secret` upstream guard.
- Express guard example.
- Direct upstream `401` test.
- PayGate proxy unpaid `402` test.
- Agent/client paid `200` test.
- SDK middleware as future convenience, not V1 requirement.
- Demo API caveat.
- V1 boundaries and troubleshooting.

## Acceptance Check

- [x] Developer guide exists in `docs/`.
- [x] Guide explains why upstream guard is required.
- [x] Guide explains `401`, `402`, and `200` expectations.
- [x] Guide does not position SDK middleware as required.
- [x] Root README links to the guide.
- [x] Docs index links to the guide.
- [x] `npm --prefix frontend run build` passed.
- [x] `git diff --check` passed.

