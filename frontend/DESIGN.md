# PayGate hero preview — reference reset, 13 September 2026

## Current authority and scope

Wildan rejected the metal/monochrome two-section pilot and approved building **the hero only** for another visual feedback round. The existing PayGate dark/purple color system must stay. He explicitly allows Higgsfield credits to be used for quality; the earlier 16.5-credit target and generation stop no longer apply to this revision. Later sections and production release remain outside scope. Issue #5 / draft PR #6 track this work.

The old two-panel direction is superseded. Its implementation and asset ledger remain in Git history and `docs/design/landing-pilot-assets.json`, not as guidance for new imagery.

## Register, audience, path

Brand UI with a small native product demonstration. API owners should understand paid machine access, then register an API. The main CTA goes to `/apis/new`; an optional sample shows the request/payment/response path without a wallet or network transaction. Public Stellar Testnet beta stays visible.

## Visual target

- Primary: https://rbp-saas-template.vercel.app/ — integrated frame/navigation, centered bold headline, rich full-field artwork, product preview emerging below.
- https://www.koderea.id/ — simple reading order with ambient motion from entry.
- https://rbp-cloudlight-template.vercel.app/ — dark product preview anchored in the hero environment.
- https://rbp-agentframe-template.vercel.app/ — deliberate texture and clear identity.
- Reference principles only; no purchased template source, copied imagery or borrowed customer claims.

## Visual system

Preserve `src/styles/tokens.css`: ink #050609, purple #735CFA, lavender #9A90FF, existing blue/green/amber semantic colors. DM Sans for expressive, bold centered typography; JetBrains Mono for code and data. The existing colored PayGate mark stays.

Artwork is an immersive violet optical current: thousands of fine light filaments flowing into a broad concave horizon, with dark upper-middle atmosphere, luminous peripheral ridges and fine photographic texture. No doors, metal, hardware, studio floor or unrelated sculpture. Artwork supplies atmosphere; readable native HTML supplies product meaning.

One rounded full-width stage, compact floating navigation, centered two-line headline, concise supporting copy, purple primary CTA and a quieter sample CTA. A single wide native sample console emerges from the lower light field, within the hero. No second section or repeated card grid.

Desktop: typography and actions centered with generous horizontal space; sample console has request and response columns. Mobile: narrower headline, compact navigation, vertically stacked console, retained artwork crop and touch-friendly targets. No fixed-height text crop.

## Motion and state contract

Silent ambient film starts automatically with motion enabled, independently of the sample. A poster shows immediately. Pointer movement adds a bounded depth shift and local light response; no custom cursor or scroll hijack. Subtle flowing SVG traces reinforce the product path. Motion pauses offscreen/hidden and via a visible control. OS reduced motion defaults to still artwork and no pointer/entrance movement. Failed autoplay/media retain the poster and working UI.

Sample: idle → requesting → 402 → explicitly simulate payment → verifying → escrow credited → forwarding → response. Gross 0.010, provider 0.009 and fee 0.001 testnet USDC. Credit precedes delivery; decorative media never determines financial state. Reset cancels stale callbacks. The sample is visibly labelled and sends no payment or API request.

Controls: distinct hover/focus/active/disabled states, keyboard access, 44px minimum targets. State updates use a concise live region; avoid announcing ambient animation. Native code stays crisp and selectable.

## Verification and creative gate

Inspect actual artwork and film, then the assembled desktop and 390px hero. Verify motion from entry, pointer response, sample flow, reset, reduced-motion preference, playback fallback, no horizontal overflow, no broken media, build and meaningful simulation tests. Record prompts, selected/rejected generations, actual balance delta, media sizes and limitations. A build passing is not owner creative approval.
