# PayGate UI Refactor - Phase 2 Hero Interactions

Date: 2026-06-22

## Interaction Direction

Hero motion should communicate the PayGate product model, not decorate the page. The interaction language is an operational API flow:

- Source API pill represents the user's upstream endpoint.
- PayGate node represents verification, proxying, and control.
- Paid endpoint pill represents the generated monetized API URL.
- Lifecycle chips represent the request outcome: `402 Required`, `MPP Paid`, `200 OK`.
- Revenue and dashboard preview represent monetization proof after a successful paid call.

The intended feel is close to a premium developer tool diagram: calm, precise, responsive, and useful.

## Implemented Effects

- URL pills are real buttons with copy-to-clipboard behavior.
- Copy feedback appears inline as `Copy`, `Copied`, or `Error`.
- Hover/focus on the source pill activates the inbound request path.
- Hover/focus/click on the paid endpoint activates the outbound path, success state, revenue split, and dashboard preview.
- Hover/focus/click on lifecycle chips highlights their respective status state.
- PayGate node has a restrained hover/focus glow and matrix expansion.
- Connector lines use lightweight CSS animation for dashed flow and request packets.
- Reduced-motion users get transitions and looping animations disabled.

## Acceptance Criteria

- The hero still matches the locked centered content and paid API flow visual direction.
- Interactive affordances are visible without adding instructional copy.
- Click-to-copy works for both source API and paid endpoint examples.
- Hover/focus states make the flow easier to understand.
- No text overlap in desktop or mobile screenshots.
- Build passes.

## Verification

- `npm --prefix frontend run build` passed.
- Desktop idle screenshot: `output/playwright/paygate-hero-interactive-idle-1440x900.png`
- Desktop proxy hover screenshot: `output/playwright/paygate-hero-interactive-proxy-hover-1440x900.png`
- Desktop copied screenshot: `output/playwright/paygate-hero-interactive-proxy-copied-1440x900.png`
- Desktop MPP hover screenshot: `output/playwright/paygate-hero-interactive-mpp-hover-1440x900.png`
- Mobile screenshot: `output/playwright/paygate-hero-interactive-mobile-390x844.png`

Notes:

- Browser console still reports the existing dev-mode React Router future warnings and `favicon.ico` 404. These are unrelated to the hero interaction work.
