#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env, Symbol,
};

const FEE_BPS: i128 = 1_000;
const BPS_DENOMINATOR: i128 = 10_000;
const LEDGERS_PER_DAY: u32 = 17_280;
const TTL_BUMP_THRESHOLD: u32 = 29 * LEDGERS_PER_DAY;
const TTL_EXTEND_TO: u32 = 30 * LEDGERS_PER_DAY;

#[contract]
pub struct PayGateEscrow;

#[contractevent]
#[derive(Clone)]
pub struct PaymentCredited {
    #[topic]
    pub developer: Address,
    #[topic]
    pub payment_id: Symbol,
    pub gross_amount: i128,
    pub developer_amount: i128,
    pub fee: i128,
}

#[contractevent]
#[derive(Clone)]
pub struct DeveloperWithdrawn {
    #[topic]
    pub developer: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone)]
pub struct PlatformFeeWithdrawn {
    #[topic]
    pub admin: Address,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Token,
    DeveloperBalance(Address),
    PlatformFeeBalance,
    ProcessedPayment(Symbol),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    PaymentAlreadyProcessed = 3,
    InvalidAmount = 4,
    NoBalance = 5,
}

#[contractimpl]
impl PayGateEscrow {
    pub fn init(env: Env, admin: Address, token: Address) -> Result<(), EscrowError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowError::AlreadyInitialized);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage()
            .persistent()
            .set(&DataKey::PlatformFeeBalance, &0_i128);
        bump_instance_ttl(&env);
        bump_persistent_ttl(&env, &DataKey::PlatformFeeBalance);

        Ok(())
    }

    pub fn credit_payment(
        env: Env,
        payment_id: Symbol,
        developer: Address,
        gross_amount: i128,
    ) -> Result<(), EscrowError> {
        require_admin(&env)?;

        if gross_amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }

        let payment_key = DataKey::ProcessedPayment(payment_id.clone());
        if env.storage().persistent().has(&payment_key) {
            bump_persistent_ttl(&env, &payment_key);
            return Err(EscrowError::PaymentAlreadyProcessed);
        }

        let fee = gross_amount * FEE_BPS / BPS_DENOMINATOR;
        let developer_amount = gross_amount - fee;

        let developer_key = DataKey::DeveloperBalance(developer.clone());
        let current_developer_balance = read_persistent_i128(&env, &developer_key);
        env.storage().persistent().set(
            &developer_key,
            &(current_developer_balance + developer_amount),
        );
        bump_persistent_ttl(&env, &developer_key);

        let current_fee_balance = read_persistent_i128(&env, &DataKey::PlatformFeeBalance);
        env.storage()
            .persistent()
            .set(&DataKey::PlatformFeeBalance, &(current_fee_balance + fee));
        bump_persistent_ttl(&env, &DataKey::PlatformFeeBalance);

        env.storage().persistent().set(&payment_key, &true);
        bump_persistent_ttl(&env, &payment_key);
        PaymentCredited {
            developer,
            payment_id,
            gross_amount,
            developer_amount,
            fee,
        }
        .publish(&env);

        Ok(())
    }

    pub fn withdraw(env: Env, developer: Address) -> Result<i128, EscrowError> {
        bump_instance_ttl(&env);
        developer.require_auth();

        let developer_key = DataKey::DeveloperBalance(developer.clone());
        let balance = read_persistent_i128(&env, &developer_key);
        if balance <= 0 {
            return Err(EscrowError::NoBalance);
        }

        env.storage().persistent().set(&developer_key, &0_i128);
        bump_persistent_ttl(&env, &developer_key);
        transfer_from_contract(&env, &developer, balance)?;
        DeveloperWithdrawn {
            developer,
            amount: balance,
        }
        .publish(&env);

        Ok(balance)
    }

    pub fn withdraw_platform_fee(env: Env) -> Result<i128, EscrowError> {
        let admin = require_admin(&env)?;

        let balance = read_persistent_i128(&env, &DataKey::PlatformFeeBalance);
        if balance <= 0 {
            return Err(EscrowError::NoBalance);
        }

        env.storage()
            .persistent()
            .set(&DataKey::PlatformFeeBalance, &0_i128);
        bump_persistent_ttl(&env, &DataKey::PlatformFeeBalance);
        transfer_from_contract(&env, &admin, balance)?;
        PlatformFeeWithdrawn {
            admin,
            amount: balance,
        }
        .publish(&env);

        Ok(balance)
    }

    pub fn balance(env: Env, developer: Address) -> i128 {
        bump_instance_ttl(&env);
        read_persistent_i128(&env, &DataKey::DeveloperBalance(developer))
    }

    pub fn platform_fee_balance(env: Env) -> i128 {
        bump_instance_ttl(&env);
        read_persistent_i128(&env, &DataKey::PlatformFeeBalance)
    }

    pub fn processed(env: Env, payment_id: Symbol) -> bool {
        bump_instance_ttl(&env);
        let key = DataKey::ProcessedPayment(payment_id);
        let processed = env.storage().persistent().get(&key).unwrap_or(false);
        if processed {
            bump_persistent_ttl(&env, &key);
        }
        processed
    }
}

fn bump_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_BUMP_THRESHOLD, TTL_EXTEND_TO);
}

fn bump_persistent_ttl(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, TTL_BUMP_THRESHOLD, TTL_EXTEND_TO);
}

fn read_persistent_i128(env: &Env, key: &DataKey) -> i128 {
    let value = env.storage().persistent().get(key);
    if value.is_some() {
        bump_persistent_ttl(env, key);
    }
    value.unwrap_or(0_i128)
}

fn require_admin(env: &Env) -> Result<Address, EscrowError> {
    bump_instance_ttl(env);
    let admin: Address = env
        .storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(EscrowError::NotInitialized)?;
    admin.require_auth();
    Ok(admin)
}

fn transfer_from_contract(env: &Env, to: &Address, amount: i128) -> Result<(), EscrowError> {
    bump_instance_ttl(env);
    let token_address: Address = env
        .storage()
        .instance()
        .get(&DataKey::Token)
        .ok_or(EscrowError::NotInitialized)?;
    let token = token::TokenClient::new(env, &token_address);
    token.transfer(&env.current_contract_address(), to, &amount);
    Ok(())
}

mod test;
