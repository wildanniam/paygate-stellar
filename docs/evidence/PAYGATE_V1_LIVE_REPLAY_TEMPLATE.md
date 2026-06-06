# PayGate V1 Live Replay Evidence - {{RUN_ID}}

Created: {{DATE_ISO}}

## Environment

| Field | Value |
| --- | --- |
| Live URL | `TBD` |
| Branch / commit | `TBD` |
| Supabase project | `TBD` |
| Stellar network | `stellar:testnet` |
| RPC URL | `https://soroban-testnet.stellar.org` |
| ESCROW_CONTRACT_ID | `TBD` |

Secrets must not be pasted into this file.

## Replay Checklist

| Step | Result | Evidence |
| --- | --- | --- |
| `npm run beta:preflight` | `TBD` | `transcripts/preflight.txt` |
| Direct refresh `/dashboard` | `TBD` | `screenshots/dashboard-refresh.png` |
| Direct refresh `/apis/new` | `TBD` | `screenshots/apis-new-refresh.png` |
| Direct refresh `/apis/<apiId>` | `TBD` | `screenshots/api-detail-refresh.png` |
| Register demo upstream API | `TBD` | API id: `TBD` |
| Direct upstream without secret returns `401` | `TBD` | `screenshots/upstream-401.png` |
| Paid proxy without payment returns `402` | `TBD` | `screenshots/proxy-402.png` |
| Agent paid request returns `200` JSON | `TBD` | `screenshots/agent-200.png` |
| Dashboard shows call and revenue | `TBD` | `screenshots/dashboard-paid.png` |
| Dashboard shows payment tx hash | `TBD` | Payment tx: `TBD` |
| Dashboard shows credit tx hash | `TBD` | Credit tx: `TBD` |
| Dashboard shows escrow balance | `TBD` | `screenshots/dashboard-escrow.png` |
| Developer withdrawal succeeds through Freighter | `TBD` | Withdrawal tx: `TBD` |
| Demo video recorded | `TBD` | Video link: `TBD` |

## Transaction Hashes

| Type | Hash | Stellar Expert Link |
| --- | --- | --- |
| Payment | `TBD` | `TBD` |
| Credit | `TBD` | `TBD` |
| Withdrawal | `TBD` | `TBD` |

## Known Limitations Confirmed During Replay

- Testnet only.
- GET-only registered APIs.
- No refunds, fiat checkout, marketplace, buyer accounts, mainnet, POST APIs, or compliance claims.
- Upstream failures after payment are logged, but no automated refund flow exists in V1.

## Notes

Add exact commands, timestamps, and any deviations here.
