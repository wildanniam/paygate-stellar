# PayGate Soroban Contracts

This workspace contains Soroban contracts for PayGate V1.

PayGate V1 is a **pay-per-call gateway for APIs**. The first contract is `paygate-escrow`, a minimal settlement contract for the V1 spike.

## paygate-escrow

The escrow contract is responsible for financial state only:

- hold USDC testnet funds sent through MPP Charge,
- track developer withdrawable balances,
- track PayGate platform fee balance,
- prevent duplicate payment credit,
- let developers withdraw their own balances,
- let PayGate admin withdraw platform fees.

The contract does not store API registry data such as upstream URLs, API names, or secret headers. Those belong in Supabase.

## Structure

```text
contracts/
├── Cargo.toml
├── README.md
└── contracts/
    └── paygate-escrow/
        ├── Cargo.toml
        ├── Makefile
        └── src/
            ├── lib.rs
            └── test.rs
```

## Commands

Run from this directory:

```bash
cargo test
stellar contract build
```

The first spike target is to deploy this contract on Soroban testnet and verify that `@stellar/mpp` Charge can send USDC testnet to the deployed `C...` contract address.
