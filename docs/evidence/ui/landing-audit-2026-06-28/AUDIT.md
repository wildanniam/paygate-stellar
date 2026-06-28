# PayGate Landing Page Audit

Date: 2026-06-28
Surface: `/` landing page
Local URL: `http://127.0.0.1:5173/`
Register: brand/product hybrid for API infrastructure

## Evidence

- `01-desktop-1440x900.png` - desktop hero viewport
- `03-mobile-390x844.png` - mobile hero viewport
- `05-desktop-how-it-works.png` / `09-mobile-how-it-works.png`
- `06-desktop-protected-calls.png` / `10-mobile-protected-calls.png`
- `07-desktop-proof.png` / `11-mobile-proof.png`
- `08-desktop-workspace.png` / `12-mobile-workspace.png`
- `13-desktop-features-cta.png` / `14-mobile-features-cta.png`
- `15-desktop-hero-recheck.png` / `16-mobile-hero-recheck.png`

## Flow Health

1. Hero: strong concept, but CTA buttons are hidden by animation state. Health: needs fix.
2. How it works: strong mechanism demo and clear monetization transformation. Health: good.
3. Protected calls: strong security explanation; mobile stack is understandable. Health: good.
4. Receipt proof: strongest trust section; specific request/payment/revenue evidence. Health: good.
5. Workspace preview: credible dashboard preview and good product specificity. Health: good.
6. Audience/final CTA: useful segmentation and strong closing action. Health: good, with mobile fold caveat.

## Findings

### P1 - Hero CTA Buttons Are Invisible

The hero contains two CTA buttons in `Landing.jsx`, but the rendered buttons have `opacity: 0` and `visibility: hidden` after the page settles. The nav CTA is visible, but the primary hero conversion row is not visible on desktop or mobile.

Evidence: `15-desktop-hero-recheck.png`, `16-mobile-hero-recheck.png`.

Likely source: `frontend/src/pages/Landing.jsx` hero intro animation targets `.paygate-hero-actions .pg-button` with `autoAlpha` at lines 600-604. Use `fromTo` with explicit visible end state and `clearProps: 'opacity,visibility,transform'`, or remove the button-specific intro animation and animate the parent container instead.

### P1 - Navbar Active State Sticks On Security

Below the security section, the desktop nav continues to show `Security` as active on `#proof`, `#workspace`, and `#features`. This makes the page feel less polished and weakens orientation.

Evidence: `07-desktop-proof.png`, `08-desktop-workspace.png`, `13-desktop-features-cta.png`.

Likely source: `MarketingNavbar.jsx` builds `sectionIds` from nav order, then scans it in reverse at lines 23-38. Because `protected-calls` is last in that array and remains above the viewport after scrolling past it, it wins for every lower section. Fix with a document-order section map, an IntersectionObserver, or explicit ranges that map proof/workspace/features to the correct nav bucket.

### P2 - Mobile Long Page Has No Section Navigation

On mobile, `.paygate-nav-center` and `.paygate-nav-secondary` are hidden, leaving only logo and `Create paid endpoint`. The page is long, so users lose quick access to Product, How it works, Security, Docs, and Dashboard.

Evidence: mobile screenshots from hero through final CTA.

Recommendation: add a compact menu or a horizontally scrollable section nav. Keep the primary CTA visible.

### P2 - Anchor Offset Shows Previous Section On Mobile

The `#how-it-works` mobile screenshot starts with a clipped piece of the previous hero revenue row before the actual section heading. This is small, but it feels like a capture/scroll-position mismatch when using nav anchors.

Evidence: `09-mobile-how-it-works.png`.

Likely source: section `scroll-margin-top` around `components.css` lines 2357-2363 and 5437-5441. Re-tune mobile anchor offset against the sticky nav height.

### P2 - Non-Action Cards Are In The Tab Order

Several visual cards and steps use `tabIndex={0}` only to trigger visual hover/focus states. This creates a long keyboard path with focusable elements that do not perform actions.

Examples: `Landing.jsx` lines 934-941, 1115-1120, 1139-1144, 1158-1163, 1276-1280, 1326-1330, 1359-1363.

Recommendation: remove `tabIndex` from informational cards, or give them real interactive semantics and keyboard behavior only when they perform an action.

### P3 - Repeated Section Label Pattern Is Slightly Template-Like

The page uses repeated small uppercase labels for every major section. It is not fatal because the mechanism is specific, but `PRODUCT.md` explicitly lists repeated tiny uppercase section labels as an anti-reference.

Recommendation: keep labels only where they add clarity, and let a few sections use stronger product language or visual object labels instead.

## Checks

- Desktop viewport checked at 1440 x 900.
- Mobile viewport checked at 390 x 844.
- No horizontal overflow detected at either viewport.
- One H1 detected.
- Reduced-motion CSS rule exists.
- `npm run build` passed.
- Console output had React Router v7 future-flag warnings only; no fatal landing errors observed.

## Recommended Fix Order

1. Fix hidden hero CTAs.
2. Fix navbar active-section logic.
3. Add mobile navigation affordance.
4. Re-tune anchor scroll margin.
5. Remove non-action focus stops.
6. Do one final copy/taste pass on repeated section labels.
