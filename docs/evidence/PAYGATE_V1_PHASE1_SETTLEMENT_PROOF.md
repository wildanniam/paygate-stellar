# PayGate V1 Phase 1 Settlement Proof

> Date: 2026-06-04.
> Network: Stellar testnet / Soroban testnet.
> Phase: Payment And Contract Proof.
> Result: Direct MPP-to-contract works. Fallback wallet path is not needed for the current spike.

This document records the Phase 1 evidence for the locked PayGate V1 plan.

## Scope

Phase 1 needed to prove or reject the core payment assumption before building wallet auth, Supabase registry, or paid proxy success flow.

The tested flow was:

```text
deploy paygate-escrow
-> initialize it with official testnet USDC SAC
-> move USDC into escrow
-> credit developer/platform ledger
-> withdraw developer balance
-> withdraw platform fee
-> configure MPP Charge recipient as escrow C... contract
-> agent pays escrow contract through MPP
-> API returns 200
-> contract receives USDC
-> backend/operator credits the escrow ledger
```

## Public Testnet Addresses

No secret keys are stored in this repository.

| Role | Public address |
|---|---|
| Escrow contract | `CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM` |
| Admin / PayGate operator | `GAGUU5KHTCX23KGVPQALUKRDYA5DF7KUTOBGGLCPV3LMUPRBCMOX7RNS` |
| Developer wallet | `GD5BCBBDALI3W35QY5DXB6JNP7SAZEXKEMOJJ4AJPTJABL4MTSZUSJKM` |
| Agent / payer wallet | `GBGXIGC36FD6COHDTBOA6KU4BW3U7UBVABMHKNRB4CRUHCIKH42IILLW` |

## Token

Official Stellar testnet USDC was used.

| Field | Value |
|---|---|
| Asset code | `USDC` |
| Issuer | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |
| SEP-41 / SAC contract | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |
| Decimals | `7` |
| Source | Stellar docs, x402 on Stellar, Testnet USDC section |

## Local Verification

Commands:

```bash
cd contracts
cargo test
stellar contract build
```

Results:

- `cargo test`: 4 passed.
- `stellar contract build`: succeeded.
- WASM hash: `b17921b9446d6155d38d7cf9c842082f92c0d01027a59aadc6802a4c9d74d751`.

## Testnet Deploy And Init

| Action | Tx hash |
|---|---|
| Upload WASM | `7cf683562c870954a81b8385ba0a94cadd3654033248aefcdf166be0e34cc42f` |
| Deploy escrow contract | `ba36b358a64372392f1747d3fc847beea6221c005843141a10d1c7e4d7a24425` |
| Init escrow with admin and USDC token | `e344f9484b3e14ff871174e2abf540c536069b6c3b5c23313330060ebda06ab3` |

Explorer links:

- `https://stellar.expert/explorer/testnet/tx/7cf683562c870954a81b8385ba0a94cadd3654033248aefcdf166be0e34cc42f`
- `https://stellar.expert/explorer/testnet/tx/ba36b358a64372392f1747d3fc847beea6221c005843141a10d1c7e4d7a24425`
- `https://stellar.expert/explorer/testnet/tx/e344f9484b3e14ff871174e2abf540c536069b6c3b5c23313330060ebda06ab3`

## Contract Hold And Withdraw Proof

The payer obtained 2 USDC testnet through the Stellar testnet order book after creating trustlines.

| Action | Tx hash |
|---|---|
| Admin USDC trustline | `b0bc4120e91ba7d414f9881e822eabb5c8d25f450b9e14d629e875dd887ea123` |
| Developer USDC trustline | `794b082ad99ebd40cbf97286d7363eb38457f2038f665bf2782fa8b40ffe65e6` |
| Payer USDC trustline | `24cc785670a739a6dea791f11d0fddc69823be20c9010ca39f3dfa34343b3cfd` |
| Payer buys 2 USDC with XLM | `dd2fae2d053270987370965c37b6fbed052f1fa42b01b0a90d02075072b79a0d` |

