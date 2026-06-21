# PayGate UI Reference Research

Date: 2026-06-21

## Context

PayGate is a pay-per-call gateway for APIs on Stellar testnet. The current UI already communicates "developer tool", but the hero leans heavily on the familiar dark console pattern: dot grid, purple/cyan gradient, and a terminal code block. That makes the product understandable, but not yet premium or distinctive.

The strongest direction for a refactor is:

> A premium payment/API control layer: productized like Linear, commercially credible like Orb/Primer, and technical like Resend/Speakeasy.

The UI should make the core mechanism visible: an agent calls a paid proxy, receives `402 Payment Required`, pays with Stellar MPP, PayGate verifies/credits escrow, and the upstream API responds.

## Screenshots Captured

- Current PayGate baseline: `../output/playwright/ref-paygate-current.png`
- Linear: `../output/playwright/ref-linear-home.png`
- Resend: `../output/playwright/ref-resend-home.png`
- Polar: `../output/playwright/ref-polar-home.png`
- Orb: `../output/playwright/ref-orb-home.png`
- Primer: `../output/playwright/ref-primer-home.png`
- Trigger.dev: `../output/playwright/ref-trigger-home.png`
- Inngest: `../output/playwright/ref-inngest-home.png`
- Clerk: `../output/playwright/ref-clerk-home.png`
- Raycast: `../output/playwright/ref-raycast-home.png`
- Speakeasy: `../output/playwright/ref-speakeasy-home.png`

## Best Primary References

### 1. Linear

URL: https://linear.app

What works:

- The first viewport is calm, dark, and confident. It does not need decorative gradients to feel premium.
- The hero visual is not generic code; it is a product surface with real hierarchy, side navigation, metadata, activity, comments, and status.
- The product screenshot proves the system. The user can immediately imagine using it.
- The page sections feel like a product operating model, not a list of features.

Why it fits PayGate:

- PayGate has a workflow-heavy product: API registry, setup verification, request logs, payments, escrow crediting, withdrawal. Linear proves how to show operational complexity without making the UI feel like an admin console.
- The dashboard and API detail pages should borrow Linear's density, muted hierarchy, and object-oriented layout.

Use for PayGate:

- Redesign the dashboard as a real operations workspace, not a card grid.
- Put the API list, active status, recent calls, payment events, and withdrawable balance in one cohesive product surface.
- Use quiet interaction states: active row, subtle status dot, compact metadata, keyboard-friendly actions.

Do not copy:

- The exact black/grey palette and issue-tracker structure. PayGate should still feel like payments infrastructure.

### 2. Orb

URL: https://www.withorb.com

What works:

- Orb avoids the default dark SaaS look. The light canvas, editorial headline, and revenue-oriented language make billing feel strategic.
- The visual identity has texture and confidence without relying on heavy 3D.
- It frames billing as "revenue design", not just invoices and usage meters.

Why it fits PayGate:

- PayGate is also about turning usage into revenue, but at API-call granularity.
- A light or mixed theme would instantly separate PayGate from generic AI/devtool dashboards.

Use for PayGate:

- Consider an ivory/light marketing surface with dark product modules.
- Use a more commercial vocabulary: "usage to settlement", "paid proxy", "API revenue rail", "agent-ready payments".
- Use abstract 2D visual panels for proxy/routing/escrow instead of purple terminal blocks.

Do not copy:

- The broad enterprise sales tone. PayGate is still a developer-first beta/product.

### 3. Polar

URL: https://polar.sh

What works:

- The headline "Turn Usage Into Revenue" is direct and almost exactly adjacent to PayGate's promise.
- The page quickly shows billing capabilities: usage billing, credits, subscriptions, margins, code integration.
- The visual system is simple enough to feel fast.

Why it fits PayGate:

- PayGate needs to explain usage-based API charging in one line.
- The "usage -> revenue" framing is cleaner than "MPP code generator" or generic "AI payments".

Use for PayGate:

- Tighten the landing copy around one commercial transformation: "Turn API calls into settled revenue."
- Show "API call", "MPP proof", "escrow split", and "withdrawal" as first-class primitives.
- Use pricing/usage language on the dashboard, not only API status language.

Do not copy:

- The extreme emptiness. PayGate needs more product proof because the payment flow is novel.

### 4. Speakeasy

URL: https://www.speakeasy.com

What works:

- It feels technical without becoming a console. The typography and ASCII-style illustration create a memorable developer identity.
- The page clearly says "connect/control/observe", which maps well to gateway products.
- It positions itself as a control plane, not just a collection of tools.

Why it fits PayGate:

- PayGate can be framed as a payment control plane for agent/API traffic.
- The product has strong verbs: register, protect, charge, verify, credit, forward, withdraw.

Use for PayGate:

- Introduce a lightweight 2D "payment topology" illustration built from lines, endpoint nodes, status chips, and ledger entries.
- Use crisp section verbs instead of generic feature cards.
- Borrow the idea of a memorable technical visual system without using 3D.

Do not copy:

- The enterprise AI-control language too closely. PayGate should remain payment/API-specific.

### 5. Primer

URL: https://www.primer.io

What works:

- Primer visualizes payments as workflows: configure checkout, route logic, analyze performance, reconcile settlements, control funds.
- Its page treats payment infrastructure as an end-to-end operating system.
- It balances business trust signals with technical product surfaces.

Why it fits PayGate:

- PayGate's most unique story is also workflow-based: challenge, pay, verify, forward, split, withdraw.
- The API detail page could become a workflow/checklist rather than a static information panel.

Use for PayGate:

- Create a tabbed or step-based "Payment route" visual: `Request -> 402 -> MPP -> Escrow -> Upstream -> 200`.
- Use settlement/reconciliation language for dashboard sections.
- Show failed calls, duplicate payments, and verification state as part of a reliable payment ops surface.

