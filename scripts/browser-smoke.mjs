import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootPath = fileURLToPath(new URL('..', import.meta.url));
const frontendPath = join(rootPath, 'frontend');
const frontendRequire = createRequire(new URL('../frontend/package.json', import.meta.url));

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
    if (code !== null && code !== 0) {
      console.error(stderr.trim());
    }
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

const smokeWallet = 'GD5BCBBDALI3W35QY5DXB6JNP7SAZEXKEMOJJ4AJPTJABL4MTSZUSJKM';
const smokeApi = {
  id: 'smoke-api-id',
  ownerWallet: smokeWallet,
  name: 'Browser Smoke API',
  upstreamBaseUrl: 'https://api.example.com',
  path: '/v1/signal',
  method: 'GET',
  priceUsdc: '0.0100000',
  proxyUrl: 'https://paygate.app/api/pay/smoke-api-id',
  secret: 'pgsec_browser_smoke_only',
  status: 'active',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const smokeDashboard = {
  walletAddress: smokeWallet,
  summary: {
    totalApis: 1,
    activeApis: 1,
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    grossRevenueUsdc: '0.0000000',
    developerRevenueUsdc: '0.0000000',
    platformFeeUsdc: '0.0000000',
  },
  apis: [smokeApi],
  requests: [],
  payments: [],
  withdrawals: [],
  escrow: {
    configured: true,
    developerBalance: { baseUnits: '0', usdc: '0.0000000' },
    platformFeeBalance: { baseUnits: '0', usdc: '0.0000000' },
  },
};

const loggedOutRoutes = [
  { path: '/', expectedText: 'PayGate' },
  { path: '/generate', expectedText: 'Legacy generator.' },
  { path: '/result', expectedText: 'Legacy generator.', finalPath: '/generate' },
  { path: '/dashboard', expectedText: 'Wallet not connected.' },
  { path: '/dashboard/endpoints', expectedText: 'Wallet not connected.' },
  { path: '/dashboard/activity', expectedText: 'Wallet not connected.' },
  { path: '/dashboard/payouts', expectedText: 'Wallet not connected.' },
  { path: '/apis/new', expectedText: 'Connect wallet to create paid endpoints' },
  { path: '/apis/smoke-api-id', expectedText: 'Connect wallet to view this API' },
];

const authenticatedRoutes = [
  { path: '/dashboard', expectedText: 'Your API revenue, endpoint health', navLabel: 'Overview' },
  { path: '/dashboard/endpoints', expectedText: 'Manage paid proxy URLs', navLabel: 'Endpoints' },
  { path: '/dashboard/activity', expectedText: 'Trace requests from payment challenge', navLabel: 'Activity' },
  { path: '/dashboard/payouts', expectedText: 'Withdraw developer revenue', navLabel: 'Payouts' },
  { path: '/apis/new', expectedText: 'Upstream API' },
  { path: '/apis/smoke-api-id', expectedText: smokeApi.name },
];

async function mockApiRequests(page, authenticated) {
  await page.route('**/api/**', (route) => {
    const url = new URL(route.request().url());
    let status = 200;
    let body;

    if (url.pathname === '/api/auth/me') {
      body = authenticated
        ? { authenticated: true, walletAddress: smokeWallet }
        : { authenticated: false };
    } else if (authenticated && url.pathname === '/api/dashboard/summary') {
      body = smokeDashboard;
    } else if (authenticated && url.pathname === `/api/apis/${smokeApi.id}`) {
      body = { api: smokeApi };
    } else {
      status = 500;
      body = { error: `Unexpected API call during browser smoke: ${url.pathname}` };
    }

    return route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

const viewports = [
  { name: 'desktop', width: 1366, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const port = Number(process.env.PAYGATE_BROWSER_SMOKE_PORT || 0) || await getFreePort();
const baseUrl = process.env.PAYGATE_BROWSER_SMOKE_URL || `http://127.0.0.1:${port}`;
const shouldStartServer = !process.env.PAYGATE_BROWSER_SMOKE_URL;
const screenshotDir = process.env.PAYGATE_BROWSER_SMOKE_SCREENSHOTS
  ? join(rootPath, 'docs', 'evidence', 'browser-smoke', 'latest')
  : null;

let child;
let browser;

try {
  if (!existsSync(join(frontendPath, 'node_modules'))) {
    throw new Error('frontend/node_modules is missing. Run npm --prefix frontend ci first.');
  }

  const { chromium } = frontendRequire('playwright');

  if (shouldStartServer) {
    child = startVite(port);
    await waitForUrl(baseUrl);
  }

  if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

  browser = await chromium.launch();

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await mockApiRequests(page, false);
    for (const route of loggedOutRoutes) {
      const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      assert(response && response.status() < 500, `${route.path} returned ${response?.status() ?? 'no response'}`);

      if (route.finalPath) {
        await page.waitForURL(`${baseUrl}${route.finalPath}`, { timeout: 8_000 });
      }
      await page.waitForFunction((expected) => document.body.innerText.includes(expected), route.expectedText, {
        timeout: 8_000,
      });
      const text = await page.locator('body').innerText();
      assert(text.includes(route.expectedText), `${route.path} did not include expected text: ${route.expectedText}`);
      assert(!text.includes('Authentication required'), `${route.path} leaked raw API auth error`);

      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert(!hasHorizontalOverflow, `${route.path} has horizontal overflow at ${viewport.name}`);

      if (screenshotDir) {
        const fileSafeRoute = route.path === '/' ? 'home' : route.path.slice(1).replaceAll('/', '-');
        await page.screenshot({ path: join(screenshotDir, `${viewport.name}-${fileSafeRoute}.png`), fullPage: true });
      }
    }
    await page.close();

    const authenticatedPage = await browser.newPage({ viewport });
    await mockApiRequests(authenticatedPage, true);
    for (const route of authenticatedRoutes) {
      const response = await authenticatedPage.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      assert(response && response.status() < 500, `authenticated ${route.path} returned ${response?.status() ?? 'no response'}`);
      await authenticatedPage.waitForFunction(
        (expected) => document.body.innerText.includes(expected),
        route.expectedText,
        { timeout: 8_000 },
      );

      if (route.navLabel) {
        const activeLabel = await authenticatedPage.locator('.pg-workspace-nav a.is-active').innerText();
        assert(activeLabel.includes(route.navLabel), `${route.path} did not activate ${route.navLabel} navigation`);
      }

      const hasHorizontalOverflow = await authenticatedPage.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      assert(!hasHorizontalOverflow, `authenticated ${route.path} has horizontal overflow at ${viewport.name}`);
    }
    await authenticatedPage.close();
  }

  console.log(
    `Browser smoke passed for ${loggedOutRoutes.length} logged-out routes and ${authenticatedRoutes.length} authenticated routes across ${viewports.length} viewports`,
  );
} catch (err) {
  if (String(err.message || '').includes('Executable doesn\'t exist')) {
    throw new Error('Playwright browser is not installed. Run npm --prefix frontend exec playwright install chromium.');
  }
  throw err;
} finally {
  if (browser) await browser.close();
  await stopProcess(child);
}
