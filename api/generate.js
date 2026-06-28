import { generateSchema } from '../backend/src/validators/generate.js';
import { generateMiddleware } from '../backend/src/templates/middleware.js';
import { generateIntegration } from '../backend/src/templates/integration.js';
import { jsonBodyErrorResponse, readJsonBody } from '../server/lib/body.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const response = jsonBodyErrorResponse(error);
    return res.status(response.statusCode).json(response.payload);
  }

  const parsed = generateSchema.safeParse(body);

  if (!parsed.success) {
    const details = {};
    for (const issue of parsed.error.issues) {
      details[issue.path[0]] = issue.message;
    }
    return res.status(400).json({ error: 'Validation failed', details });
  }

  const { endpointUrl, path, price } = parsed.data;

  return res.status(200).json({
    middleware: generateMiddleware({ endpointUrl, path, price }),
    integration: generateIntegration({ path }),
  });
}
