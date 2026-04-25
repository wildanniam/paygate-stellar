# { PayGate }

**MPP middleware generator and earnings dashboard for Node.js APIs on Stellar.**

PayGate lets developers monetize any API endpoint with micropayments — without touching a blockchain. Fill a 3-field form, get a drop-in Express middleware, start accepting USDC on Stellar. That's it.

---

## What is MPP?

[Micropayment Protocol (MPP)](https://stellar.org/mpp) is a Stellar-native standard co-authored by Stripe and Tempo Labs, live on Cloudflare, OpenAI, and Google Gemini, adopted by 50+ services since its March 2026 launch. It enables frictionless per-request payments over HTTP — no subscriptions, no API keys, no billing infrastructure.

PayGate is the fastest way onto that stack.

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
import { mppCharge } from '@stellar/mpp';

export const paywall = mppCharge({
  asset:       'USDC',
  amount:      '0.01',
  destination: process.env.STELLAR_ADDRESS,
});

// Drop into any Express route. That's it.
app.get('/api/data', paywall, (req, res) => {
  res.json({ data: '...' });
});
```

Every request to that endpoint now triggers an automatic USDC payment via Stellar before your handler runs. On-chain. Verifiable. Near-zero fees.

---

## Project Status

> **Early development.** The landing page is live. The generator and dashboard are in progress.

| Component | Status |
|---|---|
| Landing page (`/frontend`) | ✅ Live |
| Middleware generator (BE) | 🔧 In progress |
| Earnings dashboard (FE) | 🔧 In progress |
| Stellar / USDC integration | 📋 Planned |
| Smart contracts | 📋 Planned |

---

## Repository Structure

```
paygate/
├── frontend/          # Landing page — React + Tailwind + Vite
│   ├── src/
│   │   ├── App.jsx    # Single-file landing page component
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
├── backend/           # Middleware generator API  (coming soon)
├── contracts/         # Stellar smart contracts   (coming soon)
└── dashboard/         # Earnings dashboard        (coming soon)
```

---

## Running Locally

**Requirements:** Node.js 18+

```bash
# Clone
git clone https://github.com/paygate-stellar/paygate.git
cd paygate

# Landing page
cd frontend
npm install
npm run dev       # → http://localhost:5173

# Production build
npm run build
npm run preview
```

**Deploy to Vercel:** Import the `frontend/` directory. Vercel auto-detects Vite — no config needed.

---

## Tech Stack

### Frontend (Landing Page)
| | |
|---|---|
| Framework | React 18 |
| Styling | Tailwind CSS v3 |
| Icons | lucide-react |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Build | Vite 5 |
| Deploy | Vercel |

### Planned
| | |
|---|---|
| Backend | Node.js / Express |
| Blockchain | Stellar · `@stellar/mpp` SDK |
| Smart Contracts | Soroban (Stellar's smart contract platform) |
| Database | TBD |

---

## Why PayGate?

Traditional payment rails charge **$0.30 + 2.9%** per transaction — which makes $0.01 per API call economically impossible. MPP settles payments on Stellar at fractions of a cent, with finality in seconds.

The protocol that fixes micropayment monetization launched in March 2026. Most developers still can't access it — not because the protocol is hard, but because the tooling gap is real. Galaxy Research estimates $3–5 trillion in agentic commerce by 2030. PayGate gets developers onto that stack in minutes.

---

## Roadmap

- [ ] Middleware generator (3-field form → working `paywall.js`)
- [ ] Stellar wallet integration (USDC destination setup)
- [ ] Real-time earnings dashboard (on-chain data via Stellar Horizon)
- [ ] CLI tool (`npx paygate init`)
- [ ] Multi-framework support (Fastify, Hono, Next.js API routes)
- [ ] Soroban smart contract for payment escrow
- [ ] Developer analytics (per-endpoint revenue, request volume)

---

## Contributing

This project is in early development. Issues and PRs are welcome once the core generator is stable. Watch the repo to be notified.

---

## License

MIT © 2026 PayGate
