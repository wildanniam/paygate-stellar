import { Router } from 'express';
import { generateSchema } from '../validators/generate.js';
import { generateMiddleware } from '../templates/middleware.js';
import { generateIntegration } from '../templates/integration.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const parsed = generateSchema.safeParse(req.body);

    if (!parsed.success) {
      const details = {};
      for (const issue of parsed.error.issues) {
        details[issue.path[0]] = issue.message;
      }
      return res.status(400).json({ error: 'Validation failed', details });
    }

    const { endpointUrl, path, price } = parsed.data;

    const middleware = generateMiddleware({ endpointUrl, path, price });
    const integration = generateIntegration({ path });

    return res.status(200).json({ middleware, integration });
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

