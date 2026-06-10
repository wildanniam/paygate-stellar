import crypto from 'node:crypto';
import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Keypair } from '@stellar/stellar-sdk';
import { clearChallengesForTest } from '../api/_lib/authStore.js';
import { clearRegistryForTest } from '../api/_lib/registryStore.js';

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'paygate-browser-wallet-session-secret-32';
process.env.API_SECRET_ENCRYPTION_KEY = process.env.API_SECRET_ENCRYPTION_KEY || 'paygate-browser-wallet-api-secret-key-32';
process.env.PAYGATE_AUTH_CHALLENGE_STORE = 'memory';
process.env.PAYGATE_REGISTRY_STORE = 'memory';
process.env.PAYGATE_ESCROW_WITHDRAW_MODE = 'memory';
process.env.PAYGATE_MOCK_DEVELOPER_BALANCE_BASE_UNITS = '0';
process.env.PAYGATE_MOCK_PLATFORM_FEE_BALANCE_BASE_UNITS = '0';

const rootPath = fileURLToPath(new URL('..', import.meta.url));
const frontendPath = join(rootPath, 'frontend');
const frontendRequire = createRequire(new URL('../frontend/package.json', import.meta.url));
const SIGN_MESSAGE_PREFIX = 'Stellar Signed Message:\n';

const [
  { default: challengeHandler },
  { default: verifyHandler },
  { default: meHandler },
  { default: logoutHandler },
  { default: apisHandler },
  { default: apiDetailHandler },
  { default: dashboardHandler },
] = await Promise.all([
  import('../api/auth/challenge.js'),
  import('../api/auth/verify.js'),
  import('../api/auth/me.js'),
  import('../api/auth/logout.js'),
  import('../api/apis/index.js'),
  import('../api/apis/[apiId].js'),
  import('../api/dashboard/summary.js'),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForUrl(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startVite(port) {
  const viteBin = join(dirname(frontendRequire.resolve('vite/package.json')), 'bin', 'vite.js');
  const child = spawn(process.execPath, [viteBin, '--host', '127.0.0.1', '--port', String(port)], {
    cwd: frontendPath,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  child.on('exit', (code) => {
    if (code !== null && code !== 0) console.error(stderr.trim());
  });

  return child;
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill();
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 2_000);
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

function signChallenge(keypair, message) {
  const messageHash = crypto.createHash('sha256').update(`${SIGN_MESSAGE_PREFIX}${message}`).digest();
  return Buffer.from(keypair.sign(messageHash)).toString('base64');
}

function makeReq(routeRequest, body, query = {}) {
  const headers = routeRequest.headers();
  return {
    method: routeRequest.method(),
    body,
    query,
    url: new URL(routeRequest.url()).pathname,
    headers: {
      host: 'localhost:3000',
      'x-forwarded-proto': 'http',
      ...headers,
    },
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = JSON.stringify(payload);
      this.headers['content-type'] = 'application/json';
      return this;
    },
    end(payload = '') {
      this.body = payload;
      return this;
    },
  };
}

async function callHandler(handler, routeRequest, body, query) {
  const req = makeReq(routeRequest, body, query);
  const res = makeRes();
  await handler(req, res);
  return res;
}

function parseJsonBody(routeRequest) {
  const raw = routeRequest.postData();
  if (!raw) return {};
  return JSON.parse(raw);
}

async function fulfillWithHandler(route, handler, query) {
  const routeRequest = route.request();
  const body = parseJsonBody(routeRequest);
  const res = await callHandler(handler, routeRequest, body, query);
  await route.fulfill({
    status: res.statusCode,
    headers: Object.fromEntries(Object.entries(res.headers).map(([key, value]) => [key, String(value)])),
    body: typeof res.body === 'string' ? res.body : '',
  });
}

async function installApiRoutes(page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const apiDetail = url.pathname.match(/^\/api\/apis\/([^/]+)$/);

    if (url.pathname === '/api/auth/challenge') return fulfillWithHandler(route, challengeHandler);
    if (url.pathname === '/api/auth/verify') return fulfillWithHandler(route, verifyHandler);
    if (url.pathname === '/api/auth/me') return fulfillWithHandler(route, meHandler);
    if (url.pathname === '/api/auth/logout') return fulfillWithHandler(route, logoutHandler);
    if (url.pathname === '/api/apis') return fulfillWithHandler(route, apisHandler);
    if (apiDetail) return fulfillWithHandler(route, apiDetailHandler, { apiId: apiDetail[1] });
    if (url.pathname === '/api/dashboard/summary') return fulfillWithHandler(route, dashboardHandler);

    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: `Unexpected API call: ${url.pathname}` }),
    });
  });
}

