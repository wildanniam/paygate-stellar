# PayGate OpenSpec

OpenSpec in this repo is a lightweight planning and requirements layer for PayGate.

PayGate is now an accepted **$5,000 SCF Instaward** project, per the Stellar Community Fund email dated May 14, 2026. OpenSpec should therefore preserve the 30-day SOW evidence path while also documenting the approved V1 product pivot.

Read order for agents:

1. `../docs/PAYGATE_V1_PRODUCT_SPEC.md` for the locked V1 product direction.
2. `../docs/TECHNICAL_SPEC.md` for the original SOW/V0 implementation plan.
3. `../docs/PAYGATE_NEXT_PLAN.md` for product/SOW context and the current testing playbook.
4. `openspec/specs/*/spec.md` for capability-level requirements.
5. `openspec/changes/*` for active or proposed changes before implementation.

## Current Specs

- `specs/mpp-code-generator/spec.md` — backend generator API.
- `specs/generated-middleware/spec.md` — code emitted by PayGate.
- `specs/website-frontend/spec.md` — React SPA routes and UX.
- `specs/monitoring-dashboard/spec.md` — Horizon-backed earnings dashboard.

## Current Active Change

- `changes/prove-e2e-mpp-payment/` — prove the SOW-critical flow: generate middleware, run it in a sample Express API, execute a real Stellar testnet MPP payment, and show it in the dashboard.
- `changes/build-paygate-v1-gateway/` — build the approved V1 direction: paid proxy, Freighter auth, Supabase API registry, Soroban escrow settlement, and AI-agent payment flow.

## How To Use

When adding a feature or changing behavior:

1. Check the related spec under `openspec/specs`.
2. If it changes product behavior, create or update a folder under `openspec/changes`.
3. Write the proposal, design notes, tasks, and spec delta before coding.
4. After implementation is verified, update the canonical spec under `openspec/specs`.

Keep this lightweight. For V0 work, document behavior that matters for the SOW, official Instawards review, and demo evidence. For V1 work, document the product behavior that makes PayGate a pay-per-call gateway rather than only a code generator.
