# Hero integration — 13 September 2026

Issue #5 / draft PR #6. Standard frontend change, isolated to `/design-preview`.

## Owner feedback and scope

The owner accepts the replacement artwork-led capabilities and setup sections in 8119964. The transaction walkthrough is now judged out of place, the hero effects insufficiently integrated, and the navigation unavailable during scrolling. Earlier transaction acceptance is historical. This iteration changes only hero presentation and navigation; the accepted section implementations and simulation engine remain unchanged. The revised hero awaits owner feedback.

## Design and implementation

- Remove the large opaque walkthrough frame, simulated window chrome, repeated narrative paragraphs and full-width receipt. Float two small glass endpoints around PayGate in the existing violet field. Use the approved weather poster to make the data response recognizable.
- A concise playback strip shows status and the next action. The visible 402 step waits for an explicit simulated payment. The compact share/fee remains present and changes to credited at payment verification, before response delivery. Optional payload uses native text and an accessible disclosure.
- Reduce artwork pointer displacement from 54/28px ranges to 16/8px. Remove the independent cursor spotlight. A shared gradient grades the backdrop into the scene and page; the gateway halo and connector illumination respond to payment state. The poster/video keeps its offscreen, document-hidden and reduced/manual motion behavior.
- Move navigation outside the clipped hero to a page-level fixed header. Reserve initial header space, use a denser scrolled surface, and keep it available in every section. On phone the disclosure exposes the same navigation, closes on selection, Escape, outside pointer or focus leaving the header, and returns focus to its button on Escape. Desktop resize closes the disclosure.
- Anchor targets have explicit top margins for the persistent header, including the setup heading's preceding caption. This page-level placement and offset rule is the reusable pattern for later preview sections.

No new Higgsfield generation. Reuse `hero-violet/field.*` and `visual-story/weather-small.webp`; no new download size beyond existing media, although the weather poster now appears earlier in the page. No package dependency added.

## Verification

- Frontend production build, five simulation tests and diff whitespace checks pass.
- Browser layouts reviewed at 1440×1080, 835×950, 390×844 and 320×740, with no horizontal overflow in the checked layouts.
- Send request stops at 402; explicit payment produces credited earnings and then the weather response. Replay/reset and reset during verification return to idle without delayed stale delivery. Existing simulation tests verify credit ordering and queued-callback cancellation precisely.
- Motion-off pauses all mounted videos, sets native animation to none and retains a usable complete simulation and readable payload. OS reduced preference, hidden-tab and error fallback remain source-reviewed rather than forcibly emulated.
- Navigation remains at the viewport top in section 3 on desktop and phone. Anchor clearance, mobile disclosure selection, Escape/focus return and outside-pointer dismissal checked. Primary demo actions, dashboard and mobile menu meet 44px minimum height.
- Browser reports only existing React Router future notices; no new runtime errors. Physical-device rendering/performance is not benchmarked.

Engineering checks establish behavior, not owner visual approval. No homepage/backend/wallet/contract modification, deployment or merge.
