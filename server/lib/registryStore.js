import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

function nowIso() {
  return new Date().toISOString();
}

function resolveApiStatus(record) {
  if (['pending_setup', 'active', 'archived'].includes(record.status)) return record.status;
  if (record.archived_at) return 'archived';
  return record.active ? 'active' : 'pending_setup';
}

function normalizeApiRecord(record) {
  const status = resolveApiStatus(record);
  return {
    ...record,
    status,
    active: status === 'active',
    verified_at: record.verified_at ?? null,
    archived_at: record.archived_at ?? null,
  };
}

function normalizeApiUpdates(updates) {
  const next = { ...updates };
  if (next.status) {
    next.active = next.status === 'active';
  } else if (next.archived_at !== undefined && next.archived_at !== null) {
    next.status = 'archived';
    next.active = false;
  } else if (next.active !== undefined) {
    next.status = next.active ? 'active' : 'pending_setup';
  }
  return next;
}

function getMemoryState() {
  if (!globalThis.__PAYGATE_REGISTRY_MEMORY) {
    globalThis.__PAYGATE_REGISTRY_MEMORY = {
      apis: new Map(),
      developers: new Map(),
      mppStore: new Map(),
      payments: new Map(),
      proxyRequests: new Map(),
      withdrawals: new Map(),
    };
  }
  return globalThis.__PAYGATE_REGISTRY_MEMORY;
}

