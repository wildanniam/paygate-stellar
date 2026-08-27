import { apiDetailResponse, requireRegistryConfig, requireRegistrySession, resolveApiStatus } from '../../../server/lib/apiRegistry.js';
import { decryptApiSecret, generateApiSecret } from '../../../server/lib/apiSecret.js';
import { methodNotAllowed, requireSameOrigin } from '../../../server/lib/auth.js';
import { publicErrorMessage } from '../../../server/lib/errors.js';
import {
  MAX_UPSTREAM_VERIFY_PREVIEW_BYTES,
  MAX_UPSTREAM_RESPONSE_BYTES,
  assertSafeUpstreamUrl,
  readLimitedResponseText,
  upstreamFetchOptions,
} from '../../../server/lib/upstreamSecurity.js';
import { enforceRateLimit } from '../../../server/lib/rateLimit.js';

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

function hasJsonContentType(contentType) {
  const mediaType = String(contentType || '').split(';')[0].trim().toLowerCase();
  return mediaType === 'application/json' || mediaType.endsWith('+json');
}

async function fetchUpstreamGuardProbe(upstreamUrl, secret, { validateJson = false } = {}) {
  const headers = {
    Accept: 'application/json',
    'Cache-Control': 'no-store, max-age=0',
    Pragma: 'no-cache',
  };
  if (secret) headers['X-PayGate-Secret'] = secret;

  const response = await fetch(upstreamUrl, upstreamFetchOptions({
    method: 'GET',
    headers,
  }));

  const contentType = response.headers.get('Content-Type');
  const body = await readLimitedResponseText(response, {
    maxBytes: validateJson ? MAX_UPSTREAM_RESPONSE_BYTES : MAX_UPSTREAM_VERIFY_PREVIEW_BYTES,
    errorOnLimit: validateJson,
  });
  let bodyIsJson = null;
  if (validateJson) {
    bodyIsJson = hasJsonContentType(contentType);
    if (bodyIsJson) {
      try {
        JSON.parse(body);
      } catch {
        bodyIsJson = false;
      }
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    contentType,
    bodyIsJson,
    bodyPreview: body.slice(0, 300),
  };
}

async function verifyUpstreamGuard(api) {
  const secret = decryptApiSecret(api);
  const upstreamUrl = buildUpstreamUrl(api);
  await assertSafeUpstreamUrl(upstreamUrl);

  let invalidSecret = generateApiSecret();
  while (invalidSecret === secret) invalidSecret = generateApiSecret();

  const negativeProbe = await fetchUpstreamGuardProbe(upstreamUrl, invalidSecret);
  if (negativeProbe.ok) {
    return {
      ok: false,
      code: 'setup_guard_missing',
      status: negativeProbe.status,
      contentType: negativeProbe.contentType,
      bodyPreview: negativeProbe.bodyPreview,
    };
  }
  if (![401, 403].includes(negativeProbe.status)) {
    return {
      ok: false,
      code: 'setup_guard_rejection_unconfirmed',
      status: negativeProbe.status,
      contentType: negativeProbe.contentType,
      bodyPreview: negativeProbe.bodyPreview,
    };
  }

  const positiveProbe = await fetchUpstreamGuardProbe(upstreamUrl, secret, { validateJson: true });
  if (!positiveProbe.ok) {
    return { ...positiveProbe, code: 'setup_verification_failed' };
  }
  if (!positiveProbe.bodyIsJson) {
    return { ...positiveProbe, ok: false, code: 'setup_response_invalid' };
  }
  return positiveProbe;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!requireSameOrigin(req, res)) return undefined;

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  const apiId = getApiId(req);
  const verifyRateAllowed = await enforceRateLimit(req, res, {
    label: 'api_setup_verify_wallet_api',
    keyParts: [session.walletAddress, apiId],
    limit: 5,
    windowSeconds: 60,
  });
  if (!verifyRateAllowed) return undefined;

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
        details: publicErrorMessage(error, 'Upstream request failed'),
      });
    }

    if (!verification.ok) {
      if (verification.code === 'setup_guard_missing') {
        return res.status(400).json({
          error: 'Upstream guard verification failed. The endpoint accepted an invalid X-PayGate-Secret.',
          code: 'setup_guard_missing',
          upstreamStatus: verification.status,
          upstreamBodyPreview: verification.bodyPreview,
        });
      }

      if (verification.code === 'setup_guard_rejection_unconfirmed') {
        return res.status(400).json({
          error: 'Upstream guard verification was inconclusive. Invalid secrets must return HTTP 401 or 403.',
          code: 'setup_guard_rejection_unconfirmed',
          upstreamStatus: verification.status,
          upstreamBodyPreview: verification.bodyPreview,
        });
      }

      if (verification.code === 'setup_response_invalid') {
        return res.status(400).json({
          error: 'Upstream guard verification failed. The authenticated endpoint must return valid JSON.',
          code: 'setup_response_invalid',
          upstreamStatus: verification.status,
          upstreamContentType: verification.contentType,
          upstreamBodyPreview: verification.bodyPreview,
        });
      }

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
    return res.status(500).json({
      error: publicErrorMessage(err, 'PayGate could not verify setup. Please try again in a moment.'),
    });
  }
}
