# Five-section interaction revision — 14 September 2026

## Authorization and boundaries

Wildan accepted the motion/interaction audit and requested implementation plus evaluation. Reuses issue #5 and draft PR #6, branch `codex/5-higgsfield-landing-pilot`. The five existing content roles, ink/violet identity and native financial state remain. No new section, homepage replacement, backend change, dependency or merge.

This document supersedes the earlier closing-only instruction to leave the first four sections unchanged. Historical documents retain their original milestones. Engineering verification below is not owner acceptance of the assembled visuals.

## Implemented choreography

| Section | Action and visual response | Stable content / fallback |
|---|---|---|
| Hero | Try a request scrolls first; a cancellable frame observer starts the simulation after the demo is visible and stable. Field opacity .92 → .62 and playback .85 → .65 during the demo. Core enlarged, ring traces during verification, client and API edges highlight their respective stages. | Existing explicit 402/payment/credit/delivery state machine. Reset/payload remain native. No payment on hover; no real request. Pointer wake excluded over hero copy. |
| Pricing | Segmented active plate moves in 280ms. A short bridge pulse leads into the share panel, then 27/3 bars receive a finite light sweep. Hovering groups highlights their matching labels. | Gross/net/fee update immediately using the existing arithmetic. Constant 90/10 ratio; no interpolated currency or changing bar proportions. On mobile the bridge is vertical and controls stay beside the example. |
| Setup | Register gathers layered API sheets; Protect attaches a translucent guard and secret connector; Verify & share reveals an endpoint with client links. Rails pulse once. Shared tab plate and local object edge light. | Three selectable anchors on desktop, one 281px active stage on phones. Tabs support arrows/Home/End, objects are separate buttons. Selection illustrates steps, never reports real setup success. |
| Receipt | Selection marks the active sample; only request identity and API outcome animate. Explicit flip exposes IDs; copy feedback remains. Ribbon .72 opacity and .8 playback. | Credited payment and ledger do not remount/flash as if another payment occurred. Both records retain credited payment independently of response 200/502. Native text never warped. |
| Closing/navigation | Existing fiber still clipped into native PayGate letters; bounded pointer light retained. Quiet FAQ row tint, link underline, CTA one-pass edge glint/press. Nav marks the current request/pricing/setup section. | No looping footer film, generated logo or moving click targets. Single-open FAQ stays readable, keyboard focus retained. Nav clears active state for receipt/closing. |

Setup backdrop plays at .75 speed and is darker so the objects lead. The new weather still uses the existing fine-pointer enhancement; a second weather video is not loaded. Shared motion-off removes transitions/animations and pointer renderers; existing visibility/hidden cleanup pauses video and releases GPU work. Finite object animations pause when setup is offscreen. OS motion CSS/default preference retained.

## Higgsfield asset evaluation

Two image generations, no new video. First Seedream result was rejected: visible hanging droplets contradicted the partly-cloudy example despite the prompt. Revision with `gpt_image_2_5` produced a dry closed cloud contour and violet sun, inspected before integration. The clean contour stays legible at hero-card size and matches the site's violet fiber language. Only the revision ships.

- Job: `a1cd72b6-e0b0-4005-9ec5-87fabf59b479`.
- Provenance and exact prompts: `interaction-assets.json`.
- `weather-clear.webp`: 1168×876, WebP quality87, approximately40KB.
- `weather-clear-small.webp`: 600×450, quality84, approximately13KB.
- Local conversion is web encoding/resizing only. Old assets remain available as historical references.
- User authorized credit use. Actual billed credit total was not returned/verified; do not invent it.

## Evaluation and verification

