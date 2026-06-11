import { z } from 'zod';
import { decryptApiSecret, encryptApiSecret, generateApiSecret, hasApiSecretEncryptionKey } from './apiSecret.js';
import { getOrigin, getSession } from './auth.js';
import { getRegistryStore } from './registryStore.js';

export const API_STATUSES = {
  PENDING_SETUP: 'pending_setup',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

export const createApiSchema = z.object({
  name: z.string().trim().min(2).max(80),
  upstreamBaseUrl: z.string().trim().url(),
  path: z.string().trim().regex(/^\/[A-Za-z0-9/_\-.:]*$/, 'Path must start with / and contain URL-safe characters'),
  priceUsdc: z.coerce.number().positive().max(1000),
});

export const updateApiSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  active: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be updated',
});

export class RegistryApiError extends Error {
  constructor(statusCode, message, details = {}) {
    super(message);
    this.name = 'RegistryApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function requireRegistrySession(req, res) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return session;
}

export function requireRegistryConfig(res) {
  const store = getRegistryStore();
  if (!store || !hasApiSecretEncryptionKey()) {
    res.status(503).json({
      error: 'PayGate API registry is not configured',
      requiredEnv: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'API_SECRET_ENCRYPTION_KEY', 'SESSION_SECRET'],
      testMode: 'Set PAYGATE_REGISTRY_STORE=memory for local smoke tests only.',
    });
    return null;
  }
  return store;
}

export function resolveApiStatus(api) {
  if (Object.values(API_STATUSES).includes(api.status)) return api.status;
  if (api.archived_at) return API_STATUSES.ARCHIVED;
  return api.active ? API_STATUSES.ACTIVE : API_STATUSES.PENDING_SETUP;
}

export function normalizeUpstreamBaseUrl(value) {
  const url = new URL(value);
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/+$/, '');
}

export function normalizeApiPath(value) {
  if (value === '/') return value;
  return value.replace(/\/+$/, '') || '/';
}

export function normalizeApiFingerprint({ upstreamBaseUrl, path, method = 'GET' }) {
  return {
    method: method.toUpperCase(),
    upstreamBaseUrl: normalizeUpstreamBaseUrl(upstreamBaseUrl),
    path: normalizeApiPath(path),
  };
}

export function toApiResponse(req, api, extra = {}) {
  const status = resolveApiStatus(api);
  return {
    id: api.id,
    ownerWallet: api.owner_wallet,
    name: api.name,
    upstreamBaseUrl: api.upstream_base_url,
    path: api.path,
    method: api.method,
    priceUsdc: Number(api.price_usdc),
    status,
    active: status === API_STATUSES.ACTIVE,
    proxyUrl: `${getOrigin(req)}/api/pay/${api.id}`,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
    verifiedAt: api.verified_at,
    archivedAt: api.archived_at,
    ...extra,
  };
}

export async function createRegisteredApi({ req, store, walletAddress, input }) {
  await store.upsertDeveloper(walletAddress);

  const fingerprint = normalizeApiFingerprint({
    upstreamBaseUrl: input.upstreamBaseUrl,
    path: input.path,
    method: 'GET',
  });
  const existing = await store.findLiveApiByEndpoint(fingerprint);
  if (existing) {
    const sameOwner = existing.owner_wallet === walletAddress;
    throw new RegistryApiError(
      409,
      sameOwner
        ? 'This API is already registered in your wallet.'
        : 'This upstream API is already registered by another wallet.',
      {
        code: sameOwner ? 'duplicate_api' : 'endpoint_claimed',
        existingApiId: sameOwner ? existing.id : undefined,
      },
    );
  }

  const secret = generateApiSecret();
  const encrypted = encryptApiSecret(secret);
  const api = await store.createApi({
    owner_wallet: walletAddress,
    name: input.name,
    upstream_base_url: fingerprint.upstreamBaseUrl,
    path: fingerprint.path,
    method: fingerprint.method,
    price_usdc: input.priceUsdc,
    status: API_STATUSES.PENDING_SETUP,
    active: false,
    verified_at: null,
    archived_at: null,
    ...encrypted,
  });

  return toApiResponse(req, api, { secret });
}

export function apiDetailResponse(req, api) {
  return toApiResponse(req, api, {
    secret: decryptApiSecret(api),
    setup: {
      requiredHeader: 'X-PayGate-Secret',
      note: 'Add this secret check to the upstream API. PayGate will send this header when forwarding paid requests.',
    },
  });
}
