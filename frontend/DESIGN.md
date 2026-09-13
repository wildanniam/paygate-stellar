# PayGate landing preview — 13 September 2026

## Current authority and scope

Latest owner instruction accepts the API capabilities section (commit 98375fb) and asks to develop exactly one next section. Hero, revised buttons, transaction journey and capabilities are now accepted. The next setup section is a new implementation proposal awaiting its own visual feedback. `/design-preview` remains isolated on issue #5 / draft PR #6; later sections and release remain outside scope.

The rejected metal/monochrome pilot is historical. Dark/purple identity remains mandatory. Higgsfield generation is authorized where it improves the design, not required for every native product interaction.

## Register, audience and path

Brand UI with native, illustrative product interactions. API owners should understand paid machine access, then register an API at `/apis/new`. Public Stellar Testnet beta is prominent. Examples never create an API, contact a wallet or send a payment.

## References and interpretation

- [Circular](https://rbp-saas-template.vercel.app/): a dominant feature panel with smaller supporting panels, changes in tone and scale after an immersive hero. Adapt composition, not its lime palette, phone mockups or invented customer figures.
- [Cloudlight](https://rbp-cloudlight-template.vercel.app/#capabilities): each capability is demonstrated by a relevant product visual; calm surrounding space makes the story readable.
- [Agentframe](https://rbp-agentframe-template.vercel.app/#quickstart): concise copy connected to native, inspectable examples.
- [Koderea](https://www.koderea.id/): simple reading order with ambient motion from entry; already reflected in the accepted hero.

Browser-rendered sections were inspected, not inferred solely from home screenshots. No purchased template source or reference artwork is used.

## Visual vocabulary

Preserve the existing ink/dark/purple system from `src/styles/tokens.css`: #050609, #735CFA and #9A90FF, with existing blue/green/amber semantic colors. DM Sans for typography; JetBrains Mono for code/data. Keep the colored PayGate mark. Pale lavender product surfaces provide local contrast inside the dark landing; they do not change the global theme.

The accepted hero uses a rounded full-width violet filament environment, centered headline, continuous purple CTA and quiet play action. Native client → PayGate → API graphics show the transaction. Its composition and artwork remain unchanged.

## Accepted section: API capabilities

Heading: “Your API. Ready for business.” Supporting copy: “You build the API. PayGate handles paid access and payment records.” One register link, then an asymmetric grid:

1. Dominant left panel: “A price for every call.” A crisp example configuration sits over a crop of the existing Higgsfield filament artwork. Three native price buttons update the visible request price and the receipt. Example endpoint and register → guard → verify setup copy make this a product illustration, not a false published endpoint.
2. Upper right: “Your API. Your access rules.” The provider must add a secret-header check. A restrained native shield mark and verified-payment → secret-header path show what PayGate adds to a paid upstream call. Do not imply that a URL alone makes the upstream private.
3. Lower right: “Every payment. On record.” A pale lavender panel holds a native receipt with gross amount, 90% provider share and 10% fee. Payment and delivery are explicitly separate.

Examples: 0.010 / 0.050 / 0.100 testnet USDC. Splits: 0.009+0.001, 0.045+0.005, 0.090+0.010. These are browser-only illustrations, not new billing logic. The hero simulation remains independent.

Use a calm dark background and varied panel scale after the rich hero. Do not repeat another request animation, create a second full-screen video, or add unrelated sculpture. Existing Higgsfield poster is lazy-loaded and reused; no new generation or dependency for this section.

Responsive: two columns above 760px; below that, price → access → receipt in one column. On phones, show immediate split feedback alongside the price controls so the result does not require scrolling. Targets are at least 44px. The smallest access path becomes vertical. Keep readable text, no fixed-height text clipping, and no horizontal overflow.

## Next section: From URL to paid endpoint

After the capabilities grid, switch rhythm to one wide dark-plum workspace. Left: concise heading and three connected selectable steps. Right: one changing native preview, rather than another trio of cards. Circular's process timeline informs the reading order; Agentframe's quickstart pairing informs the connection between selected step and visual evidence. Keep useful product UI foregrounded, following Cloudlight's approach.

Content and state inventory:

1. Register your API: connect Freighter, supply an existing GET/JSON API and price. An illustrative registration summary is pending setup; do not imply a live registered endpoint.
2. Add the guard: store the generated secret server-side and reject requests without the matching `X-PayGate-Secret`. An Express guard excerpt makes the integration concrete without a large debug console. Reference the setup guide for real implementation.
3. Verify & share: illustrate checking rejected invalid-secret calls and an accepted correct-secret call, then the paid endpoint becoming shareable. A clearly labelled local verification example can run/replay; changing steps resets/cancels pending illustrative checks. Never call the API, wallet or backend from this preview.

Interaction: native vertical tabs with roving focus, arrows/Home/End, clear selected/focus/hover states. Keep tabs vertical on small screens for consistent semantics. A stable scene body changes via a brief opacity/transform transition, disabled with motion-off or OS reduced motion. Busy action retains focus and prevents duplicate input; concise live status announces verification. No autoplay carousel, scroll hijack or continuous background animation.

Background: restrained dark-plum wash and fine linework framing the workspace. Use native interface/code/check visuals; no additional artwork is required for this semantic section. The accepted Higgsfield hero and capability crop remain intact.

Mobile: one column, more compact step labels/descriptions, preview below. No horizontal code overflow; a simplified excerpt wraps where necessary. Minimum 44px action targets. The heading/copy avoid invented setup duration or mainnet claims. Tests cover actual behavior rather than mirroring static markup.

## State and motion contract

Capabilities: deterministic local selection; pressed state, hover, keyboard focus and active feedback. A concise polite live region announces the split. No loading or error UI is required because no request runs. Illustrative status and testnet units remain visible. Section motion is limited to button/link microinteractions; existing motion-off and reduced-motion rules apply.

Accepted hero: silent ambient video independent of the sample, responsive poster fallback, bounded pointer depth/light response, offscreen/hidden pause, visible pause control, and OS reduced-motion defaults. Simulation: idle → requesting → 402 → explicit simulated payment → verifying → credit → forwarding → returning → response. Reset invalidates pending callbacks. Credit is separate from delivery.

## Verification

Run frontend build and existing simulation tests. New setup verification covers desktop/tablet/390px/320px layouts, three stages, code overflow, keyboard tabs, next/back, cancellation, replay, motion-off, link destination and runtime errors. Prior capabilities/hero evidence remains valid for unchanged components. See `docs/design/setup-journey.md`, `docs/design/api-capabilities.md` and `docs/design/hero-violet.md`. Passing checks are not owner visual approval.
