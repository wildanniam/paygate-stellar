# Homepage promotion — 15 September 2026

Owner clarified that the approved design must replace the actual homepage on main, and requested implementation plus post-replacement checks. This supersedes previous preview-only/no-homepage-change restrictions. Standard UI/routing increment, issue9, branch `codex/promote-landing-homepage`; owner authorization includes completing the homepage replacement on main.

Root renders the approved landing directly, removing the old landing import from the shipped route graph. `/design-preview` redirects to `/` with query/hash preserved locally; Vercel has a permanent redirect. Product routes stay unchanged. Replace preview title, add beta-aware description/theme color, and scope canonical URL to the mounted homepage. Restore initial anchor/top on entry; map prior landing section anchors to corresponding sections. No wallet/backend changes.

Verification record: `docs/design/homepage-promotion.md`.

---

# Per-call price motion — 15 September 2026

Owner requests an animated per-call amount. Keep badge/label/currency fixed; exact price layers slide/crossfade on selection for420ms/280ms, without interpolating monetary values. Persistent layers reverse smoothly; no remount/idle entrance. Existing live price announcement stays immediate. Global off/reduced-motion disable travel. This supersedes earlier no-amount-animation guidance for the decorative per-call badge only. Verified desktop/390px, keyboard, rapid selections and motion-off; build passes. See `docs/design/interaction-choreography.md`. Reuse issue5/draft PR6; no merge.

---

# Hero demo placement — 15 September 2026

Owner accepts the separate hero placement study and requests implementation. Standard UI increment on issue #5 / draft PR #6; do not merge. Visual target: `hero-placement-study.html` in the 13 September visualization session. Keep centered hero, existing brand/media and the five-section narrative.

Place a shallow demo surface at the lower hero transition. Group the request strip, example price and one stable action; use a smaller gateway and a larger response. Remove the separate playback bar and duplicate reset. Payment state belongs to the gateway, delivery state to the response. Keep a polite live status and optional payload. The existing simulation must still pause at402, credit before forwarding, and cancel stale runs; no wallet/network actions. On phones, request/action → compact gateway → response; controls ≥44px and readable supporting text. Native signal travel/verification trace/response reveal follow actual state, with stable layout and motion-off/reduced-motion alternatives. Existing fiber stack fades into shared ink behind the demo; no regenerated media or dependencies. Verify desktop/tablet/390/320px, explicit payment/replay, rapid clicks, payload, keyboard, scroll entry and motion off; build and existing19tests.

Implementation and verification completed: shallow grouped demo, stable46px action, larger response, bounded background mask and native state-driven signals. Final build and19 regression tests pass; Chrome desktop/tablet/390/320px and explicit payment/replay/keyboard/motion-off checked. Full record: `docs/design/interaction-choreography.md#hero-demo-placement--15-september-2026`. Owner approval covers the study direction; assembled visual feedback remains open.

---

# Setup selection and card feedback — 14 September 2026

Owner asks for unmistakable active setup artwork, smoother step changes, and whole-card pricing hover. Standard UI increment; reuse issue #5 / draft PR #6, no merge. Preserve existing palette, artwork, five sections and payment truth.

Target: selected setup stage has a persistent Viewing marker, bright tab plate, stronger shield material and a quiet grounding light. Inactive hover must stay weaker than selection. Keep artwork DOM mounted; transition from current transforms over 420ms instead of remounting/restarting all objects. Caption uses three persistent overlapping rows; mobile crossfades one stage at a time with hidden inactive controls. Keyboard focus remains distinct. Pricing cards lift 4px with edge light/shadow in 220ms on fine-pointer hover, native controls retain focus/press. No card-wide click action or tilt. Motion-off/reduced-motion removes travel while preserving visual state. No new media/dependency. Verify rapid switching, keyboard, desktop/mobile, hover leave, exact pricing and motion-off.

---

# Surface blending and cloud candidate — 14 September 2026

Owner reports hard color patches inside the pricing artwork and across surrounding sections, and rejects the contour cloud. Scope: correct compositing and produce a better cloud study in the existing five-section preview; issue #5 / draft PR #6, no merge.

