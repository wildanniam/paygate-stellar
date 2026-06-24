# PayGate App UI Impeccable Final Plan

Date: 2026-06-24

Scope: app/product pages outside the landing page, plus reconciliation with the older landing handoff.

## Why This Exists

The previous app UI QA used Impeccable source scanning and Playwright screenshots, but it did not run Impeccable inside the rendered browser. This document closes that gap.

The result is not "rewrite everything." The app refactor is directionally much better than the old console UI. The remaining issues are concentrated in rendered contrast, mobile data presentation, post-submit viewport behavior, and the two legacy generator pages that still do not fully belong to the new PayGate system.

## Audit Method

Rendered pages were opened in Playwright against the local Vite app at `http://127.0.0.1:5173`.

Impeccable browser detector was injected into each page and run with:

```js
window.impeccableDetectAsync({
  visualContrast: true,
  visualContrastMaxCandidates: 35,
  scrollOffscreen: false
})
```

Source scan was also run against app pages/components/styles:

```txt
node .claude/skills/impeccable/scripts/detect.mjs --json \
  frontend/src/pages/Dashboard.jsx \
  frontend/src/pages/RegisterApi.jsx \
  frontend/src/pages/ApiDetail.jsx \
  frontend/src/pages/Generate.jsx \
  frontend/src/pages/Result.jsx \
  frontend/src/components/AppNavbar.jsx \
  frontend/src/components/WalletLoginPanel.jsx \
  frontend/src/components/UpstreamGuardGuide.jsx \
  frontend/src/components/CodeBlock.jsx \
  frontend/src/components/ui \
  frontend/src/styles/components.css
```

Source result:

```txt
0 findings
```

Rendered evidence:

```txt
output/impeccable/app-pages/summary.json
output/impeccable/app-pages/source-scan.json
output/playwright/impeccable-app-dashboard-unauth-desktop.png
output/playwright/impeccable-app-dashboard-auth-desktop.png
output/playwright/impeccable-app-dashboard-auth-mobile.png
output/playwright/impeccable-app-create-form-desktop.png
output/playwright/impeccable-app-create-success-desktop.png
output/playwright/impeccable-app-create-success-viewport-after-submit.png
output/playwright/impeccable-app-detail-pending-desktop.png
output/playwright/impeccable-app-detail-active-desktop.png
output/playwright/impeccable-app-legacy-generate-desktop.png
output/playwright/impeccable-app-legacy-result-desktop.png
```

## Rendered Impeccable Summary

| State | Findings | Main Types |
| --- | ---: | --- |
| Dashboard unauth desktop | 27 | low contrast, palette/glow, page-level heuristics |
| Dashboard auth desktop | 61 | semantic color contrast, cyan status colors, glow |
| Dashboard auth mobile | 61 | same as desktop plus visible table density issue |
| Create form desktop | 24 | line length, preview contrast, glow, palette |
| Create success desktop | 26 | post-submit viewport, guard-card contrast, glow |
| Detail pending desktop | 31 | guard-card contrast, destructive-card contrast, glow |
| Detail active desktop | 29 | guard-card contrast, destructive-card contrast, glow |
| Legacy generate desktop | 16 | old layout, thin-border/wide-shadow, Inter/inline style |
| Legacy result desktop | 24 | old layout, mixed copy language, code page hierarchy |

## Important Interpretation

Some Impeccable results are page-level or heuristic false positives:

- `gradient-text` appears on `body` for every route, but no app page headline is visibly using gradient text.
- `layout-transition: height` appears on `body` for every route and is not tied to an obvious app-page interaction defect.
- `repeating-stripes-gradient` appears globally because landing CSS is loaded with app CSS.
- `theater-slop-phrase` appears as `"X theater"` at page level and should not be treated as a literal visible phrase until traced.

The actionable findings are:

1. Successful create endpoint flow leaves the viewport scrolled awkwardly after submit. The sticky nav visually cuts through the page headline.
2. The right-side create/detail guide cards use green/amber/red tinted panels where text is visually readable to humans, but Impeccable flags contrast because the tinted backgrounds are too strong and too broad.
3. Dashboard metric success cards and wallet panel use semantic green/purple washes too heavily; the product feels premium, but the color surfaces can be calmer.
4. Dashboard mobile still renders payment/request data as horizontally scrollable desktop tables. This is the most obvious remaining mobile demo risk.
5. `Generate.jsx` and `Result.jsx` are still legacy inline-style pages. They are intentionally demoted, but visually they still create product confusion and do not feel integrated with the app shell.
6. App-page headers repeat the uppercase mono eyebrow pattern and use long one-line support copy. It is acceptable in moderation, but it should be quieter across app surfaces.
7. Several inline styles remain in Dashboard, RegisterApi, ApiDetail, Generate, Result, and CodeBlock. They do not trigger source findings, but they make future visual consistency harder.

