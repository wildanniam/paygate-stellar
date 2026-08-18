# PayGate Landing Reference Contract

This contract records the useful design intent from the supplied light and dark concept images. The images are visual references, not runtime assets and not a requirement to reproduce invented product claims.

## Reference Evidence

- `paygate-reference-light.png`: 1491 x 1055
- `paygate-reference-dark.png`: 1491 x 1055

## Composition Contract

- The first viewport has a quiet, compact navigation bar, a left product statement, and a large right-side revenue workspace.
- The headline is split into a high-contrast sentence and a purple emphasis line: `Paste an API URL.` followed by `Charge per call.`
- The right workspace is a real interface preview built from DOM, SVG, and CSS layers. It is not a screenshot or a background image.
- The workspace has three visible depth planes behind the front surface, with distinct offsets, borders, shadows, and translucency.
- The bottom edge of the first viewport reveals the beginning of one connected flow board: source API, PayGate gate, paid endpoint, payment states, and revenue split.
- The flow board is a single story, not unrelated feature cards.
- The mobile composition becomes a deliberate vertical story. No fixed desktop board is allowed to overflow horizontally.

## Visual Contract

- Light mode uses a near-white canvas, pale lavender planes, dark navy text, and restrained purple accents.
- Dark mode uses a near-black canvas, blue-black surfaces, bright text, and the same purple accent system.
- Both modes preserve the same geometry and hierarchy; only surface treatment and contrast change.
- The hero workspace reads as a tilted glass panel with a visible front face, a soft edge highlight, a chart grid, chart line, metrics, and an operational footer.
- Background geometry is sparse: a grid, a few circuit-like lines, and controlled glow. No decorative blobs or generic gradient orbs.
- Product copy must distinguish illustrative/testnet data from live customer data. Do not claim fake users, production volume, or real revenue.

## Interaction Contract

- Pointer movement over the workspace changes its depth variables smoothly. Rear, middle, and front planes use different parallax factors.
- Pointer exit eases the workspace back to its resting pose. Keyboard focus and touch do not depend on hover.
- The range control changes the chart points, labels, tooltip, and active point. It is a real compact menu/segmented control.
- Chart points are keyboard reachable and expose their selected value.
- Pause stops the illustrative chart cycle and surface float. Reduced-motion users receive a stable state.
- Endpoint copy buttons provide a scoped success/error state without altering the URL or route.
- Flow outcomes are a small inspectable state machine: request received, `402 Required`, `MPP Paid`, and `200 OK`. Users can select/replay the states.
- Flow state changes update status emphasis and connector activity rather than only changing a label.
- Primary CTAs retain the existing real routes: `/apis/new`, `/dashboard`, and the `#how-it-works` anchor.

## Regression Contract

- `/`, `/dashboard`, `/apis/new`, and `/apis/:apiId` remain routable and refreshable.
- The landing page has no horizontal overflow at 1366 x 900, 390 x 844, and a narrow 320px mobile width.
- Unauthenticated app routes retain friendly wallet-login states.
- The landing build has no runtime errors, and browser smoke still covers both desktop and mobile.
- Visual audit output records screenshots, bounding-box geometry, motion deltas, and interaction assertions under `docs/evidence/landing-reference/latest/`.
