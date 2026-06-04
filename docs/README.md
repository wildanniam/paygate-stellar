# { PayGate }

**MPP middleware generator, sample paid API, and earnings dashboard for Node.js APIs on Stellar.**

PayGate helps developers turn an Express endpoint into a pay-per-request API using Stellar MPP and USDC testnet. Fill a 3-field form, get middleware, attach it to an API route, and monitor incoming payments from a Stellar wallet.

> **V1 branch update:** the current `codex/paygate-v1` direction is evolving PayGate into a **pay-per-call gateway for APIs**. V1 adds Freighter wallet login, Supabase API registry, paid proxy endpoints, and Soroban escrow settlement so AI agents can pay per API call and developers can withdraw balances. See `PAYGATE_V1_PRODUCT_SPEC.md`.

---

## What is MPP?

[Machine Payments Protocol (MPP)](https://developers.stellar.org/docs/build/agentic-payments/mpp) enables machine/API clients to pay for HTTP resources through `402 Payment Required` flows. In PayGate's current POC, each paid request uses Stellar testnet USDC through MPP Charge mode.

PayGate is the onboarding layer: it generates the Express paywall code and provides a dashboard for proof of received payments.

For V1, PayGate becomes the paid gateway in front of the API:

```text
AI agent
→ PayGate paid proxy
→ original developer API
```

Payment is intended to settle into a Soroban escrow contract, with 90% credited to the developer balance and 10% credited as PayGate platform fee.

---

## How It Works

```
┌─────────────────────────┐
│  1. Fill the form        │  endpoint URL · gated path · USDC price
│  2. Click Generate       │  PayGate builds @stellar/mpp middleware
│  3. Copy. Paste. Ship.   │  drop into Express — done
└─────────────────────────┘
```

Generated middleware looks like this:

```js
import { paywall } from './mpp-middleware.js';

app.get('/v1/data', paywall, (req, res) => {
  res.json({ data: 'premium data' });
});
```

Every unpaid request to that endpoint receives an MPP `402 Payment Required` challenge. A compatible machine client can pay with Stellar testnet USDC, retry, and receive the protected JSON response.

---

## Project Status

> **V1 demo-ready alpha.** The original generator is preserved, and the `codex/paygate-v1` branch now implements the stronger gateway story: wallet login, API registry, paid proxy, MPP payment verification, Soroban escrow crediting, dashboard, and withdrawal flow. Use `PAYGATE_V1_DEMO_GUIDE.md` as the current demo replay guide.

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
| Demo video | Not recorded yet |

---

## Repository Structure

```
paygate/
├── docs/                     # Project docs, specs, agent memory, and README
│   ├── README.md
│   ├── evidence/
│   ├── PAYGATE_V1_PRODUCT_SPEC.md
│   ├── PAYGATE_V1_DEVELOPMENT_PLAN.md
│   └── TECHNICAL_SPEC.md
├── frontend/                 # React SPA: landing, generator, result, dashboard
├── backend/                  # Express generator API
├── contracts/                # Soroban escrow contract spike for V1
├── examples/express-paid-api # Internal demo lab for protected API + agent client
└── openspec/                 # Capability specs and active demo-proof change
```

---

## Running Locally

**Requirements:** Node.js 22+ for the Vercel/Mpp demo functions. The frontend and legacy Express backend can still run on Node.js 20.

```bash
cd paygate

# Frontend
cd frontend
npm install
npm run dev       # http://localhost:5173
```

```bash
# Backend
cd backend
npm install
npm start         # http://localhost:3001
```

The frontend calls the backend through `/api/generate` during local development.

## Vercel Production Demo

This repo is configured so one Vercel project can serve both the React frontend and the demo API functions.

Vercel project setting:

```text
Root Directory: repo root
Build Command: npm run build
Output Directory: frontend/dist
```

Live routes after deployment:

```text
/                         PayGate frontend
/generate                 Generator page
/dashboard                Dashboard page
/api/generate             Generator API
/api/demo/market-signal   Official sample paid API
```

Set these Vercel environment variables before testing the paid demo API:

```bash
STELLAR_RECIPIENT=G...  # demo API owner public key
MPP_SECRET_KEY=...      # strong random server secret
```

Do not set `STELLAR_SECRET` in Vercel. The payer secret belongs only in the local agent/client `.env`.

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
- [ ] Demo video recorded

## Known Limitations

- Testnet only.
- USDC only.
- GET endpoints only for the V1 paid proxy.
- Charge mode only.
- AI agent/client is represented by a local script, not a full LLM agent.
- No fiat checkout, refund system, mainnet support, or non-Web3 buyer abstraction yet.

---

## Contributing

This project is in early development. Issues and PRs are welcome once the core generator is stable. Watch the repo to be notified.

---

## License

MIT © 2026 PayGate
