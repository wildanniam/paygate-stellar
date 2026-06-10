# PayGate V1 Live Replay Evidence - 2026-06-09-live-vercel-e2e

Created: 2026-06-09T13:57:31.307Z

## Environment

| Field | Value |
| --- | --- |
| Live URL | `https://frontend-ten-drab-92.vercel.app` |
| Deployment URL | `https://frontend-83bjgky0w-argalumunon9-9369s-projects.vercel.app` |
| Vercel deployment id | `dpl_ARxeJ7XUAYVHxK9VSiHGCsy8pnBY` |
| Branch / commit | `codex/paygate-v1` / `5988686dffbb16c7159ea20bc9f57872d9330ce9` plus local `.vercelignore` deploy exclusion |
| Supabase project | `ognztgqqemxurjclornw.supabase.co` |
| Stellar network | `stellar:testnet` |
| RPC URL | `https://soroban-testnet.stellar.org` |
| ESCROW_CONTRACT_ID | `CBDYTCVJHTTFRKRR5Y4S3BVHBBZBT6AQNTJXNI2HV2KZMPFPJ5WAPP3Y` |

Secrets must not be pasted into this file.

## Replay Checklist

| Step | Result | Evidence |
| --- | --- | --- |
| `node --env-file=.env.local scripts/beta-preflight.mjs` | Passed with `0 failure(s), 0 warning(s)` | Terminal replay |
| Direct refresh `/dashboard` | Passed | Terminal route check returned `200` |
| Direct refresh `/apis/new` | Passed | Terminal route check returned `200` |
| Direct refresh `/apis/<apiId>` | Passed | Terminal route check returned `200` |
| Register demo upstream API | Passed | API id: `7854e637-a1f6-406d-8d88-0761a78ed60e` |
| Direct upstream without secret returns `401` | Passed | Terminal replay |
| Direct upstream with registered secret returns `200` | Passed | Terminal replay |
| Paid proxy without payment returns `402` | Passed | PayGate request id: `dcf1d77a-1226-48e6-af46-fd4adf4eec85`; payment id: `p2b6aaaef5f` |
| Agent paid request returns `200` JSON | Passed | Response: `{"signal":"bullish","confidence":0.82,"source":"PayGate demo upstream API"}` |
| Dashboard shows call and revenue | Passed | Dashboard summary after payment: `calls=2`, `success=1`, `payments=1`, withdrawable `0.0090000` |
| Dashboard shows payment tx hash | Passed | Payment tx: `1540f83dcdfc1793d7d1d34bb00ea52b27614933f2f46f37a4e4a6ba31b3772d` |
| Dashboard shows credit tx hash | Passed | Credit tx: `6d057380f813fd47ce8ed9aab70c5337bf1b6cdcacacddb794a7d458026e9c65` |
| Dashboard shows escrow balance | Passed | Before withdrawal: `0.0090000`; after withdrawal: `0.0000000` |
| Developer withdrawal succeeds through Freighter | Passed through deployed withdrawal endpoints with a programmatic testnet wallet signature; Freighter popup not captured | Withdrawal tx: `1d3996dcfb94bd11e12409e27f123cedc91abaeb12c7879d15b6f0e571c81b73` |
| Operator platform fee withdrawal | Passed after adding missing operator USDC trustline | Platform fee tx: `39f081ba4bc0ed7d1f1dae106c9cd353bacf9c1a110ff25c4f8d4b0998b45f1b` |
| Demo video recorded | Not captured | Video link: `TBD` |

## Transaction Hashes

| Type | Hash | Stellar Expert Link |
| --- | --- | --- |
| Payer USDC funding | `b5f8d467a1bda776c82115c07d87c851a997aac2e2cbca4981b06a0388bc2b4e` | `https://stellar.expert/explorer/testnet/tx/b5f8d467a1bda776c82115c07d87c851a997aac2e2cbca4981b06a0388bc2b4e` |
| Payment | `1540f83dcdfc1793d7d1d34bb00ea52b27614933f2f46f37a4e4a6ba31b3772d` | `https://stellar.expert/explorer/testnet/tx/1540f83dcdfc1793d7d1d34bb00ea52b27614933f2f46f37a4e4a6ba31b3772d` |
| Credit | `6d057380f813fd47ce8ed9aab70c5337bf1b6cdcacacddb794a7d458026e9c65` | `https://stellar.expert/explorer/testnet/tx/6d057380f813fd47ce8ed9aab70c5337bf1b6cdcacacddb794a7d458026e9c65` |
| Withdrawal | `1d3996dcfb94bd11e12409e27f123cedc91abaeb12c7879d15b6f0e571c81b73` | `https://stellar.expert/explorer/testnet/tx/1d3996dcfb94bd11e12409e27f123cedc91abaeb12c7879d15b6f0e571c81b73` |
| Operator USDC trustline | `a547d58013a46eda4372fc21c2b4032543dce8d63bf55c74d155f407a0ba2486` | `https://stellar.expert/explorer/testnet/tx/a547d58013a46eda4372fc21c2b4032543dce8d63bf55c74d155f407a0ba2486` |
| Platform fee withdrawal | `39f081ba4bc0ed7d1f1dae106c9cd353bacf9c1a110ff25c4f8d4b0998b45f1b` | `https://stellar.expert/explorer/testnet/tx/39f081ba4bc0ed7d1f1dae106c9cd353bacf9c1a110ff25c4f8d4b0998b45f1b` |

## Verification After Replay

| Command / check | Result |
| --- | --- |
| `node --env-file=.env.local scripts/beta-preflight.mjs` | Passed, `0 failure(s), 0 warning(s)` |
| Deployed route check for `/`, `/dashboard`, `/apis/new`, `/apis/7854e637-a1f6-406d-8d88-0761a78ed60e`, `/api/auth/me` | Passed, all returned `200` |
| `npm run test:beta` | Passed |
| `npm run audit:prod` | Passed, all production audits returned `0 vulnerabilities` |
| `npm run test:browser` | Passed route smoke for 4 routes across 2 viewports, plus mocked-Freighter wallet login/API registration/API detail browser flow |

## Known Limitations Confirmed During Replay

- Testnet only.
- GET-only registered APIs.
- No refunds, fiat checkout, marketplace, buyer accounts, mainnet, POST APIs, or compliance claims.
- Upstream failures after payment are logged, but no automated refund flow exists in V1.
- Automated replay signed withdrawal XDR with a throwaway testnet developer keypair. A separate manual Freighter recording is still needed for visual proof of the browser wallet popup.

## Notes

- Throwaway developer wallet: `GBMGAP62L4AN3K4VA447UQUD46F7DQNZNVUPKEIUHNKQGZOSAVOMGQY5`.
- Throwaway payer wallet: `GBVDSFFZMAA7KR4A7BHL43BGYRB6SGQ5N5VEKPX26UVXR3G4RARYDK4M`.
- Vercel `PAYGATE_DEMO_UPSTREAM_SECRET` was updated to the generated API secret through stdin and redeployed. The secret value is intentionally not recorded.
- The first platform fee withdrawal attempt failed because the current operator account did not have a USDC trustline. After creating the trustline, platform fee withdrawal succeeded.
