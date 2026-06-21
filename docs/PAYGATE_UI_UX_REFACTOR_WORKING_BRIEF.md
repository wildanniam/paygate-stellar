# PayGate UI/UX Refactor Working Brief

Date: 2026-06-21

Status: working draft for discussion. The reference research in `docs/PAYGATE_UI_REFERENCE_RESEARCH.md` is locked.

## Locked Reference Direction

Blend:

- Linear: product density, workspace feel, quiet hierarchy.
- Orb / Polar: usage-to-revenue positioning.
- Primer / Speakeasy: payment/control-plane workflow storytelling.
- Resend / Trigger.dev / Clerk / Raycast: premium developer polish, restrained motion, product proof.

Hard avoid:

- Generic purple AI SaaS.
- Terminal mockup as the main hero.
- Crypto trading, yield, token, airdrop, wallet-app framing.
- Heavy 3D hero dependency.
- Hackathon/proposal language.

## Product Truth

Atlas + repo context agree on the core product:

> PayGate is a pay-per-call gateway for APIs.

The better marketing translation:

> Paste an API URL. Get a paid endpoint agents can call.

This should become the guiding promise, but the product must not overclaim. PayGate creates the paid proxy and handles payment/settlement, while the developer still needs to protect the original upstream with the generated `X-PayGate-Secret` guard.

## Recommended Positioning

Primary one-liner:

> PayGate turns any API URL into a pay-per-call endpoint for AI agents.

Sharper landing headline candidates:

1. `Paste an API URL. Charge per call.`
2. `Turn API calls into settled revenue.`
3. `One API URL in. Paid endpoint out.`
4. `The paid proxy for agent-ready APIs.`

Recommended combination:

> Paste an API URL. Charge per call.
> PayGate creates a paid proxy, verifies Stellar MPP payments, forwards valid requests, and tracks revenue from one dashboard.

Why:

- It captures the Bitly/Linktree simplicity: input a URL, get a usable monetized URL.
- It sounds like a real product, not a protocol demo.
- It keeps the technical proof visible without leading with jargon.

## Primary Personas

Primary product user:

> API owners and developers who already have useful endpoints and want per-call monetization without building payment infrastructure.

Sub-personas:

- Indie API builder with a useful data/tool endpoint.
- Startup API owner who wants usage-based monetization.
- Backend developer adding paid access to an existing REST endpoint.
- AI agent developer who needs paid tools/endpoints agents can call.

Important distinction:

- The app UI is mostly for the **API owner/developer**.
- The buyer/consumer narrative is **AI agents and machine clients**.
- The landing page must show both sides, but the product screens should optimize for the API owner.

## Recommended Anti-Audience

Do not design for:

- Crypto traders seeking yield, token charts, airdrops, staking, or wallet speculation.
- Consumer creators who want a Linktree-style public profile page.
- No-code sellers who expect Stripe checkout and zero backend work.
- Enterprise card-payment teams that need PCI/card routing first.
- API marketplace browsers who want discovery/catalog features before owning an API.
- Blockchain-native protocol users who want raw MPP/Soroban controls more than product simplicity.

Reason:

These audiences pull the UI in conflicting directions. PayGate should feel like API monetization infrastructure, not a crypto app, creator link page, checkout builder, or API marketplace.

## Desired Feeling

Recommended feeling:

> Your ordinary API just became gated, priced, observable, and ready for agent traffic.

Alternative feeling options:

1. `A valuable endpoint becoming a revenue rail in minutes.`
2. `Calm control over machine-paid API traffic.`
3. `A URL turning into infrastructure.`
4. `Payment complexity disappearing behind one inspectable proxy.`

Avoid feelings:

- "premium"
- "modern"
- "clean"
- "AI-native"
- "web3"

Those words are too soft and produce generic output.

## Hero Recommendation

Do not use the current terminal/code-block hero as the main object.

Recommended hero object:

> A URL transformation rail: an upstream API URL enters PayGate and becomes a paid proxy endpoint with live payment states.

Hero visual behavior:

1. A single upstream URL appears: `https://api.company.com/v1/signal`.
2. A price chip attaches: `0.01 USDC / call`.
3. PayGate mints a proxy URL: `https://paygate.app/api/pay/api_123`.
4. A tiny request line hits the proxy.
5. State chips activate: `402 Required` -> `MPP Paid` -> `200 OK`.
6. Revenue pulse appears: `+0.009 USDC` developer, `+0.001 USDC` PayGate fee.

Why this is stronger:

