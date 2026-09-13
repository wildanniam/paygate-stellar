# PayGate landing preview — 13 September 2026

## Current authority and scope

Latest owner instruction: “Okey aku suka, sekarang lanjut ke section berikutnya … Kita lanjut develop satu section.” The revised violet hero, buttons and transaction journey are accepted. Build exactly one next section for a new feedback round. The new capabilities treatment is an implementation proposal, not yet owner-approved. `/design-preview` stays isolated; the live homepage and production release are outside this work. Reuse issue #5 / draft PR #6.

The metal/monochrome two-section pilot was rejected. The earlier hero-only iteration is now complete and superseded only in scope by hero plus one capabilities section. Further sections still need another feedback round. Higgsfield credit use is authorized for quality; asset generation is not a quota.

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

## One new section: API capabilities

Heading: “Your API. Ready for business.” Supporting copy: “You build the API. PayGate handles paid access and payment records.” One register link, then an asymmetric grid:

1. Dominant left panel: “A price for every call.” A crisp example configuration sits over a crop of the existing Higgsfield filament artwork. Three native price buttons update the visible request price and the receipt. Example endpoint and register → guard → verify setup copy make this a product illustration, not a false published endpoint.
2. Upper right: “Your API. Your access rules.” The provider must add a secret-header check. A restrained native shield mark and verified-payment → secret-header path show what PayGate adds to a paid upstream call. Do not imply that a URL alone makes the upstream private.
3. Lower right: “Every payment. On record.” A pale lavender panel holds a native receipt with gross amount, 90% provider share and 10% fee. Payment and delivery are explicitly separate.

Examples: 0.010 / 0.050 / 0.100 testnet USDC. Splits: 0.009+0.001, 0.045+0.005, 0.090+0.010. These are browser-only illustrations, not new billing logic. The hero simulation remains independent.

Use a calm dark background and varied panel scale after the rich hero. Do not repeat another request animation, create a second full-screen video, or add unrelated sculpture. Existing Higgsfield poster is lazy-loaded and reused; no new generation or dependency for this section.

Responsive: two columns above 760px; below that, price → access → receipt in one column. On phones, show immediate split feedback alongside the price controls so the result does not require scrolling. Targets are at least 44px. The smallest access path becomes vertical. Keep readable text, no fixed-height text clipping, and no horizontal overflow.

## State and motion contract

Capabilities: deterministic local selection; pressed state, hover, keyboard focus and active feedback. A concise polite live region announces the split. No loading or error UI is required because no request runs. Illustrative status and testnet units remain visible. Section motion is limited to button/link microinteractions; existing motion-off and reduced-motion rules apply.

Accepted hero: silent ambient video independent of the sample, responsive poster fallback, bounded pointer depth/light response, offscreen/hidden pause, visible pause control, and OS reduced-motion defaults. Simulation: idle → requesting → 402 → explicit simulated payment → verifying → credit → forwarding → returning → response. Reset invalidates pending callbacks. Credit is separate from delivery.

## Verification

Run frontend build and existing simulation tests. Inspect the assembled section at desktop, intermediate widths, 390px and 320px; exercise all prices, keyboard activation, focus, register destination, image loading, motion-off and a hero request smoke check. No live wallet/payment calls. Update `docs/design/api-capabilities.md` with actual results and limitations. Passing checks are not owner visual approval.
