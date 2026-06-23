# PayGate UI/UX Refactor Development Plan

Status: planning brief  
Locked direction: premium developer/fintech product inspired by Linear-like density, subtle GSAP product storytelling, and the PayGate hero concept image.  
Primary product promise: paste an API URL, get a pay-per-call endpoint agents can call.

## 1. Executive Direction

PayGate should no longer feel like a hackathon console or generic AI SaaS page. The new UI must feel like a real product for API owners, indie API builders, startup API teams, and AI agent developers who want to monetize API access without building payment infrastructure.

The product story should be simple:

1. A developer has an existing API URL.
2. PayGate wraps it with a paid proxy endpoint.
3. Unpaid clients receive `402 Payment Required`.
4. AI agents or machine clients pay through Stellar MPP.
5. PayGate verifies payment, forwards the request upstream, and tracks revenue.
6. The developer withdraws earned revenue from escrow.

The UI should make that flow feel obvious, trustworthy, and premium.

## 2. Current Codebase Findings

### Stack

- Frontend: React 18, Vite, React Router, Tailwind, lucide-react.
- Wallet: `@stellar/freighter-api`.
- Current app style: mostly inline styles plus a small global CSS layer.
- Build status: `npm --prefix frontend run build` succeeds.
- GSAP and `@gsap/react` are installed and already used for restrained landing-page interactions.

### Main Files

- `frontend/src/App.jsx`: route registration.
- `frontend/src/colors.js`: current shared token object.
- `frontend/src/index.css`: global styles, animations, Tailwind base.
- `frontend/src/pages/Landing.jsx`: current marketing page, large monolithic file.
- `frontend/src/pages/Dashboard.jsx`: dashboard and operational data view.
- `frontend/src/pages/RegisterApi.jsx`: API registration flow.
- `frontend/src/pages/ApiDetail.jsx`: API detail, verify setup, archive/delete.
- `frontend/src/pages/Generate.jsx` and `frontend/src/pages/Result.jsx`: legacy generator flow.
- `frontend/src/components/*`: reusable pieces, but many are still narrow and locally styled.

### Current UI Problems

- The landing page now has strong visual pieces, but the narrative order still needs to be corrected so sections do not repeat the same paid-call idea.
- The current hero, receipt proof, and transformation sections all reference paid-call mechanics; the next work should make every section answer a different user question.
- `Landing.jsx` and `Dashboard.jsx` are too monolithic for a controlled premium refactor.
- The dashboard has useful data, but the layout feels like cards on a page instead of an operational workspace.
- "Register API" sounds technical and passive. The desired product action is closer to "Create paid endpoint".
- The legacy generator still exists and should be visually demoted so it does not confuse V1 positioning.
- Current landing copy still uses some mechanism-first language (`MPP`, `paid proxy`, `402`) before the user has enough context.
- The old generic feature section remains and should be removed or replaced with audience/conversion content.
- Motion should continue to teach product states, but the revised plan should avoid adding another full lifecycle scrollytelling section.

### Current UI Strengths To Preserve

- Product logic is already real enough to support a serious interface: APIs, requests, payments, escrow, withdrawals.
- `UpstreamGuardGuide` captures a crucial product truth: the developer must protect the upstream API with `X-PayGate-Secret`.
- `CopyButton`, `ApiStatusBadge`, and `ValueRow` are useful primitives that can be upgraded rather than discarded.
- Brand mark assets already exist under `frontend/public/brand`.
- Dashboard API response already contains the right operational concepts: total APIs, calls, revenue, escrow, requests, payments, withdrawals.
- The current hero direction is strong: centered product promise plus a visual API URL -> PayGate -> paid endpoint rail.
- The current transformation section has a strong before/action/after layout and should be retained with narrative polish.
- The current receipt component is valuable, but should be positioned as auditability proof instead of another flow explanation.

## 3. Locked Design Principles

### Product Positioning

Use this as the core message:

> Paste an API URL. Charge per call.

Supporting line:

> PayGate turns ordinary API endpoints into paid endpoints for agents, apps, and machine clients.

Avoid:

- Generic "AI infrastructure" language.
- Crypto-first language.
- Hackathon/demo/proposal framing.
- Overclaiming "fully automatic" if the developer still needs to protect the upstream API.

### Visual Direction

The product should feel:

- Dark, precise, and operational.
- Premium developer tool, not dashboard template.
- Slightly futuristic, but not sci-fi.
- Subtle motion, not visual noise.
- Useful density, similar to Linear's product confidence.

Avoid:

- Heavy 3D hero.
- Decorative blobs, orbs, bokeh, and random gradients.
- Terminal as the primary hero object.
- Purple-only palette.
- Oversized marketing cards.
- "AI slop" sections that say a lot but teach little.

### Motion Direction

Motion should be used only where it explains the product:

