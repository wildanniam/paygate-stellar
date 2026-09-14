# Pointer-responsive artwork — 14 September 2026

Owner approves applying the previously discussed cursor response and reviewing the other assets. Standard frontend work on issue #5 / draft PR #6, within the existing four-section `/design-preview`. No new generation, asset download, dependency, content section or payment operation. Higgsfield cost for this iteration: **0 credits**. Asset provenance remains in the existing hero, visual-story and payment-records ledgers.

## Asset analysis and treatment

The existing Higgsfield media supplies composition, texture and ambient movement. A shared WebGL plane samples those same frames and reacts locally to pointer movement. The film timeline continues normally. This is a restrained 2D optical deformation, not a reconstructed physical scene.

| Asset | Response | Radius / maximum directional displacement | Rationale |
|---|---|---|---|
| Hero violet fibers | Local wake, slight curl, existing-highlight lift | 185px / 19px | Continuous filaments can flex without losing their identity; replaces whole-field pointer translation |
| Receipt ribbons | Local flex and highlight | 155px / 16px | Keeps perforations recognizable and the native receipt stable |
| Weather field | Soft wind-like displacement | 150px / 9px | Cloud silhouette stays readable |
| Setup path | Gentle, mostly horizontal wake | 190px / 8px | Spatial source/guard/endpoint relationships remain clear |
| Access shield | Light response only | 130px / 0px | Rigid protection form should not melt; no need to generate a separate film |
| Logo, weather thumbnail, native endpoint sheets, receipt and earnings bars | Existing interaction retained | No texture deformation | Exact product meaning and data need stability |

The small curl can add up to 12% of the directional displacement budget locally. Vertical response is damped for hero, weather and setup. Motion relaxes after the cursor stops or leaves. Controls, receipt faces and semantic scene objects are excluded from pointer excitation; the canvas never receives pointer events or focus. Native effects such as price updates, setup state transitions and receipt turning remain independent.

## Implementation and operating rules

- `PointerFlow.jsx` opts in by profile and only mounts for active media with a fine pointer, hover support and width ≥741px. Touch/narrow screens retain the original ambient media.
- `pointerFlowRenderer.js` owns one WebGL texture plane. CSS object-fit/object-position are mapped into texture coordinates to preserve framing. Existing section grading stays above the canvas, isolated from foreground text.
- Cap DPR at 1.25 and the render buffer's long edge at 1600px. Upload video textures only for decoded frames through `requestVideoFrameCallback`; use currentTime comparison where that API is absent. Static artwork sleeps after motion settles.
- Shared media visibility and global motion state unmount renderers when inactive. Cancel animation/video callbacks, remove listeners/observers and delete GPU resources. Do not explicitly lose the canvas context during cleanup: React StrictMode reuses the same canvas during effect replay.
- Original picture/video stays underneath; canvas appears only after a successful draw. Context acquisition, shader or texture failure hides the canvas. A lost context keeps the original media until remount; no automatic context-restoration loop.
- Tuning lives in `FLOW_PROFILES`. Prefer adjusting local strength/radius rather than adding another independent spotlight or shifting the entire section.

## Verification completed

- Build passed: `npm --prefix frontend run build`. Lazy preview JS: 41.42kB raw / 12.77kB gzip; approximately +2.94kB gzip over the prior preview. No new library dependency.
- Eleven tests passed: `node --test frontend/src/lib/pointerFlow.test.js frontend/src/lib/pointerFlowRenderer.test.js frontend/src/lib/landingPilotSimulation.test.js`. Covers bounded displacement and relaxation, 30/60/120Hz timing, cover/contain/crop mapping, resolution budget, StrictMode setup-cleanup-setup, frame scheduling/resource cleanup, missing-context fallback and existing payment state/cancellation.
- Browser: all five renderer profiles reached ready; native pointer movement across each art surface increased local response, then energy returned to zero. Artwork remained upright with the intended crop and native text above its grading. A stacking issue found in weather was corrected with an isolated media layer.
- Native price selection updated 0.050 → 0.045 share, setup click/ArrowRight reached Publish, sample selection updated receipt data, details/back worked. Hero still paused at 402 for explicit simulated payment, reached 200/data, and reset correctly.
- Manual motion-off removed all canvases and paused every loaded video. Resume created a working fresh renderer. Offscreen sections released canvases; no pointer canvases were mounted at 390px or 320px. 1440×1000, 835×950, 390×844 and 320×740 checks showed no horizontal overflow. Temporary viewport override was reset.
- No new browser errors; the existing two React Router future notices remain. `git diff --check` passed.

OS reduced-motion initialization and document-hidden behavior inherit the existing media state and were source-reviewed. Missing WebGL was unit-tested; the renderer's original-media fallback was also observed during development before the StrictMode context-loss bug was fixed. These checks do not claim physical-device GPU benchmarks, screen-reader speech testing or owner aesthetic approval. Mobile width checks are not physical touch-hardware tests.

Primary references: [MDN video textures](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_textures_in_WebGL), [MDN requestVideoFrameCallback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback). Current design authority: `frontend/DESIGN.md`.
