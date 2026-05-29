# PayGate OpenSpec

OpenSpec in this repo is a lightweight planning and requirements layer for PayGate.

PayGate is now an accepted **$5,000 SCF Instaward** project, per the Stellar Community Fund email dated May 14, 2026. OpenSpec should therefore be used to keep the 30-day delivery scope tight, evidence-oriented, and aligned with the accepted SOW.

Read order for agents:

1. `../TECHNICAL_SPEC.md` for the canonical project implementation plan.
2. `../PAYGATE_NEXT_PLAN.md` for product/SOW context and the current testing playbook.
3. `openspec/specs/*/spec.md` for capability-level requirements.
4. `openspec/changes/*` for active or proposed changes before implementation.

## Current Specs

- `specs/mpp-code-generator/spec.md` — backend generator API.
- `specs/generated-middleware/spec.md` — code emitted by PayGate.
- `specs/website-frontend/spec.md` — React SPA routes and UX.
- `specs/monitoring-dashboard/spec.md` — Horizon-backed earnings dashboard.

## Current Active Change

- `changes/prove-e2e-mpp-payment/` — prove the SOW-critical flow: generate middleware, run it in a sample Express API, execute a real Stellar testnet MPP payment, and show it in the dashboard.

## How To Use

When adding a feature or changing behavior:

1. Check the related spec under `openspec/specs`.
2. If it changes product behavior, create or update a folder under `openspec/changes`.
3. Write the proposal, design notes, tasks, and spec delta before coding.
4. After implementation is verified, update the canonical spec under `openspec/specs`.

Keep this lightweight. PayGate is still a 30-day accepted grant POC, so document behavior that matters for the SOW, official Instawards review, and demo evidence.
