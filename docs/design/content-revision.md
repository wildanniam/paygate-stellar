# Four-section content revision — 14 September 2026

Owner locked the content blueprint with one explicit boundary: improve the four existing sections; do not create a new landing section. This is standard frontend work on issue #5 / draft PR #6. `/design-preview` remains isolated. UI merge and homepage replacement are not authorized.

## One explanation per section

| Section | Implemented change | Visual explanation preserved |
|---|---|---|
| Hero | Shorter product copy; remove repeated share/fee row; separate “Payment credited” and “Response delivered” | Violet fibers and client → PayGate → weather response; explicit payment simulation |
| Pricing | “Your price. Clear fees.”; remove numbered feature labels; price → share → access DOM/mobile order; access links to setup | Weather artwork with native price options; 27/3 bars show 90/10; optical shield |
| Setup | Register / Protect / Verify & share; all objects readable initially; one caption; remove Next/Back/Replay and completion claims | Three spatial objects in the existing filament environment; direct keyboard exploration |
| Receipt | Delivered vs API error for the same Weather API; visible request identity and two independent status events; amounts secondary | Light paper, perforations, native receipt turn, copy-ID feedback and ribbon artwork |

Navigation labels are now Pricing and Setup. There is no fifth section, FAQ, new closing CTA or dashboard showcase. Existing dashboard/docs links and preview footer remain.

## Product and state constraints

Both receipts are independent illustrative testnet records, with gross 0.010, provider 0.009 and fee 0.001 USDC. One request returned 200; the other explicitly represents a credited payment followed by an upstream 502. A 502 response alone does not prove payment: credit failures can also return 502. This illustration follows `PAYGATE_V1_PRODUCT_SPEC.md` §9 and `api/pay/[apiId].js`; it does not introduce refunds or change the runtime.

The hero remains a separate fixed-price simulation, paused at 402 until Simulate payment. The pricing selector is a calculator and does not rewrite the sample records. Receipt selection returns the front face, invalidates outstanding clipboard feedback and preserves unique illustrative IDs. Inactive receipt faces remain inert; a persistent toggle retains focus.

## Assets and interactions

All five existing Higgsfield treatments are reused: hero fibers, weather film, access shield still, setup path film, receipt paper film. **No new generation or asset edits; 0 additional credits.** Generated art supplies the environment. Text, numbers, status icons, selectable controls and receipt faces stay native.

Existing pointer response, offscreen cleanup, global motion pause and poster fallback are preserved. Price changes update the split; tabs focus a setup object; receipt selection updates two status events; the details control turns the sheet. No auto-cycling or added transaction simulation. This revision adds no dependency, backend operation, wallet action or network payment.

## Verification

- Frontend build passed on Node 24.18.0.
- 13 focused tests pass: existing five simulation tests, six pointer/renderer tests, plus two receipt comparison/evidence integrity tests. The latter verify independent payment vs delivery, distinct illustrative evidence and conserved 90/10 totals.
- Desktop 1440×1000: all four compositions visually inspected. Pricing options update gross/share/fee; fixed navigation anchors work. Setup direct tabs, Right/Home/End tested. Receipt delivered/error, flip, full IDs and successful copy verified; selecting another record resets the face and copy feedback.
- Tablet 835×950: pricing layout inspected; increased the earnings panel height so the newly visible fee label has room (26px between the share value and bars in the final 835px check). Hero 402 → explicit simulated payment → response verified, followed by payload and reset.
- Phones 390×844 and 320×740: pricing → earnings → access order, setup objects and receipt readability inspected. No page horizontal overflow at 1440, 835, 390 or 320px. Shortened the setup example origin to avoid an awkward wrapped URL at 320px.
- Receipt tabs Home/Up/Down work with motion off. Shift+Tab from the front-face details toggle reaches the receipt panel, bypassing the inert back's copy action. Flip toggle retains focus. Important new controls measure ≥44px tall.
- Motion off removes pointer canvases and pauses all four videos; resume restarts the visible hero while other films stay paused offscreen. Existing renderer teardown/fallback tests pass. No warning/error messages returned by the browser log inspection.
- `git diff --check` passed. No backend suite or new live settlement proof was needed for this preview-only revision. OS reduced-motion initialization, media failure and clipboard failure handling are unchanged/source-reviewed rather than newly fault-injected. Physical-device GPU performance and screen-reader speech were not benchmarked.

The local screenshot set is `content-revision-2026-09-14` in this task's visualization directory; selected evidence and the owner lock are copied into Atlas Vault's PayGate content blueprint. Passing checks establishes implementation behavior, not owner approval of visual taste.