- Production Vite build passed on Node24.18.0; no dependency additions.
- 15 relevant tests passed: existing payment timing/reset/disposal, receipt invariants, pointer bounds/resolution/lifecycle/fallback, plus new visible-scroll sequencing/cancellation tests.
- Actual Chrome preview checked at1440×900,835×900,390×844,320×800; viewport restored to1470×674. No horizontal document overflow; narrow pricing plate fits its buttons, setup shows one active object on phones.
- Tested Try a request → visible/focused demo →402 → explicit Simulate payment → credited → delivered; dimming and video rate verified. Payload disclosure checked.
- Pricing .05/.10 changes give .045/.005 and .090/.010. Tab plate position checked against actual button bounds at320px.
- Setup click, ArrowRight navigation, active artwork/caption and mobile stable stage verified. Mobile menu opens, anchor closes it; active desktop section indication checked.
- Receipt error retains credit and ledger; flip, copy request ID, selection resetting the face verified. FAQ changes close the prior answer.
- Global motion off pauses all three loaded videos, leaves zero pointer canvases, and makes record animation `none`. At fresh hero load only hero video loads/plays; offscreen videos are not eagerly fetched.
- No broken images after final reload. Console messages observed were from installed MetaMask extension. OS reduced-motion and hidden cleanup were source-reviewed; physical mobile GPU performance, Safari and screen-reader speech were not separately tested.
- `git diff --check` passed. Review screenshots are local, not committed.

Visual judgment: each section now has a distinct action, and setup has the largest structural improvement. The calmer field and receipt protect reading; the weather artwork is semantically corrected. This is ready for owner review in the live preview. It is not a claim that a static screenshot proves animation quality or that owner taste approval has been obtained.


## Pricing feedback follow-up

### Owner feedback and implementation

On 14 September the owner requested actual wave motion for the share bars on hover and price changes; the earlier brightness sweep was insufficient. The owner also rejected the contour cloud form and asked how it should improve. This feedback supersedes the earlier AI judgment that the weather asset was ready; it does not invalidate the five-section content structure.

Implemented native motion, without a dependency, canvas, video or generated asset:

- Hover over the share card creates a continuous, spatially local crest/trough around the pointer. Its position eases toward the cursor. On leave, amplitude dissipates before the frame loop sleeps.
- A different price launches one 1500ms wave from left to right, including the fee bars. Rapid changes blend at most three impulses; bounds keep scale between0.54 and1.68. There is no idle loop or initial-mount animation. A repeat click on the already-selected price has no financial or animation effect.
- The 27 lavender /3 muted bars, their widths and labels remain fixed. Animated height expresses interaction, not a change to the90/10 split. Gross/net/fee update immediately and are announced through the existing live region. Numbers are never interpolated.
- `useShareWave` mutates only decorative transforms through a single requestAnimationFrame loop. It cancels and resets on offscreen, hidden document, global off, OS reduced-motion and unmount. Fine-pointer hover only; touch and keyboard get the same price-change wave. A price chosen while share is just outside the phone viewport can play on entry within1.8s; older actions do not replay.
- Mobile graphic raised8px to reserve space for the crest. Prices, labels and controls stay still.

Verification: Node24 production build and19 tests pass (15 existing +4 wave propagation/locality/bounds/frame-rate tests). Chrome1470px desktop,835px tablet,390px and320px phone viewports: no document overflow. Pointer-local changing heights were observed; keyboard Space selected0.10 and displayed0.090/0.010; leave/settling restored all30 bars to neutral; global motion-off kept all transforms neutral while prices still changed. Narrow mobile retained space above/below the maximum bar envelope. OS preference/hidden cleanup reviewed in source, not Safari/physical-device performance testing. No new cloud asset or credits used.

### Cloud analysis — proposal, not implemented or approved

The concentric closed outlines make the cloud read as a fingerprint/logo; the triangular void is visually unexplained. A uniform bright tubular outline and a detached solid violet sun flatten the form. Scaling, adding glow or distorting this silhouette cannot fix the underlying construction.

Recommended direction: **one soft volumetric weather object**. Use asymmetric, naturally clustered cloud lobes, an airy dry base, lilac highlights and deep indigo internal shading. A partly hidden sun illuminates the upper-right cloud edge, creating one connected composition. Keep purple through the lighting and background, with a few pearl highlights; avoid solid neon fill across the whole object. No fingerprint contours, hollow center, metallic material or unrelated sculpture.

Composition:4:3 source; cloud/sun together occupy roughly60–65%width and50–55%height. Leave clear upper-left room for Jakarta/29° and lower-right room for the native price. Fit fully inside mobile crop; fade to#090613 without a floor or visible image rectangle. Keep labels and amounts native. A readable100px silhouette is needed because the same asset also appears in the hero API card.

Interaction: a still is sufficient; retain only restrained pointer parallax/light response. Shape and weather do not change when the API price changes. Do not add another background video merely to create motion. Inspect the still at actual card and thumbnail sizes before considering a subtle breathing-light loop.

