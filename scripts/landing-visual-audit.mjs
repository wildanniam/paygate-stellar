import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootPath = fileURLToPath(new URL('..', import.meta.url));
const frontendPath = join(rootPath, 'frontend');
const frontendRequire = createRequire(new URL('../frontend/package.json', import.meta.url));
const evidencePath = join(rootPath, 'docs', 'evidence', 'landing-reference', 'latest');

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
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startVite(port) {
  const viteBin = join(dirname(frontendRequire.resolve('vite/package.json')), 'bin', 'vite.js');
  return spawn(process.execPath, [viteBin, '--host', '127.0.0.1', '--port', String(port)], {
    cwd: frontendPath,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
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

async function captureLanding({ browser, baseUrl, theme, viewport, suffix }) {
  const context = await browser.newContext({
    viewport,
    colorScheme: theme,
    reducedMotion: 'no-preference',
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const errors = [];
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  await context.addInitScript((initialTheme) => {
    window.localStorage.setItem('paygate-theme', initialTheme);
  }, theme);
  await page.route('**/api/**', (route) => route.fulfill({
    status: route.request().url().endsWith('/api/auth/me') ? 200 : 500,
    contentType: 'application/json',
    body: JSON.stringify(route.request().url().endsWith('/api/auth/me') ? { authenticated: false } : { error: 'Unexpected API call during landing audit' }),
  }));

  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('.paygate-workspace-surface', { state: 'visible', timeout: 10_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(450);

  const screenshotName = `${theme}-${suffix}.png`;
  await page.screenshot({ path: join(evidencePath, screenshotName) });

  const initial = await page.evaluate(() => {
    const rectOf = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
    };
    return {
      theme: document.querySelector('.paygate-landing')?.dataset.theme,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      hero: rectOf('.paygate-hero'),
      copy: rectOf('.paygate-hero-copy-block'),
      workspace: rectOf('.paygate-hero-workspace'),
      surface: rectOf('.paygate-workspace-surface'),
      flow: rectOf('.paygate-concept-flow'),
      flowStage: document.querySelector('.paygate-concept-flow')?.dataset.flowStage,
    };
  });

  assert(initial.theme === theme, `Expected ${theme} theme, got ${initial.theme}`);
  assert(initial.scrollWidth <= initial.viewportWidth + 1, `Landing overflows horizontally at ${viewport.width}px`);
  assert(initial.workspace?.width > 0 && initial.surface?.height > 0, 'Hero workspace geometry is missing');

  const workspaceBox = await page.locator('.paygate-hero-workspace').boundingBox();
  assert(workspaceBox, 'Could not measure hero workspace');
  await page.mouse.move(workspaceBox.x + workspaceBox.width * 0.82, workspaceBox.y + workspaceBox.height * 0.24);
  await page.waitForTimeout(520);
  const pointerState = await page.evaluate(() => {
    const root = document.querySelector('.paygate-hero-workspace');
    const surface = document.querySelector('.paygate-workspace-surface');
    return {
      active: root?.dataset.pointerActive,
      surfaceTransform: getComputedStyle(surface).transform,
      backX: getComputedStyle(root).getPropertyValue('--workspace-back-x').trim(),
      surfaceX: getComputedStyle(root).getPropertyValue('--workspace-surface-x').trim(),
    };
  });
  assert(pointerState.active === 'true', 'Pointer interaction did not activate workspace');
  assert(pointerState.backX !== '0px' && pointerState.surfaceX !== '0px', 'Workspace depth variables did not move');
  await page.mouse.move(0, 0);
  await page.waitForTimeout(520);
  const resetState = await page.evaluate(() => getComputedStyle(document.querySelector('.paygate-hero-workspace')).getPropertyValue('--workspace-surface-x').trim());
  assert(Math.abs(Number.parseFloat(resetState)) < 0.5, `Workspace did not settle after pointer exit: ${resetState}`);

  const rangeButton = page.locator('.paygate-workspace-status');
  await rangeButton.click({ force: true });
  assert(await page.locator('.paygate-workspace-range-menu').isVisible(), 'Revenue range menu did not open');
  await page.getByRole('menuitemradio', { name: /Last 7 days/ }).click({ force: true });
  assert((await rangeButton.innerText()).includes('Last 7 days'), 'Range menu did not change chart range');
  assert((await page.locator('.paygate-workspace-chart').getAttribute('aria-label')).includes('Last 7 days'), 'Chart aria label did not change with range');

  for (const [rangeIndex, rangeLabel] of ['Last 7 days', 'This month', 'Last 90 days'].entries()) {
    await rangeButton.click({ force: true });
    const menuOption = page.locator('.paygate-workspace-range-menu button').nth(rangeIndex);
    await menuOption.click({ force: true });
    await page.waitForTimeout(160);
    const settledRange = await rangeButton.innerText();
    assert(settledRange.includes(rangeLabel), `${rangeLabel} range selection did not settle (got ${settledRange})`);
    const yValues = await page.locator('.paygate-workspace-chart circle').evaluateAll((circles) => circles.map((circle) => Number(circle.getAttribute('cy'))));
    assert(yValues.length >= 3 && yValues.every(Number.isFinite), `${rangeLabel} revenue trend points are invalid`);
    if (rangeLabel === 'This month') {
      assert(yValues.some((value, index) => index > 0 && value > yValues[index - 1]), 'Monthly revenue trend should show a local period dip');
    }
  }

  const pauseButton = page.getByRole('button', { name: /Pause revenue chart animation/ });
  if (viewport.width <= 1180) {
    await pauseButton.click({ force: true });
    assert((await page.locator('.paygate-hero-workspace').getAttribute('data-paused')) === 'true', 'Workspace pause control did not pause');
  } else {
    assert(await page.locator('.paygate-workspace-topbar').evaluate((element) => getComputedStyle(element).display === 'none'), 'Desktop workspace chrome should stay hidden in the reference composition');
  }

  const activePoint = page.locator('.paygate-workspace-chart circle').first();
  await activePoint.focus();
  assert(await activePoint.evaluate((element) => document.activeElement === element), 'Chart point did not receive keyboard focus');
  await activePoint.click({ force: true });
  await page.waitForTimeout(120);
  assert(await activePoint.evaluate((element) => element.classList.contains('is-active')), 'Chart point selection did not work after keyboard focus');

  const copyButton = page.locator('.paygate-workspace-copy');
  if (viewport.width <= 1180) {
    await copyButton.click({ force: true });
    await page.waitForTimeout(180);
    assert((await copyButton.innerText()).includes('Copied'), 'Workspace copy affordance did not report success');
  } else {
    assert(await page.locator('.paygate-workspace-footer').evaluate((element) => getComputedStyle(element).display === 'none'), 'Desktop workspace footer should stay hidden in the reference composition');
  }

  const flow = page.locator('.paygate-concept-flow');
  await flow.locator('.paygate-concept-flow-status.is-warning').click();
  assert((await flow.getAttribute('data-flow-stage')) === 'required', 'Flow status selection did not change stage');
  await flow.getByRole('button', { name: 'Restart PayGate flow' }).click();
  assert((await flow.getAttribute('data-flow-stage')) === 'request', 'Flow restart did not reset to request');
  await flow.locator('.paygate-concept-flow-status.is-paid').click();
  assert((await flow.getAttribute('data-flow-stage')) === 'paid', 'MPP flow status did not become active');
  await flow.locator('.is-proxy .paygate-concept-flow-url').click();
  await page.waitForTimeout(180);
  assert((await flow.locator('.is-proxy .paygate-concept-flow-url').innerText()).includes('Copied'), 'Flow endpoint copy affordance did not report success');

  const afterInteractions = await page.evaluate(() => ({
    flowStage: document.querySelector('.paygate-concept-flow')?.dataset.flowStage,
    flowPlaying: document.querySelector('.paygate-concept-flow')?.dataset.flowPlaying,
    theme: document.querySelector('.paygate-landing')?.dataset.theme,
  }));

  if (theme === 'dark') {
    let themeToggle;
    if (viewport.width <= 640) {
      await page.getByRole('button', { name: 'Open mobile menu' }).click({ force: true });
      themeToggle = page.locator('.paygate-mobile-theme-toggle');
    } else {
      themeToggle = page.locator('.paygate-theme-toggle');
    }
    assert(await themeToggle.count() === 1, 'Theme toggle is missing from the landing navigation');
    await themeToggle.click({ force: true });
    assert((await page.locator('.paygate-landing').getAttribute('data-theme')) === 'light', 'Theme toggle did not switch to light');
    if (viewport.width <= 640) {
      await page.getByRole('button', { name: 'Open mobile menu' }).click({ force: true });
      themeToggle = page.locator('.paygate-mobile-theme-toggle');
    }
    await themeToggle.click({ force: true });
    assert((await page.locator('.paygate-landing').getAttribute('data-theme')) === 'dark', 'Theme toggle did not switch back to dark');
  }

  await context.close();
  return { theme, viewport, screenshot: screenshotName, initial, pointerState, resetState, afterInteractions, errors };
}

const port = Number(process.env.PAYGATE_LANDING_AUDIT_PORT || 0) || await getFreePort();
const baseUrl = process.env.PAYGATE_LANDING_AUDIT_URL || `http://127.0.0.1:${port}`;
const shouldStartServer = !process.env.PAYGATE_LANDING_AUDIT_URL;
const viewports = [
  { name: 'desktop-1491x1055', width: 1491, height: 1055 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-320x844', width: 320, height: 844 },
];

let child;
let browser;

try {
  if (!existsSync(join(frontendPath, 'node_modules'))) {
    throw new Error('frontend/node_modules is missing. Run npm --prefix frontend ci first.');
  }

  const { chromium } = frontendRequire('playwright');
  await mkdir(evidencePath, { recursive: true });
  if (shouldStartServer) {
    child = startVite(port);
    await waitForUrl(baseUrl);
  }
  browser = await chromium.launch();

  const results = [];
  for (const viewport of viewports) {
    for (const theme of ['dark', 'light']) {
      results.push(await captureLanding({
        browser,
        baseUrl,
        theme,
        viewport,
        suffix: viewport.name,
      }));
    }
  }

  await writeFile(join(evidencePath, 'landing-audit.json'), `${JSON.stringify({ baseUrl, results }, null, 2)}\n`, 'utf8');
  const errors = results.flatMap((result) => result.errors);
  assert(errors.length === 0, `Landing browser errors: ${errors.join('; ')}`);
  console.log(`Landing visual audit passed for ${results.length} theme/viewport combinations`);
  console.log(`Evidence: ${evidencePath}`);
} catch (error) {
  if (String(error.message || '').includes('Executable doesn\'t exist')) {
    throw new Error('Playwright browser is not installed. Run npm --prefix frontend exec playwright install chromium.');
  }
  throw error;
} finally {
  if (browser) await browser.close();
  await stopProcess(child);
}