- URL transforms into paid proxy.
- Status changes from `402` to `MPP paid` to `200 OK`.
- Revenue increments after a successful request.
- Trust and proof sections reveal different product truths instead of repeating the same paid-call lifecycle.
- Dashboard rows or metrics update with restraint.

Every motion feature must have a reduced-motion fallback.

## 4. Design System Implementation Strategy

### Phase 1 Target

Before touching individual pages heavily, create a stronger shared UI foundation.

Recommended files:

- `frontend/src/styles/tokens.css`
- `frontend/src/styles/base.css`
- `frontend/src/styles/components.css`
- `frontend/src/components/ui/Button.jsx`
- `frontend/src/components/ui/Panel.jsx`
- `frontend/src/components/ui/Badge.jsx`
- `frontend/src/components/ui/Field.jsx`
- `frontend/src/components/ui/DataTable.jsx`
- `frontend/src/components/ui/Metric.jsx`
- `frontend/src/components/ui/Notice.jsx`
- `frontend/src/components/ui/Section.jsx`

This keeps the refactor controlled. We can migrate pages section by section without rewriting the whole app blindly.

### Token Direction

Recommended palette:

```txt
bg.canvas       #050609
bg.app          #080A0F
surface.1       #0D1117
surface.2       #111722
surface.3       #151C2A
border.subtle   #222A38
border.strong   #344055
text.primary    #F7F8FB
text.secondary  #A5ADBD
text.muted      #6B7487
brand.purple    #7C3AED
flow.blue       #38BDF8
settled.green   #22C55E
pending.amber   #F59E0B
danger.red      #F87171
```

Usage rules:

- Purple: brand, selected nav, primary CTA, logo accent.
- Blue: network/proxy/request flow.
- Green: successful call, revenue, withdrawable.
- Amber: unpaid, `402`, pending setup.
- Red: destructive/error only.
- Mono type: endpoints, hashes, status codes, request ids.
- Sans type: all product copy and interface text.

### Typography Decision

Recommended direction:

- Product/UI sans: `DM Sans` or `IBM Plex Sans` for reliable implementation.
- Mono: `JetBrains Mono` or `IBM Plex Mono`.

Optional premium direction if external font loading is acceptable:

- `Satoshi` or `General Sans` for marketing/product headings.
- `IBM Plex Mono` or `JetBrains Mono` for endpoint/payment details.

Decision needed before implementation: use reliable Google/local fonts or introduce a premium external font source.

## 5. Development Sequence

The refactor should be done section by section. Each section should be visually checked before moving forward.

### Updated Landing Narrative

The old landing sequence risked repeating the same story in different visual forms: API URL -> paid endpoint -> `402` -> MPP -> `200 OK` -> revenue. The revised sequence keeps the locked premium visual direction, but gives each section a distinct job.

Recommended landing order:

1. Hero: explain the product in seconds.
2. Transformation: show how an API owner creates a paid endpoint.
3. Protected paid calls: answer the upstream-safety objection.
4. Receipt proof: show that every paid call is auditable.
5. Dashboard preview: show PayGate as an operating workspace.
6. Use cases and final CTA: make the right users recognize themselves and act.

This is the product narrative to protect during implementation:

```txt
What is PayGate?
  Paste an API URL. Charge per call.

How easy is it?
  Paste URL -> set price -> generate paid endpoint.

Is my upstream safe?
  PayGate blocks unpaid traffic and forwards valid requests with the upstream secret header.

Can I prove what happened?
  Every paid call has a request receipt.

Can I operate this as a product?
  Dashboard shows endpoints, calls, revenue, fees, escrow, and withdrawable balance.

Who is this for?
  API owners and builders who want paid machine-readable access without rebuilding billing infrastructure.
```

Do not add another full paid-call lifecycle section unless a future product need makes it clearly different from the hero, proof, and transformation sections.

### Locked Visual Baseline Pack

These images are the visual contract for autonomous implementation. Generated baselines define layout, hierarchy, density, copy, and visual intent. Actual screenshots define the already-implemented sections. Do not replace or reinterpret these baselines during development unless the user explicitly approves a new baseline.

| Phase | Section | Baseline |
| --- | --- | --- |
| Phase 2 | Hero | `docs/evidence/ui/landing-baselines/phase-2-hero-actual-baseline.png` |
| Phase 3 | Transformation | `docs/evidence/ui/landing-baselines/phase-3-transformation-actual-baseline.png` |
| Phase 4 | Protected paid calls | `docs/evidence/ui/landing-baselines/phase-4-protected-paid-calls-baseline.png` |
| Phase 5 | Receipt proof | `docs/evidence/ui/landing-baselines/phase-5-receipt-proof-baseline.png` |
| Phase 6 | Dashboard preview | `docs/evidence/ui/landing-baselines/phase-6-dashboard-preview-baseline.png` |
| Phase 7 | Use cases and final CTA | `docs/evidence/ui/landing-baselines/phase-7-use-cases-cta-baseline.png` |

Baseline interpretation rules:

