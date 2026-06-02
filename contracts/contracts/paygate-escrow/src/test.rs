#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env,
};

fn setup() -> (Env, Address, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let developer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token.address();

    let escrow = env.register(PayGateEscrow, ());
    let client = PayGateEscrowClient::new(&env, &escrow);
    client.init(&admin, &token_address);

    (env, escrow, token_address, admin, developer, token_admin)
}

#[test]
fn credits_developer_and_platform_fee() {
    let (env, escrow, token_address, _admin, developer, _token_admin) = setup();
    let client = PayGateEscrowClient::new(&env, &escrow);
    let asset_client = StellarAssetClient::new(&env, &token_address);
    let token_client = TokenClient::new(&env, &token_address);

    asset_client.mint(&escrow, &1_000);
    client.credit_payment(&symbol_short!("pay1"), &developer, &1_000);

    assert_eq!(client.balance(&developer), 900);
    assert_eq!(client.platform_fee_balance(), 100);
    assert!(client.processed(&symbol_short!("pay1")));
    assert_eq!(token_client.balance(&escrow), 1_000);
}

#[test]
fn rejects_duplicate_payment_ids() {
    let (env, escrow, _token_address, _admin, developer, _token_admin) = setup();
    let client = PayGateEscrowClient::new(&env, &escrow);

    client.credit_payment(&symbol_short!("pay1"), &developer, &1_000);

    let error = client
        .try_credit_payment(&symbol_short!("pay1"), &developer, &1_000)
        .unwrap_err()
        .unwrap();
    assert_eq!(error, EscrowError::PaymentAlreadyProcessed);
}

#[test]
fn developer_can_withdraw_own_balance() {
    let (env, escrow, token_address, _admin, developer, _token_admin) = setup();
    let client = PayGateEscrowClient::new(&env, &escrow);
    let asset_client = StellarAssetClient::new(&env, &token_address);
    let token_client = TokenClient::new(&env, &token_address);

    asset_client.mint(&escrow, &1_000);
    client.credit_payment(&symbol_short!("pay1"), &developer, &1_000);

    let withdrawn = client.withdraw(&developer);

    assert_eq!(withdrawn, 900);
    assert_eq!(client.balance(&developer), 0);
    assert_eq!(token_client.balance(&developer), 900);
    assert_eq!(token_client.balance(&escrow), 100);
}

#[test]
fn admin_can_withdraw_platform_fee() {
    let (env, escrow, token_address, admin, developer, _token_admin) = setup();
    let client = PayGateEscrowClient::new(&env, &escrow);
    let asset_client = StellarAssetClient::new(&env, &token_address);
    let token_client = TokenClient::new(&env, &token_address);

    asset_client.mint(&escrow, &1_000);
    client.credit_payment(&symbol_short!("pay1"), &developer, &1_000);

    let withdrawn = client.withdraw_platform_fee();

    assert_eq!(withdrawn, 100);
    assert_eq!(client.platform_fee_balance(), 0);
    assert_eq!(token_client.balance(&admin), 100);
    assert_eq!(token_client.balance(&escrow), 900);
}
