# PayGate preview: integrate hero journey and persistent navigation

Latest owner feedback, 13 September 2026: the artwork-led sections 2–3 in 8119964 are accepted. The owner asks for a better concept for the boxed hero transaction walkthrough, more coherent background effects, and navigation available while scrolling. Replace the opaque walkthrough with an open scene, reuse approved violet/weather media, simplify visible copy, localize state lighting, reduce field parallax, and add a page-level fixed nav with a mobile disclosure. Preserve explicit sample payment, credit-before-delivery, cancellation, motion-off and truthful testnet labels. See `frontend/DESIGN.md` and `docs/design/hero-integration.md`.

This hero revision awaits visual feedback. No new section, homepage replacement, backend/wallet/contract change, dependency or merge. The preceding scope records are chronological history, superseded where they conflict with this feedback.

---

# PayGate preview: visual revision of capabilities and setup

Latest owner feedback, later on 13 September 2026: sections 2 and 3 are too plain and text-heavy. Replace their configuration/receipt/code/checklist presentation with original Higgsfield artwork, two ambient loops, concise interactive price/split visuals and a connected setup scene. Keep the accepted hero and original dark/purple palette. Native controls retain keyboard/touch support; media is decorative, lazy and pausable. Actual API/secret/verification requirements stay truthful. See `frontend/DESIGN.md`, `docs/design/visual-story-revision.md` and `docs/design/visual-story-assets.json`.

The new sections await owner feedback. No further section, homepage replacement, backend/wallet/contract change or merge. Prior acceptance and proposals below are chronological history and are superseded where they conflict with this feedback.

---

# PayGate preview: accepted hero/capabilities and one setup section

Latest scope, 13 September 2026: owner accepts the capabilities section and requests exactly one next section. Add a three-step setup journey: register → guard → verify/share. Native selectable steps control one workspace preview; local example checks have cancellable timers, keyboard access, replay, motion-off and mobile layouts. No live API/wallet operation, dependency or new media generation. See `frontend/DESIGN.md` and `docs/design/setup-journey.md`. New setup section awaits feedback; further sections and release remain outside scope.

The previous scope records below are historical; capabilities acceptance and this one-section extension supersede their pending capabilities feedback and two-section boundary.

---

# PayGate preview: accepted hero and one capabilities section

Latest scope, 13 September 2026: owner accepts the revised hero/buttons/transaction journey and asks to develop exactly one next section. The new asymmetric capabilities section covers example pricing, upstream access and payment records. Local price selection updates an illustrative 90/10 split. It reuses the accepted Higgsfield poster, with native product UI and no new dependency or generation. See `frontend/DESIGN.md` and `docs/design/api-capabilities.md`. This new section awaits owner feedback; further sections and release remain outside scope.

The text below preserves the preceding hero-only scope and feedback history; its pending hero acceptance and no-second-section limits are superseded by this latest instruction.

---

# Preview the revised PayGate hero

Owner-authorized scope, 13 September 2026; tracked in [issue #5](https://github.com/wildanniam/paygate-stellar/issues/5) and draft PR #6.

The earlier two-section metal pilot was rejected. Wildan supplied Circular, Koderea, Cloudlight and Agentframe references, required the existing dark/purple identity, and approved implementing the hero first for feedback. He explicitly permits Higgsfield credit use for quality. Prior metal direction and budget limits are superseded.

`/design-preview` is a separate lazy route with one hero: original violet filament artwork, silent ambient film, centered typography, native navigation/CTAs, pointer depth/light response, and an integrated sample console. No new second section. `/` and existing application flows are unchanged.

Spec delta: Public Stellar Testnet beta and a visible simulation label; explicit sample-payment action; credit before forwarding; no payment/API network calls; cancellable reset; media-independent sample state; pause, OS reduced-motion default and poster fallback. No backend/contract/wallet or dependency changes.

The current design contract is `frontend/DESIGN.md`. Implementation evidence is `docs/design/hero-violet.md`, and new generation provenance is `docs/design/hero-violet-assets.json`. Previous pilot evidence remains historical. Owner visual acceptance, later sections and release are pending.

Owner feedback revision: retain the accepted violet background/concept; replace the buttons and rejected debug-style console. The new native transaction journey displays client → gateway → API with state-driven packets, an explicit 402 pause, persistent settlement amounts, a returning-response state, and optional raw payload. Mobile uses a vertical path. Reuse existing Higgsfield media. Revised component acceptance is pending; scope remains hero only.