Draft Higgsfield prompt (proposal only):

> Create a refined volumetric partly-cloudy weather illustration for PayGate, a dark violet developer API payments website. One compact airy cumulus cloud, naturally asymmetric lobes and a clean dry softly dissolving base. Solid readable cloud volume with delicate vapor detail, no holes or hollow center. A softly luminous lilac sun is partially occluded behind its upper-right edge; its light grazes the cloud so both forms feel connected. Cloud body shaded deep indigo with soft lavender and a few pearlescent highlights, color atmosphere#735CFA and#A99AFF against uniform near-black#090613. Understated dimensional editorial lighting, soft internal occlusion, fine atmospheric detail, restrained bloom. Front view with a slight sense of depth. Whole object centered within60percent image width and50percent image height, generous empty dark margins, upper-left and lower-right kept quiet for native website labels.4:3 composition, no ground, horizon, pedestal, border, text, numbers, UI or logo. No concentric contour lines, fingerprint pattern, triangular cavity, wireframe cloud, metallic surface, plastic toy, hanging strands, drops, rain, lightning or detached glossy sphere. Recognizable at small sizes; detailed but calm at large sizes.

Acceptance for a replacement: owner can recognize partly-cloudy weather immediately; no contour/cavity artifacts, awkward crop or loss of text contrast; cloud and sun look physically connected; matches the existing violet atmosphere without becoming a second visual focal point competing with price selection. Owner visual acceptance remains open.


# Surface blending and cloud candidate — 14 September 2026

Owner reports hard color patches inside the pricing artwork and across surrounding sections, and rejects the contour cloud. Scope: correct compositing and produce a better cloud study in the existing five-section preview; issue #5 / draft PR #6, no merge.

Verified cause: price art is inset 5% from the top and 14% from the bottom, while the card, baked image background and opaque gradient end used different ink values. The overlay ended abruptly at those inset bounds. Section glows also extended beyond clipped containers. Shared `--lp-art-surface: #090613` and `--lp-art-rgb: 9, 6, 19` now anchor pricing/access/setup; alpha masks feather the whole media stack (poster plus pointer canvas), replacing the price's opaque gradient. Pricing/receipt glows fade before all section edges; closing uses the existing canvas token. Keep intentional lavender share-card hierarchy and semantic payment states.

One Higgsfield still replaces the rejected contour cloud: natural asymmetrical cumulus volume, pearl/lavender light, indigo shadows and partly hidden lilac sun; no concentric cavity. This is an AI-selected candidate now integrated for owner review, NOT owner-approved artwork. Exact prompt, job and sources: `docs/design/weather-volume-asset.json`. Full WebP about 20 KB, small about 6.5 KB; no video or dependency added. Pricing retains native pointer response, while the hero uses the matching thumbnail. Earlier proposal-only notes below are historical and superseded by this actual integration.

Validation: production build and all 19 motion/simulation tests pass; desktop 1470px and mobile 390px inspected, exact .05/.045/.005 relationship checked, motion-off compositing and hero thumbnail verified. No financial behavior or homepage route changed.

---

