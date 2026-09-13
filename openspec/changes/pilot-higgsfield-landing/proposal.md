# Pilot the Higgsfield landing direction

Owner-approved scope, 13 September 2026; tracked in [issue #5](https://github.com/wildanniam/paygate-stellar/issues/5). The earlier eight-section concept requires a small acceptance pilot before further asset spend.

Add `/design-preview` with two sections: a dark two-panel hero and one weather API example. Preserve `/` and the existing application. Design, media limits and simulation behavior are recorded in `frontend/DESIGN.md`; implementation evidence and remaining review items are in `docs/design/landing-pilot.md`.

Spec delta: the preview SHALL be a separate lazy route. It SHALL show Public Stellar Testnet beta and label the sample as a simulation. The sample SHALL require an explicit second click to simulate payment, and credit SHALL precede forwarding. The sample SHALL NOT contact payment/API services. Reset SHALL invalidate prior callbacks. Playback SHALL NOT determine sample completion; reduced motion and media failure SHALL retain working controls and a still visual. Request/response tabs SHALL support keyboard input. The pilot SHALL NOT replace the current homepage or authorize further generation.

Implementation tasks: separate route, two-section UI, four shipped media files, cancellable simulation, media fallbacks, keyboard/copy states, responsive checks, build and state tests are complete. Owner creative review, remaining sections and live release are pending and outside this implementation.
