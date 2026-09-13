# PayGate landing pilot

Owner-approved scope, 13 September 2026: lock the dark, Higgsfield-led two-panel direction and implement only the hero and API example section for feedback. The earlier landing brief is historical for this route. The alternate hero and remaining asset family are deferred.

## Register and intent

Brand UI with an interactive product explanation. An API builder should understand that they set a per-request price, that machine clients pay before access, and where to register. Public Stellar Testnet beta remains visible. The example never sends a payment or contacts an API.

## Visual direction

- A continuous dark studio, tactile metal and one shallow offset seam. The Higgsfield artwork/video is the hero itself.
- Native off-white typography; violet limited to the seam, selected controls and focus. Green/amber always paired with text.
- Existing DM Sans and JetBrains Mono; regular/medium headings, mono only for code and data.
- Desktop: copy on the left, panel silhouette on the right. Mobile: copy followed by a deliberately cropped media window, with controls below it.
- Second section: one weather API example and its generated contour specimen. One useful JSON response; additional specimens deferred.
- Controls use six-pixel radii, clear focus, at least 44-pixel targets. Avoid nested feature cards, glossy pill buttons, glows and invented business metrics.

## Interaction and states

Native sample request: idle → requesting → 402 → user-triggered simulated payment → verification → escrow credited → forwarding → 200 response. Example gross 0.010, provider 0.009, fee 0.001 testnet USDC. Video starts only after credit; response never depends on playback completion. Reset cancels old callbacks and does not create another credit.

One silent opening film. No scroll scrubbing, reverse playback, orbit, physics or WebGL. Poster appears first. Video loads when the user starts the sample. Motion preference follows the OS unless the user overrides it. Reduced motion and rejected/error/stalled playback use stills and working native controls. Leaving the viewport finishes media through its still fallback. The sample remains readable.

Hover/focus, busy/disabled, error/fallback and completed states must be explicit. Buttons remain usable without imagery. Request/response tabs have keyboard navigation; reset returns the demonstration to its starting state. Example data is clearly labelled.

## Scope and verification

Preview route: `/design-preview`, lazily loaded in the existing React app. No production route replacement, backend, wallet, contract or dependency changes. This is a two-section acceptance pilot.

Initial asset budget: three stills and one six-second film, estimated 16.5 credits. Actual pilot usage: 18.5 credits (four still submissions, including two rejected end-frame attempts, and one film). Stop further generation: first/last posters were extracted from the edited film to preserve framing. The alternate hero and other specimens remain deferred. Master reused as start; mobile crop tested before any extra generation. No automatic broad batch or subjective regeneration. Record requested and reported model, actual cost and provenance in the asset ledger.

Check the actual assets in desktop and 390-pixel layouts, pointer/keyboard/touch paths, reduced motion, media failures, reset races, first/last-frame transitions, file sizes, build and simulation tests. Quality remains subject to owner feedback; a passed build is not creative approval.
