import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

function nowIso() {
  return new Date().toISOString();
}

function getMemoryState() {
  if (!globalThis.__PAYGATE_REGISTRY_MEMORY) {
    globalThis.__PAYGATE_REGISTRY_MEMORY = {
      apis: new Map(),
      developers: new Map(),
      mppStore: new Map(),
      payments: new Map(),
      proxyRequests: new Map(),
    };
  }
  return globalThis.__PAYGATE_REGISTRY_MEMORY;
}

function publicApiFields(record) {
  return {
    id: record.id,
    owner_wallet: record.owner_wallet,
    name: record.name,
    upstream_base_url: record.upstream_base_url,
    path: record.path,
    method: record.method,
    price_usdc: record.price_usdc,
    active: record.active,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function publicProxyRequestFields(record) {
  return {
    id: record.id,
    api_id: record.api_id,
    owner_wallet: record.owner_wallet,
    payment_id: record.payment_id,
    status: record.status,
    price_usdc: record.price_usdc,
    payer_wallet: record.payer_wallet,
    tx_hash: record.tx_hash,
    upstream_status: record.upstream_status,
    error_message: record.error_message,
    created_at: record.created_at,
    paid_at: record.paid_at,
    forwarded_at: record.forwarded_at,
  };
}

function publicPaymentFields(record) {
  return {
    id: record.id,
    request_id: record.request_id,
    api_id: record.api_id,
    payment_id: record.payment_id,
    tx_hash: record.tx_hash,
    credit_tx_hash: record.credit_tx_hash,
    gross_amount_usdc: record.gross_amount_usdc,
    developer_amount_usdc: record.developer_amount_usdc,
    platform_fee_usdc: record.platform_fee_usdc,
    recipient_mode: record.recipient_mode,
    verified_at: record.verified_at,
    credited_at: record.credited_at,
    created_at: record.created_at,
  };
}

function shouldUseMemoryStore() {
  return process.env.PAYGATE_REGISTRY_STORE === 'memory';
}

function createMemoryRegistry() {
  const state = getMemoryState();

  return {
    mode: 'memory',
    async upsertDeveloper(walletAddress) {
      const current = state.developers.get(walletAddress);
      const row = {
        id: current?.id || crypto.randomUUID(),
        wallet_address: walletAddress,
        created_at: current?.created_at || nowIso(),
        last_login_at: nowIso(),
      };
      state.developers.set(walletAddress, row);
      return row;
    },
    async listApis(ownerWallet) {
      return [...state.apis.values()]
        .filter((record) => record.owner_wallet === ownerWallet)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(publicApiFields);
    },
    async createApi(record) {
      const row = {
        ...record,
        id: crypto.randomUUID(),
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      state.apis.set(row.id, row);
      return publicApiFields(row);
    },
    async getApi(apiId, ownerWallet) {
      const row = state.apis.get(apiId);
      if (!row || row.owner_wallet !== ownerWallet) return null;
      return row;
    },
    async updateApi(apiId, ownerWallet, updates) {
      const row = state.apis.get(apiId);
      if (!row || row.owner_wallet !== ownerWallet) return null;
      const next = {
        ...row,
        ...updates,
        updated_at: nowIso(),
      };
      state.apis.set(apiId, next);
      return publicApiFields(next);
    },
    async getPublicApi(apiId) {
      const row = state.apis.get(apiId);
      if (!row || !row.active) return null;
      return row;
    },
    async createProxyRequest(record) {
      const row = {
        ...record,
        id: crypto.randomUUID(),
        payer_wallet: record.payer_wallet ?? null,
        tx_hash: record.tx_hash ?? null,
        upstream_status: record.upstream_status ?? null,
        error_message: record.error_message ?? null,
        paid_at: record.paid_at ?? null,
        forwarded_at: record.forwarded_at ?? null,
        created_at: nowIso(),
      };
      state.proxyRequests.set(row.id, row);
      return publicProxyRequestFields(row);
    },
    async getProxyRequestByPaymentId(paymentId) {
      return [...state.proxyRequests.values()].find((row) => row.payment_id === paymentId) ?? null;
    },
    async updateProxyRequest(proxyRequestId, updates) {
      const row = state.proxyRequests.get(proxyRequestId);
      if (!row) return null;
      const next = {
        ...row,
        ...updates,
      };
      state.proxyRequests.set(proxyRequestId, next);
      return publicProxyRequestFields(next);
    },
    async getPaymentByPaymentId(paymentId) {
      const row = [...state.payments.values()].find((payment) => payment.payment_id === paymentId);
      return row ? publicPaymentFields(row) : null;
    },
    async createPayment(record) {
      const duplicatePaymentId = [...state.payments.values()].find(
        (payment) => payment.payment_id === record.payment_id,
      );
      const duplicateTxHash = [...state.payments.values()].find(
        (payment) => payment.tx_hash === record.tx_hash,
      );
      if (duplicatePaymentId || duplicateTxHash) {
        const error = new Error('duplicate key value violates unique constraint');
        error.code = '23505';
        throw error;
      }
      const row = {
        ...record,
        id: crypto.randomUUID(),
        credit_tx_hash: record.credit_tx_hash ?? null,
        verified_at: record.verified_at ?? null,
        credited_at: record.credited_at ?? null,
        created_at: nowIso(),
      };
      state.payments.set(row.id, row);
      return publicPaymentFields(row);
    },
    async updatePayment(paymentId, updates) {
      const row = [...state.payments.values()].find((payment) => payment.payment_id === paymentId);
      if (!row) return null;
      const next = {
        ...row,
        ...updates,
      };
      state.payments.set(row.id, next);
      return publicPaymentFields(next);
    },
    async getMppStoreValue(key) {
      const raw = state.mppStore.get(key);
      return raw === undefined ? null : JSON.parse(raw);
    },
    async putMppStoreValue(key, value) {
      state.mppStore.set(key, JSON.stringify(value));
    },
    async deleteMppStoreValue(key) {
      state.mppStore.delete(key);
    },
  };
}

function createSupabaseRegistry() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  const client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    mode: 'supabase',
    async upsertDeveloper(walletAddress) {
      const { data, error } = await client
        .from('developers')
        .upsert(
          {
            wallet_address: walletAddress,
            last_login_at: nowIso(),
          },
          { onConflict: 'wallet_address' },
        )
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    async listApis(ownerWallet) {
      const { data, error } = await client
        .from('apis')
        .select('id, owner_wallet, name, upstream_base_url, path, method, price_usdc, active, created_at, updated_at')
        .eq('owner_wallet', ownerWallet)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    async createApi(record) {
      const { data, error } = await client
        .from('apis')
        .insert(record)
        .select('id, owner_wallet, name, upstream_base_url, path, method, price_usdc, active, created_at, updated_at')
        .single();
      if (error) throw error;
      return data;
    },
    async getApi(apiId, ownerWallet) {
      const { data, error } = await client
        .from('apis')
        .select('*')
        .eq('id', apiId)
        .eq('owner_wallet', ownerWallet)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async updateApi(apiId, ownerWallet, updates) {
      const { data, error } = await client
        .from('apis')
        .update(updates)
        .eq('id', apiId)
        .eq('owner_wallet', ownerWallet)
        .select('id, owner_wallet, name, upstream_base_url, path, method, price_usdc, active, created_at, updated_at')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async getPublicApi(apiId) {
      const { data, error } = await client
        .from('apis')
        .select('*')
        .eq('id', apiId)
        .eq('active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async createProxyRequest(record) {
      const { data, error } = await client
        .from('proxy_requests')
        .insert(record)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    async getProxyRequestByPaymentId(paymentId) {
      const { data, error } = await client
        .from('proxy_requests')
        .select('*')
        .eq('payment_id', paymentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async updateProxyRequest(proxyRequestId, updates) {
      const { data, error } = await client
        .from('proxy_requests')
        .update(updates)
        .eq('id', proxyRequestId)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async getPaymentByPaymentId(paymentId) {
      const { data, error } = await client
        .from('payments')
        .select('*')
        .eq('payment_id', paymentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async createPayment(record) {
      const { data, error } = await client
        .from('payments')
        .insert(record)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    async updatePayment(paymentId, updates) {
      const { data, error } = await client
        .from('payments')
        .update(updates)
        .eq('payment_id', paymentId)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async getMppStoreValue(key) {
      const { data, error } = await client
        .from('mpp_store')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) throw error;
      return data?.value ?? null;
    },
    async putMppStoreValue(key, value) {
      const { error } = await client
        .from('mpp_store')
        .upsert(
          {
            key,
            value,
            updated_at: nowIso(),
          },
          { onConflict: 'key' },
        );
      if (error) throw error;
    },
    async deleteMppStoreValue(key) {
      const { error } = await client.from('mpp_store').delete().eq('key', key);
      if (error) throw error;
    },
  };
}

export function getRegistryStore() {
  if (shouldUseMemoryStore()) return createMemoryRegistry();
  return createSupabaseRegistry();
}

export function clearRegistryForTest() {
  const state = getMemoryState();
  state.apis.clear();
  state.developers.clear();
  state.mppStore?.clear();
  state.payments?.clear();
  state.proxyRequests?.clear();
}

export function getRawApisForTest() {
  return [...getMemoryState().apis.values()];
}

export function getRawProxyRequestsForTest() {
  return [...getMemoryState().proxyRequests.values()];
}

export function getRawPaymentsForTest() {
  return [...getMemoryState().payments.values()];
}

export function getRawMppStoreForTest() {
  return [...getMemoryState().mppStore.entries()].map(([key, value]) => [key, JSON.parse(value)]);
}
