# Visual storytelling revision — 13 September 2026

## Owner feedback and scope

The owner explicitly rejected sections 2 and 3 after viewing them: plain backgrounds, little visual character, and too much written explanation, particularly in the setup workspace. This supersedes the earlier capabilities acceptance and the setup proposal recorded in `api-capabilities.md` and `setup-journey.md`. The violet hero and transaction visualization remain accepted. The new revision still awaits visual feedback.

Scope: revise those two sections on `/design-preview`, issue #5 / draft PR #6. No backend, wallet, contract, dashboard, production homepage or dependency changes.

## What changed and why

Capabilities keeps an asymmetric composition, but most of each panel is now visual:

- A luminous weather-data cloud makes the API example recognizable. Native price controls update the per-call amount, immediate mobile share/fee and the earnings panel.
- An optical shield with data streams illustrates guarded access. The short caption still says that the provider's server checks the secret.
- A native 90/10 strip and large provider amount replace the detailed receipt. It responds to price selection rather than fabricating live volume or traction.

Setup replaces the timeline/workbench, code excerpt and verification table with one panoramic scene. A native API file, PayGate guard and paid link connect over original moving violet artwork. Connect → Protect → Publish changes focus, guard scan, connecting packets and the appearance of the agent/app recipients. One short caption provides the action for the selected stage. Technical implementation lives in the real setup guide.

This changes the information hierarchy, not only the background: artwork and object state convey the story first; text identifies the action. Circular's varied panel scale, Cloudlight's product-related visuals and Agentframe's textured setting informed the revision. Reference artwork and paid template source are not copied.

## Media and provenance

Three new GPT Image 2 high-quality masters, referenced to the accepted violet hero, were generated through Higgsfield: weather, access, path. Weather and path were animated with Kling 3.0 Pro, 8 seconds, sound off, matching start/end references. Masters and 0/2/4/6-second video contact sheets were inspected before completion. No metal/sculpture treatment, baked UI or generated writing.

The provider balance moved from 563.5 to 516: **47.5 credits observed** for this revision (three images and two clips). Exact prompts, references, job IDs and permanent processed URLs are in `visual-story-assets.json`. No retries or discarded generations in this revision.

Higgsfield sandbox processing produced WebP posters and small-screen variants, plus silent H.264 24fps loops with a 0.4-second wrap crossfade. Weather is 401,790 bytes; path is 2,109,401 bytes. Images total 385,538 bytes. New media totals approximately 2.90 MB, loaded progressively rather than as part of the initial hero request.

`StoryMedia` provides lazy video attachment, poster fallback, viewport/document visibility handling and global motion support. User input and native state remain independent of media playback. No new rendering or animation dependency.

## Truth and interaction

- Illustrations are local; no API registration, guard installation, verification, wallet or payment request occurs.
- Freighter, registration, provider-side secret checks and setup verification remain actual prerequisites. The scene simplifies their explanation, not their implementation.
- Example prices 0.010 / 0.050 / 0.100 testnet USDC map to provider 0.009 / 0.045 / 0.090 and fee 0.001 / 0.005 / 0.010. No success-only charge or automatic refund claim.
- Price controls have pressed states and a polite amount announcement. Setup tabs have roving focus, Left/Right/Home/End, a labelled panel, previous/next and replay. No asynchronous setup timers remain.
- Phone setup becomes a connected vertical illustration. Prices and immediate split remain together. Minimum 44px action heights. Future-stage artwork is dimmed; labels stay readable.

## Verification

- Production frontend build and all five existing hero simulation tests pass.
- Actual rendered compositions inspected at 1440×1000/1080, 835×950, 390×844 and 320×740. Tablet background overflow was found and fixed; document width was rechecked.
- All three prices and matching share/fee amounts checked; 0.100 → 0.090 + 0.010 and immediate mobile feedback verified.
- Connect/Protect/Publish, next/back, replay, Left/Right/Home/End and active focus verified in the browser. Touch targets measured at least 44px.
- Fresh page: zero new story videos before entering the sections. Entering setup plays the path film; the weather film pauses offscreen. A separate fresh motion-off pass loads zero story videos, displays the path poster and keeps Publish functional. CSS movement is disabled.
- Fresh browser log has only the two pre-existing React Router future notices, with no new runtime errors. Media posters and video decoding were observed.
- Video-error fallback and document-hidden handling are source-reviewed. OS reduced-motion rules are source-reviewed, not browser-emulated. No physical-device performance benchmark is claimed.

Screenshots are local review evidence, not proof of owner approval. Further sections, homepage replacement and merging remain outside this change.
