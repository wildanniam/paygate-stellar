# PayGate Landing Fix Verification

Date: 2026-06-28
Surface: `/` landing page

## Fixed

1. Hero CTA buttons now render visibly after the GSAP intro animation on desktop and mobile.
2. Desktop nav active state now follows the landing page document order:
   - `#how-it-works` -> How it works
   - `#protected-calls` -> Security
   - `#proof`, `#workspace`, `#features` -> Product
3. Mobile now uses a single-line header with a menu button; section links and secondary actions live inside an on-demand menu panel.
4. Mobile anchor targets use a larger scroll offset to avoid landing under the sticky nav after the menu closes.
5. Informational cards/steps are no longer added to the keyboard tab order.
6. The mobile header no longer shows a second purple CTA; the primary purple CTA is reserved for the hero.

## Evidence

- `17-fix-desktop-hero.png` - desktop hero after the fix
- `18-fix-mobile-hero.png` - mobile hero after the fix
- `27-mobile-menu-final-offset-closed.png` - final mobile closed header at 390 x 844
- `28-mobile-menu-final-offset-open.png` - final mobile open menu at 390 x 844
- `26-mobile-menu-final-320-open.png` - final narrow mobile open-menu check at 320 x 844

## Verification

- `npm run build` passed from `frontend/`.
- Browser check passed for CTA visibility on desktop and mobile.
- Browser check passed for active nav states on `#how-it-works`, `#protected-calls`, `#proof`, `#workspace`, and `#features`.
- Browser check found no horizontal overflow on mobile.
- Browser check found no non-action card tab stops.
- Browser check passed for mobile menu open/close state, Flow anchor click, and menu close-after-navigation behavior.
- Browser check confirmed the Flow target lands 21px below the sticky nav after menu close.
- Console output only showed React Router v7 future-flag warnings.

## Not Changed

- The repeated section-label pattern from the P3 finding was left as a taste/copy pass for a later polish round, because it is not a functional regression.
