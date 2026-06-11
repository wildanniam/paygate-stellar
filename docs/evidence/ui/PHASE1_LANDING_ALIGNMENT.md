---
title: PayGate V1 Landing Alignment
date: 2026-06-11
phase: 1
status: passed
---

# Phase 1 - Landing Alignment

## Scope

Updated the landing page so first-time users enter the V1 API gateway flow instead of the legacy MPP middleware generator flow.

## Changes

- Primary landing CTA now routes to `/apis/new`.
- Main CTA label changed from `Generate Paywall` to `Register API`.
- Hero copy now describes PayGate as a paid proxy gateway for APIs.
- Hero code preview now shows an agent calling a PayGate proxy and handling `402`.
- How-it-works now explains register API, create proxy, protect upstream, and get paid.
- Feature cards now describe proxy URL, dashboard, upstream guard, and machine-client payment flow.
- Final CTA now routes to `/apis/new`.

## Screenshots

- `phase1-landing-desktop.png`
- `phase1-landing-mobile.png`
- `phase1-landing-viewport-desktop.png`
- `phase1-landing-viewport-mobile.png`

## Screenshot Analysis

- Desktop first viewport clearly communicates "paid proxy endpoints".
- Mobile first viewport keeps headline, supporting copy, CTA, and proxy code preview readable.
- Primary CTA is visible and routes to the V1 API registration flow.
- No obvious text overlap or clipped CTA was observed in the captured hero viewport.
- Full-page captures still show the existing scroll-animation limitation where offscreen sections remain hidden during automated fullPage screenshots. This predates the phase and should be handled separately if full-page visual evidence is required.

## Acceptance Check

- [x] Landing page has no visible primary CTA to `/generate`.
- [x] Landing page no longer sells the old Express paywall generator as the main product.
- [x] First viewport positions PayGate as a pay-per-call API gateway.
- [x] Primary CTA points to `/apis/new`.
- [x] Desktop and mobile screenshots captured and reviewed.
- [x] `npm --prefix frontend run build` passed.