## Handoff Reconciliation

The old handoff in `docs/PAYGATE_UI_UX_REFACTOR_AUTONOMOUS_HANDOFF.md` is still useful for the landing page only:

- Landing Phase E: tactical anti-slop defects.
- Landing Phase F: motion and reveal hardening.
- Landing Phase G: final landing QA and docs.

It is not the current app-page plan. Since then, the app UI refactor landed through:

```txt
style: add app interface foundations
style: unify app navigation
feat: redesign dashboard overview
feat: improve dashboard operations
feat: redesign paid endpoint creation
feat: redesign endpoint control center
test: verify app ui refactor
```

So the consolidated priority should be:

1. Finish app-page rendered anti-slop polish first, because those pages are needed for demo.
2. Then return to the landing handoff phases.

## Final Development Plan

### Phase 1: Rendered App Contrast And Surface Calibration

Goal: reduce visible "neon card" and false contrast traps without losing the locked PayGate purple system.

Scope:

- Update semantic surface recipes in `frontend/src/styles/components.css`.
- Keep brand purple for primary CTAs and selected nav.
- Convert green/amber/red cards from broad color washes into dark panels with semantic border, small icon/badge accents, and subtle top-right state glow.
- Tune `.pg-app-card[data-tone='success']`, `.pg-dashboard-wallet`, `.pg-detail-control[data-status]`, `.pg-detail-danger`, `.pg-guard-card.is-primary`, warning cards, and setup checklist step dots.
- Keep text on neutral dark surfaces wherever possible.

Acceptance:

- `npm --prefix frontend run build`
- `git diff --check`
- Source Impeccable app scan remains `0`.
- Rendered Impeccable shows fewer high-confidence `low-contrast` findings on dashboard/create/detail.
- Desktop screenshots still look premium and not flattened.

Suggested commit:

```txt
style: calibrate app semantic surfaces
```

### Phase 2: Create Endpoint Success Flow Polish

Goal: after submit, the success state should land in a clean, intentional viewport.

Scope:

- In `RegisterApi.jsx`, after a successful create, scroll/focus to the result panel or reset to a stable top position.
- Add accessible focus handling for the created endpoint result.
- Ensure sticky nav no longer cuts through the headline in the post-submit state.
- Make the success panel the primary visual event, not just a side card that appears while the user remains scrolled around the submit button.
- Keep the existing two-column structure; do not redesign the flow.

Acceptance:

- Playwright create success viewport screenshot does not crop the header awkwardly.
- Keyboard focus lands on a meaningful success region or action.
- Copy paid endpoint and secret still work.
- Rendered Impeccable does not introduce new text overflow or focus issues.

Suggested commit:

```txt
fix: stabilize created endpoint success state
```

### Phase 3: Dashboard Mobile Activity Redesign

Goal: make the dashboard demo-ready on mobile.

Scope:

- Keep endpoint mobile cards as-is, since they already work.
- Replace mobile payment history and request log desktop tables with mobile cards or a compact timeline.
- Keep desktop `DataTable` for desktop.
- Payment mobile card should show time, API, gross amount, payment tx, credit tx.
- Request mobile card should show time, API, status, upstream, tx.
- Keep copy/open explorer affordances compact.

Acceptance:

- Mobile dashboard screenshot at `390x844` shows no horizontally clipped table content in payment/request sections.
- No horizontal document overflow.
- Desktop dashboard table layout remains unchanged.
- Important revenue/status data is scannable in one hand.

Suggested commit:

```txt
feat: improve mobile dashboard activity logs
```

### Phase 4: Legacy Generator Containment Or Migration

Goal: stop `/generate` and `/result` from feeling like another PayGate product path.

Recommended direction: contain them as "Legacy SOW tools" inside the app system, not as hero-like pages.

Scope:

