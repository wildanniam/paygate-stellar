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

function routeExpectation(pathname) {
  if (pathname === '/') return 'PayGate';
  if (pathname === '/generate' || pathname === '/result') return 'Generate Express middleware for V0 testing.';
  if (pathname.startsWith('/dashboard')) return 'Wallet not connected.';
  if (pathname === '/apis/new') return 'Connect wallet to create paid endpoints';
  return 'Connect wallet to view this API';
}

const routes = [
  '/', '/generate', '/result', '/dashboard', '/dashboard/endpoints',
  '/dashboard/activity', '/dashboard/payouts', '/apis/new', '/apis/smoke-api-id',
];
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
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    let authenticated = false;
    const detailRequests = [];
    await page.route('**/api/**', (route) => {
      const url = new URL(route.request().url());
      let status = 500;
      let body = { error: 'Unexpected API call during browser smoke' };
      if (url.pathname === '/api/auth/me') {
        status = 200;
        body = { authenticated, walletAddress: authenticated ? 'browser-smoke-wallet' : undefined };
      } else if (url.pathname === '/api/generate' && route.request().method() === 'POST') {
        status = 200;
        body = { middleware: '// Browser routing fixture', integration: '// Integration fixture' };
      } else if (url.pathname.startsWith('/api/apis/') && authenticated) {
        detailRequests.push(url.pathname);
        status = 404;
        body = { error: 'API not found' };
      }
      return route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      assert(response && response.status() < 500, `${route} returned ${response?.status() ?? 'no response'}`);

      const expectedText = routeExpectation(route);
      await page.waitForFunction((expected) => document.body.innerText.includes(expected), expectedText, {
        timeout: 8_000,
      }).catch(async () => {
        throw new Error(`${viewport.name} ${route} expected ${expectedText}; got ${await page.locator('body').innerText()}; errors: ${pageErrors.join('; ')}`);
      });
      const text = await page.locator('body').innerText();
      assert(text.includes(expectedText), `${route} did not include expected text: ${expectedText}`);
      assert(!text.includes('Authentication required'), `${route} leaked raw API auth error`);
      if (route === '/result') {
        assert(new URL(page.url()).pathname === '/generate', 'empty result must redirect to generator');
      }
      if (route.startsWith('/dashboard')) {
        assert(await page.locator('.pg-app-navbar a[href="/dashboard"][aria-current="page"]').count() === 1,
          `${route} lost its active Dashboard navigation state`);
      }

      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert(!hasHorizontalOverflow, `${route} has horizontal overflow at ${viewport.name}`);

      if (screenshotDir) {
        const fileSafeRoute = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
        await page.screenshot({ path: join(screenshotDir, `${viewport.name}-${fileSafeRoute}.png`), fullPage: true });
      }
    }

    // Exercise Link, browser history, Navigate and useNavigate/state after the v7 migration.
    await page.locator('.pg-app-navbar a[href="/dashboard"]').click();
    await page.waitForURL('**/dashboard');
    await page.goBack();
    await page.waitForURL('**/apis/smoke-api-id');
    await page.goForward();
    await page.waitForURL('**/dashboard');
    await page.locator('.pg-app-navbar a[href="/apis/new"]').click();
    await page.waitForURL('**/apis/new');
    await page.getByText('Connect wallet to create paid endpoints').waitFor();

    await page.goto(`${baseUrl}/generate`);
    await page.getByPlaceholder('https://api.yourservice.com').fill('https://api.example.com');
    await page.getByPlaceholder('/v1/data').fill('/weather');
    await page.getByPlaceholder('0.01').fill('0.01');
    await page.getByRole('button', { name: 'Generate legacy code' }).click();
    await page.waitForURL('**/result');
    await page.getByText('Your paywall is ready.').waitFor();
    await page.reload();
    await page.getByText('Your paywall is ready.').waitFor();
    assert((await page.locator('body').innerText()).includes('https://api.example.com'),
      'generated result must survive refresh via sessionStorage');

    authenticated = true;
    await page.goto(`${baseUrl}/apis/route-param-check`);
    await page.getByText('API not found for this wallet', { exact: true }).waitFor();
    assert(detailRequests.includes('/api/apis/route-param-check'), 'useParams must request the selected API ID');
    assert(pageErrors.length === 0, `Browser errors at ${viewport.name}: ${pageErrors.join('; ')}`);
    await page.close();
  }

  console.log(`Browser smoke passed for ${routes.length} routes across ${viewports.length} viewports, history, auth guards, dynamic params and result persistence`);
} catch (err) {
  if (String(err.message || '').includes('Executable doesn\'t exist')) {
    throw new Error('Playwright browser is not installed. Run npm --prefix frontend exec playwright install chromium.');
  }
  throw err;
} finally {
  if (browser) await browser.close();
  await stopProcess(child);
}
