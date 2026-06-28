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

Canonical specs should describe the product as it exists now:

- `specs/wallet-auth/spec.md` — Freighter sign-message login and session behavior.
- `specs/api-registry/spec.md` — registered API lifecycle, encrypted upstream secrets, and setup verification.
- `specs/paid-proxy/spec.md` — `/api/pay/:apiId` payment challenge, MPP verification, upstream forwarding, and request logging.
- `specs/escrow-settlement/spec.md` — Soroban escrow crediting, developer withdrawals, and platform fee accounting.
- `specs/monitoring-dashboard/spec.md` — authenticated PayGate workspace dashboard backed by registry, payment, request, withdrawal, and escrow data.
- `specs/website-frontend/spec.md` — React SPA routes, marketing landing page, app shell, dashboard workspace, create endpoint, and endpoint detail UX.

Legacy/SOW specs are still kept for evidence and regression context:

- `specs/mpp-code-generator/spec.md` — historical backend generator API at `/api/generate`.
- `specs/generated-middleware/spec.md` — historical Express middleware emitted by the V0 generator and used by the sample Express proof.

## Current Change Folders

- `changes/build-paygate-v1-gateway/` — implemented V1 gateway direction. Kept as the implementation/evidence trail; canonical V1 requirements are now promoted into `openspec/specs/*`.
- `changes/prove-e2e-mpp-payment/` — historical V0/SOW generated-middleware proof path. Kept for Instawards/SOW evidence, not as the current product direction.

## How To Use

When adding a feature or changing behavior:

1. Check the related spec under `openspec/specs`.
2. If it changes product behavior, create or update a folder under `openspec/changes`.
3. Write the proposal, design notes, tasks, and spec delta before coding.
4. After implementation is verified, update the canonical spec under `openspec/specs`.

Keep this lightweight. For V0 work, document behavior that matters for the SOW, official Instawards review, and demo evidence. For V1 work, document the product behavior that makes PayGate a pay-per-call gateway rather than only a code generator.

Last canonical alignment pass: 2026-06-27.
