#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env, Symbol,
};

const FEE_BPS: i128 = 1_000;
const BPS_DENOMINATOR: i128 = 10_000;

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
            .instance()
            .set(&DataKey::PlatformFeeBalance, &0_i128);

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
            return Err(EscrowError::PaymentAlreadyProcessed);
        }

        let fee = gross_amount * FEE_BPS / BPS_DENOMINATOR;
        let developer_amount = gross_amount - fee;

        let developer_key = DataKey::DeveloperBalance(developer.clone());
        let current_developer_balance: i128 = env
            .storage()
            .persistent()
            .get(&developer_key)
            .unwrap_or(0_i128);
        env.storage().persistent().set(
            &developer_key,
            &(current_developer_balance + developer_amount),
        );

        let current_fee_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::PlatformFeeBalance)
            .unwrap_or(0_i128);
        env.storage()
            .persistent()
            .set(&DataKey::PlatformFeeBalance, &(current_fee_balance + fee));

        env.storage().persistent().set(&payment_key, &true);
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
        developer.require_auth();

        let developer_key = DataKey::DeveloperBalance(developer.clone());
        let balance: i128 = env
            .storage()
            .persistent()
            .get(&developer_key)
            .unwrap_or(0_i128);
        if balance <= 0 {
            return Err(EscrowError::NoBalance);
        }

        env.storage().persistent().set(&developer_key, &0_i128);
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

        let balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::PlatformFeeBalance)
            .unwrap_or(0_i128);
        if balance <= 0 {
            return Err(EscrowError::NoBalance);
        }

        env.storage()
            .persistent()
            .set(&DataKey::PlatformFeeBalance, &0_i128);
        transfer_from_contract(&env, &admin, balance)?;
        PlatformFeeWithdrawn {
            admin,
            amount: balance,
        }
        .publish(&env);

        Ok(balance)
    }

    pub fn balance(env: Env, developer: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::DeveloperBalance(developer))
            .unwrap_or(0_i128)
    }

    pub fn platform_fee_balance(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::PlatformFeeBalance)
            .unwrap_or(0_i128)
    }

    pub fn processed(env: Env, payment_id: Symbol) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::ProcessedPayment(payment_id))
            .unwrap_or(false)
    }
}

fn require_admin(env: &Env) -> Result<Address, EscrowError> {
    let admin: Address = env
        .storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(EscrowError::NotInitialized)?;
    admin.require_auth();
    Ok(admin)
}

fn transfer_from_contract(env: &Env, to: &Address, amount: i128) -> Result<(), EscrowError> {
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
