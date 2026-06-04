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
}

export function getRawApisForTest() {
  return [...getMemoryState().apis.values()];
}
