> **Superseded by owner feedback later on 13 September 2026.** The owner rejected sections 2 and 3 as too plain and text-heavy. See [Visual storytelling revision](visual-story-revision.md) for the replacement, assets and current verification. Earlier acceptance/proposals below are historical. The new revision awaits feedback.

# Setup journey — 13 September 2026

The owner accepted the API capabilities section (`98375fb`) and authorized exactly one next section. `/design-preview` now adds “From URL to paid endpoint.” Hero and capabilities are accepted; **this setup section awaits its own visual feedback**. Issue #5 / draft PR #6 track the incremental work. No homepage replacement, production release or backend change.

## Reference synthesis

- [Circular](https://rbp-saas-template.vercel.app/): its rendered “How it works” section uses a calm dark band, left-aligned introduction and a connected timeline. Adopted that change in rhythm after the capabilities grid; did not copy its enterprise onboarding copy or long scroll spacing.
- [Agentframe quickstart](https://rbp-agentframe-template.vercel.app/#quickstart): the previously inspected step/code pairing informed one changing preview alongside the selected instruction.
- [Cloudlight capabilities](https://rbp-cloudlight-template.vercel.app/#capabilities): the previously inspected product visuals reinforced showing the actual task rather than unrelated decoration.

One wide dark-plum section replaces another card grid. A three-step timeline sits beside a native setup workspace. Fine linework and a localized violet wash frame the workspace. The scene changes with a short fade/5px shift; no autoplay carousel or continuous background animation is added. Existing Higgsfield assets stay intact. **No new generation, media weight or dependency** for this native setup interaction.

## Content and product truth

1. **Register your API:** connect Freighter, supply an existing GET/JSON endpoint and price. The example remains pending setup.
2. **Add the guard:** store the generated secret server-side. A small Express middleware excerpt rejects missing/mismatched secrets before `next()`. It is labelled an excerpt, not a complete application or an executed integration.
3. **Verify & share:** a local example rejects an invalid secret, accepts the correct one and shows an illustrative paid endpoint. No API is registered or contacted.

Sources checked in this branch: `frontend/src/pages/RegisterApi.jsx`, `frontend/src/pages/ApiDetail.jsx`, `api/apis/[apiId]/verify.js`, `api/upstream/market-signal.js`, and `docs/demo-upstream-api.md`. Actual verification sends an invalid-secret probe, requires it to fail, then requires the correct-secret probe to succeed before activating the API. The example 401/200 statuses match the demo upstream. Demo timings (700ms and 900ms) are storytelling durations, not a latency claim.

## Interaction and accessibility

Native vertical tabs use selected state, roving `tabIndex`, ArrowUp/ArrowDown, Home/End and associated tabpanels. Only one panel is exposed at a time. The workspace also has previous/next controls so mobile users can continue without returning to the timeline. Local verification has busy and completed states, retains action focus, guards duplicate activation, supports replay, and clears timers when changing steps or unmounting. One polite status region reports the outcome.

Phones stack the timeline and workspace; only the selected step's description is visible. Code remains native and can wrap without horizontal overflow. Controls have at least 44px targets. Global manual motion-off and OS reduced-motion styles suppress scene/spinner animation while keeping the example functional.

## Verification

- Frontend production build passes; all five existing hero simulation tests pass. No new backend/security implementation was introduced.
- Browser visuals checked at 1440×1000, 835×950, 390×844 and 320×740; no document or code overflow. Small-screen controls measured at least 44px high. All three preview states were inspected across desktop/mobile.
- Step selection, next/back, ArrowDown, Home/End, roving tab stops, one visible tabpanel, and action focus retained through verification were checked.
- Invalid-secret 401 then correct-secret 200 completion, replay, and switching away during replay followed by returning to an idle verification state were checked.
- Manual motion-off shows `animation: none`, paused hero video and a completed local verification. A selector targeting the short-lived busy button timed out before a duplicate-key test could run; duplicate activation prevention is source-reviewed, not claimed as a successful browser double-input test.
- Setup guide destination matches the existing public repository document. No wallet/API operation was attempted.
- Browser log shows only the two existing React Router future notices and no new runtime error.
- OS reduced motion is inherited and source-reviewed; no browser preference emulation or physical-device performance benchmark is claimed.

Visual acceptance remains the owner's next decision. Further sections and release need another instruction.
