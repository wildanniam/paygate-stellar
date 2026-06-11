import { apiDetailResponse, requireRegistryConfig, requireRegistrySession, toApiResponse, updateApiSchema } from '../../server/lib/apiRegistry.js';
import { methodNotAllowed } from '../../server/lib/auth.js';
import { readJsonBody } from '../../server/lib/body.js';

function nowIso() {
  return new Date().toISOString();
}

function getApiId(req) {
  if (req.query?.apiId) return String(req.query.apiId);
  const parts = (req.url || '').split('?')[0].split('/').filter(Boolean);
  return parts[parts.length - 1];
}

export default async function handler(req, res) {
  if (!['GET', 'PATCH', 'DELETE'].includes(req.method)) return methodNotAllowed(res, 'GET, PATCH, DELETE');

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  const apiId = getApiId(req);

  try {
    if (req.method === 'GET') {
      const api = await store.getApi(apiId, session.walletAddress);
      if (!api) return res.status(404).json({ error: 'API not found' });
      return res.status(200).json({ api: apiDetailResponse(req, api) });
    }

    if (req.method === 'DELETE') {
      const api = await store.getApi(apiId, session.walletAddress);
      if (!api) return res.status(404).json({ error: 'API not found' });

      const activity = await store.getApiActivityCounts(apiId);
      if (activity.total === 0) {
        const deleted = await store.deleteApi(apiId, session.walletAddress);
        if (!deleted) return res.status(404).json({ error: 'API not found' });
        return res.status(200).json({
          deleted: true,
          archived: false,
          apiId,
          activity,
        });
      }

      const archived = await store.updateApi(apiId, session.walletAddress, {
        status: 'archived',
        active: false,
        archived_at: nowIso(),
      });

      return res.status(200).json({
        deleted: false,
        archived: true,
        activity,
        api: toApiResponse(req, archived),
      });
    }

    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const parsed = updateApiSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const updates = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;

    const api = await store.updateApi(apiId, session.walletAddress, updates);
    if (!api) return res.status(404).json({ error: 'API not found' });

    return res.status(200).json({ api: toApiResponse(req, api) });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'API registry error' });
  }
}