- Match the baseline section's layout, content hierarchy, spacing rhythm, color intent, density, and interaction affordances.
- Generated image details that conflict with implemented design-system primitives should defer to the existing PayGate design system. For example, primary CTA buttons must continue using the custom `Button` / `.pg-button` styling even if a generated baseline button appears slightly flatter.
- Do not copy image-generation artifacts literally if they reduce implementation quality; preserve the intended product UI.
- Every section must still be responsive and accessible, even if the desktop baseline is the primary visual reference.

### Phase Gate Protocol

Every landing phase after this point must follow the same acceptance gate:

1. Implement only the selected section and any supporting shared styles/components required for that section.
2. Run `npm --prefix frontend run build`.
3. Run `git diff --check`.
4. Capture Playwright screenshots:
   - desktop `1440px` section screenshot,
   - mobile `390x844` section screenshot,
   - hover/focus screenshot when the baseline includes an interactive emphasis state.
5. Compare the implementation screenshot against the locked baseline for the active phase.
6. Iterate until the implementation matches the baseline's layout, visual hierarchy, tone, density, and copy closely enough for acceptance.
7. Update or add the phase evidence document under `docs/evidence/ui/`.
8. Commit only after the acceptance criteria pass.
9. Do not start the next phase until the current phase has been committed.

Required commit messages:

```txt
Phase 4: feat: add protected paid calls section
Phase 5: feat: add request receipt proof section
Phase 6: feat: add landing dashboard preview
Phase 7: content: add landing audience and conversion close
Phase 8: style: polish landing narrative flow
```

## Phase 0: Baseline And Refactor Safety

Goal: establish a safe baseline so every future section can be verified.

Tasks:

1. Run and record baseline build.
2. Start Vite dev server.
3. Capture current desktop and mobile screenshots for comparison.
4. Confirm key routes load:
   - `/`
   - `/dashboard`
   - `/apis/new`
   - `/apis/:apiId` if test data exists
   - `/generate`
5. Confirm no backend contract changes are needed for the first visual pass.

Acceptance:

- Build passes.
- Current routes are known.
- We know which pages can be visually verified without wallet login.

## Phase 1: Design Foundation

Goal: create tokens and reusable components so the refactor does not become scattered inline styling.

Tasks:

1. Replace or extend `frontend/src/colors.js` with semantic tokens.
2. Add CSS variables in a dedicated token stylesheet.
3. Create foundational UI primitives:
   - Button variants: primary, secondary, ghost, destructive, icon.
   - Panel/surface primitive with restrained borders.
   - Badge/status primitive for `active`, `unpaid`, `paid`, `settled`, `error`, `testnet`.
   - Field/input primitive.
   - Copy field for URLs/secrets.
   - Metric primitive for dashboard numbers.
   - Data table primitive for dense operational rows.
   - Notice/checklist primitive for setup guidance.
4. Update `CopyButton`, `ApiStatusBadge`, `CodeBlock`, and `ValueRow` to use shared tokens.
5. Remove or stop using old global decorative styles:
   - hue-shifting gradient headline
   - shimmer border
   - decorative grid as primary visual language
   - noisy glowing hover effects

Acceptance:

- No major page has been redesigned yet, but shared primitives are ready.
- Visual language is clearly darker, calmer, and more operational.
- Existing build still passes.

## Phase 2: Landing Hero

Goal: implement the locked hero direction first and polish it before moving to the rest of the page.

Hero structure:

1. Nav with PayGate mark, product links, and CTA.
2. Eyebrow: `Pay-per-call API gateway`.
3. H1: `Paste an API URL. Charge per call.`
4. Supporting copy: explain paid endpoint for agents/apps/machine clients.
5. CTA group:
   - Primary: `Create paid endpoint`
   - Secondary: `View dashboard` or `See how it works`
6. Hero visual: URL transformation rail.

Hero visual states:

```txt
https://api.example.com/weather
        -> PayGate proxy
        -> $0.01 / call
        -> 402 Payment Required
        -> MPP paid
        -> 200 OK
        -> +$0.009 developer revenue
```

Implementation approach:

- Build the visual with normal HTML/CSS/SVG, not 3D.
- Use CSS for static layout and SVG lines.
- Use GSAP only for sequencing the state transitions.
- Keep all text real and readable.
- Make mobile layout stack cleanly.
- Add `prefers-reduced-motion` fallback where all states appear without animation.

Acceptance:

- Hero communicates the product in under 3 seconds.
- No terminal hero.
- No heavy 3D.
- No purple-only gradient dependency.
- Screenshot check at 1440 desktop and 390 mobile.
- No text overlap.
- Desktop and mobile screenshots remain consistent with `docs/evidence/ui/landing-baselines/phase-2-hero-actual-baseline.png`.

## Phase 3: Landing Transformation Section

Goal: replace vague feature cards with a clear before/after product story.

Recommended title:

> From ordinary API to paid endpoint

Steps:

