import { createRegisteredApi, createApiSchema, requireRegistryConfig, requireRegistrySession, toApiResponse } from '../../server/lib/apiRegistry.js';
import { methodNotAllowed } from '../../server/lib/auth.js';
import { readJsonBody } from '../../server/lib/body.js';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = requireRegistrySession(req, res);
  if (!session) return undefined;

  const store = requireRegistryConfig(res);
  if (!store) return undefined;

  try {
    if (req.method === 'GET') {
      const apis = await store.listApis(session.walletAddress);
      return res.status(200).json({ apis: apis.map((api) => toApiResponse(req, api)) });
    }

    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const parsed = createApiSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const api = await createRegisteredApi({
      req,
      store,
      walletAddress: session.walletAddress,
      input: parsed.data,
    });

    return res.status(201).json({ api });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'API registry error' });
  }
}

export { methodNotAllowed };