Do not copy:

- Primer's softer enterprise SaaS look. PayGate can be sharper and more developer-native.

## Strong Secondary References

### Resend

URL: https://resend.com

Use for:

- Editorial typography and premium restraint.
- Developer onboarding that makes SDK/code feel elegant.
- Code examples that are integrated into a product story.

Avoid:

- Heavy 3D object dependency. PayGate does not need sculpted 3D assets.

### Trigger.dev

URL: https://trigger.dev

Use for:

- Large product screenshot or product-detail background behind the hero.
- Below-fold code examples tied to actual use cases.
- Strong CTA contrast and developer trust markers.

Avoid:

- Over-indexing on neon AI/workflow language.

### Clerk

URL: https://clerk.com

Use for:

- Light technical backgrounds with very subtle circuitry.
- Clear developer-facing proof: "drop-in", "embedded", "start building".
- Trust band + product component preview immediately after hero.

Avoid:

- Generic auth/SaaS layout if the product proof is not adapted to PayGate's flow.

### Raycast

URL: https://www.raycast.com

Use for:

- Premium first impression, confident nav, simple copy, and one dominant visual.
- Strong brand energy without many cards.

Avoid:

- Too abstract a hero. PayGate needs to show what it does.

### Inngest

URL: https://www.inngest.com

Use for:

- Big typographic attitude.
- Code as a visual layer, not just a terminal block.
- Scroll-driven story moments.

Avoid:

- Too much editorial noise, star particles, and oversized type in product-app surfaces.

## Recommended PayGate Design Direction

### Positioning

Move from:

> Dark developer console for MPP API payments.

To:

> A premium paid API gateway where agent traffic turns into settled API revenue.

Potential headline directions:

- "Turn API calls into settled revenue."
- "The paid proxy for agent-ready APIs."
- "Charge per API call. Settle on Stellar."
- "A payment rail for machine-to-machine APIs."

Best current-style refinement:

> Turn API calls into settled revenue.
> PayGate wraps your API with a paid proxy, verifies Stellar MPP payments, and credits your wallet per successful call.

### Visual System

Recommended palette:

- Background: near-black or warm off-white, not pure purple/cyan dark mode everywhere.
- Primary accent: Stellar/payment blue.
- Revenue accent: settlement green.
- Warning/state accent: amber for pending setup and `402`.
- Purple: keep only as a small Stellar/web3 accent, not the dominant brand color.

Recommended typography:

- Use a more distinctive display face for marketing pages, paired with a highly readable UI font.
- Keep mono only for endpoint IDs, request logs, status codes, and transaction hashes.
- Avoid huge mono labels as the main brand personality.

Recommended shape language:

- 6-8px radii for product surfaces.
- Thin borders, real hierarchy, compact tables.
- No nested cards inside cards.
- More full-width product bands and fewer isolated floating cards.

### Hero Concept

Replace the standalone terminal mockup with a "PayGate transaction rail":

1. Agent sends `GET /api/pay/api_123`.
2. PayGate returns `402 Payment Required`.
3. MPP proof appears.
4. Escrow credits 90% developer / 10% platform.
5. Upstream API returns `200`.
6. Dashboard updates revenue and call count.

This can be a 2D animated product panel, not 3D. Use GSAP-style motion: status chips, line drawing, log rows, and amount counters.

### Landing Page Structure

Recommended flow:

1. Hero: product promise + transaction rail visual.
2. Proof band: `402`, MPP, escrow split, withdrawable balance.
3. "How a paid call works": pinned scroll section showing request -> payment -> response.
4. "Register an API": show the setup form and generated secret/proxy.
5. "Operate revenue": dashboard preview with calls, revenue, fees, withdrawals.
6. Developer docs/SDK/code: compact code examples and copy buttons.
7. Trust/scope: testnet status, security boundary, secret guard, V1 limitations.

### App UX Changes

Dashboard:

- Make the API registry the main workspace.
- Use a Linear-like shell: left navigation, command area, wallet/account status, environment switcher.
- Show "Revenue", "Calls", "Active APIs", "Failed/Pending", and "Withdrawable" as a single operational summary.
- Recent activity should read like a ledger/event stream, not just cards.

Register API:

- Convert the form into a guided setup flow.
- Step 1: endpoint details.
- Step 2: price per call.
- Step 3: generated proxy and secret.
- Step 4: upstream guard checklist.
- Step 5: verify setup.

API Detail:

- Treat it as a lifecycle page.
- Top: status, price, proxy URL, upstream.
- Middle: payment route visual.
- Bottom: request/payment logs and setup checklist.
- Keep destructive actions quiet and separated from primary setup actions.

### Motion Direction

Use GSAP only where motion teaches the system:

- Hero load: line draws from agent to PayGate to escrow to API.
- ScrollTrigger: pin the transaction rail while each step activates.
- Counter animation: calls/revenue/fees update after the `200`.
- FLIP-style transition: API row expands into API detail.
- ScrambleText-style effect only for short status codes: `402`, `MPP`, `200`.

Avoid:

- Particle fields, random floating blobs, heavy 3D, and continuous animations.
- Motion that does not explain the payment flow.
- Animation on core dashboard interactions that slows repeated work.

## Final Recommendation

Use this blend:

- 45% Linear for product density and dashboard/app UX.
- 25% Orb/Polar for usage-to-revenue positioning.
- 20% Speakeasy/Primer for control-plane and payment-workflow storytelling.
- 10% Resend/Trigger.dev/Raycast for premium hero polish and motion taste.

The PayGate refactor should not become a prettier terminal. It should become a visible payment operating system for API owners: register, protect, charge, verify, settle, withdraw.