1. Connect your API URL.
2. Set a price per call.
3. Share the paid proxy with agents and clients.

Each step should show:

- What user does.
- What PayGate creates.
- What changes operationally.

Acceptance:

- Feels like Bitly/Linktree simplicity applied to APIs.
- Does not hide the upstream protection requirement.
- The right-side result card is clearly the outcome, but does not become a second dashboard section.
- The section avoids repeating the full hero lifecycle.
- Desktop and mobile screenshots remain consistent with `docs/evidence/ui/landing-baselines/phase-3-transformation-actual-baseline.png`.

Implementation status:

- The current Phase 4 implementation already establishes this direction.
- If we keep the existing commit history naming, this remains the completed transformation work even though the plan order now labels it as Phase 3 for narrative clarity.

Commit message after final narrative-polish acceptance:

```txt
content: rebalance landing transformation narrative
```

## Phase 4: Landing Protected Paid Calls

Goal: answer the strongest API-owner objection after the user understands setup simplicity.

Core user question:

> If buyers can call my paid endpoint, how do I keep the original upstream API private?

Recommended title:

> Keep your upstream API private.

Supporting copy:

> PayGate verifies payment before forwarding and sends valid requests with your upstream secret header.

Avoid saying `signs valid requests` unless the implementation actually performs cryptographic request signing. The current product truth is better described as guarded forwarding with `X-PayGate-Secret`.

Section concept:

```txt
Machine client / agent
  calls the PayGate paid endpoint

PayGate guard
  blocks unpaid traffic
  verifies payment
  issues request identity
  forwards valid requests with X-PayGate-Secret

Protected upstream API
  rejects direct traffic without the secret
  accepts PayGate-forwarded traffic
```

Primary visual:

- Three-zone architecture composition:
  - Left: machine client card with `GET /api/pay/api_123`.
  - Center: PayGate guard card as the focal point.
  - Right: protected upstream API card with masked upstream URL and a small guard snippet.
- Two connector states:
  - Amber branch: `Unpaid -> 402 blocked`, stopping at PayGate.
  - Green/blue branch: `Paid -> forwarded`, continuing to upstream.
- Bottom compact trust facts:
  - `Unpaid traffic blocked`
  - `Upstream URL stays private`
  - `Secret header forwarding`
  - `Receipt per request`

Recommended snippet:

```js
if (request.headers.get("X-PayGate-Secret") !== PAYGATE_SECRET) {
  return new Response("Unauthorized", { status: 401 });
}
```

Visual direction:

- Premium security architecture, not generic security SaaS.
- Use one strong PayGate guard focal card instead of many shield icons.
- Keep purple on the guard, amber only for blocked traffic, green only for verified/forwarded traffic.
- Do not add a large revenue card in this section.
- Do not repeat the full `402 -> MPP -> 200 -> revenue` lifecycle.

Implementation:

- Build as normal React/CSS/SVG, using the existing PayGate card language.
- Use GSAP only for subtle line activation or hover/focus state transitions if it adds clarity.
- Mobile: stack as `client -> PayGate guard -> upstream`, with blocked/forwarded states shown as compact rows.
- Reduced motion: show both states without animated sweeps.
- Keep interaction optional; the section must communicate statically.

Acceptance:

- The section clearly answers upstream protection.
- Copy is technically accurate and does not overclaim cryptographic signing.
- It feels different from hero, transformation, and receipt proof.
- No icon or connector overlaps on desktop/mobile.
- Screenshot check at desktop and mobile.
- Implementation matches `docs/evidence/ui/landing-baselines/phase-4-protected-paid-calls-baseline.png` before the phase is committed.
- Primary CTAs, if added in this section, use the existing custom `Button` / `.pg-button` treatment.

Commit message:

```txt
feat: add protected paid calls section
```

## Phase 5: Landing Receipt Proof

Goal: prove that paid calls are observable and auditable after the trust model is understood.

Recommended title:

> Every paid call leaves a receipt.

Supporting copy:

> Track request identity, payment verification, upstream forwarding, and posted revenue from a single call.

Content:

```txt
REQ ID: req_01HZ8XQ4F2J7Q9K3T6V1

Request received       GET /api/pay/api_123
Payment required       402 Required
Payment verified       pay_8d7a2c0e
Upstream returned      200 OK

LIVE · Region: SGP · Latency: 142ms · Forwarded to upstream
```

Important copy correction:

- Prefer `Payment verified before forwarding`.
- Avoid leading with `verified on-chain` in marketing copy because it pulls attention toward crypto mechanics too early.
- `Stellar MPP` can appear in supporting labels or docs links, but should not dominate the section.

Visual direction:

- Receipt/log panel as the main object.
- Request identity, payment proof, upstream result as supporting evidence bullets.
- Revenue split may appear, but as a supporting receipt outcome, not the hero of the section.
- Keep row icons custom and friendly, but precise. Avoid generic checkmark spam.
- Use dividers, timestamps, copy affordances, and mono values to make it feel operational.

