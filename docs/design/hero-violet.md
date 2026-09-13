# Violet hero preview — 13 September 2026

Implemented for owner feedback at `/design-preview`, on `codex/5-higgsfield-landing-pilot`, issue #5 / draft PR #6. **Creative acceptance is pending.** This revision supersedes the rejected metal/monochrome pilot; it does not replace the live homepage.

## What changed and why

The original PayGate dark/purple palette and colored mark return as the hero identity. A centered bold headline and two clear actions sit inside one rounded visual stage. The Higgsfield artwork fills that stage instead of appearing as an unrelated object beside the copy. A native request console emerges from the same field, keeping the API/payment meaning legible. The second weather section has been removed from the current preview scope.

Two new 2K composition candidates were generated and visually inspected. The broad violet filament horizon was selected; a folded optical membrane was retained only as an alternative. One eight-second film animates the selected master. The footage was converted to a 7.5-second wrap-crossfaded silent loop in the Higgsfield sandbox. Original source: 9.7 MB; shipped film: 1,190,276 bytes, 1600×892 at 24 fps. Desktop poster: 131,670 bytes; mobile poster: 31,618 bytes. No generic third-party background or purchased template source is used.

Observed Higgsfield account balance: **581.5 → 563.5, delta 18 credits**. This is the new revision's observed usage, separate from the historical pilot's 18.5. Exact prompts, models, IDs, processing and permanent result URLs: [asset ledger](hero-violet-assets.json).

## Interaction

- Ambient film plays from entry, independently of the request demo.
- Pointer movement shifts the light field by at most 27px horizontally / 14px vertically and adds localized illumination. Headline and controls remain stable.
- Try a request scrolls to and focuses the console, then sends a local sample. The demo waits at 402 for an explicit Simulate payment action. It shows escrow credit before forwarding and the JSON result.
- Reset cancels stale callbacks. The demo sends no payment, wallet or upstream API request.
- Motion control pauses/resumes film and pointer/ambient effects. OS reduced motion defaults to a poster and disabled effects. Hidden document/offscreen state pauses playback.
- Failed media retains responsive poster artwork and working native UI.

## Verification

- Vite production build passes; no new dependency.
- All four existing simulation tests pass: 402 gating/duplicate input, credit-before-delivery, reset during verification, reset after credit, and disposal.
- Browser inspected at desktop 1280×720 / 1440×900 and mobile 390×844 / 320×740. No horizontal overflow observed. At 1440×900 the native console begins within the first viewport; artwork/video loaded and played correctly.
- Intermediate 600×900 layout checked; heading and console fit. Final desktop browser error/warning log was empty. Temporary viewport override was reset.
- Both image candidates and a multi-frame film sheet inspected; actual browser playback observed at progressing times. Motion starts before any sample action.
- Native pointer drag produced bounded field transforms and light coordinates; readable copy stayed still.
- Sample 402 → payment → response, keyboard Enter reset, and pause/resume verified in-browser.
- Media failure injected by temporarily moving the local film out of the public path, then reloading: `fallback`, loaded 960px poster, and usable request control observed. Film was restored afterward.
- Mobile beta contrast and text size were corrected after visual inspection. Background overscan was clipped after a lower-edge artifact was observed.
- OS reduced-motion initialization was code-reviewed; the browser tool does not expose preference emulation. Manual motion-off was exercised. No real-device low-power or bandwidth benchmark is claimed.

The verification concerns functionality and rendering, not a guarantee of visual taste. Wildan's feedback on this hero determines the next iteration. Later sections, mainnet/production behavior and release remain outside this change.