Verified cause: price art is inset 5% from the top and 14% from the bottom, while the card, baked image background and opaque gradient end used different ink values. The overlay ended abruptly at those inset bounds. Section glows also extended beyond clipped containers. Shared `--lp-art-surface: #090613` and `--lp-art-rgb: 9, 6, 19` now anchor pricing/access/setup; alpha masks feather the whole media stack (poster plus pointer canvas), replacing the price's opaque gradient. Pricing/receipt glows fade before all section edges; closing uses the existing canvas token. Keep intentional lavender share-card hierarchy and semantic payment states.

One Higgsfield still replaces the rejected contour cloud: natural asymmetrical cumulus volume, pearl/lavender light, indigo shadows and partly hidden lilac sun; no concentric cavity. This is an AI-selected candidate now integrated for owner review, NOT owner-approved artwork. Exact prompt, job and sources: `docs/design/weather-volume-asset.json`. Full WebP about 20 KB, small about 6.5 KB; no video or dependency added. Pricing retains native pointer response, while the hero uses the matching thumbnail. Earlier proposal-only notes below are historical and superseded by this actual integration.

Validation: production build and all 19 motion/simulation tests pass; desktop 1470px and mobile 390px inspected, exact .05/.045/.005 relationship checked, motion-off compositing and hero thumbnail verified. No financial behavior or homepage route changed.

---

# Pricing feedback — 14 September 2026

Owner asks for actual wave deformation on hover and price selection in “You keep 90%”, and analysis of the unsatisfactory cloud. Reuse issue #5 / draft PR #6. Native 30-bar wave, fixed 27/3 ownership split, exact immediate amounts. Pointer-local crest/trough; one 1.5s travelling wave on price change; settles and sleeps. Stop offscreen/hidden, global off and OS reduced-motion. Keep text/control positions stable and reserve room around the graphic at all breakpoints. No additional section or UI merge.

Cloud contour is now **rejected by owner for its form**, superseding AI integration acceptance below. Replacement direction is a proposal: one airy volumetric cloud with subtle lavender rim light and partly hidden sun, no concentric rings/triangular cavity. Analyze first; no new generation or image replacement in this increment. Detailed rationale, draft asset brief and checks: `docs/design/interaction-choreography.md#pricing-feedback-follow-up`.

---

# PayGate — interaction choreography, 14 September 2026

## Current owner lock: connect actions, objects and atmosphere

The owner approves the five-section interaction audit and requests implementation and evaluation. Continue issue #5 / draft PR #6 without merging. Keep ink/violet, type, five content roles and simulated payment truth. This supersedes the prior instruction to leave the first four sections unchanged.

- Hero: foreground request/credit/response choreography; subdued ambient during the demonstration; start the request only after its controls are in view. Static content and keyboard focus remain immediate.
- Pricing: moving segmented selection and a short connection into the constant 90/10 split. All values update immediately; animation is emphasis, not financial state. Dry sun/cloud artwork replaces the inconsistent rainy asset.
- Setup: bundle, attach guard, verify/share are distinct object actions. Three anchors on desktop; one stable active stage under tabs on phones. No setup operations or automatic progress claims.
- Receipt: independent payment and response events; subtle record selection and explicit flip, stable readable data.
- Closing/navigation: native fiber-like wordmark texture, tactile buttons, quiet disclosures and section-aware navigation. No new section or repeating full-screen film.

Motion: local controls 150–220ms, transitions 250–450ms, one-shot object actions under 1s; ongoing hero simulation follows its existing explicit state machine. Stop decorative work offscreen/hidden. Global off/OS reduced-motion preserves all state, suppresses travel and distortion. Touch does not require hover. Verify desktop/tablet/390/320px, rapid selection/reset, keyboard, motion-off and clipboard; build and relevant existing tests. Implementation record: `docs/design/interaction-choreography.md`.

---

# Previous lock — closing section, 14 September 2026

## Current owner lock: approved closing study

The owner accepts the CTA/FAQ/interactive-wordmark study and authorizes implementation as the fifth, closing section on `/design-preview`. This supersedes the four-section-only restriction below for this increment. Continue issue #5 / draft PR #6; do not merge the UI.

