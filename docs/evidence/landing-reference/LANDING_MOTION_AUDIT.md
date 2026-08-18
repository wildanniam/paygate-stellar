# PayGate Landing Motion Audit

This evidence package captures the owned implementation of the supplied light and dark concept references. The reference images are retained beside this file; generated screenshots and pixel artifacts live in the ignored `latest/` directory.

## Commands

```text
npm run test:landing
npm run test:landing:parity
npm run test:landing:compare
```

## Results

- Landing audit passed for dark and light at 1491 x 1055.
- Landing audit passed for dark and light at 390 x 844.
- Landing audit passed for dark and light at 320 x 844.
- Pointer movement changed rear, middle, front, and surface depth variables; pointer exit returned within the audit tolerance.
- Revenue range menu changed the chart dataset and accessible label.
- Chart point focus/selection, pause control, endpoint copy feedback, theme toggle, and flow status selection/replay passed.
- No landing console errors or horizontal overflow were observed in the audited viewports.
- Latest comparison artifacts report mean absolute difference of `17.567` for dark and `20.550` for light, with changed-pixel ratios of `0.449` and `0.267`. These values are diagnostic only: the current build deliberately places the flow board below the fixed comparison viewport, while the supplied concept shows it above the fold.
- The Lando-style parity packet now includes exact-viewport isolated captures, DOM/computed-style geometry, pointer/range/flow state snapshots, a 50/50 overlay, a colored heatmap, per-region metrics, and build-only motion frames. Because the supplied oracle is one static PNG, no reference motion energy or frame correlation is claimed.
- The landing audit also verifies that each cumulative revenue range has non-increasing SVG `cy` coordinates, preventing a future data edit from showing revenue moving backward.

## Viewport And Runtime Pass

- At `1428x1293`, the hero owns the opening viewport; the transformation section begins at `y=1293` and its board begins at `y=1325`. At `390x844`, the stacked hero places the board at `y=1257`.
- The workspace and flow observers pause their local motion outside the viewport. A browser probe observed `13` active animations at the top and `8` after scrolling those regions away; this is a directional runtime observation, not a lab FPS claim.
- Expensive backdrop blur is limited to the primary surfaces, while the navigation and decorative rails avoid continuous blur work. Rich chart, depth-plane, hover, pause, range, copy, and flow interactions remain enabled.

## Dependency Note

The root, backend, and example production-only audits pass with zero vulnerabilities. `npm --prefix frontend audit --omit=dev` reports two moderate React Router advisories for the required `react-router-dom@6.30.4` line. npm only offers an audit fix by installing React Router 7.18.2, which is a breaking upgrade; no forced upgrade was applied. The V1 app remains on the planned v6 dependency and its browser route smoke passes.
