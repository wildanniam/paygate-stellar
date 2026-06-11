# { PayGate }

**Pay-per-call gateway for APIs on Stellar testnet.**

PayGate lets a developer put a paid gateway in front of a normal API. The developer connects a Freighter wallet, registers an API, receives a PayGate proxy URL, and lets machine clients or AI agents pay per request through Stellar MPP. Successful calls are logged in PayGate, credited into a Soroban escrow ledger, and shown in the developer dashboard.

The original SOW/V0 code generator is still preserved at `/generate`, but the current product direction is **PayGate V1: a pay-per-call gateway for APIs**. Use `PAYGATE_V1_PRODUCT_SPEC.md`, `developer-guide.md`, and `PAYGATE_V1_DEMO_GUIDE.md` as the current source of truth for the V1 demo.

---

## What is MPP?

[Machine Payments Protocol (MPP)](https://developers.stellar.org/docs/build/agentic-payments/mpp) enables machine/API clients to pay for HTTP resources through `402 Payment Required` flows. In PayGate's current POC, each paid request uses Stellar testnet USDC through MPP Charge mode.

PayGate is the onboarding layer for this flow. In V1, PayGate becomes the paid gateway in front of the API:

```text
AI agent
→ PayGate paid proxy
→ original developer API
```

Payment is intended to settle into a Soroban escrow contract, with 90% credited to the developer balance and 10% credited as PayGate platform fee.

---

## How It Works

```text
Developer connects Freighter
→ Developer registers an API
→ PayGate stores the API config in Supabase
→ PayGate creates /api/pay/:apiId as the paid proxy
→ Agent calls the proxy without payment
→ PayGate returns 402 Payment Required
→ Agent pays USDC testnet through Stellar MPP
→ PayGate verifies the payment
→ PayGate credits the Soroban escrow contract
→ PayGate forwards the request to the original API with X-PayGate-Secret
→ Dashboard shows calls, payments, fees, and withdrawable balance
```

The original `/generate` page still exists as a legacy MPP middleware generator. It is useful for SOW evidence and code-snippet experimentation, but it is not the main V1 product flow. For the V1 demo, use `/dashboard` and `/apis/new`.

Developer onboarding guide:

- [`developer-guide.md`](developer-guide.md) explains Proxy URL, API Secret, upstream guard setup, and `401`/`402`/`200` testing.

---

## Project Status

> **V1 testnet beta candidate.** The original generator is preserved, and the `codex/paygate-v1` branch now implements the stronger gateway story: wallet login, API registry, paid proxy, MPP payment verification, Soroban escrow crediting, dashboard, withdrawal flow, Supabase-backed auth challenges, and deployment-safe SPA routes. Use `PAYGATE_V1_DEMO_GUIDE.md` as the current demo replay guide.

| Component | Status |
|---|---|
| Landing page | Done |
| Middleware generator | Done |
| Result/code copy page | Done |
| V1 wallet auth | Done |
| V1 API registry | Done |
| Secret-protected demo upstream API | Done |
| V1 paid proxy unpaid `402` flow | Done |
| V1 paid proxy paid `200` flow | Done, live testnet proof captured |
| V1 Soroban escrow contract | Done for testnet demo |
| V1 developer dashboard | Done |
| V1 developer withdrawal | Done |
| Demo guide/evidence index | Done |
| Supabase auth challenge persistence | Done |
| Vercel SPA deep links | Done |
| Beta readiness evidence package | Done; deployment slots pending live replay |
| Beta preflight and browser smoke tooling | Done |
| Demo video | Not recorded yet |

---

## Repository Structure

```
paygate/
├── docs/                     # Project docs, specs, agent memory, and README
│   ├── README.md
│   ├── evidence/
│   ├── developer-guide.md
│   ├── PAYGATE_V1_PRODUCT_SPEC.md
│   ├── PAYGATE_V1_DEVELOPMENT_PLAN.md
│   └── TECHNICAL_SPEC.md
├── frontend/                 # React SPA: landing, generator, result, dashboard
├── backend/                  # Express generator API
├── contracts/                # Soroban escrow contract spike for V1
├── examples/express-paid-api # Internal demo lab for protected API + agent client
├── supabase/                 # SQL migrations for V1 registry and payment logs
└── openspec/                 # Capability specs and active demo-proof change
```

---

## Running Locally

**Recommended requirement:** Node.js 22+ locally. The Vercel project is configured for Node.js 24.x, and `@stellar/mpp` requires Node.js 22+.

### Full V1 App

Use this path for the real PayGate V1 flow. It serves the React frontend and root-level Vercel Functions from one local URL.

```bash
cd paygate
npm install
npm --prefix frontend install
vercel env pull .env.local --environment=development --yes
vercel dev
```

Open:

```text
http://localhost:3000
```

Verify that V1 API functions are loaded:

```bash
curl -i http://localhost:3000/api/auth/me
```

Expected before login:

```json
{"authenticated":false}
```

If `/api/auth/me` logs a Vite proxy `ECONNREFUSED` error, the linked Vercel project is still using `frontend` as the Root Directory. Fix the Vercel project setting first:

```text
Vercel project → Settings → General → Root Directory → repo root / "."
```

Then run:

```bash
vercel env pull .env.local --environment=development --yes
vercel dev
```

### Legacy Frontend-Only Mode

This is only for visual checks. It does not load the V1 Vercel Functions.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Verification Commands

Run from the repo root:

```bash
npm run test:beta       # local smokes, frontend build, contract tests, diff check
npm run audit:prod      # production dependency audit gates
npm run test:browser    # desktop/mobile SPA route smoke
npm run evidence:init   # create a timestamped live replay evidence folder
```

Deployed preflight requires production-like Vercel/Supabase/Stellar env:

```bash
npm run beta:preflight
```

## Vercel Production Demo

This repo is configured so one Vercel project can serve both the React frontend and the demo API functions.

Vercel project setting:

```text
Root Directory: repo root
Build Command: npm run build
Output Directory: frontend/dist
```

Check the linked project:

```bash
vercel project inspect paygate-stellar
```

The project must not show `Root Directory: frontend`. If it does, `/api/*` will not load the V1 functions and local dev will fall through to the Vite proxy.

Live routes after deployment:

```text
/                         PayGate frontend
/generate                 Generator page
/dashboard                Dashboard page
/apis/new                 Register API page
/apis/:apiId              API detail page
/api/generate             Generator API
/api/demo/market-signal   Official sample paid API
```

### Vercel Environment Variables

Set these variables for **Development** first, then add the same set to Preview/Production when the beta is ready to deploy.

| Variable | Purpose | Source |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database access | Supabase dashboard, service role key |
| `SESSION_SECRET` | Signs wallet login sessions | Strong random string, 32+ chars |
| `API_SECRET_ENCRYPTION_KEY` | Encrypts generated API secrets | Strong random string, 32+ chars or 64-char hex |
| `MPP_SECRET_KEY` | Signs MPP challenge state | Strong random string, 32+ chars |
| `ESCROW_CONTRACT_ID` | Soroban escrow contract recipient | Testnet contract id, `C...` |
| `PAYGATE_OPERATOR_SECRET` | Operator/admin signer for escrow credit and platform fee withdrawal | Stellar testnet secret seed, `S...` |
| `PAYGATE_DEMO_UPSTREAM_SECRET` | Secret expected by the demo upstream endpoint | Generated API secret during demo setup |
| `STELLAR_NETWORK` | Network selector | `stellar:testnet` |
| `STELLAR_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |

Generate local random secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do not set `STELLAR_SECRET` in Vercel. The payer secret belongs only in the local agent/client `.env`. Do not set `PAYGATE_AUTH_CHALLENGE_STORE=memory` or `PAYGATE_REGISTRY_STORE=memory` in Vercel; memory mode is only for deterministic local smoke tests.

After adding env vars in Vercel:

```bash
vercel env pull .env.local --environment=development --yes
```

Check keys without printing secret values:

```bash
node -e "require('fs').readFileSync('.env.local','utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>l.split('=')[0]).forEach(k=>console.log(k))"
```

### Supabase Setup

Run the migrations in Supabase SQL Editor:

```text
supabase/migrations/20260604000000_paygate_v1_registry.sql
supabase/migrations/20260604000001_paygate_v1_paid_proxy.sql
```

The V1 API registry depends on these tables:

```text
developers
auth_challenges
apis
proxy_requests
payments
withdrawals
mpp_store
```

### Smoke Tests

Production generator test:

```bash
curl -i -X POST https://your-vercel-domain.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"endpointUrl":"https://api.example.com","path":"/v1/data","price":"0.01"}'
```

Production paid API challenge test:

```bash
curl -i https://your-vercel-domain.vercel.app/api/demo/market-signal
```

Expected with Vercel env configured:

```text
HTTP/1.1 402 Payment Required
```

V1 paid proxy smoke after registering an API:

```bash
curl -i https://your-vercel-domain.vercel.app/api/pay/<apiId>
```

Expected without payment:

```text
HTTP/1.1 402 Payment Required
```

## Internal Demo Lab

```bash
cd examples/express-paid-api
npm install
cp .env.example .env
```

Fill `.env` with:

```bash
STELLAR_RECIPIENT=G...  # API owner public key
MPP_SECRET_KEY=...      # strong random string
STELLAR_SECRET=S...     # payer/agent testnet secret key
```

For production demo mode, point the local agent/client to Vercel:

```bash
PAYGATE_SAMPLE_URL=https://your-vercel-domain.vercel.app/api/demo/market-signal
```

Run the paid API:

```bash
npm start
```

Test the no-payment challenge:

```bash
curl -i http://localhost:4000/v1/market-signal
```

Expected result: `402 Payment Required`.

Run the agent/client payment test after funding the payer wallet with testnet XLM and USDC:

```bash
npm run client
```

Or target the production demo API directly:

```bash
PAYGATE_SAMPLE_URL=https://your-vercel-domain.vercel.app/api/demo/market-signal npm run client
```

Expected result: `200 OK` with:

```json
{
  "signal": "bullish",
  "confidence": 0.82,
  "source": "PayGate demo API"
}
```

---

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | React 18 |
| Styling | Tailwind CSS v3 |
| Icons | lucide-react |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Build | Vite 5 |
| Routing | React Router v6 |

### Backend And Demo
| | |
|---|---|
| Backend | Node.js / Express |
| MPP | `@stellar/mpp`, `mppx` |
| Chain | Stellar testnet |
| Asset | USDC testnet |
| Persistence | Supabase for V1 registry, logs, payments, withdrawals |

---

## Why PayGate?

Traditional payment rails make tiny per-request API payments awkward or uneconomical. PayGate explores a machine-payment model where API consumers, especially agent clients, can pay only when they call a resource.

The current V1 POC focuses on proving the stronger product loop: register a normal API, expose it through a PayGate paid proxy, require MPP payment per call, forward successful requests, show revenue in the dashboard, and withdraw developer balance from escrow.

---

## Roadmap

- [x] React SPA with generator, result page, and dashboard
- [x] Backend `POST /api/generate`
- [x] Internal sample paid API
- [x] No-payment `402` challenge proof
- [x] Funded testnet payer payment proof
- [x] Dashboard proof with real tx hash support
- [x] Demo evidence guide
- [x] Supabase-backed wallet auth challenges
- [x] Deployment-safe V1 SPA routes
- [x] Beta readiness evidence package
- [ ] Demo video recorded

## Known Limitations

- Testnet only.
- USDC only.
- GET endpoints only for the V1 paid proxy.
- Charge mode only.
- AI agent/client is represented by a local script, not a full LLM agent.
- No fiat checkout, refund system, mainnet support, or non-Web3 buyer abstraction yet.
- The legacy `/generate` flow does not require wallet login because it only generates code snippets. The V1 product flow starts at `/apis/new`.
- Local V1 development requires the linked Vercel project Root Directory to be the repo root, not `frontend`.
- `.env.local` is intentionally ignored and should never be committed.

---

## Contributing

This project is in early development. Issues and PRs are welcome once the core generator is stable. Watch the repo to be notified.

---

## License

MIT © 2026 PayGate
