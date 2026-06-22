# Product

## Register

brand

## Users

PayGate is for API owners and developers who already have useful endpoints and want per-call monetization without building payment infrastructure. Primary users include indie API builders, startup API owners, backend developers monetizing existing REST endpoints, and AI agent developers who need paid tools/endpoints that machine clients can call.

The product UI primarily serves the API owner. The landing page must also make the machine-client side legible: an agent calls a paid endpoint, receives `402 Payment Required`, pays through Stellar MPP, retries, and receives JSON.

## Product Purpose

PayGate turns an ordinary API URL into a pay-per-call endpoint. A developer pastes an upstream API URL, PayGate creates a paid proxy URL, verifies Stellar MPP payments, forwards paid requests, records request/payment evidence, and tracks revenue in a dashboard.

Success means a visitor understands the product in seconds: paste an API URL, get a paid endpoint, charge per call, and see proof that unpaid traffic is rejected while paid traffic produces revenue.

## Brand Personality

Precise, operational, and commercially credible. PayGate should feel like payment/API infrastructure that happens to be simple to use, not a protocol demo, crypto app, or generic AI SaaS tool.

The emotional target is calm control over machine-paid API traffic: an ordinary endpoint becomes gated, priced, observable, and ready for agent traffic.

## Anti-references

- Generic purple/cyan AI SaaS pages with decorative glows, pills, and repeated tiny uppercase section labels.
- Terminal mockups as the main hero object.
- Crypto trading, token, yield, staking, airdrop, wallet-app, or speculation framing.
- Hackathon, grant, proposal, or demo-first language.
- Heavy 3D hero dependencies, decorative orbs, bokeh blobs, and noisy gradients.
- Creator profile/link-in-bio, no-code checkout builder, or API marketplace framing.

## Design Principles

1. Show the mechanism, not a metaphor: URL to paid endpoint, `402`, MPP paid, `200 OK`, revenue posted.
2. Color has a job: purple for PayGate identity and primary action, blue for request/proxy flow, green for settled revenue, amber for payment-required states, red for destructive/error only.
3. Product proof beats generic claims: receipts, request IDs, status codes, escrow split, dashboard logs, and copyable endpoint values should carry the story.
4. Motion teaches the lifecycle: packets, state changes, and revenue pulses are useful; ambient glow and decorative shimmer are not.
5. Keep the page commercially credible: confident copy, strong contrast, precise spacing, and fewer repeated landing-page tropes.

## Accessibility & Inclusion

Target WCAG AA contrast for body text and interface copy. Preserve keyboard focus states for copyable URLs, receipt rows, CTAs, and navigation. Provide reduced-motion fallbacks for animated lifecycle and request-flow states. Do not rely on color alone for request/payment status; pair status color with labels and icons.