function publicApiFields(record) {
  const normalized = normalizeApiRecord(record);
  return {
    id: normalized.id,
    owner_wallet: normalized.owner_wallet,
    name: normalized.name,
    upstream_base_url: normalized.upstream_base_url,
    path: normalized.path,
    method: normalized.method,
    price_usdc: normalized.price_usdc,
    status: normalized.status,
    active: normalized.active,
    verified_at: normalized.verified_at,
    archived_at: normalized.archived_at,
    created_at: normalized.created_at,
    updated_at: normalized.updated_at,
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

function publicWithdrawalFields(record) {
  return {
    id: record.id,
    wallet_address: record.wallet_address,
    amount_usdc: record.amount_usdc,
    tx_hash: record.tx_hash,
    status: record.status,
    created_at: record.created_at,
    completed_at: record.completed_at,
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
        ...normalizeApiRecord(record),
        id: crypto.randomUUID(),
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      state.apis.set(row.id, row);
      return publicApiFields(row);
    },
    async findLiveApiByEndpoint({ method, upstreamBaseUrl, path }) {
      const row = [...state.apis.values()].find((record) => {
        const normalized = normalizeApiRecord(record);
        return (
          ['pending_setup', 'active'].includes(normalized.status)
          && normalized.method === method
          && normalized.upstream_base_url.toLowerCase() === upstreamBaseUrl.toLowerCase()
          && normalized.path === path
        );
      });
      return row ? publicApiFields(row) : null;
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
        ...normalizeApiRecord({ ...row, ...normalizeApiUpdates(updates) }),
        updated_at: nowIso(),
      };
      state.apis.set(apiId, next);
      return publicApiFields(next);
    },
    async deleteApi(apiId, ownerWallet) {
      const row = state.apis.get(apiId);
      if (!row || row.owner_wallet !== ownerWallet) return false;
      state.apis.delete(apiId);
      return true;
    },
    async getApiActivityCounts(apiId) {
      const proxyRequests = [...state.proxyRequests.values()].filter((record) => record.api_id === apiId).length;
      const payments = [...state.payments.values()].filter((record) => record.api_id === apiId).length;
      return { proxyRequests, payments, total: proxyRequests + payments };
    },
    async getPublicApi(apiId) {
      const row = state.apis.get(apiId);
      if (!row || resolveApiStatus(row) !== 'active') return null;
      return normalizeApiRecord(row);
    },
    async listProxyRequests(ownerWallet, limit = 100) {
      return [...state.proxyRequests.values()]
        .filter((record) => record.owner_wallet === ownerWallet)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit)
        .map(publicProxyRequestFields);
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
    async listPaymentsForOwner(ownerWallet, limit = 100) {
      const ownedApiIds = new Set(
        [...state.apis.values()]
          .filter((record) => record.owner_wallet === ownerWallet)
          .map((record) => record.id),
      );
      return [...state.payments.values()]
        .filter((payment) => ownedApiIds.has(payment.api_id))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit)
        .map(publicPaymentFields);
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
    async listWithdrawals(walletAddress, limit = 50) {
      return [...state.withdrawals.values()]
        .filter((record) => record.wallet_address === walletAddress)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit)
        .map(publicWithdrawalFields);
    },
    async createWithdrawal(record) {
      const row = {
        ...record,
        id: crypto.randomUUID(),
        tx_hash: record.tx_hash ?? null,
        completed_at: record.completed_at ?? null,
        created_at: nowIso(),
      };
      state.withdrawals.set(row.id, row);
      return publicWithdrawalFields(row);
    },
    async updateWithdrawal(withdrawalId, updates) {
      const row = state.withdrawals.get(withdrawalId);
      if (!row) return null;
      const next = {
        ...row,
        ...updates,
      };
      state.withdrawals.set(withdrawalId, next);
      return publicWithdrawalFields(next);
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
        .select('id, owner_wallet, name, upstream_base_url, path, method, price_usdc, status, active, verified_at, archived_at, created_at, updated_at')
        .eq('owner_wallet', ownerWallet)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(publicApiFields);
    },
    async createApi(record) {
      const { data, error } = await client
        .from('apis')
        .insert(normalizeApiRecord(record))
        .select('id, owner_wallet, name, upstream_base_url, path, method, price_usdc, status, active, verified_at, archived_at, created_at, updated_at')
        .single();
      if (error) throw error;
      return publicApiFields(data);
    },
    async findLiveApiByEndpoint({ method, upstreamBaseUrl, path }) {
      const { data, error } = await client
        .from('apis')
        .select('id, owner_wallet, name, upstream_base_url, path, method, price_usdc, status, active, verified_at, archived_at, created_at, updated_at')
        .eq('method', method)
        .eq('upstream_base_url', upstreamBaseUrl)
        .eq('path', path)
        .in('status', ['pending_setup', 'active'])
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? publicApiFields(data) : null;
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
        .update(normalizeApiUpdates(updates))
        .eq('id', apiId)
        .eq('owner_wallet', ownerWallet)
        .select('id, owner_wallet, name, upstream_base_url, path, method, price_usdc, status, active, verified_at, archived_at, created_at, updated_at')
        .maybeSingle();
      if (error) throw error;
      return data ? publicApiFields(data) : null;
    },
    async deleteApi(apiId, ownerWallet) {
      const { data, error } = await client
        .from('apis')
        .delete()
        .eq('id', apiId)
        .eq('owner_wallet', ownerWallet)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
    async getApiActivityCounts(apiId) {
      const [{ count: proxyRequests, error: proxyError }, { count: payments, error: paymentError }] = await Promise.all([
        client
          .from('proxy_requests')
          .select('id', { count: 'exact', head: true })
          .eq('api_id', apiId),
        client
          .from('payments')
          .select('id', { count: 'exact', head: true })
          .eq('api_id', apiId),
      ]);
      if (proxyError) throw proxyError;
      if (paymentError) throw paymentError;
      return {
        proxyRequests: proxyRequests ?? 0,
        payments: payments ?? 0,
        total: (proxyRequests ?? 0) + (payments ?? 0),
      };
    },
    async getPublicApi(apiId) {
      const { data, error } = await client
        .from('apis')
        .select('*')
        .eq('id', apiId)
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      return data ? normalizeApiRecord(data) : null;
    },
    async listProxyRequests(ownerWallet, limit = 100) {
      const { data, error } = await client
        .from('proxy_requests')
        .select('*')
        .eq('owner_wallet', ownerWallet)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
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
    async listPaymentsForOwner(ownerWallet, limit = 100) {
      const { data: apis, error: apiError } = await client
        .from('apis')
        .select('id')
        .eq('owner_wallet', ownerWallet)
        .order('created_at', { ascending: false });
      if (apiError) throw apiError;

      const apiIds = (apis ?? []).map((api) => api.id);
      if (apiIds.length === 0) return [];

      const { data, error } = await client
        .from('payments')
        .select('*')
        .in('api_id', apiIds)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
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
    async listWithdrawals(walletAddress, limit = 50) {
      const { data, error } = await client
        .from('withdrawals')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    async createWithdrawal(record) {
      const { data, error } = await client
        .from('withdrawals')
        .insert(record)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    async updateWithdrawal(withdrawalId, updates) {
      const { data, error } = await client
        .from('withdrawals')
        .update(updates)
        .eq('id', withdrawalId)
        .select('*')
        .maybeSingle();
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
  state.withdrawals?.clear();
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

export function getRawWithdrawalsForTest() {
  return [...getMemoryState().withdrawals.values()];
}

export function getRawMppStoreForTest() {
  return [...getMemoryState().mppStore.entries()].map(([key, value]) => [key, JSON.parse(value)]);
}