Interaction:

- Rows can be hoverable/copyable.
- Active row highlight should be subtle and semantically colored.
- Copy state should show `copied` feedback.

Acceptance:

- The section communicates auditability, not setup flow.
- It does not feel like a duplicate of the hero rail.
- Request IDs, endpoint paths, status codes, and values remain readable on mobile.
- Copy interactions continue to work.
- Implementation matches `docs/evidence/ui/landing-baselines/phase-5-receipt-proof-baseline.png` before the phase is committed.
- Receipt row hover/focus and copy states are captured as evidence when implemented.

Commit message:

```txt
feat: add request receipt proof section
```

## Phase 6: Landing Dashboard Preview

Goal: show PayGate as an operational product.

Recommended title:

> Monitor calls, revenue, and endpoints in one workspace.

Supporting copy:

> Track calls, revenue, fees, escrow balance, and request activity without building billing infrastructure.

Content:

- API registry preview.
- Paid call volume.
- Gross revenue.
- Developer revenue.
- Platform fee.
- Escrow withdrawable balance.
- Recent request/payment rows.
- Withdrawal or escrow readiness panel.

Design:

- Use a realistic product screenshot-like composition, but built from components.
- Avoid fake chart overload.
- If a chart is needed, use a small SVG line/area chart first.
- Prioritize table rows, ledger entries, metric hierarchy, and workspace navigation over decorative analytics.

Recommended dashboard composition:

```txt
Sidebar
  Overview
  APIs
  Payments
  Withdrawals

Header
  API revenue
  Date range
  7D / 30D / 90D
  Create paid endpoint

Metrics
  Total calls
  Gross revenue
  Developer revenue
  Withdrawable

Operations
  API registry table
  Activity ledger
  Escrow / withdraw panel
```

Copy note:

- Avoid headline wording like `See every paid call, payout, and endpoint in one place`; it reads slightly clumsy.
- Prefer `Monitor calls, revenue, and endpoints in one workspace.`

Acceptance:

- Users can imagine operating revenue from this product.
- Feels like a real dashboard, not marketing decoration.
- Does not duplicate the hero's small dashboard hint; it is the fuller operational view.
- Dense but readable at desktop and cleanly stacked on mobile.
- Implementation matches `docs/evidence/ui/landing-baselines/phase-6-dashboard-preview-baseline.png` before the phase is committed.
- Dashboard preview data remains credible and aligned with existing PayGate concepts.

Commit message:

```txt
feat: add landing dashboard preview
```

## Phase 7: Landing Use Cases And Final CTA

Goal: close with audience clarity and one decisive action, without creating another generic feature grid.

Recommended title:

> Monetize the endpoints your users already call.

Supporting copy:

> PayGate is for API owners and builders who want paid machine-readable access without rebuilding billing, metering, and revenue operations.

Personas:

- Indie API builders.
  - Problem: useful endpoints are hard to charge for.
  - Outcome: publish a paid endpoint in minutes.
- Agent-facing API builders.
  - Problem: agents need machine-readable paid access.
  - Outcome: expose an endpoint that responds with API-native payment states.
- Startup API owners.
  - Problem: billing and access control slow API monetization.
  - Outcome: gate requests before they reach upstream.
- Data/API sellers.
  - Problem: successful requests need metering and revenue evidence.
  - Outcome: track calls, revenue, and withdrawable balance.

Avoid:

- Overly broad `developers who want to ship`.
- Treating AI agents as the only primary buyer.
- Crypto-first persona language.
- Repeating the full hero flow inside the CTA panel.

Visual direction:

- Use a customer-fit matrix or compact horizontal rows, not four generic feature cards.
- The CTA card should be the strongest object in this section.
- CTA:
  - Primary: `Create paid endpoint`
  - Secondary: `View docs`
- Trust notes:
  - `Built on Stellar MPP`
  - `Request receipts included`
  - `Upstream guard supported`

Acceptance:

- The user can self-identify quickly.
- The final action is clear.
- CTA copy matches the real product route.
- No hackathon/demo framing.
- Implementation matches `docs/evidence/ui/landing-baselines/phase-7-use-cases-cta-baseline.png` before the phase is committed.
- Primary and secondary CTA buttons use existing PayGate button variants rather than one-off styling.

Commit message:

```txt
content: add landing audience and conversion close
```

## Phase 8: Landing Full-Page Polish And Evidence

Goal: make the completed landing page feel like one coherent premium product narrative.

Tasks:

1. Remove obsolete generic features section.
2. Reconcile navigation anchors:
   - `Product` should point to the transformation or overview section.
   - `How it works` should point to transformation.
   - `Docs` should remain external/internal docs.
   - Hide or defer `Pricing` until a real pricing section exists.
3. Audit copy for repeated concepts:
   - Do not overuse `+0.009 USDC`.
   - Do not repeat `402 -> MPP -> 200` in every section.
   - Use `MPP` mainly as a mechanism/trust detail, not the main value proposition.
