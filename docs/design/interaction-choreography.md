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
