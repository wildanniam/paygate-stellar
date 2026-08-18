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
  if (pathname === '/dashboard') return 'Wallet login required';
  if (pathname === '/apis/new') return 'Connect wallet to register APIs';
  return 'Connect wallet to view this API';
}

const routes = ['/', '/dashboard', '/apis/new', '/apis/smoke-api-id'];
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
    await page.route('**/api/**', (route) => {
      const url = new URL(route.request().url());
      const body = url.pathname === '/api/auth/me'
        ? { authenticated: false }
        : { error: 'Unexpected API call during browser smoke' };
      return route.fulfill({
        status: url.pathname === '/api/auth/me' ? 200 : 500,
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
      });
      const text = await page.locator('body').innerText();
      assert(text.includes(expectedText), `${route} did not include expected text: ${expectedText}`);
      assert(!text.includes('Authentication required'), `${route} leaked raw API auth error`);

      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert(!hasHorizontalOverflow, `${route} has horizontal overflow at ${viewport.name}`);

      if (screenshotDir) {
        const fileSafeRoute = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
        await page.screenshot({ path: join(screenshotDir, `${viewport.name}-${fileSafeRoute}.png`), fullPage: true });
      }
    }
    await page.close();
  }

  console.log(`Browser smoke passed for ${routes.length} routes across ${viewports.length} viewports`);
} catch (err) {
  if (String(err.message || '').includes('Executable doesn\'t exist')) {
    throw new Error('Playwright browser is not installed. Run npm --prefix frontend exec playwright install chromium.');
  }
  throw err;
} finally {
  if (browser) await browser.close();
  await stopProcess(child);
}