4. Audit motion:
   - Every animation should teach a product state or improve affordance.
   - No decorative motion that distracts from comprehension.
   - Reduced-motion fallback for all animated sequences.
5. Audit mobile:
   - Each section must remain readable at `390x844`.
   - No horizontal overflow.
   - Code/URL pills truncate elegantly.
6. Update evidence docs with screenshots and acceptance notes.

Verification:

- `npm --prefix frontend run build`
- `git diff --check`
- Playwright desktop screenshots:
  - Hero
  - Transformation
  - Protected paid calls
  - Receipt proof
  - Dashboard preview
  - Use cases/CTA
- Playwright mobile screenshots at `390x844`.
- Copy interactions still return `data-copy-state="copied"` where supported.

Acceptance:

- The page has clear narrative progression from product promise to trust to operations to conversion.
- Every section has a distinct job.
- No section feels like a duplicated version of the hero.
- The landing page feels like a real product launch, not a hackathon/demo shell.
- Full-page screenshots confirm all locked baselines still work together as one coherent landing page.
- The phase is committed before moving into app shell/navigation work.

Commit message:

```txt
style: polish landing narrative flow
```

## Phase 9: App Shell And Navigation

Goal: make the logged-in product feel like a workspace.

Tasks:

1. Split marketing navigation from app shell.
2. Use real PayGate mark from `frontend/public/brand`.
3. Rename primary action from `Register API` to `Create paid endpoint`.
4. Add `Stellar Testnet` environment badge if still relevant.
5. Consider sidebar for app routes:
   - Dashboard
   - APIs
   - Create paid endpoint
   - Payments
   - Legacy generator
6. Keep mobile nav compact and usable.

Acceptance:

- App feels like a product workspace, not a landing page extension.
- Legacy generator is not presented as the primary product.

## Phase 10: Dashboard Refactor

Goal: turn the dashboard into the operational center of PayGate.

Keep existing behavior:

- Fetch `/api/dashboard/summary`.
- Show wallet/auth states.
- Support withdraw flow.
- Show APIs, requests, payments, withdrawals.

Recommended layout:

1. Workspace header
   - Title: `API revenue`
   - Subtitle: `Calls, payments, escrow, and endpoints.`
   - Primary action: `Create paid endpoint`
   - Wallet/environment status.
2. Revenue summary strip
   - Gross revenue
   - Developer revenue
   - Platform fee
   - Withdrawable
3. API registry
   - Endpoint name
   - Status
   - Price/call
   - Calls
   - Revenue
   - Last paid call
   - Action
4. Activity ledger
   - Recent requests and payments in one coherent operational area.
5. Escrow and withdrawal panel
   - Balance
   - Last withdrawal
   - Withdraw CTA
6. Empty/auth/error states
   - Calm, actionable, and visually aligned.

Component extraction:

- `DashboardHeader`
- `RevenueSummary`
- `ApiRegistryTable`
- `ActivityLedger`
- `EscrowPanel`
- `WithdrawalHistory`
- `DashboardEmptyState`

Acceptance:

- Dashboard no longer feels like loose cards.
- Data hierarchy is clear.
- Empty states push users toward creating a paid endpoint.
- Wallet states still work.
- Build passes and screenshots are checked.

## Phase 11: Create Paid Endpoint Flow

Goal: refactor `RegisterApi.jsx` into the core product workflow.

Recommended name:

- UI label: `Create paid endpoint`
- Route can remain `/apis/new` for now.

Flow:

1. Endpoint
   - Name
   - Upstream base URL
   - Path
2. Pricing
   - Price per call in USDC
   - Preview expected split if product logic supports it.
3. Generate
   - Submit to create API.
   - Show loading state.
4. Protect
   - Generated proxy URL.
   - API secret.
   - Upstream guard guide.
5. Verify
   - Link to API detail verification.
   - Explain `401`, `402`, and `200` states.

Important UX:

- The form should feel as easy as shortening a URL.
- Advanced details should be visible but not overwhelming.
- "Use demo endpoint" can remain as a helper, but should not make product feel like a demo.

Acceptance:

- User understands exactly what they are creating.
- The post-create state is polished and useful.
- Copy buttons and secret handling feel trustworthy.
- No backend contract change required unless explicitly chosen.

## Phase 12: API Detail Refactor

Goal: make each API page feel like a lifecycle/control page.

Recommended layout:

1. API header
   - Name
   - Status
   - Price per call
   - Proxy URL
   - Verify setup CTA
2. Payment route visualization
   - Client -> PayGate proxy -> MPP payment -> upstream -> response
3. Setup checklist
   - Upstream URL saved
   - Secret configured
   - Setup verified
   - Endpoint ready to share
4. Credentials and copy fields
   - Proxy URL
   - Upstream secret
   - Original upstream
5. Guard guide
   - Reuse upgraded `UpstreamGuardGuide`