Brand UI for API builders finishing the four-section product story. Primary path: resolve a prerequisite in the FAQ, then Create paid endpoint → `/apis/new`; the setup guide is secondary. Keep public Stellar Testnet beta visible by the CTA. Existing four sections remain unchanged.

Target: the owner-approved `paygate-closing-direction.html` study, with CTA left / four quiet FAQ rows right, large PayGate wordmark below, and small Docs/GitHub footer. Retain DM Sans, ink/violet/lavender and the existing primary button family. Scale the study to the landing's content width; stack at 700px. Controls remain at least 44px, supporting text at least 12px. Preserve exact letter shapes and native readable content.

Micro motion budget: bounded light inside the wordmark follows a fine pointer with easing and returns to 45% on leave; no idle loop, video, shader or scroll hijack. Stop frames/listeners when disabled/offscreen/hidden and clean up on unmount. Respect the shared motion setting and OS reduced motion. CTA lift/arrow/press and 240ms single-open FAQ disclosure complete the interaction. All answers start closed; keyboard Enter/Space and visible focus work; collapsed answer content is hidden from assistive technology. No loading/payment/validation state is needed for this local FAQ.

Native fine-line material is the approved starting finish. A Higgsfield still is optional only if inspection shows a clear need; generating new media is not required to reproduce the accepted study. No generated text/logo. Review assembled desktop/tablet/390/320px views, pointer return/pause, FAQ single-open and keyboard behavior, CTA routes, build and existing regressions. Implementation and evidence: `docs/design/closing-section.md`.

---

# Previous lock — four-section content revision

## Current owner lock

The owner accepts the content blueprint and authorizes revising the four existing sections only. No new landing section, FAQ, closing CTA, dashboard showcase or homepage replacement. Continue issue #5 / draft PR #6; no UI merge. This scope supersedes conflicting historical instructions below (persistent hero split, serial setup controls, three successful receipts).

- Hero owns runtime request → explicit payment → response. Preserve artwork/diagram/402 pause; remove the repeated earnings bar. Copy distinguishes payment credited from response delivered.
- Capabilities owns pricing: “Your price. Clear fees.” Keep weather art, selector and 90/10 graphic. DOM/mobile order price → share → access; keep the asymmetric desktop composition. Access becomes a short benefit with a link to setup, without secret-header mechanics.
- Setup owns provider actions: Register → Protect → Verify & share. All objects remain readable initially; direct keyboard tabs choose one concise caption. Remove Next/Back/Replay. Tab selection does not perform real setup.
- Receipt owns evidence: two illustrative Weather API records, Delivered and API error. Both explicitly have credited payment; one returns 200, the other is an upstream 502. Request identity and independent payment/response states dominate; gross/net/fee remain complete but secondary. A 502 code alone never establishes payment. Keep flip, copy feedback, inactive-face inertness and stable focus.

Preserve dark/violet tokens, typography, fixed navbar, existing five Higgsfield media treatments, motion controls and pointer response. No new media generation required. Native labels/values stay sharp over the artwork. Important context labels target ≥12px and actions ≥44px. Preserve mobile, keyboard, reduced-motion and original-media fallback.

Validate build, simulation/pointer tests, receipt payment-vs-delivery semantics, and actual browser desktop/tablet/390/320px views. Review interactions and content independently of visual taste; owner feedback remains pending on the assembled revision. Detailed implementation/evidence: `docs/design/content-revision.md`.

---

## Previous direction (historical)

# PayGate landing preview — pointer-responsive artwork, 14 September 2026

## Current authorized interaction — 14 September 2026

Owner now approves the proposed local video-texture response and requests analysis of the other assets. Apply it within the existing four sections. This is a brand-motion enhancement, not a new content section. Preserve palette, composition, native copy, receipt, logo and product controls. Reuse current Higgsfield assets; no new generation is needed for this experiment.

| Asset | Treatment | Reason |
|---|---|---|
| Hero violet fibers | Broad local displacement, soft momentum and luminance response | Long organic filaments can visibly follow a passing cursor |
| Receipt light-paper | Local flex around pointer, slightly tighter radius | Paper edges remain recognizable; receipt itself is native and stable |
| Weather field | Gentle wind response, lower displacement | Preserve cloud/data illustration clarity |
| Setup path | Low, directionally restrained displacement | Keep connect/protect/publish spatial relationships clear |
| Access shield | Local light response, zero displacement | Rigid protection shape should not melt |
| Logos, weather thumbnail, native sheets and earnings bars | Preserve current treatment | Semantic product objects and exact data must remain sharp |

