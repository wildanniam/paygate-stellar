# PayGate V1 Phase 8 Withdrawal Proof

Date: 2026-06-04
Branch: `codex/paygate-v1`
Commit checkpoint: `feat: add escrow withdrawal flow`

## Goal

Phase 8 proves that PayGate can support developer payout from the escrow contract without holding the developer wallet secret.

## Implemented

- `POST /api/withdraw/prepare`
  - Requires authenticated developer wallet session.
  - Reads the developer escrow balance.
  - Rejects withdrawal when balance is zero.
  - Prepares a Soroban contract invocation for `withdraw(developer)`.
  - Returns transaction XDR for Freighter signing.

- `POST /api/withdraw/submit`
  - Requires authenticated developer wallet session.
  - Accepts the Freighter-signed transaction XDR.
  - Verifies the signed transaction source matches the authenticated wallet.
  - Submits the transaction through Soroban RPC.
  - Waits for confirmation.
  - Records a withdrawal row.

- Dashboard withdrawal UI
  - Shows withdrawable developer balance.
  - Disables withdrawal when there is no balance or the contract is unavailable.
  - Runs prepare -> Freighter sign -> submit.
  - Refreshes dashboard state after successful withdrawal.
  - Shows withdrawal history.

- Admin fee command
  - `npm run admin:withdraw-fees`
  - Uses `PAYGATE_OPERATOR_SECRET` server-side.
  - Calls `withdraw_platform_fee`.
  - Prints amount, tx hash, and Stellar Expert testnet link.

## Verification

Command:

```bash
npm run test:withdrawal
```

Result:

```text
Phase 8 withdrawal smoke test passed
```

The smoke test proves:

- Unauthenticated withdrawal preparation returns `401`.
- Positive balance can prepare a withdrawal transaction.
- Signed withdrawal submission succeeds in deterministic memory mode.
- Withdrawal row is recorded.
- Dashboard shows withdrawal history.
- Developer balance resets after withdrawal.
- Second prepare with no balance returns `400`.
- Admin platform fee withdrawal command path works in deterministic memory mode.

Admin command smoke:

```bash
PAYGATE_REGISTRY_STORE=memory \
PAYGATE_ESCROW_WITHDRAW_MODE=memory \
PAYGATE_MOCK_PLATFORM_FEE_BALANCE_BASE_UNITS=20000 \
npm run admin:withdraw-fees
```

Result:

```text
PayGate platform fee withdrawal submitted
Amount: 0.0020000 USDC
Tx: mock-platform-fee-withdrawal
```

## Real Testnet Path

Real developer withdrawal uses the default non-mock path:

```text
dashboard button
-> POST /api/withdraw/prepare
-> Freighter signs prepared XDR
-> POST /api/withdraw/submit
-> Soroban RPC submits contract withdraw(developer)
-> withdrawals row is recorded
```

The backend never receives the developer secret key.

Admin platform fee withdrawal needs:

```text
ESCROW_CONTRACT_ID=
PAYGATE_OPERATOR_SECRET=
```

Without `PAYGATE_OPERATOR_SECRET`, the admin fee command cannot be executed against the live deployed testnet escrow contract from this local environment.