- It expresses the Bitly/Linktree-like simplicity without pretending the product is only a link shortener.
- It shows the unique payment flow without a noisy diagram.
- It is product-led, not terminal-led.
- It can be animated with lightweight SVG/HTML/GSAP instead of 3D.

Hero composition:

- Large, simple copy above or beside the visual.
- One primary CTA: `Create paid endpoint`.
- One secondary CTA: `View docs` or `Watch 402 flow`.
- Product visual should occupy the hero center/lower half and hint at the next section.
- No floating orbs, no purple-blue gradient blob, no full terminal mockup.

## Landing Structure

Recommended section order:

1. **Hero: URL to paid endpoint**
   - Promise: paste API URL, charge per call.
   - Animated URL transformation rail.

2. **Proof strip**
   - `API URL -> Paid proxy`
   - `Unpaid -> 402`
   - `MPP paid -> 200`
   - `Escrow split -> withdrawable revenue`

3. **From ordinary API to paid API**
   - Three-step funnel:
   - Register endpoint.
   - Protect upstream.
   - Charge agent calls.

4. **Watch a paid call happen**
   - Pinned GSAP scrollytelling.
   - Request, 402, payment proof, escrow credit, upstream forward, 200 response.

5. **Operate API revenue**
   - Dashboard preview.
   - Calls, gross revenue, developer revenue, platform fee, withdrawable balance, recent requests/payments.

6. **Developer setup**
   - Proxy URL, API Secret, Express guard snippet.
   - Direct upstream `401`, unpaid proxy `402`, paid proxy `200`.

7. **Built for APIs and agents**
   - API owner side: register, protect, monitor, withdraw.
   - Agent side: request, pay, retry, receive JSON.

8. **Trust and scope**
   - Stellar MPP, Soroban escrow, testnet beta boundary, GET/REST/JSON V1 scope.
   - Honest but confident.

9. **Final CTA**
   - Create paid endpoint.
   - Read developer guide.

Cut:

- Pricing table for now.
- Testimonials.
- Blog teasers.
- Big FAQ.
- Marketplace browsing.
- Logo wall unless real users/partners exist.
- Hackathon/grant explanation above fold.

## App UX Direction

Refactor the whole product, not just landing.

### Global Shell

- Use a real app workspace, inspired by Linear.
- Left sidebar or compact top shell for: Dashboard, APIs, New API, Docs, Legacy Generator.
- Wallet/account state visible but quiet.
- Environment badge: `Stellar Testnet`.
- Primary action always available: `Create paid endpoint`.

### Dashboard

Goal:

> Let API owners operate API revenue, not just inspect cards.

Layout:

- Top summary row: active APIs, total calls, gross revenue, developer revenue, withdrawable balance.
- Main region: API registry table/list with status, price, calls, revenue, last request.
- Right/detail panel or below: recent request/payment ledger.
- Withdraw action in a finance panel, separated from API setup actions.

Avoid:

- Too many isolated metric cards.
- Dashboard that feels like a demo evidence page.
- Over-large headings inside app surfaces.

### Register API

Rename conceptually:

> Create paid endpoint

Guided flow:

1. Endpoint: API name, upstream base URL, path.
2. Pricing: USDC per call.
3. Generated output: proxy URL + secret.
4. Protect: guard snippet + env var.
5. Verify: test upstream guard and activate proxy.

UX rule:

- Wizard should guide but not trap. Users can go back, copy values, and open docs.

### API Detail

Goal:

> Show the lifecycle and operating state of one paid endpoint.

Top:

- API name, status, price, proxy URL, upstream URL.

Core visual:

- Payment route: `Agent -> PayGate -> MPP -> Escrow -> Upstream`.
- Active state highlights based on API lifecycle.

Below:

- Setup checklist.
- Request ledger.
- Payment ledger.
- Revenue split.
- Verify/archive/delete actions.

### Legacy Generator

- Keep but demote.
- Label clearly: `Legacy middleware generator`.
- It should not compete with the V1 paid proxy flow.

## Design System Direction

### Color Logic

Recommended:

> Deep dark product world with four semantic lights: purple for PayGate brand, blue/cyan for proxy/network flow, green for settled revenue, amber for payment required/pending.

Keep purple, but reduce its role.

Current purple (`#7C3AED`) can stay as the brand/action accent, but it should not dominate every hero headline, border, glow, and gradient. The new system should feel like payment infrastructure, not purple AI SaaS.

Suggested tokens:

