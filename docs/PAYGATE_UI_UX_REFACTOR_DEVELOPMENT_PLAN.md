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
- No GSAP dependency is currently installed.

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

- The landing page leans toward generic purple/cyan AI SaaS: gradient headline, terminal hero, shimmer, dot-grid, and decorative motion.
- The hero explains code more than the business transformation. It should instead show ordinary API URL -> paid endpoint -> paid call -> revenue.
- `Landing.jsx` and `Dashboard.jsx` are too monolithic for a controlled premium refactor.
- The dashboard has useful data, but the layout feels like cards on a page instead of an operational workspace.
- "Register API" sounds technical and passive. The desired product action is closer to "Create paid endpoint".
- The legacy generator still exists and should be visually demoted so it does not confuse V1 positioning.
- Current color tokens are too limited for semantic product states.
- Current motion is decorative in places. New motion should teach the paid API lifecycle.

### Current UI Strengths To Preserve

- Product logic is already real enough to support a serious interface: APIs, requests, payments, escrow, withdrawals.
- `UpstreamGuardGuide` captures a crucial product truth: the developer must protect the upstream API with `X-PayGate-Secret`.
- `CopyButton`, `ApiStatusBadge`, and `ValueRow` are useful primitives that can be upgraded rather than discarded.
- Brand mark assets already exist under `frontend/public/brand`.
- Dashboard API response already contains the right operational concepts: total APIs, calls, revenue, escrow, requests, payments, withdrawals.

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
- Scroll section reveals the paid-call lifecycle.
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

## Phase 3: Landing Proof Strip

Goal: immediately prove the product mechanics after the hero.

Section content:

```txt
Original API URL       -> paid proxy URL
Unpaid request         -> 402 Payment Required
Paid MPP request       -> 200 OK
Successful call        -> escrow split and withdrawable revenue
```

Design:

- Dense horizontal strip on desktop.
- Compact stacked proof cards on mobile.
- Use semantic status chips, not decorative cards.

Acceptance:

- Reinforces product truth without long explanation.
- Helps users understand PayGate is not just a landing page promise.

## Phase 4: Landing Transformation Section

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

## Phase 5: Landing Paid-Call Scrollytelling

Goal: use GSAP for one memorable product story section.

Section concept:

Pinned or semi-pinned paid-call lifecycle:

1. Agent calls proxy endpoint.
2. Proxy returns `402 Payment Required`.
3. Agent pays using Stellar MPP.
4. PayGate verifies payment.
5. PayGate forwards upstream with `X-PayGate-Secret`.
6. API response returns.
7. Revenue is logged and withdrawable.

Implementation:

- Use GSAP ScrollTrigger after adding `gsap`.
- Keep duration short and controlled.
- Do not scroll-jack the whole page.
- On mobile, use stacked static steps or simpler scroll reveal.
- On reduced motion, show all steps.

Acceptance:

- The animation teaches the payment lifecycle.
- It feels premium, not gimmicky.
- It remains understandable if animation is disabled.

## Phase 6: Landing Dashboard Preview

Goal: show PayGate as an operational product.

Content:

- API registry preview.
- Paid call volume.
- Gross revenue.
- Developer revenue.
- Platform fee.
- Escrow withdrawable balance.
- Recent request/payment rows.

Design:

- Use a realistic product screenshot-like composition, but built from components.
- Avoid fake chart overload.
- If a chart is needed, use a small SVG line/area chart first.

Acceptance:

- Users can imagine operating revenue from this product.
- Feels like a real dashboard, not marketing decoration.

## Phase 7: Landing Developer Setup Section

Goal: be honest and credible about integration.

Content:

- Generated proxy URL.
- API secret.
- Upstream guard snippet.
- Direct upstream request without secret -> `401`.
- Proxy unpaid request -> `402`.
- Proxy paid request -> `200`.

Design:

- Use compact code snippets and copy fields.
- Keep terminal styling subtle, not hero-level.

Acceptance:

- The setup burden is clear but not intimidating.
- Protecting the upstream API is treated as a first-class product step.

## Phase 8: Landing Personas, Scope, Trust, CTA

Goal: finish the page with clarity and launch confidence.

Personas:

- Indie API builders.
- Startup API owners.
- AI agent developers.
- Developers monetizing endpoints.

Scope/trust:

- Stellar MPP.
- Soroban escrow.
- Testnet beta if still true.
- REST/JSON API scope if still true.
- Pay-per-call API access.

Final CTA:

- `Create paid endpoint`
- Secondary link: `View docs` or `Open dashboard`

Acceptance:

- No hackathon language.
- No overclaiming production readiness beyond actual state.
- CTA matches the actual product action.

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