Use one reusable, progressively enhanced WebGL texture plane, no 3D scene/dependency. Same source video frame or image as the existing media layer; preserve object-fit/object-position and color. Pointer position/velocity drives a bounded local response that dissipates, not video time scrubbing. Fine pointer + hover only; touch stays ambient. Ignore native interactive controls and receipt faces, without intercepting events. Canvas is decorative and cannot receive focus.

Performance/lifecycle: cap render resolution/DPR, upload video textures on fresh frames only, sleep when a static image settles, disable observers/listeners/frames offscreen or with motion off, destroy GPU resources on cleanup. Preserve poster/video underneath until first successful draw. WebGL/context/texture failure immediately falls back to original media. Respect global motion, OS reduced default and hidden-document pause. Actual cursor response, crop/color equivalence, desktop/mobile, keyboard/product controls and cleanup need browser checks; math/fit lifecycle logic gets focused tests. Visual quality awaits owner feedback, not guaranteed by test results.

## Authority

The pointer-response implementation and verification are recorded in `docs/design/pointer-flow.md`. The following section-creation scope is preceding history; the latest approval above adds interaction to the existing four sections.

The owner now authorizes exactly one next section after the current hero, capabilities and setup. Preserve those surfaces. Add an artwork-led payment-record section on `/design-preview`, issue #5 / draft PR #6. User explicitly wants creative Higgsfield media and thoughtful microinteractions. The preview grows to four sections; homepage replacement, backend, further sections and merge remain out of scope. New section awaits owner visual feedback.

## Current section: every call leaves a record

Brand-led interactive illustration for developer API owners, following setup. Headline: “Every paid call. A clear record.” One short supporting sentence connects payment, provider earnings and response. An asymmetric composition places three selectable sample calls beside a prominent native receipt in an original Higgsfield light-paper environment. This changes the rhythm after the wide setup panorama. No dashboard table, fabricated activity graph, fake live counter or wall of documentation.

The generated art contains translucent, perforated receipt-paper ribbons woven from violet fibers around a quiet central footprint. Keep exact data native on a pale lavender receipt with perforated edges: selected API, gross payment, provider/fee, independent response status and request identity. A “View details” action turns the receipt to its reverse for endpoint, payment/request IDs and response evidence. The reverse offers a real clipboard action with success/failure feedback. Sample identifiers are visibly examples and never link to fabricated on-chain proof.

State contract: three native vertical tabs with Up/Down/Home/End and roving focus; selection updates the same receipt and returns it to the front. A local 400ms sheet transition and finite verification-stamp reveal emphasize the new record. Hover/focus highlights the selected row; press moves it 1px. Receipt details use a controlled fold/turn; hidden faces are inert and nonfocusable, and a persistent toggle preserves keyboard focus. Clipboard success announces “Copied”; failure exposes a selectable ID. Motion off changes state immediately, stops film and all decorative CSS; no interaction waits for animation. No automatic cycling or simulated transactions in this section.

Desktop uses an open 40/60 split inside a subtly bounded violet environment. Phone stacks heading, compact call selector, then a full-size receipt; controls remain ≥44px and the selected receipt is near the selector. The generated art is a poster first; the quiet loop loads only when in view and pauses offscreen/hidden. Assets do not carry exact amounts or determine payment state. Reuse StoryMedia with a backwards-compatible asset-base option if needed.

References: Circular's differentiated panel scale; Cloudlight's concrete product objects and selectable result; Agentframe's textured art direction. Interpret principles within PayGate's existing purple palette and type system, without copying their assets, source or illustrative business claims.

## Current hero revision

Replace the large opaque walkthrough with an open client → PayGate → weather-data composition inside the hero environment. Small glass endpoint surfaces and a luminous brand core sit on the same field. Remove window chrome, repeated narrative paragraphs and the full-width settlement bar. One concise state caption, one primary simulation action and a compact persistent split explain the process. Raw payload remains optional. The 402 pause explicitly requires simulated payment; credited revenue remains visible before the API response arrives.