6. Archive/delete actions
   - Visually separated as destructive operations.

Acceptance:

- API detail explains current readiness.
- Verification state is understandable.
- Destructive actions are clear and contained.

## Phase 13: Legacy Generator Cleanup

Goal: keep the old generator available without letting it define the product.

Tasks:

1. Move nav label to `Legacy generator`.
2. Add restrained notice that it is legacy tooling.
3. Retheme page with shared tokens.
4. Avoid giving it visual priority over paid endpoint creation.

Acceptance:

- Existing functionality remains.
- Product positioning is not confused.

## Phase 14: Final Polish And Verification

Goal: ensure the whole product feels coherent.

Checklist:

- `npm --prefix frontend run build`
- Desktop screenshots:
  - Landing 1440
  - Dashboard 1440
  - Create paid endpoint 1440
  - API detail 1440 if data exists
- Mobile screenshots:
  - Landing 390
  - Dashboard 390
  - Create paid endpoint 390
- Check no horizontal scroll.
- Check no text overlap.
- Check focus states and keyboard navigation.
- Check icon-only buttons have accessible labels.
- Check reduced-motion path.
- Check loading, empty, error, and unauthenticated states.
- Check wallet/Freighter flows remain intact as much as local environment allows.

## 6. Recommended Implementation Order

Do not refactor everything in one huge pass. Recommended sequence:

1. Design foundation and shared primitives.
2. Landing hero only.
3. Landing proof strip.
4. Landing transformation section.
5. Landing paid-call scrollytelling.
6. Landing dashboard preview.
7. Landing setup/trust/final CTA.
8. App shell/navigation.
9. Dashboard.
10. Create paid endpoint flow.
11. API detail.
12. Legacy generator.
13. Final polish and verification.

Each step should end with:

- Build check when code changed enough to matter.
- Desktop screenshot.
- Mobile screenshot for responsive sections.
- A short visual critique before moving on.
- A scoped git commit after the phase acceptance criteria pass.

## 7. Phase Quality Gate And Commit Protocol

Every phase must pass a quality gate before moving to the next phase. The gate is intentionally stricter for visual work because this refactor is about perceived product quality, not just code correctness.

### Required Gate For Every Phase

1. Implementation scope is complete for the phase.
2. `npm --prefix frontend run build` passes unless the phase only changes planning docs.
3. The affected routes are opened in a real browser.
4. Desktop screenshot is captured.
5. Mobile screenshot is captured when the changed UI is visible on mobile.
6. Screenshot is reviewed against the locked design brief.
7. Any visible issue is fixed before the phase is considered done.
8. Final screenshots pass review.
9. Git diff is checked for accidental/unrelated changes.
10. A scoped commit is created for that phase only.

### Browser Verification Workflow

Default browser verification tool: Playwright.

Reason:

- The repo already includes Playwright.
- It is reliable for Vite/React browser checks.
- It can capture screenshots and inspect DOM state without adding another test stack.

Selenium can be used if explicitly required later, but Playwright should be the default screenshot/evaluation tool for this project.

Recommended commands:

```bash
npm --prefix frontend run build
npm --prefix frontend run dev
./frontend/node_modules/.bin/playwright screenshot --viewport-size=1440,1100 http://localhost:5173 output/playwright/<phase>-desktop.png
./frontend/node_modules/.bin/playwright screenshot --viewport-size=390,844 http://localhost:5173 output/playwright/<phase>-mobile.png
```

If the Vite port differs, use the actual local URL.

### Screenshot Evaluation Checklist

For every screenshot, check:

- Does the section communicate the intended product message in under 3 seconds?
- Does it match the locked premium developer/fintech direction?
- Is PayGate's purple used as an accent rather than the entire visual identity?
- Is the layout clean without nested cards or generic SaaS blocks?
- Does text fit in all containers?
- Are buttons, status chips, URLs, and metrics readable?
- Is mobile layout intentional rather than merely squeezed?
- Are important elements aligned and spaced precisely?
- Is motion useful to understanding the product?
- Is the static screenshot still strong without relying on animation?
- Are there any decorative effects that feel like generic AI design?
- Are empty/loading/error states still coherent if the phase touches app UI?

If any answer is weak, iterate before committing.

### Commit Rules

Commit after every completed phase.

Commit format recommendation follows conventional commit style:

```txt
<type>: <short scope/action>
```

Preferred types:

- `feat`: new user-facing UI, page section, workflow, or interaction.
- `refactor`: structural UI/code changes without changing product behavior.
- `style`: visual polish, tokens, spacing, typography, and non-functional styling.
- `fix`: bug fix found during verification.
- `chore`: dependency, tooling, or repo maintenance.
- `docs`: planning or documentation updates.

Examples:

```txt
style: add PayGate design foundations
feat: refactor landing hero
feat: add landing proof strip
refactor: introduce app workspace shell
```

Commit discipline:

