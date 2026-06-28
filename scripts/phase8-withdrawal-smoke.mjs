import { createServer } from 'node:http';
import { createSessionToken, SESSION_COOKIE } from '../server/lib/auth.js';
import {
  clearRegistryForTest,
  getRawWithdrawalPreparationsForTest,
  getRawWithdrawalsForTest,
  getRegistryStore,
} from '../server/lib/registryStore.js';
import dashboardHandler from '../api/dashboard/summary.js';
import { handlePrepare as prepareHandler, handleSubmit as submitHandler } from '../api/withdraw/[action].js';
import { withdrawPlatformFees } from '../server/lib/escrowContract.js';

process.env.PAYGATE_REGISTRY_STORE = 'memory';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-phase8-smoke-api-secret-key-32';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-phase8-smoke-session-secret-32';
process.env.PAYGATE_ESCROW_WITHDRAW_MODE = 'memory';
process.env.PAYGATE_MOCK_DEVELOPER_BALANCE_BASE_UNITS = '180000';
process.env.PAYGATE_MOCK_PLATFORM_FEE_BALANCE_BASE_UNITS = '20000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function startServer() {
  const server = createServer((req, res) => {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (payload) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
      return res;
    };

    if (req.url === '/api/withdraw/prepare') return prepareHandler(req, res);
    if (req.url === '/api/withdraw/submit') return submitHandler(req, res);
    if (req.url === '/api/dashboard/summary') return dashboardHandler(req, res);

    res.statusCode = 404;
    return res.end('Not found');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

clearRegistryForTest();
const store = getRegistryStore();
const ownerWallet = 'GD5BCBBDALI3W35QY5DXB6JNP7SAZEXKEMOJJ4AJPTJABL4MTSZUSJKM';
await store.upsertDeveloper(ownerWallet);

const authHeaders = {
  Cookie: `${SESSION_COOKIE}=${createSessionToken(ownerWallet)}`,
};

const server = await startServer();

try {
  const unauthenticated = await fetch(`${server.baseUrl}/api/withdraw/prepare`, { method: 'POST' });
  assert(unauthenticated.status === 401, `unauthenticated prepare expected 401, got ${unauthenticated.status}`);

  const preparedResponse = await fetch(`${server.baseUrl}/api/withdraw/prepare`, {
    method: 'POST',
    headers: authHeaders,
  });
  assert(preparedResponse.status === 200, `prepare expected 200, got ${preparedResponse.status}`);
  const prepared = await preparedResponse.json();
  assert(prepared.amountUsdc === '0.0180000', 'prepare amount mismatch');
  assert(prepared.preparationId, 'prepare should return a preparation id');
  assert(prepared.transactionXdr.includes(ownerWallet), 'prepare should bind tx to developer wallet');

  const tamperedSubmit = await fetch(`${server.baseUrl}/api/withdraw/submit`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      preparationId: prepared.preparationId,
      signedTransactionXdr: `mock-signed:mock-withdrawal-xdr:${ownerWallet}:wrong-hash`,
    }),
  });
  assert(tamperedSubmit.status === 400, `tampered submit expected 400, got ${tamperedSubmit.status}`);
  assert(getRawWithdrawalsForTest().length === 0, 'tampered submit should not create a withdrawal row');

  const retryPrepareResponse = await fetch(`${server.baseUrl}/api/withdraw/prepare`, {
    method: 'POST',
    headers: authHeaders,
  });
  assert(retryPrepareResponse.status === 200, `retry prepare expected 200, got ${retryPrepareResponse.status}`);
  const retryPrepared = await retryPrepareResponse.json();

  const submittedResponse = await fetch(`${server.baseUrl}/api/withdraw/submit`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      preparationId: retryPrepared.preparationId,
      signedTransactionXdr: `mock-signed:${retryPrepared.transactionXdr}`,
    }),
  });
  assert(submittedResponse.status === 200, `submit expected 200, got ${submittedResponse.status}`);
  const submitted = await submittedResponse.json();
  assert(submitted.amountUsdc === '0.0180000', 'submit amount mismatch');
  assert(submitted.withdrawal.status === 'succeeded', 'withdrawal status mismatch');
  assert(submitted.withdrawal.tx_hash === submitted.txHash, 'withdrawal tx hash mismatch');

  const withdrawals = getRawWithdrawalsForTest();
  assert(withdrawals.length === 1, 'withdrawal row was not recorded');
  assert(withdrawals[0].wallet_address === ownerWallet, 'withdrawal wallet mismatch');
  const preparations = getRawWithdrawalPreparationsForTest();
  assert(preparations.length === 2, 'withdrawal preparations should be recorded');
  assert(preparations.some((row) => row.status === 'prepared'), 'tampered preparation should remain reusable');
  assert(preparations.some((row) => row.status === 'succeeded'), 'successful preparation status missing');

  const dashboardResponse = await fetch(`${server.baseUrl}/api/dashboard/summary`, {
    headers: authHeaders,
  });
  assert(dashboardResponse.status === 200, `dashboard expected 200, got ${dashboardResponse.status}`);
  const dashboard = await dashboardResponse.json();
  assert(dashboard.escrow.developerBalance.baseUnits === '0', 'developer balance should reset after withdrawal');
  assert(dashboard.withdrawals.length === 1, 'dashboard withdrawal history missing');

  const secondPrepare = await fetch(`${server.baseUrl}/api/withdraw/prepare`, {
    method: 'POST',
    headers: authHeaders,
  });
  assert(secondPrepare.status === 400, `no-balance prepare expected 400, got ${secondPrepare.status}`);

  const feeResult = await withdrawPlatformFees();
  assert(feeResult.amountUsdc === '0.0020000', 'platform fee withdrawal amount mismatch');
} finally {
  await server.close();
}

console.log('Phase 8 withdrawal smoke test passed');