- Replace inline styles in `Generate.jsx` and `Result.jsx` with shared app classes/components.
- Use `pg-app`, `pg-app-main`, `pg-app-header`, `Notice`, `Field`, `Input`, `Button`, `CodeBlock`, and shared panel styles.
- Reduce the giant H1 treatment. These are utility pages, not primary product screens.
- Rename visible framing from "Legacy MPP Code Generator" to something clearer like "Legacy middleware tool" or "SOW evidence tool".
- Push users toward `/apis/new` as the real V1 product path.
- Preserve existing generation behavior and `sessionStorage` result flow.

Acceptance:

- `/generate` and `/result` visually read as secondary utility pages under the PayGate app shell.
- No `gpt-thin-border-wide-shadow` on rendered legacy generate.
- Source scan remains `0`.
- The old generator still validates fields, calls `/api/generate`, stores result, and navigates to `/result`.

Suggested commit:

```txt
style: contain legacy generator pages
```

### Phase 5: App Copy And Header Hierarchy Pass

Goal: reduce repeated "big product hero" language on operational pages.

Scope:

- Dashboard can keep the strongest H1 because it is the main workspace.
- Create/detail pages should use smaller operational headers.
- Reassess app eyebrows:
  - Dashboard: `PayGate workspace` is acceptable.
  - Create: `Create paid endpoint` can be simpler or moved into page title.
  - Detail: `Endpoint control` is acceptable but should not feel like a marketing kicker.
- Tighten support copy to avoid 90-character lines.
- Make technical terms consistent:
  - "paid endpoint" for user-facing product.
  - "proxy URL" when referring to implementation detail.
  - "upstream guard" for the required server-side protection.

Acceptance:

- `line-length` findings on create/detail app header copy are gone or materially reduced.
- Pages feel like a product application, not mini landing pages.
- No core product meaning is lost.

Suggested commit:

```txt
content: tighten app page hierarchy
```

### Phase 6: Inline Style Consolidation

Goal: make app page styling maintainable and less likely to drift.

Scope:

- Move remaining inline visual styles from app pages into named CSS classes where practical.
- Prioritize repeated loading, error, empty, alert, link, and not-found states.
- Keep dynamic color values only where semantic runtime state makes that simpler.
- Do not over-abstract into too many components.

Acceptance:

- Dashboard/RegisterApi/ApiDetail have noticeably fewer inline visual styles.
- No behavior changes.
- Source scan remains `0`.
- Build and screenshots pass.

Suggested commit:

```txt
style: consolidate app page states
```

### Phase 7: App QA Gate

Goal: prove app pages are ready for demo before returning to landing polish.

Scope:

- Run build and diff check.
- Run source Impeccable app scan.
- Run rendered Impeccable browser scan on:
  - `/dashboard` unauth desktop
  - `/dashboard` auth desktop
  - `/dashboard` auth mobile
  - `/apis/new` form desktop
  - `/apis/new` success desktop
  - `/apis/:id` pending desktop
  - `/apis/:id` active desktop
  - `/generate` desktop
  - `/result` desktop
- Capture screenshots to `docs/evidence/ui/app-final-v2/`.
- Write a short QA report.

Acceptance:

- No high-confidence visible layout defects remain.
- Source scan is `0`.
- Rendered findings are documented, with false positives separated from real issues.
- Mobile dashboard has no obvious clipped operational content.

Suggested commit:

```txt
test: verify app ui anti slop polish
```

### Phase 8: Return To Landing Handoff

Goal: resume the old landing handoff after app demo pages are solid.

Scope:

- Continue from old landing Phase E/F/G:
  - tactical anti-slop defects,
  - reveal/motion hardening,
  - final landing QA.
- Use locked landing baselines from `docs/evidence/ui/landing-baselines/`.
- Keep app design system changes compatible with landing visuals.

Acceptance:

- Landing baselines still match intended direction.
- Landing and app share the same PayGate purple and surface discipline.
- Final landing and app QA docs both exist.

Suggested commits:

```txt
style: polish landing interaction details
style: harden landing reveal behavior
test: verify paygate ui refactor
```

## Recommended Next Execution Order

Do app pages first:

1. Phase 1 semantic surface calibration.
2. Phase 2 create success flow polish.
3. Phase 3 mobile dashboard activity redesign.
4. Phase 4 legacy generator containment.
5. Phase 5 copy/header hierarchy.
6. Phase 6 inline style consolidation.
7. Phase 7 app QA.
8. Return to landing Phase E/F/G.

This order protects the demo. Dashboard, create endpoint, endpoint detail, and legacy utility pages will all feel like one coherent PayGate product before the landing polish resumes.
