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
const parityPath = join(evidencePath, 'parity');
const viewport = { width: 1491, height: 1055 };

const SELECTORS = {
  navigation: '.paygate-nav-inner',
  hero: '.paygate-hero',
  heroInner: '.paygate-hero-inner',
  heroCopy: '.paygate-hero-copy-block',
  eyebrow: '.paygate-hero-eyebrow',
  title: '.paygate-hero-title',
  copy: '.paygate-hero-copy',
  actions: '.paygate-hero-actions',
  trust: '.paygate-hero-trust',
  workspace: '.paygate-hero-workspace',
  workspaceBack: '.paygate-workspace-rail.is-back',
  workspaceMiddle: '.paygate-workspace-rail.is-middle',
  workspaceFront: '.paygate-workspace-rail.is-front',
  workspaceSurface: '.paygate-workspace-surface',
  workspaceHeading: '.paygate-workspace-heading',
  workspaceChart: '.paygate-workspace-chart-shell',
  workspaceMetrics: '.paygate-workspace-metrics',
  workspaceFooter: '.paygate-workspace-footer',
  flowSection: '.paygate-transform-section',
  flow: '.paygate-concept-flow',
  flowHeader: '.paygate-concept-flow-header',
  flowRoute: '.paygate-concept-flow-route',
  source: '.paygate-concept-flow-endpoint.is-source',
  gate: '.paygate-concept-flow-gate',
  proxy: '.paygate-concept-flow-endpoint.is-proxy',
  outcomes: '.paygate-concept-flow-outcomes',
  warning: '.paygate-concept-flow-status.is-warning',
  paid: '.paygate-concept-flow-status.is-paid',
  success: '.paygate-concept-flow-status.is-success',
  revenue: '.paygate-concept-flow-revenue',
};

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

async function collectDomState(page) {
  return page.evaluate((selectors) => {
    const styleKeys = [
      'display',
      'visibility',
      'opacity',
      'transform',
      'transformOrigin',
      'perspective',
      'borderRadius',
      'borderTopColor',
      'backgroundColor',
      'boxShadow',
      'filter',
      'backdropFilter',
      'animationName',
      'animationDuration',
      'animationPlayState',
      'transitionDuration',
    ];
    const round = (value) => Math.round(value * 10) / 10;
    const describe = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const styles = Object.fromEntries(styleKeys.map((key) => [key, style[key]]));
      return {
        selector,
        tag: element.tagName.toLowerCase(),
        text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        visible: rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0.005,
        rect: {
          x: round(rect.x),
          y: round(rect.y),
          documentY: round(rect.y + window.scrollY),
          width: round(rect.width),
          height: round(rect.height),
        },
        normalizedRect: {
          x: round(rect.x / innerWidth),
          y: round(rect.y / innerHeight),
          width: round(rect.width / innerWidth),
          height: round(rect.height / innerHeight),
        },
        styles,
        className: String(element.className || ''),
        dataset: { ...element.dataset },
      };
    };

    return {
      viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
      document: {
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        fonts: document.fonts?.status || 'unknown',
        theme: document.querySelector('.paygate-landing')?.dataset.theme || '',
      },
      elements: Object.fromEntries(Object.entries(selectors).map(([key, selector]) => [key, describe(selector)])),
      interaction: {
        flowStage: document.querySelector('.paygate-concept-flow')?.dataset.flowStage || '',
        flowPlaying: document.querySelector('.paygate-concept-flow')?.dataset.flowPlaying || '',
        pointerActive: document.querySelector('.paygate-hero-workspace')?.dataset.pointerActive || '',
        paused: document.querySelector('.paygate-hero-workspace')?.dataset.paused || '',
        chartPath: document.querySelector('.paygate-workspace-chart-line')?.getAttribute('d') || '',
        activePoint: document.querySelector('.paygate-workspace-chart circle.is-active')?.getAttribute('aria-label') || '',
        cssVariables: Object.fromEntries(
          ['--workspace-scene-x', '--workspace-scene-y', '--workspace-scene-rx', '--workspace-scene-ry']
            .map((key) => [key, getComputedStyle(document.querySelector('.paygate-hero-workspace')).getPropertyValue(key).trim()]),
        ),
      },
    };
  }, SELECTORS);
}