Reuse the approved violet filament film and a small existing weather poster. Do not generate unrelated art. Reduce whole-field pointer displacement and remove the unrelated cursor spotlight; directional connector light and a local gateway halo respond to transaction state. A single graded atmosphere protects text and fades the hero into the page. Motion-off, reduced motion and poster fallback preserve the explanation.

Navigation is fixed at page level, outside the clipped hero, with a translucent initial surface and a denser scrolled surface. Reserve its space in the hero. On phone, a labelled disclosure opens the same links, closes on selection/Escape/outside click, and restores keyboard focus on Escape. Anchor/focus destinations clear the persistent header. Avoid scroll hijacking or navigation that disappears on downward scroll.

## Visual target and story

Keep ink #050609, violet #735CFA, lavender #9A90FF, existing semantic colors, DM Sans and JetBrains Mono. Preserve the colored mark and accepted hero. Circular's varied panel scale and media-led composition, Cloudlight's recognizable product scenes, and the textured setting of Agentframe are references. The previous implementation copied containers and left the visual story to paragraphs; do not repeat it.

Capabilities: one dominant weather/data art panel with a native price selector, one optical shield illustration with short access caption, and one large native 90/10 earnings visualization. Art occupies most of the panels. Short titles and concrete numbers carry the explanation; no configuration form, long receipt or code block. Price selection updates the matching share and fee with immediate feedback on mobile too.

Setup: a panoramic violet filament environment with three spatial anchors. Native API source, guard and shareable endpoint show register → protect → publish. Three short selectable controls change the state of the same scene. Keep one sentence below the scene and a real setup-guide link. Remove the debug workspace, verification checklist, duplicated step descriptions and Express snippet. The sequence is a local illustration of setup; actual registration still requires Freighter, API config, a server-side secret check and verification.

## Assets and motion

The accepted sections use three original Higgsfield masters with the violet hero as a style reference: recognizable weather data/cloud, optical access shield, and panoramic connecting light field. These assets are already produced; reuse them for this hero revision. Keep all exact text, values and controls native. No metal sculpture, literal doors, coins, fabricated UI or unrelated stock art.

Media gets a poster fallback, lazy source attachment, offscreen/document-hidden pause, global motion-off and OS reduced-motion support. Native scene transitions use transform/opacity; never move surrounding layout. No scroll hijack, autoplay steps, fake live activity or shader dependency. Motion supports the diagram; it does not determine financial state.

## Interaction and responsive contract

Price choices use native buttons and aria-pressed, update the 90/10 illustration and a polite live announcement. Setup uses horizontal tabs with roving focus, Left/Right/Home/End, native next/back controls and a concise accessible stage description. Steps can be selected in any order. No network operation runs from either illustration.

Desktop: artwork-heavy asymmetric capabilities followed by one broad, immersive setup scene. Phone: artwork remains substantial; price and immediate split stay together. Setup anchors become vertical with clear connecting flow and no horizontal scrolling. Minimum 44px controls. Native text stays readable over quiet regions of artwork. Motion-off changes state immediately.

## Product truth

Public Stellar Testnet beta; GET/JSON examples. Gross 0.010 / 0.050 / 0.100 testnet USDC maps to provider 0.009 / 0.045 / 0.090 and fee 0.001 / 0.005 / 0.010. Payment credit precedes delivery; do not imply success-only charging. Upstream protection requires the provider's secret-header check, not merely registration. Examples do not register APIs, contact wallets or send payment.

## Verification

Inspect the assembled hero on desktop, tablet and small phones. Check explicit 402/payment/delivery, cancellation on reset, payload visibility, motion-off and media playback. Verify fixed navigation beyond the hero, desktop/mobile anchor offsets, disclosure Escape/outside-click/selection and touch targets. Keep the accepted sections unchanged; check them as navigation destinations. Source-review fallback and reduced-motion behavior. Run the frontend build and existing simulation tests. Record assets, exact prompts, jobs and measured cost; capture the owner's feedback separately from engineering checks. Prior implementations are historical in the linked design notes.
