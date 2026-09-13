# Two-section landing pilot

Status: implemented for owner review, 13 September 2026. [Issue #5](https://github.com/wildanniam/paygate-stellar/issues/5). This is a standard frontend change; no payment implementation changes.

## Accepted scope

Wildan accepted a dark, Higgsfield-led direction and requested a small real implementation before spending on the remaining assets. The pilot uses one primary thin-panel master, one opening film, and one weather specimen. The alternate hero, other specimens, downstream sections and live replacement are deferred. Creative acceptance remains with Wildan after inspecting this version.

Run `npm --prefix frontend run dev -- --host 127.0.0.1 --port 4190 --strictPort` and open `/design-preview`. The existing homepage remains at `/`. Node dependencies must already be installed as described by the frontend package.

## What the page does

- Hero: “Your API. Paid per request.” A dark metal-panel composition, native copy and accessible controls. Static poster first; no automatic video download or background loop.
- A sample request receives a simulated 402. A separate click simulates payment and retry; verification and escrow credit precede forwarding and the JSON response. No API calls, wallet requests or payments are sent by the simulation.
- The film starts after simulated credit. Completion, reset and native controls work independently of video playback. Motion-off, playback rejection/error/stall, hidden document and offscreen playback fall back to stills.
- Second section: one weather API use case, contour artwork, accessible request/response tabs, copy feedback and a visible example price split (0.010 = 0.009 + 0.001 testnet USDC).
- Existing registration and dashboard links retain their destinations. No added dependencies, WebGL, canvas renderer or scroll scrubbing.

## Media and resource use

[Asset provenance and exact prompts](landing-pilot-assets.json) record submissions, selected outputs, rejected attempts and processing. The requested image model was `nano_banana_pro`; the completion metadata reported `nano_banana_2`. No assumption is made that this is a verified alias.

The initial estimate was 16.5 credits; actual balance changed from 600 to 581.5, or **18.5 credits**. Four image submissions cost 8 credits total (master, two rejected end-frame attempts, weather), and the single six-second film cost 10.5 credits. One extra two-credit refinement was tried and rejected; further generation stopped.

Separate end frames changed the panel geometry. Instead, the accepted master was used as the sole video reference. The selected film opens gradually; its first three seconds were retimed to 2.2 seconds and the ending held to six seconds. Posters are extracted from this edited film so the video and stills share framing. This is generated film, not a precise CAD animation; owner review still needs to judge the material, silhouette, motion and whether the gateway metaphor communicates software access.

| Shipped asset | Format / dimensions | Bytes |
|---|---|---:|
| Initial hero poster | WebP, 1600 × 892 | 21,818 |
| Open hero poster | WebP, 1600 × 892 | 24,918 |
| Opening film | MP4/H.264, 1600 × 892, 24 fps, 6 seconds, silent | 311,308 |
| Weather contour specimen | WebP, 1200 × 805 | 44,452 |
| Total | Four files | 402,496 |

Total media is approximately 393 KiB. The film source is attached only after the user starts the example. This is an asset-size measurement, not a Core Web Vitals benchmark.

## Verification

- `npm --prefix frontend run build`: passed.
- `node --test frontend/src/lib/landingPilotSimulation.test.js`: four tests passed. Covers state order, duplicate payment clicks, reset during verification/after credit, stale callbacks and disposal.
- Browser inspection in the in-app browser at 1440 × 900 and 390 × 844: images load, typography/crops inspected, no document horizontal overflow. Screenshots were inspected inline in the implementation session; no screenshot files are committed.
- Browser sample completed with the video at six seconds, paused and showing the open still. Reset returned to idle/closed, and resetting during verification stayed idle after old deadlines.
- Returning through “View current site” rendered the original `/` landing and its original headline; pilot markup was absent.
- Motion-off completed with an open still and video time zero. Turning motion back on did not replay the completed transaction.
- A temporary missing-video URL forced the media fallback on mobile: the native sample still reached 200 with the open poster. The real media URL was restored after this check.
- Request/response tabs responded to ArrowRight/Home, with focus tracking the selected tab. Copy succeeded.

The OS reduced-motion setting is handled in code but was not separately emulated. Device Safari/Android, screen-reader announcements, throttled-network performance and production direct-route refresh have not been verified. No live payment regression suite was run because the change does not touch payment code. No deployment or live-homepage replacement is included.

## Feedback checkpoint

Evaluate the two sections as one composition: silhouette/material, readable hero message, motion clarity, mobile framing and the transition to a concrete API example. If these miss the intended quality, revise this pilot before commissioning other assets. The full fourteen-role asset plan is a deferred menu, not a generation target.
