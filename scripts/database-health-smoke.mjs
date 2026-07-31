import { createDatabaseHealthHandler } from '../api/cron/database-health.js';
import { checkDatabaseHealth } from '../server/lib/databaseHealth.js';

const TEST_SECRET = 'paygate-database-health-smoke-secret';
const CRON_ENV_KEY = 'CRON_SECRET';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeReq({ method = 'GET', authorization } = {}) {
  return {
    method,
    headers: authorization ? { authorization } : {},
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

async function call(handler, req) {
  const res = makeRes();
  await handler(req, res);
  return res;
}

function makeHealthClient({ failTable } = {}) {
  const queries = [];
  return {
    queries,
    from(table) {
      return {
        select(column, options) {
          queries.push({ table, column, options });
          return {
            async limit(value) {
              if (table === failTable) {
                return { error: new Error('simulated database failure') };
              }
              assert(value === 1, 'health query must be limited to one row');
              return { error: null };
            },
          };
        },
      };
    },
  };
}

const originalSecret = process.env[CRON_ENV_KEY];

try {
  delete process.env[CRON_ENV_KEY];
  const unconfigured = await call(
    createDatabaseHealthHandler(async () => ({ queryCount: 3 })),
    makeReq(),
  );
  assert(unconfigured.statusCode === 503, 'missing CRON_SECRET should return 503');

  process.env[CRON_ENV_KEY] = TEST_SECRET;
  const handler = createDatabaseHealthHandler(async () => ({ queryCount: 3 }));

  const wrongMethod = await call(handler, makeReq({ method: 'POST' }));
  assert(wrongMethod.statusCode === 405, 'non-GET request should return 405');
  assert(wrongMethod.headers.allow === 'GET', 'Allow header should require GET');

  const unauthorized = await call(handler, makeReq());
  assert(unauthorized.statusCode === 401, 'missing authorization should return 401');

  const authorized = await call(
    handler,
    makeReq({ authorization: `Bearer ${TEST_SECRET}` }),
  );
  assert(authorized.statusCode === 200, 'authorized health check should return 200');
  assert(authorized.body.ok === true, 'authorized health check should report ok');
  assert(authorized.body.queryCount === 3, 'health query count should be returned');
  assert(authorized.headers['cache-control'] === 'no-store', 'health responses must not be cached');

  const originalConsoleError = console.error;
  let unavailable;
  try {
    console.error = () => {};
    unavailable = await call(
      createDatabaseHealthHandler(async () => {
        throw new Error('private provider detail');
      }),
      makeReq({ authorization: `Bearer ${TEST_SECRET}` }),
    );
  } finally {
    console.error = originalConsoleError;
  }
  assert(unavailable.statusCode === 503, 'database failure should return 503');
  assert(unavailable.body.error === 'Database unavailable', 'database failure should be generic');
  assert(!JSON.stringify(unavailable.body).includes('private provider detail'), 'provider details must not leak');

  const client = makeHealthClient();
  const result = await checkDatabaseHealth(client);
  assert(result.queryCount === 3, 'three health queries should run');
  assert(client.queries.length === 3, 'all health queries should reach the client');
  assert(client.queries.every((query) => query.options.head === true), 'health queries should not fetch row bodies');

  const failingClient = makeHealthClient({ failTable: 'apis' });
  let failed = false;
  try {
    await checkDatabaseHealth(failingClient);
  } catch {
    failed = true;
  }
  assert(failed, 'database query errors should fail the health check');
} finally {
  if (originalSecret === undefined) {
    delete process.env[CRON_ENV_KEY];
  } else {
    process.env[CRON_ENV_KEY] = originalSecret;
  }
}

console.log('Database health smoke test passed');
