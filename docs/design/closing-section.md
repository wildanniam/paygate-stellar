# Closing section — owner lock, 14 September 2026

## Scope and visual target

Wildan explicitly accepts the closing study and asks for implementation that matches it. Add the closing composition after the four existing sections on `/design-preview`, issue #5 / draft PR #6. No homepage replacement or UI merge.

Target: CTA left, four thin FAQ rows right, oversized violet PayGate wordmark below and small footer. The reviewed study is `paygate-closing-direction.html` in the thread's visualization directory. The implementation scales this composition to the existing landing, retaining DM Sans, the primary button family and dark/violet palette. Mobile stacks CTA → FAQ → wordmark → links. This is a closing decision surface, not another product demo.

## Content and controls

- “Ready for your first paid call?” → Create paid endpoint routes to `/apis/new`; the existing wallet-required screen handles the next step.
- Setup guide and footer Docs point to the existing `docs/developer-guide.md` on GitHub; GitHub points to the repository.
- Public Stellar Testnet beta stays visible beside the conversion path.
- Four prerequisites/limitations: existing GET/JSON API and server guard; MPP-compatible client and testnet USDC; testnet rather than mainnet; credited payment can precede upstream failure, with no automatic V1 refund.
- FAQs start closed. Native Enter/Space/click toggles one answer, closing the previous one. Each button exposes `aria-expanded` and `aria-controls`; collapsed answers are hidden/inert. Focus stays on the triggering button.

Copy is grounded in `docs/developer-guide.md`, `PAYGATE_V1_PRODUCT_SPEC.md` §11 and `PAYGATE_V1_DEMO_GUIDE.md` known limitations. No real request, wallet or payment action runs from this section.

## Artwork and motion

Reproduce the approved native finish: precise text with a subtle fine-line overlay and violet/lavender light within the lettering. No video, canvas, new package or new asset download. Higgsfield was optional in the approved proposal; visual inspection did not reveal a need to replace the accepted finish. **0 additional credits.**

Fine-pointer movement positions the light between 10–90%; leaving returns it to 45%. Time-based easing keeps the response consistent across refresh rates. The frame loop only runs until settled. IntersectionObserver and document visibility disable listeners/frames offscreen or while hidden. Cleanup cancels frames and removes listeners; route changes and React StrictMode can remount safely. Global motion-off and OS reduced motion retain the static wordmark. Touch needs no hover. The typography never deforms.

CTA uses existing hover lift, arrow translation and press feedback; FAQ opens in 240ms with plus→minus. Motion-off removes transitions without changing content or control availability. All closing links/buttons are at least 44px high. Text falls back to solid lavender if background-clip is unavailable; forced-colors mode keeps solid system text.

## Reference interpretation

- [Circular](https://rbp-saas-template.vercel.app/): distinct final composition and textured image surface.
- [Agentframe](https://rbp-agentframe-template.vercel.app/): small native geometric hover movement.
- [Cloudlight](https://rbp-cloudlight-template.vercel.app/): restrained depth behind simple CTA controls.
- [Koderea](https://www.koderea.id/): clear change in rhythm toward the end.

Observed references informed the approved study. No reference source, artwork, palette or commercial claims are copied.

## Verification

- Production frontend build passes on Node 24.18.0.
- All 13 existing simulation, receipt, pointer math and renderer lifecycle tests pass.
- Browser: 1440×1000 desktop, 835×950 tablet, 390px and 320px phones. No horizontal document or wordmark overflow at inspected widths; open answers remain readable.
- Enter/Space open FAQs; changing question closes the old answer. Expanded/hidden accessibility states and retained focus checked.
- Pointer light visibly updates (observed 81.19%) and returns to neutral (45.05%). Global motion-off leaves the light neutral and FAQ transition at 0s; FAQ still opens. Resume works.
- CTA actually navigates to `/apis/new` and the existing wallet-required screen. No wallet connection attempted.
- Desktop/mobile screenshots saved in the thread's visualization directory as `paygate-closing-desktop.png` and `paygate-closing-mobile.png` for owner review. Browser logs observed extension-origin MetaMask warnings; these are not emitted by the closing component.
- `git diff --check` passes.

OS reduced-motion, document-hidden/offscreen cleanup and forced-colors fallback are source-reviewed; no physical-device GPU measurement or screen-reader speech test. The new visual still awaits feedback on the assembled landing. PR remains draft/unmerged.
