# API capabilities section — 13 September 2026

Owner accepts the revised violet hero/buttons/transaction journey and authorizes **one next section**. Implemented on `/design-preview`, issue #5 / draft PR #6. New section awaits visual feedback; no homepage replacement or release.

## Reference synthesis

- [Circular](https://rbp-saas-template.vercel.app/): inspected the feature grid after the introduction. A dominant tall panel and smaller varied panels make hierarchy visible. Adapted this composition using PayGate violet rather than the template's lime palette.
- [Cloudlight](https://rbp-cloudlight-template.vercel.app/#capabilities): inspected its capability trio; each panel demonstrates a different job through product UI. Applied that clarity to price, access control and receipts.
- [Agentframe](https://rbp-agentframe-template.vercel.app/#quickstart): inspected its copy/SDK example pairing. The PayGate equivalent keeps endpoint/code/amounts native and legible, rather than baking UI into imagery.

The section follows the accepted hero with a calmer dark background. Main configuration panel reuses original Higgsfield artwork; guard and receipt are native DOM/CSS/Lucide visuals. No copied source, purchased template assets, fake user metrics or unrelated sculpture.

## Interaction and product truth

Three illustrative prices update the amount and 90/10 receipt split: 0.010 → 0.009 + 0.001; 0.050 → 0.045 + 0.005; 0.100 → 0.090 + 0.010 testnet USDC. Mobile shows immediate split feedback under the controls. The section has its own local selection, independent of the hero demonstration.

The URL is a clearly labelled example configuration. Real activation still requires registration, a provider-side secret-header guard and setup verification. Copy explicitly distinguishes payment records from delivery. No wallet, backend or payment operation is triggered. The register CTA uses the existing `/apis/new` route.

## Asset and motion budget

Reuse `/brand/hero-violet/field.webp` (131,670 bytes, 1920×1072) as a lazy-loaded crop. Its provenance is in [the existing ledger](hero-violet-assets.json). Zero additional Higgsfield generations/credits and no new dependencies. Only small control transitions; the existing pause/reduced-motion rules suppress them. No continuous motion or second video in this section.

## Verification

- Frontend production build passes. Five existing simulation tests pass; no new payment/state logic was introduced.
- Browser visuals inspected at 1440px desktop, 835px tablet, 390px phone and 320px narrow phone. No document or panel horizontal overflow. At 320px the access path is explicitly stacked rather than leaving a right-pointing arrow before a wrapped node.
- All three prices and corresponding receipt splits inspected. Enter activation and focus retention checked; price controls have 44px minimum height. Mobile immediate feedback matches the receipt.
- The new artwork loads at its original 1920px width. It is a reuse of the already loaded hero poster.
- Manual motion-off pauses the hero film and makes section transitions 0s; selection continues working. OS reduced-motion behavior inherits the unchanged stylesheet and remains code-reviewed, not preference-emulated.
- Hero request → explicit 402 payment action → completed response still works. Its 0.010 example remains independent from the capabilities selection. One browser wait hit the tool's short deadline during the intentional animation; the following DOM inspection confirmed the completed state, credited revenue and returned 200 response.
- Register CTA navigates to `/apis/new` and displays the existing wallet-connect registration entry. No wallet connection was attempted.
- One main landmark contains both sections. Final observed browser warnings are the two pre-existing React Router future notices; no runtime error was observed.
- `git diff --check` passes; temporary viewport override reset. No physical-device performance benchmark claimed.

New visual acceptance remains pending owner feedback. Build/interaction success does not imply approval of the new design.
