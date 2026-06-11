import { apiDetailResponse, requireRegistryConfig, requireRegistrySession, resolveApiStatus } from '../../../server/lib/apiRegistry.js';
import { decryptApiSecret } from '../../../server/lib/apiSecret.js';
import { methodNotAllowed } from '../../../server/lib/auth.js';

function nowIso() {
  return new Date().toISOString();
}

function getApiId(req) {
  if (req.query?.apiId) return String(req.query.apiId);
  const parts = (req.url || '').split('?')[0].split('/').filter(Boolean);
  const verifyIndex = parts.lastIndexOf('verify');
  if (verifyIndex > 0) return parts[verifyIndex - 1];
  return parts.at(-2);
}

function buildUpstreamUrl(api) {
  return new URL(api.path, `${api.upstream_base_url.replace(/\/+$/, '')}/`);
}

async function verifyUpstreamGuard(api) {
  const secret = decryptApiSecret(api);
  const response = await fetch(buildUpstreamUrl(api), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-PayGate-Secret': secret,
    },
  });

  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get('Content-Type'),
    bodyPreview: (await response.text()).slice(0, 300),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  const apiId = getApiId(req);

  try {
    const api = await store.getApi(apiId, session.walletAddress);
    if (!api) return res.status(404).json({ error: 'API not found' });

    const status = resolveApiStatus(api);
    if (status === 'archived') {
      return res.status(409).json({
        error: 'Archived APIs cannot be verified. Register the endpoint again to create a new setup flow.',
        code: 'api_archived',
      });
    }

    let verification;
    try {
      verification = await verifyUpstreamGuard(api);
    } catch (error) {
      return res.status(502).json({
        error: 'PayGate could not reach the upstream API for verification.',
        code: 'upstream_unreachable',
        details: error instanceof Error ? error.message : 'Upstream request failed',
      });
    }

    if (!verification.ok) {
      return res.status(400).json({
        error: 'Upstream guard verification failed. Add the X-PayGate-Secret check to your API, then try again.',
        code: 'setup_verification_failed',
        upstreamStatus: verification.status,
        upstreamBodyPreview: verification.bodyPreview,
      });
    }

    await store.updateApi(apiId, session.walletAddress, {
      status: 'active',
      active: true,
      verified_at: nowIso(),
      archived_at: null,
    });
    const updated = await store.getApi(apiId, session.walletAddress);

    return res.status(200).json({
      api: apiDetailResponse(req, updated),
      verification: {
        upstreamStatus: verification.status,
        contentType: verification.contentType,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'API setup verification error' });
  }
}
