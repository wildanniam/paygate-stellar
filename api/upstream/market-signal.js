const REQUIRED_HEADER = 'x-paygate-secret';

function configuredSecret() {
  return process.env.PAYGATE_DEMO_UPSTREAM_SECRET || '';
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = configuredSecret();
  if (!secret) {
    return res.status(503).json({
      error: 'PayGate demo upstream API is not configured',
      requiredEnv: ['PAYGATE_DEMO_UPSTREAM_SECRET'],
    });
  }

  if (req.headers[REQUIRED_HEADER] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    signal: 'bullish',
    confidence: 0.82,
    source: 'PayGate demo upstream API',
  });
}