async function installFreighterMock(page, developer) {
  await page.exposeFunction('__paygateSignFreighterMessage', (message) => signChallenge(developer, message));
  await page.addInitScript((walletAddress) => {
    window.freighter = true;
    const originalPostMessage = window.postMessage.bind(window);

    window.postMessage = (message, targetOrigin, transfer) => {
      if (message?.source === 'FREIGHTER_EXTERNAL_MSG_REQUEST') {
        const respond = async (payload) => {
          window.dispatchEvent(new MessageEvent('message', {
            source: window,
            data: {
              source: 'FREIGHTER_EXTERNAL_MSG_RESPONSE',
              messagedId: message.messageId,
              ...payload,
            },
          }));
        };

        setTimeout(async () => {
          if (message.type === 'REQUEST_CONNECTION_STATUS') {
            await respond({ isConnected: true });
          } else if (['REQUEST_ACCESS', 'REQUEST_PUBLIC_KEY'].includes(message.type)) {
            await respond({ publicKey: walletAddress });
          } else if (message.type === 'REQUEST_ALLOWED_STATUS') {
            await respond({ isAllowed: true });
          } else if (message.type === 'SUBMIT_BLOB') {
            const signedBlob = await window.__paygateSignFreighterMessage(message.blob);
            await respond({ signedBlob, signerAddress: walletAddress });
          } else {
            await respond({ apiError: { message: `Unhandled Freighter mock request: ${message.type}` } });
          }
        }, 0);
      }

      return originalPostMessage(message, targetOrigin, transfer);
    };
  }, developer.publicKey());
}

clearChallengesForTest();
clearRegistryForTest();

const developer = Keypair.random();
const port = Number(process.env.PAYGATE_BROWSER_WALLET_PORT || 0) || await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
let child;
let browser;

try {
  if (!existsSync(join(frontendPath, 'node_modules'))) {
    throw new Error('frontend/node_modules is missing. Run npm --prefix frontend ci first.');
  }

  const { chromium } = frontendRequire('playwright');
  child = startVite(port);
  await waitForUrl(baseUrl);

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await installApiRoutes(page);
  await installFreighterMock(page, developer);

  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Connect Freighter' }).first().click();
  await page.waitForFunction((wallet) => document.body.innerText.includes(wallet.slice(0, 12)), developer.publicKey());
  await page.waitForFunction(() => document.body.innerText.includes('No APIs registered yet'));

  await page.goto(`${baseUrl}/apis/new`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('API Name').fill('Browser Wallet Smoke API');
  await page.getByLabel('Upstream Base URL').fill('https://example.com');
  await page.getByLabel('GET Path').fill('/v1/browser-smoke');
  await page.getByLabel('Price Per Call, USDC').fill('0.01');
  await page.getByRole('button', { name: 'Register API' }).click();
  await page.waitForFunction(() => document.body.innerText.includes('API Registered'));

  const detailHref = await page.getByRole('link', { name: 'Open API Detail' }).getAttribute('href');
  assert(detailHref?.startsWith('/apis/'), 'API detail link was not rendered after registration');
  await page.goto(`${baseUrl}${detailHref}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body.innerText.includes('Browser Wallet Smoke API'));
  await page.waitForFunction(() => document.body.innerText.includes('Active'));

  console.log('Browser Freighter wallet smoke passed');
} catch (err) {
  if (String(err.message || '').includes('Executable doesn\'t exist')) {
    throw new Error('Playwright browser is not installed. Run npm --prefix frontend exec playwright install chromium.');
  }
  throw err;
} finally {
  if (browser) await browser.close();
  await stopProcess(child);
}
