#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{storage::Instance as _, storage::Persistent as _, Address as _, Ledger as _},
    token::{StellarAssetClient, TokenClient},
    Address, Env, Symbol,
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
fn accepts_current_payment_id_format() {
    let (env, escrow, _token_address, _admin, developer, _token_admin) = setup();
    let client = PayGateEscrowClient::new(&env, &escrow);
    let payment_id = "p0123456789abcdef0123456789abcd";

    assert_eq!(payment_id.len(), 31);
    let payment_id = Symbol::new(&env, payment_id);
    client.credit_payment(&payment_id, &developer, &1_000);

    assert!(client.processed(&payment_id));
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

#[test]
fn renews_instance_balances_and_payment_marker_ttls() {
    let (env, escrow, _token_address, _admin, developer, _token_admin) = setup();
    let client = PayGateEscrowClient::new(&env, &escrow);
    let payment_id = symbol_short!("pay1");

    client.credit_payment(&payment_id, &developer, &1_000);

    let developer_key = DataKey::DeveloperBalance(developer.clone());
    let fee_key = DataKey::PlatformFeeBalance;
    let payment_key = DataKey::ProcessedPayment(payment_id.clone());
    let initial_ttls = env.as_contract(&escrow, || {
        (
            env.storage().instance().get_ttl(),
            env.storage().persistent().get_ttl(&developer_key),
            env.storage().persistent().get_ttl(&fee_key),
            env.storage().persistent().get_ttl(&payment_key),
        )
    });
    assert!(initial_ttls.0 >= TTL_EXTEND_TO - 1);
    assert!(initial_ttls.1 >= TTL_EXTEND_TO - 1);
    assert!(initial_ttls.2 >= TTL_EXTEND_TO - 1);
    assert!(initial_ttls.3 >= TTL_EXTEND_TO - 1);

    env.ledger().with_mut(|ledger| {
        ledger.sequence_number += TTL_EXTEND_TO - TTL_BUMP_THRESHOLD + 2;
    });
    let before_renewal = env.as_contract(&escrow, || {
        env.storage().persistent().get_ttl(&developer_key)
    });
    assert!(before_renewal < TTL_BUMP_THRESHOLD);

    assert_eq!(client.balance(&developer), 900);
    assert_eq!(client.platform_fee_balance(), 100);
    assert!(client.processed(&payment_id));

    let renewed_ttls = env.as_contract(&escrow, || {
        (
            env.storage().instance().get_ttl(),
            env.storage().persistent().get_ttl(&developer_key),
            env.storage().persistent().get_ttl(&fee_key),
            env.storage().persistent().get_ttl(&payment_key),
        )
    });
    assert!(renewed_ttls.0 >= TTL_EXTEND_TO - 1);
    assert!(renewed_ttls.1 >= TTL_EXTEND_TO - 1);
    assert!(renewed_ttls.2 >= TTL_EXTEND_TO - 1);
    assert!(renewed_ttls.3 >= TTL_EXTEND_TO - 1);
}