- Stage only files touched for the phase.
- Do not include screenshot artifacts unless requested.
- Do not include unrelated untracked files.
- Do not mix multiple phases in one commit.
- If a phase requires a dependency, include the package file changes in that phase commit.
- If verification discovers follow-up fixes, include them before the phase commit.

### Recommended Commit Message Per Phase

These are draft commit messages and can be corrected before implementation:

| Phase | Scope | Recommended commit message |
| --- | --- | --- |
| Phase 0 | Baseline and screenshots | `chore: capture UI refactor baseline` |
| Phase 1 | Design foundations | `style: add PayGate design foundations` |
| Phase 2 | Landing hero | `feat: refactor landing hero around paid API flow` |
| Phase 3 | Landing proof strip | `feat: add paid endpoint proof strip` |
| Phase 4 | Landing transformation section | `feat: add API to paid endpoint transformation section` |
| Phase 5 | Paid-call scrollytelling | `feat: add paid call lifecycle storytelling` |
| Phase 6 | Dashboard preview section | `feat: add landing dashboard preview` |
| Phase 7 | Developer setup section | `feat: add developer setup and guard section` |
| Phase 8 | Personas, trust, CTA | `feat: add landing trust and conversion sections` |
| Phase 9 | App shell and navigation | `refactor: introduce PayGate workspace shell` |
| Phase 10 | Dashboard refactor | `refactor: redesign API revenue dashboard` |
| Phase 11 | Create paid endpoint flow | `feat: redesign create paid endpoint flow` |
| Phase 12 | API detail refactor | `refactor: redesign API detail lifecycle view` |
| Phase 13 | Legacy generator cleanup | `refactor: demote legacy generator UI` |
| Phase 14 | Final polish and verification | `style: polish PayGate UI refactor` |

## 8. Dependency Recommendations

### Add

- `gsap`
- `@gsap/react`

Reason:

- The desired site direction explicitly uses GSAP-style storytelling.
- Only the landing hero and paid-call scrollytelling need it.
- It avoids inventing complex scroll animation logic by hand.

### Avoid For Now

- Charting library, unless dashboard data visualization becomes more complex.
- Framer Motion, unless we decide GSAP is not enough.
- 3D/WebGL libraries.
- Heavy component libraries that fight the current custom visual direction.

## 9. Technical Risks

### Risk: Inline Style Refactor Becomes Too Large

Mitigation:

- Create primitives first.
- Migrate one page/section at a time.
- Do not rewrite all pages in a single commit/pass.

### Risk: Landing Animation Becomes Decorative

Mitigation:

- Every animation must correspond to a real payment lifecycle state.
- If an animation does not teach the product, remove it.

### Risk: Product Overclaims Simplicity

Mitigation:

- Keep "paste API URL" as the headline promise.
- Still clearly explain upstream protection with `X-PayGate-Secret`.

### Risk: Dashboard Needs Data That API Does Not Provide

Mitigation:

- Use existing `/api/dashboard/summary` fields first.
- Do not design unavailable per-API analytics unless we also add backend support.

### Risk: Wallet Flow Hard To Test Locally

Mitigation:

- Preserve existing auth and withdraw logic.
- Verify non-wallet states locally.
- Do manual wallet test when browser extension/session is available.

## 10. Decisions Needed Before Coding

These are the only decisions I would discuss before starting implementation:

1. Typography source
   - Safe option: Google/local fonts such as `DM Sans` or `IBM Plex Sans`.
   - Premium option: `Satoshi` or `General Sans` if external font loading is acceptable.
   - Recommendation: start with `DM Sans` + `JetBrains Mono` for reliable implementation, then upgrade if needed.

2. GSAP dependency
   - Recommendation: add `gsap` and `@gsap/react`.
   - Use only for hero sequencing and the paid-call lifecycle section.

3. Navigation model
   - Recommendation: marketing page gets a compact top nav; app gets a Linear-like workspace shell.
   - App shell can use a slim sidebar on desktop and top/bottom compact nav on mobile.

4. Product naming
   - Recommendation: use `Create paid endpoint` as the primary action.
   - Keep route `/apis/new` unless there is a reason to rename routes.

5. Hero concept source of truth
   - Recommendation: treat the generated image as a visual reference, not a pixel-perfect target.
   - Implement with real responsive components so it stays maintainable.

## 11. Definition Of Done

The refactor is successful when:

- The landing hero instantly communicates PayGate's product promise.
- The page explains the API monetization lifecycle without sounding like a generic AI tool.
- The dashboard feels like a real operating workspace.
- The create endpoint flow feels as easy as Bitly/Linktree, while still honest about API protection.
- Status, payment, escrow, and revenue states are visually distinct.
- The UI uses PayGate's purple as a brand accent, not the whole personality.
- The experience works on mobile without overlap or cramped text.
- The build passes.
- Key pages are screenshot-verified.
- There is no terminal-first hero, heavy 3D, decorative blob background, or hackathon tone.