```txt
bg.canvas      #050609
bg.app         #080A0F
surface.1      #0D1117
surface.2      #111722
surface.3      #151C2A
border.subtle  #222A38
border.strong  #344055
text.primary   #F7F8FB
text.secondary #A5ADBD
text.muted     #6B7487
brand.purple   #7C3AED
flow.blue      #38BDF8
settled.green  #22C55E
pending.amber  #F59E0B
danger.red     #F87171
```

Usage rules:

- Purple: brand mark, primary CTA, selected nav, rare highlight.
- Blue/cyan: proxy route, request path, network/protocol state.
- Green: successful payments, revenue, withdrawable, `200`.
- Amber: `402`, pending setup, verification needed.
- Red: errors, failed payment, destructive actions.

No large purple/cyan gradient headlines.

### Typography Logic

Recommended:

> Use a refined sans for product language, and mono only for endpoints, hashes, amounts, and protocol states.

Good direction:

- Display/UI: Satoshi or General Sans if available; fallback DM Sans.
- App/data: IBM Plex Sans or similar high-readability technical sans.
- Mono: JetBrains Mono or IBM Plex Mono only for code/status/URLs.

Avoid:

- All-mono identity.
- Inter-only default SaaS.
- Giant monospace hero unless intentionally brutalist.

### Layout Logic

Recommended:

> Marketing pages use one strong product visual per section; app pages use dense but quiet workspace layouts.

Rules:

- Cards max radius: 8px.
- Product surfaces use thin borders, not heavy shadows.
- No cards inside cards.
- Hero visual should be unframed or integrated, not a decorative terminal card.
- App tables/lists should be compact, with stable row heights and clear hover/focus states.
- Mobile must preserve the core flow: URL input -> proxy output -> payment states.

## Motion System

Use GSAP where motion teaches the product.

Allowed motion:

- Hero timeline: URL becomes paid proxy, state chips activate.
- Pinned ScrollTrigger section: paid call progresses through labels.
- Line drawing: agent request path and payment route.
- Number count-up: revenue/calls after success.
- Row expand/detail transition for API list.
- Subtle CTA hover/magnetic effect only on marketing pages.

Avoid:

- Continuous decorative particles.
- Scroll-jacking.
- Heavy 3D.
- Animating layout properties.
- Motion on every card.
- Infinite animation except loading indicators.

Implementation rules:

- Respect `prefers-reduced-motion`.
- Use transform/opacity animations.
- Use a single timeline per complex sequence.
- Clean up GSAP/ScrollTrigger instances in React.
- Use mobile-specific simplified sequences.

## Copy Tone

Tone:

> Confident, product-real, developer-native, commercially clear.

Do:

- Say `API URL`, `paid endpoint`, `paid proxy`, `402`, `MPP`, `escrow`, `revenue`.
- Explain the magic as an inspectable flow.
- Make setup feel approachable without hiding the guard requirement.

Do not:

- Sound like grant/hackathon demo.
- Overuse "AI-powered".
- Overuse "web3".
- Use crypto hype.
- Promise zero backend changes.

## Refactor Scope

Refactor all primary UI:

- Landing page.
- App shell/navbar.
- Dashboard.
- Register/Create API flow.
- API detail page.
- Shared components: buttons, badges, copy controls, forms, value rows, empty states, notices, code snippets, ledgers.
- Legacy generator visual demotion.

## Acceptance Criteria

- No generic purple AI-gradient hero.
- Hero is not primarily a terminal/code block.
- User understands the value in 3 seconds: API URL becomes paid endpoint.
- User understands the actual setup: proxy URL + secret guard + verify setup.
- Dashboard feels like a real product workspace, not demo cards.
- Status colors are semantic and consistent.
- Motion explains the payment flow.
- Reduced-motion path exists.
- Mobile layouts have no overlap or horizontal scroll.
- Focus states and accessible labels exist.
- The product feels launchable, not hackathon-only.

## Decisions Still Needed From Wildan

1. Final public one-liner:
   - `PayGate turns any API URL into a pay-per-call endpoint for AI agents.`
   - Or a different sentence.

2. Final hero headline:
   - `Paste an API URL. Charge per call.`
   - `One API URL in. Paid endpoint out.`
   - `Turn API calls into settled revenue.`

3. Brand color direction:
   - Keep purple as primary CTA/brand only.
   - Or shift primary action to green/revenue and keep purple as logo-only.

4. Visual metaphor:
   - URL transformation rail.
   - Payment route/gateway.
   - Dashboard/product surface first.

5. Public naming:
   - Keep `Register API`.
   - Rename to `Create paid endpoint`.
   - Use both: `Create paid endpoint` with `Registered APIs` in app navigation.
