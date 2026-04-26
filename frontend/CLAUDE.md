# frontend/CLAUDE.md

This file is legacy guidance from the landing-page-only phase of PayGate.

For current project work, use the root-level files instead:

1. `../TECHNICAL_SPEC.md` — canonical implementation spec.
2. `../CLAUDE.md` — project memory for Claude-based agents.
3. `../AGENTS.md` — project memory for Codex and other agents.

## Important

The old single-file constraint no longer applies to the full project. The current build target is a routed React SPA with:

- `/` landing page
- `/generate` generator form
- `/result` generated code result page
- `/dashboard` Stellar testnet earnings dashboard

Only use `PayGate_LandingPage_Brief.md` when editing the existing landing page visual direction or copy. It should not override `../TECHNICAL_SPEC.md`.