async function capture(page, name, state) {
  const screenshot = join(parityPath, `${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  const dom = await collectDomState(page);
  return { state, screenshot, dom };
}

async function captureTheme(browser, baseUrl, theme) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: theme,
    reducedMotion: 'no-preference',
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  const errors = [];
  const badResponses = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push({ status: response.status(), url: response.url() });
  });
  await context.addInitScript((initialTheme) => {
    window.localStorage.setItem('paygate-theme', initialTheme);
  }, theme);
  await page.route('**/api/**', (route) => route.fulfill({
    status: route.request().url().endsWith('/api/auth/me') ? 200 : 500,
    contentType: 'application/json',
    body: JSON.stringify(route.request().url().endsWith('/api/auth/me') ? { authenticated: false } : { error: 'Unexpected API call during parity audit' }),
  }));

  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('.paygate-workspace-surface', { state: 'visible', timeout: 10_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(450);

  const captures = [];
  captures.push(await capture(page, `${theme}-runtime-initial-1491x1055`, 'runtime-initial'));

  const workspace = page.locator('.paygate-hero-workspace');
  const workspaceBox = await workspace.boundingBox();
  assert(workspaceBox, `${theme}: workspace box is missing`);

  const motionFramesPath = join(parityPath, theme, 'motion');
  await mkdir(motionFramesPath, { recursive: true });
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    await page.mouse.move(
      workspaceBox.x + workspaceBox.width * (0.5 + Math.cos(angle) * 0.30),
      workspaceBox.y + workspaceBox.height * (0.5 + Math.sin(angle) * 0.24),
    );
    await page.waitForTimeout(140);
    await page.screenshot({ path: join(motionFramesPath, `frame-${String(index).padStart(2, '0')}.png`) });
  }

  await page.mouse.move(workspaceBox.x + workspaceBox.width * 0.82, workspaceBox.y + workspaceBox.height * 0.24);
  await page.waitForTimeout(520);
  captures.push(await capture(page, `${theme}-pointer-hover-1491x1055`, 'pointer-hover'));
  const pointerHover = captures.at(-1).dom;
  await page.mouse.move(0, 0);
  await page.waitForTimeout(900);
  const pointerReset = await collectDomState(page);

  assert(await page.locator('.paygate-workspace-topbar').evaluate((element) => getComputedStyle(element).display === 'none'), `${theme}: desktop workspace chrome should stay hidden in the reference composition`);
  await page.locator('.paygate-concept-flow-status.is-success').click({ force: true });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(900);
  await page.addStyleTag({
    content: `
      .paygate-workspace-surface,
      .paygate-workspace-chart-line,
      .paygate-concept-flow-url,
      .paygate-concept-flow-gate {
        animation: none !important;
        transition: none !important;
      }
      .paygate-workspace-chart-line {
        stroke-dashoffset: 0 !important;
      }
      .paygate-workspace-surface {
        transform: none !important;
      }
    `,
  });
  await page.evaluate(() => {
    const workspace = document.querySelector('.paygate-hero-workspace');
    if (!workspace) return;
    workspace.dataset.pointerActive = 'false';
    ['--workspace-scene-x', '--workspace-scene-y'].forEach((name) => workspace.style.setProperty(name, '0px'));
    ['--workspace-scene-rx', '--workspace-scene-ry'].forEach((name) => workspace.style.setProperty(name, '0deg'));
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(220);
  captures.push(await capture(page, `${theme}-stable-initial-1491x1055`, 'stable-initial'));

  const rangeButton = page.locator('.paygate-workspace-status');
  await rangeButton.click({ force: true });
  await rangeButton.click({ force: true });
  captures.push(await capture(page, `${theme}-range-7d-1491x1055`, 'range-7d'));

  const flow = page.locator('.paygate-concept-flow');
  await flow.locator('.paygate-concept-flow-status.is-warning').click({ force: true });
  captures.push(await capture(page, `${theme}-flow-required-1491x1055`, 'flow-required'));
  await flow.locator('.paygate-concept-flow-status.is-success').click({ force: true });
  captures.push(await capture(page, `${theme}-flow-success-1491x1055`, 'flow-success'));

  const report = {
    theme,
    viewport,
    captures,
    pointer: {
      hover: pointerHover.interaction,
      reset: pointerReset.interaction,
    },
    errors,
    badResponses,
    final: await collectDomState(page),
    motionFrames: motionFramesPath,
  };
  await context.close();
  return report;
}

const port = Number(process.env.PAYGATE_LANDING_PARITY_PORT || 0) || await getFreePort();
const baseUrl = process.env.PAYGATE_LANDING_AUDIT_URL || `http://127.0.0.1:${port}`;
const shouldStartServer = !process.env.PAYGATE_LANDING_AUDIT_URL;
let child;
let browser;

try {
  assert(existsSync(join(frontendPath, 'node_modules')), 'frontend/node_modules is missing. Run npm --prefix frontend ci first.');
  const { chromium } = frontendRequire('playwright');
  await mkdir(parityPath, { recursive: true });
  if (shouldStartServer) {
    child = startVite(port);
    await waitForUrl(baseUrl);
  }
  browser = await chromium.launch();
  const reports = [await captureTheme(browser, baseUrl, 'dark')];
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport,
    reference: join(rootPath, 'docs', 'evidence', 'landing-reference', 'paygate-reference-dark.png'),
    method: {
      layout: 'exact viewport, deviceScaleFactor 1, isolated browser context per theme',
      states: ['runtime-initial', 'pointer-hover', 'range-7d', 'flow-required', 'flow-success'],
      motion: 'eight runtime frames per theme; no motion oracle exists for the static reference',
      interpretation: 'image metrics are diagnostic evidence, not a completion threshold for an AI-generated concept image',
    },
    themes: reports,
  };
  await writeFile(join(parityPath, 'landing-parity-audit.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  const errors = reports.flatMap((item) => item.errors);
  assert(errors.length === 0, `Landing parity browser errors: ${errors.join('; ')}`);
  console.log(`Landing parity audit captured ${reports.length} themes at ${viewport.width}x${viewport.height}`);
  console.log(`Evidence: ${parityPath}`);
} catch (error) {
  if (String(error.message || '').includes("Executable doesn't exist")) {
    throw new Error('Playwright browser is not installed. Run npm --prefix frontend exec playwright install chromium.');
  }
  throw error;
} finally {
  if (browser) await browser.close();
  await stopProcess(child);
}
