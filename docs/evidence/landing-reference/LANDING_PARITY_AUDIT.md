# PayGate Landing Parity Audit

This audit adapts the Lando reverse-engineering loop to PayGate's available evidence. The supplied target is a single AI-generated PNG, not a live site or recording, so the comparison can prove composition and state coverage but cannot prove 1:1 motion parity.

## Repeatable Loop

1. Capture the target viewport at `1491x1055`, device scale factor `1`, in isolated dark and light browser contexts.
2. Record DOM geometry and computed surface state for the navigation, hero copy, workspace planes, chart, flow board, outcomes, and revenue footer.
3. Capture separate runtime, pointer-hover, range-selection, flow-required, and flow-success states.
4. Capture eight runtime frames per theme. These are build-only motion evidence because the reference has no corresponding frame stream.
5. Generate side-by-side, 50/50 overlay, enhanced heatmap, full contact sheet, region contact sheet, and JSON metrics.
6. Review the artifacts and classify gaps as layout, typography, content/asset construction, surface treatment, interaction, or motion.

## Commands

```text
npm run test:landing:parity
python scripts/compare-landing-reference.py --prefix dark-parity --reference docs/evidence/landing-reference/paygate-reference-dark.png --actual docs/evidence/landing-reference/latest/parity/dark-stable-initial-1491x1055.png --frames-dir docs/evidence/landing-reference/latest/parity/dark/motion
```

Or run capture and both theme comparisons together:

```text
npm run test:landing:parity:compare
```

The generated files are intentionally ignored under `docs/evidence/landing-reference/latest/`. The stable region definitions live in `paygate-dark-regions.json`.

## Current Reading

The latest stable capture run at `1491x1055` measured:

- Dark: mean absolute difference `17.567`, changed-pixel ratio `0.449`.
- Light: mean absolute difference `20.550`, changed-pixel ratio `0.267`.
- Dark region means: navigation `14.605`, hero copy `26.680`, tilted workspace `13.338`, flow board `22.256`, flow route `28.956`, flow outcomes `29.514`.
- Light region means: navigation `15.667`, hero copy `19.657`, tilted workspace `10.256`, flow board `37.747`, flow route `15.136`, flow outcomes `49.441`.
- The pointer path produced a build-only median frame energy of `0.00312` in dark and `0.00222` in light, with p95 values of `0.00358` and `0.00262`. It is evidence that the interaction moves; it is not a reference correlation because the oracle has no motion stream.

At the user-sized `1428x1293` viewport, the hero occupies the opening stage from `y=76` to `y=1293`; the transformation section begins at `y=1293` and its flow board begins at `y=1325`. This intentionally keeps the connected diagram out of the first viewport while preserving the dashboard as the focal object. On a `390x844` viewport, the naturally taller stacked hero pushes the board to `y=1257`. The hero workspace and flow animation observers also stop their local motion when those regions leave the viewport; an animation-count probe observed the page drop from `13` active animations at the top to `8` after scrolling them away. This is a runtime observation, not a lab FPS claim.

- The opening hero now owns the first viewport; the flow board intentionally begins below it. The fixed-image parity score therefore worsens for the flow regions because the supplied concept shows that board above the fold, but the product hierarchy matches the requested scroll behavior.
- The target workspace is a compact tilted glass dashboard with three readable depth planes. The build now uses the same visual grammar with a real DOM/SVG chart, range menu, metric selection, pause control, hover depth, and endpoint copy interaction.
- The target includes an avatar trust row; the build uses truthful capability signals instead of inventing users or production volume. This is an intentional content divergence, not a missing CSS detail.
- The target flow board is a calmer, more spacious connected diagram. The build now keeps controls available on focus/hover while allowing the stable frame to retain that calmer rhythm.
- Pointer, range, pause, copy, and flow interactions are real in the build. They cannot be scored against a static target image; their evidence is recorded as state traces instead.

## Acceptance Boundary

These artifacts are decision support for the next design pass, not a false pixel-similarity gate. A visual change should be kept only when it improves the reference's composition and effect family while preserving the real PayGate routes, truthful testnet wording, keyboard access, reduced-motion behavior, and the existing browser/test suite.