Research rationale (design inference): [Apple weather icon semantics](https://support.apple.com/en-ie/guide/iphone/iph4305794fb/ios) support a recognizable partly-cloudy silhouette. [Spline displacement](https://docs.spline.design/materials-shading/surface-detail/displace-layer) and [environment lighting](https://docs.spline.design/lighting/environment-and-hdri) inform volume and unified lighting; these do not require introducing Spline or real-time 3D. The generated still uses these visual principles with the existing lightweight interaction layer. Quality remains subject to owner feedback.


## Setup Selection And Whole-Card Feedback

# Setup selection and card feedback — 14 September 2026

Owner asks for unmistakable active setup artwork, smoother step changes, and whole-card pricing hover. Standard UI increment; reuse issue #5 / draft PR #6, no merge. Preserve existing palette, artwork, five sections and payment truth.

Target: selected setup stage has a persistent Viewing marker, bright tab plate, stronger shield material and a quiet grounding light. Inactive hover must stay weaker than selection. Keep artwork DOM mounted; transition from current transforms over 420ms instead of remounting/restarting all objects. Caption uses three persistent overlapping rows; mobile crossfades one stage at a time with hidden inactive controls. Keyboard focus remains distinct. Pricing cards lift 4px with edge light/shadow in 220ms on fine-pointer hover, native controls retain focus/press. No card-wide click action or tilt. Motion-off/reduced-motion removes travel while preserving visual state. No new media/dependency. Verify rapid switching, keyboard, desktop/mobile, hover leave, exact pricing and motion-off.


Implementation: removed step-dependent artwork/rail/caption remount keys and obsolete object entrance keyframes. Persistent property transitions can reverse from their current value under rapid selection. Shield selection adds stronger material/white icon; other artwork remains at .3 opacity (.48 hover), selected at1 with a Viewing marker. Caption rows overlap in a stable footer grid; mobile objects crossfade with inactive visibility/pointer suppression. Existing short scan/rail effects remain. Pricing card lift4px, edge light and shadow220ms are fine-pointer gated; focus-within has edge emphasis without travel. Global motion-off and reduced-motion retain selected styling and disable movement.

Verification: production build and19 existing tests pass; Chrome1470px active Protect, keyboard ArrowRight/Home, rapid step selection, card hover transform -4px and return-to-none verified. Mobile390/320px keeps one visible settled object/caption, no horizontal overflow; motion-off uses0s transitions and selected state remains immediate. Viewport restored. No media/dependency/backend/payment changes. Physical device/Safari and screen-reader speech not separately tested.

Research: [Fluent motion](https://fluent2.microsoft.design/motion) informs consistent duration/easing; [WAI focus versus selection](https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/) informs separating selected appearance from transient hover/focus; [Motion hover guidance](https://motion.dev/docs/react-hover-animation) informs avoiding touch-emulated hover. Specific420ms/220ms/4px values are local design choices, not claims of required standards.

## Hero demo placement — 15 September 2026

The owner approved the separate placement study and requested implementation in the existing preview. This supersedes the earlier free-floating hero diagram and separate playback bar. Reuses issue #5 / draft PR #6; the UI remains unmerged.

Implemented a shallow surface at the transition from the violet hero to shared ink. The centered headline and CTA lead directly to the demo. Request strip, price and one action form the left group; a smaller gateway sits between the request and a larger weather response. Payment status stays beside the gateway, while delivery status stays in the response. Removed the duplicate reset and detached status/action bar. The action remains in one place through Send request, Simulate payment and Replay. Payload disclosure and the simulation notice remain available.

The existing Higgsfield media stack is masked together and has a bounded height, so opening the payload does not stretch the background. Native beads travel along the two connections in the corresponding request/payment/forward/return phases. The verification ring traces during verification. Persistent response layers crossfade and translate slightly without moving labels or controls. On phones, request/action → compact gateway → response; tablet widths above760px retain the horizontal relationship. The action is46px tall, including at320px.

The underlying simulation is unchanged: the first request stops at402, explicit payment is required, credit precedes forwarding and delivery, and replay cancels the prior run. A busy click guard also prevents the focusable aria-disabled button from dispatching another action. There are no wallet/network calls, new dependencies, asset generations or new sections.

Verification:

- Final production build passes on Node24.18.0. All19 existing simulation, receipt, wave, scroll sequencing and pointer lifecycle tests pass. `git diff --check` passes.
- Chrome desktop1440/1470px, tablet835px and phone390/320px inspected; no horizontal document overflow. The narrower tablet breakpoint was adjusted after visual review; request text fits in the horizontal tablet layout.
- Try a request scrolls to and focuses the demo before starting.402 pauses until explicit payment; a scoped DOM check observed credited=true while delivered=false. Replay, payload disclosure and keyboard activation work.
- The button's vertical offset within the demo stays identical between402 and credited states, on both desktop and mobile. Response numbers/art remain mounted, avoiding layout jumps.
- Global motion off pauses all loaded videos, removes the hero pointer canvas and disables signal/response movement while the simulation still works. OS reduced-motion paths were source-reviewed; physical phone GPU performance, Safari and screen-reader speech were not separately tested.
- Full hero and focused desktop/mobile screenshots were saved outside the repository for review. The assembled hero is visually closer to the accepted study; final owner visual acceptance remains open.

Research basis remains the approved study's Circular, Cloudlight and Agentframe observations: one composed product demonstration belongs close to the promise/CTA, and interaction controls belong with their input. The placement is a PayGate-specific interpretation, not a copied template.
