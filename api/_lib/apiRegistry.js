import { z } from 'zod';
import { decryptApiSecret, encryptApiSecret, generateApiSecret, hasApiSecretEncryptionKey } from './apiSecret.js';
import { getOrigin, getSession } from './auth.js';
import { getRegistryStore } from './registryStore.js';

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

export function toApiResponse(req, api, extra = {}) {
  return {
    id: api.id,
    ownerWallet: api.owner_wallet,
    name: api.name,
    upstreamBaseUrl: api.upstream_base_url,
    path: api.path,
    method: api.method,
    priceUsdc: Number(api.price_usdc),
    active: api.active,
    proxyUrl: `${getOrigin(req)}/api/pay/${api.id}`,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
    ...extra,
  };
}

export async function createRegisteredApi({ req, store, walletAddress, input }) {
  await store.upsertDeveloper(walletAddress);

  const secret = generateApiSecret();
  const encrypted = encryptApiSecret(secret);
  const api = await store.createApi({
    owner_wallet: walletAddress,
    name: input.name,
    upstream_base_url: input.upstreamBaseUrl.replace(/\/+$/, ''),
    path: input.path,
    method: 'GET',
    price_usdc: input.priceUsdc,
    active: true,
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