Manual escrow transfer and ledger proof:

| Action | Amount | Tx hash |
|---|---:|---|
| Payer transfers USDC to escrow | `1000000` stroops = `0.1` USDC | `b5d1022d99cd4f887c6174827c3d5024059594f6d78fc29fd87cf4da1c27ce8a` |
| Admin credits payment `p1a001` | gross `1000000`, developer `900000`, fee `100000` | `fad73bf6087f465f8f18ab121a700d2257ce25b349e44ad9d4dbdee0d101dfad` |
| Developer withdraws | `900000` stroops = `0.09` USDC | `8f0647f5595020a394df833b1545e2d4c0e192af960db2b1e3c68dfd679d50d7` |
| Admin withdraws platform fee | `100000` stroops = `0.01` USDC | `0bf30b3fd0b5385f933dd9b22de39a6c8167e2c6405ac075a2bd13466a26d04b` |

Final state after this proof:

| Balance | Value |
|---|---:|
| Developer escrow ledger balance | `0` |
| Platform fee ledger balance | `0` |
| Escrow USDC token balance | `0` |
| Developer wallet USDC received | `900000` stroops |
| Admin wallet USDC received | `100000` stroops |

## MPP Direct-To-Contract Proof

The local MPP demo API was run with:

```bash
PORT=4100 \
STELLAR_RECIPIENT=CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM \
MPP_SECRET_KEY=<local-random-secret> \
npm start
```

Unpaid request:

```bash
curl -i http://localhost:4100/v1/market-signal
```

Result:

```text
HTTP/1.1 402 Payment Required
```

Paid agent request:

```bash
STELLAR_SECRET=<local-testnet-payer-secret> \
PAYGATE_SAMPLE_URL=http://localhost:4100/v1/market-signal \
npm run client
```

Result:

```text
Response status: 200
Response body: { signal: 'bullish', confidence: 0.82, source: 'PayGate demo API' }
```

MPP payment evidence:

| Action | Amount | Tx hash |
|---|---:|---|
| Agent pays escrow contract through MPP | `100000` stroops = `0.01` USDC | `21d344a5bd5fcb0b19896f78a47d7bfad744399eaf87834f5a9417f3143195c5` |
| Admin credits payment `mpp001` | gross `100000`, developer `90000`, fee `10000` | `31c6677709e56f9d09355c93907296dd9dc9361cbcb698764e9b6e19de98f7d0` |

Final state after MPP proof:

| Balance | Value |
|---|---:|
| Escrow USDC token balance | `100000` stroops |
| Developer escrow ledger balance | `90000` stroops |
| Platform fee ledger balance | `10000` stroops |

Explorer links:

- `https://stellar.expert/explorer/testnet/tx/21d344a5bd5fcb0b19896f78a47d7bfad744399eaf87834f5a9417f3143195c5`
- `https://stellar.expert/explorer/testnet/tx/31c6677709e56f9d09355c93907296dd9dc9361cbcb698764e9b6e19de98f7d0`

## Decision

MPP direct-to-contract is proven for this spike:

- `@stellar/mpp` Charge accepted a `C...` Soroban contract as recipient.
- The local agent/client paid the escrow contract.
- The MPP server accepted the payment and returned `200`.
- Escrow token balance increased by the MPP amount.
- The backend/operator can then call `creditPayment` to update the escrow ledger.

Fallback wallet-to-contract-ledger settlement is not required for the current V1 demo path, but it remains a contingency if production constraints change.

## Follow-Up Notes

- The escrow contract does not automatically credit balances on token receipt. PayGate backend must verify the MPP payment and call `creditPayment`.
- Current `payment_id` is a Soroban `Symbol`, so generated IDs must stay short. Before production, consider switching to a safer `BytesN<32>` or string-like identifier.
- The local example middleware still hardcodes `realm: 'http://localhost:4000'`; later phases should make the realm environment-driven before production demo.
- The local test identities are testnet only and should not be reused as production/operator keys.
