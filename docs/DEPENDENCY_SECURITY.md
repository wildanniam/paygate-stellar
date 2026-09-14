# Dependency Security Maintenance

Security remediation for issues #7 and #2, September 2026. Keep dependency changes separate from the landing preview and from payment-state hardening.

## Compatibility decisions

| Package | Selected version | Reason and boundary |
| --- | --- | --- |
| `toml` under Stellar SDK | `4.2.0` override | Fixes prototype pollution and excessive recursion. SDK 15.1.0 calls the same CommonJS `parse` API. Version 4 returns null-prototype tables and changes local date/time representations; resolver currency/string fields, invalid input, inert prototype keys and depth limits are covered by regression tests. |
| `@toon-format/toon` under `incur` | `2.3.1` override | Patch for prototype pollution; preserves the formatter used by the MPP CLI. |
| `qs` | `6.16.0` override | Fixes the reported DoS advisories. Keep Express 4.22.2 in the local adapter: its mutable `req.query` is used to merge route parameters. The Express 5 serverless/example scopes also use this patched parser. |
| `react-router-dom` / `react-router` | `7.18.3` lock | Patched v7, compatible with React 18. Keep declarative `BrowserRouter`, routes and imports. No multi-segment splats, data loaders, SSR hydration or component-scoped `React.lazy` are used. |
| Frontend build dependencies | Patched within existing major ranges | PostCSS 8.5.28, nanoid 3.3.19, Browserslist 4.28.9, baseline-browser-mapping 2.11.23 and postcss-selector-parser 6.1.4; related browser data refreshes are recorded in the lockfile. |
| GitHub Actions | Checkout 7.0.1 / setup-node 7.0.0, commit-pinned | Action internals use Node 24. Application CI stays on Node 22. Ubuntu hosted runners support the required Actions runtime. |

`@stellar/mpp@0.6.0` declares Stellar SDK `^15.0.1` as a peer. Keep MPP 0.6.0 and SDK 15.1.0 instead of forcing SDK 17 across that compatibility boundary. The TOML override is deliberate and temporary: remove it when an MPP-compatible SDK adopts a patched parser, then rerun compatibility tests. Do not remove overrides just because an audit is green; the overrides are what select patched versions.

TOML/TOON are not directly decoded by PayGate payment handlers in the inspected source. That lowers observed reachability but is not a reason to leave vulnerable packages installed. No audit allowlist, severity downgrade, `continue-on-error`, or `npm audit fix --force` is used.

## Repeatable verification

Use Node 22 or newer and independent installs in all package scopes:

```sh
npm ci
npm --prefix frontend ci
npm --prefix backend ci
npm --prefix examples/express-paid-api ci
npm run audit:prod
npm --prefix frontend audit
npm run test:dependencies
npm run test:beta
npm --prefix frontend exec -- playwright install chromium
npm run test:browser
npm run scan:secrets
git diff --check
```

- `audit:prod` always visits root, frontend, backend and the Express example, then returns failure if any audit fails, cannot start, or is terminated. Audit findings and registry errors both keep the gate red. It works from lockfiles without installed dependencies.
- The CI dependency job also audits frontend development dependencies because they execute during the build. That step still runs after a production-audit failure unless the job was cancelled.
- `test:dependencies` checks the SDK's actually resolved parser in root and example, an HTTP Stellar TOML resolver fixture, parser depth/prototype behavior, signed Soroban XDR round-trips, the MPP CLI formatter, Express query behavior and the real local adapter. Fixtures use loopback HTTP and ephemeral signing keys, not live funds.
- `test:beta` covers auth, API registration/setup, unpaid/paid proxy, dashboard, withdrawal, security, frontend build and Rust contract tests. Payment/escrow smoke modes are mocked; success is not a fresh live settlement proof.
- `test:browser` covers nine routes on desktop/mobile, logged-out guards, dashboard active links, browser history, generated result state/refresh, and an authenticated dynamic API lookup with mocked HTTP responses. It does not sign through a real Freighter extension or contact production.
- Fresh frontend installs/builds must finish before browser smoke starts; do not replace `node_modules` while Vite is serving tests.

Audit results are point-in-time checks against npm advisories, not a complete security guarantee. Merge and deployment require owner approval; a separate design PR still needs the security changes incorporated after the security PR is approved.

## Sources

- [TOML recursion](https://github.com/advisories/GHSA-82x6-q7mm-w9cf), [TOML prototype pollution](https://github.com/advisories/GHSA-v5mp-jgw5-2x6j), [TOON](https://github.com/advisories/GHSA-p95v-992w-h6c3).
- [qs comma handling](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx), [qs isBuffer DoS](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g).
- [Router redirect](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6), [Router hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg), [v6 migration guidance](https://reactrouter.com/6.30.3/upgrading/future).
- [PostCSS](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), [nanoid](https://github.com/advisories/GHSA-2v37-7h3g-55p8), [Browserslist](https://github.com/advisories/GHSA-73wf-gq98-2v4g), [baseline mapping](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv), [selector parser](https://github.com/advisories/GHSA-w9m9-85wc-3x92).
- [Checkout 7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node 7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0).
