# Approved landing becomes homepage

The owner clarified that merging the design preview alone did not satisfy the request: the new landing must replace `/`. Issue9 handles that promotion separately from the completed design iteration.

## Change

`App.jsx` renders the approved landing directly at `/` and redirects the old preview path with query/hash intact. Vercel has a permanent preview redirect. The old landing file remains historical source but is not imported in the route graph. No product routes or backend code change. The public title no longer says Design preview; description identifies Stellar Testnet beta and theme color matches the page. A homepage-only canonical is created/cleaned on mount/unmount, so dashboard and API pages do not inherit a homepage canonical. Initial anchor/top restoration handles entry from product pages; old how-it-works/protected-calls/proof/workspace/features fragments map to new sections.

## Verification

- Production build and19 existing motion/simulation/receipt regression tests pass. Root no longer bundles the legacy GSAP landing.
- Browser: `/` has the new headline, one h1, correct title/canonical, no broken loaded images or horizontal overflow.
- Create paid endpoint opens `/apis/new` and its wallet-gated registration screen; Dashboard opens its existing disconnected-wallet state. Returning Home restores the approved landing; canonical is removed on the product page. No wallet action performed.
- Try a request focuses the demo, pauses at402, explicit simulation reaches credited then complete/Replay. Simulation notice and beta labels remain.
- `/design-preview?ref=check#setup-title` resolves to `/?ref=check#setup-title` and the setup heading is in view. Vercel server redirect is configuration-validated; production HTTP verification follows deployment.
- Chrome390px: readable hero/demo, no document overflow, mobile Pricing menu closes after selection. Desktop inspected; original design also has prior320px verification. Temporary viewport restored.
- Doc links point to existing repository guide files. Existing client-rendered SEO architecture remains; no SSR/prerender claim. Physical phone/Safari and authenticated payment flows are outside this presentation/routing check.
