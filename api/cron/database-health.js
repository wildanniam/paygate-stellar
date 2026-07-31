import crypto from 'node:crypto';
import { checkDatabaseHealth } from '../../server/lib/databaseHealth.js';

function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function hasValidCronAuthorization(req) {
  const secret = process.env.CRON_SECRET || '';
  const authorization = firstHeaderValue(req.headers?.authorization) || '';

  if (secret.length < 16) return false;
  return safeEqual(authorization, `Bearer ${secret}`);
}

export function createDatabaseHealthHandler(runHealthCheck = checkDatabaseHealth) {
  return async function databaseHealthHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.CRON_SECRET || process.env.CRON_SECRET.length < 16) {
      return res.status(503).json({ error: 'Service unavailable' });
    }

    if (!hasValidCronAuthorization(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await runHealthCheck();
      return res.status(200).json({
        ok: true,
        queryCount: result.queryCount,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Database health check failed:', error);
      return res.status(503).json({
        ok: false,
        error: 'Database unavailable',
      });
    }
  };
}

export default createDatabaseHealthHandler();
