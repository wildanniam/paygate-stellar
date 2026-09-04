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
  await context.addInitScript(() => {
    window.localStorage.setItem('paygate-theme', 'light');
  });
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
  assert(
    await page.locator('.paygate-theme-toggle, .paygate-mobile-theme-toggle').count() === 0,
    'Theme controls must remain hidden while the landing is dark-only',
  );
  assert(initial.scrollWidth <= initial.viewportWidth + 1, `Landing overflows horizontally at ${viewport.width}px`);
  assert(initial.workspace?.width > 0 && initial.surface?.height > 0, 'Hero workspace geometry is missing');

  const assetDensity = await page.evaluate(async () => {
    const inspectRaster = async (selector, sourceAttribute) => {
      const element = document.querySelector(selector);
      if (!element) return { selector, missing: true };

      const source = element.getAttribute(sourceAttribute);
      const rect = element.getBoundingClientRect();
      const visible = getComputedStyle(element).display !== 'none' && rect.width > 0 && rect.height > 0;
      const image = new Image();
      const selectedSource = element instanceof HTMLImageElement && element.currentSrc
        ? element.currentSrc
        : new URL(source, window.location.href).href;
      image.src = selectedSource;
      await image.decode();

      return {
        selector,
        source,
        selectedSource,
        visible,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        renderedWidth: Math.round(rect.width),
        renderedHeight: Math.round(rect.height),
        densityX: rect.width ? image.naturalWidth / rect.width : null,
        densityY: rect.height ? image.naturalHeight / rect.height : null,
      };
    };

    return Promise.all([
      inspectRaster('.paygate-workspace-shell-image.is-dark', 'href'),
      inspectRaster('.paygate-gate-reference-art', 'src'),
    ]);
  });
  assert(assetDensity.every(({ missing }) => !missing), `Landing showcase assets are missing: ${JSON.stringify(assetDensity)}`);
  const gateAsset = assetDensity.find(({ selector }) => selector === '.paygate-gate-reference-art');
  assert(
    !gateAsset.visible || gateAsset.selectedSource.endsWith('/brand/paygate-gate-reference-transparent.png'),
    `DPR 1 did not keep the accepted gate source: ${JSON.stringify(gateAsset)}`,
  );
  assert(
    assetDensity
      .filter(({ visible }) => visible)
      .every(({ densityX, densityY }) => densityX >= 0.98 && densityY >= 0.98),
    `A landing showcase raster is enlarged beyond its native dimensions: ${JSON.stringify(assetDensity)}`,
  );

  const landingMaterialState = await page.evaluate(() => {
    const selectors = [
      '.paygate-protected-section',
      '.paygate-proof-section',
      '.paygate-ops-section',
      '.paygate-audience-section',
      '.paygate-footer',
    ];
    const panelSelectors = [
      '.paygate-protected-card',
      '.paygate-receipt-panel',
      '.paygate-ops-shell',
      '.paygate-audience-row',
      '.paygate-footer-primary',
    ];
    const toRgb = (value) => (value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/) || []).slice(1).map(Number);
    const luminance = (value) => {
      const values = toRgb(value);
      if (values.length !== 3) return null;
      const channels = values.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const describe = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return { selector, missing: true };
      const style = getComputedStyle(element);
      return {
        selector,
        backgroundColor: style.backgroundColor,
        luminance: luminance(style.backgroundColor),
      };
    };
    return {
      sections: selectors.map(describe),
      panels: panelSelectors.map(describe),
    };
  });

  if (theme === 'light') {
    assert(
      landingMaterialState.sections.every(({ missing, luminance }) => !missing && luminance >= 0.72),
      `Light landing sections must stay porcelain: ${JSON.stringify(landingMaterialState.sections)}`,
    );
    assert(
      landingMaterialState.panels.every(({ missing, luminance }) => !missing && luminance >= 0.78),
      `Light landing panels must remain readable: ${JSON.stringify(landingMaterialState.panels)}`,
    );
  }

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
      sceneX: getComputedStyle(root).getPropertyValue('--workspace-scene-x').trim(),
      sceneY: getComputedStyle(root).getPropertyValue('--workspace-scene-y').trim(),
    };
  });
  assert(pointerState.active === 'true', 'Pointer interaction did not activate workspace');
  assert(pointerState.sceneX !== '0px' && pointerState.sceneY !== '0px', 'Workspace scene variables did not move');
  await page.mouse.move(0, 0);
  await page.waitForTimeout(520);
  const resetState = await page.evaluate(() => getComputedStyle(document.querySelector('.paygate-hero-workspace')).getPropertyValue('--workspace-scene-x').trim());
  assert(Math.abs(Number.parseFloat(resetState)) < 0.5, `Workspace did not settle after pointer exit: ${resetState}`);

  const rangeButton = page.locator('.paygate-workspace-status');
  await rangeButton.click({ force: true });
  assert((await rangeButton.textContent()).includes('Last 90 days'), 'Range control did not advance to the next chart range');
  assert((await page.locator('.paygate-workspace-chart').getAttribute('aria-label')).includes('Last 90 days'), 'Chart aria label did not change with range');

  for (const rangeLabel of ['Last 7 days', 'This month', 'Last 90 days']) {
    await rangeButton.click({ force: true });
    await page.waitForTimeout(160);
    const settledRange = await rangeButton.textContent();
    assert(settledRange.includes(rangeLabel), `${rangeLabel} range selection did not settle (got ${settledRange})`);
    const yValues = await page.locator('.paygate-workspace-chart circle').evaluateAll((circles) => circles.map((circle) => Number(circle.getAttribute('cy'))));
    assert(yValues.length >= 3 && yValues.every(Number.isFinite), `${rangeLabel} revenue trend points are invalid`);
    assert(yValues.every((value, index) => index === 0 || value <= yValues[index - 1]), `${rangeLabel} cumulative revenue trend must not decrease`);
  }

  const workspaceTextFit = await page.evaluate(() => {
    const surface = document.querySelector('.paygate-workspace-surface');
    const surfaceRect = surface.getBoundingClientRect();
    const status = document.querySelector('.paygate-workspace-status');
    const statusText = status.querySelector('text').getBoundingClientRect();
    const statusChevron = status.querySelector('.paygate-workspace-chevron').getBoundingClientRect();
    const visibleText = Array.from(surface.querySelectorAll('text'))
      .filter((element) => getComputedStyle(element).display !== 'none')
      .map((element) => ({ text: element.textContent.trim(), rect: element.getBoundingClientRect() }));
    const overlaps = [];

    for (let first = 0; first < visibleText.length; first += 1) {
      for (let second = first + 1; second < visibleText.length; second += 1) {
        const a = visibleText[first];
        const b = visibleText[second];
        if (a.rect.left < b.rect.right && a.rect.right > b.rect.left && a.rect.top < b.rect.bottom && a.rect.bottom > b.rect.top) {
          overlaps.push(`${a.text} / ${b.text}`);
        }
      }
    }

    return {
      outside: visibleText
        .filter(({ rect }) => rect.left < surfaceRect.left || rect.right > surfaceRect.right || rect.top < surfaceRect.top || rect.bottom > surfaceRect.bottom)
        .map(({ text }) => text),
      overlaps,
      statusGap: statusChevron.left - statusText.right,
      metricClearance: Array.from(surface.querySelectorAll('.paygate-workspace-metric')).map((metric) => {
        const card = metric.querySelector('.paygate-workspace-metric-card').getBoundingClientRect();
        const note = metric.querySelector('.paygate-workspace-metric-note').getBoundingClientRect();
        return card.bottom - note.bottom;
      }),
    };
  });
  assert(workspaceTextFit.outside.length === 0, `Workspace text exceeds the SVG bounds: ${workspaceTextFit.outside.join(', ')}`);
  assert(workspaceTextFit.overlaps.length === 0, `Workspace text overlaps: ${workspaceTextFit.overlaps.join(', ')}`);
  assert(workspaceTextFit.statusGap >= 6, `Workspace range label is too close to its chevron: ${workspaceTextFit.statusGap}px`);
  assert(workspaceTextFit.metricClearance.every((clearance) => clearance >= 2), `Workspace metric text crosses a card edge: ${workspaceTextFit.metricClearance.join(', ')}`);

  const workspaceShells = await page.locator('.paygate-workspace-shell-image').evaluateAll((elements) => elements.map((element) => ({
    href: element.getAttribute('href'),
    display: getComputedStyle(element).display,
  })));
  assert(workspaceShells.length === 2, 'Hero instrument must provide dedicated dark and light shell assets');
  const visibleShells = workspaceShells.filter(({ display }) => display !== 'none');
  assert(visibleShells.length === 1, `Exactly one hero shell must be visible: ${JSON.stringify(workspaceShells)}`);
  assert(
    visibleShells[0].href?.includes(theme === 'light' ? 'shell-light' : 'shell-v2-tight'),
    `${theme} theme is using the wrong hero shell: ${visibleShells[0].href}`,
  );
  assert(await page.locator('.paygate-workspace-topbar').evaluate((element) => getComputedStyle(element).display === 'none'), 'Workspace chrome should stay hidden in the concept composition');

  const activePoint = page.locator('.paygate-workspace-chart circle').first();
  await activePoint.focus();
  assert(await activePoint.evaluate((element) => document.activeElement === element), 'Chart point did not receive keyboard focus');
  await activePoint.press('Enter');
  await page.waitForTimeout(120);
  assert(await activePoint.evaluate((element) => element.classList.contains('is-active')), `Chart point keyboard selection did not work at ${viewport.name}`);

  assert(await page.locator('.paygate-workspace-footer').evaluate((element) => getComputedStyle(element).display === 'none'), 'Workspace footer should stay hidden in the concept composition');

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

  const anchorNavigation = [];
  if (viewport.width > 640) {
    const anchors = [
      { name: 'how-it-works', href: '#how-it-works', heading: '#paygate-transform-title' },
      { name: 'security', href: '#protected-calls', heading: '#paygate-protected-title' },
      { name: 'product', href: '#workspace', heading: '#paygate-ops-title' },
    ];

    for (const anchor of anchors) {
      await page.locator(`.paygate-nav-center a[href="${anchor.href}"]`).click();
      await page.waitForTimeout(900);

      const geometry = await page.evaluate(({ href, headingSelector }) => {
        const nav = document.querySelector('.paygate-nav')?.getBoundingClientRect();
        const section = document.querySelector(href)?.getBoundingClientRect();
        const heading = document.querySelector(headingSelector)?.getBoundingClientRect();
        const activeLink = document.querySelector(`.paygate-nav-center a[href="${href}"]`);
        const compact = (rect) => rect ? {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
        } : null;

        return {
          hash: window.location.hash,
          nav: compact(nav),
          section: compact(section),
          heading: compact(heading),
          active: activeLink?.getAttribute('data-active'),
        };
      }, { href: anchor.href, headingSelector: anchor.heading });

      assert(geometry.hash === anchor.href, `${anchor.name} navigation did not update the URL hash`);
      assert(geometry.nav && geometry.section && geometry.heading, `${anchor.name} navigation geometry is incomplete`);
      assert(
        geometry.section.bottom > geometry.nav.bottom,
        `${anchor.name} section is hidden behind the sticky navigation: ${JSON.stringify(geometry)}`,
      );
      assert(
        geometry.heading.top >= geometry.nav.bottom + 16,
        `${anchor.name} heading is obscured by the sticky navigation: ${JSON.stringify(geometry)}`,
      );
      assert(geometry.active === 'true', `${anchor.name} navigation link did not become active`);

      if (viewport.name === 'desktop-1280x720') {
        const filename = `${theme}-anchor-${anchor.name}-1280x720.png`;
        await page.screenshot({ path: join(evidencePath, filename) });
        geometry.screenshot = filename;
      }

      anchorNavigation.push({ name: anchor.name, ...geometry });
    }
  }

  const footer = page.locator('.paygate-footer');
  assert(await footer.count() === 1, 'Expected one landing footer');
  await footer.evaluate((element) => element.scrollIntoView({ block: 'end', behavior: 'instant' }));
  await page.waitForTimeout(320);
  const chromeFit = await page.evaluate(() => {
    const inspect = (rootSelector) => {
      const root = document.querySelector(rootSelector);
      if (!root) return { rootSelector, missing: true };

      const controls = Array.from(root.querySelectorAll('a, button'))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const textRects = [];
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          let textNode = walker.nextNode();

          while (textNode) {
            const parent = textNode.parentElement;
            const value = textNode.textContent.trim();
            if (value && parent && getComputedStyle(parent).display !== 'none' && getComputedStyle(parent).visibility !== 'hidden') {
              const range = document.createRange();
              range.selectNodeContents(textNode);
              const textRect = range.getBoundingClientRect();
              if (textRect.width > 0 && textRect.height > 0) {
                textRects.push({ left: textRect.left, right: textRect.right });
              }
            }
            textNode = walker.nextNode();
          }

          return {
            label: element.getAttribute('aria-label') || element.textContent.trim(),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            clipped: textRects.some(({ left, right }) => left < rect.left - 1 || right > rect.right + 1),
          };
        });

      return {
        rootSelector,
        controls,
        horizontallyClipped: root.scrollWidth > root.clientWidth + 1,
      };
    };

    return {
      viewportWidth: document.documentElement.clientWidth,
      nav: inspect('.paygate-nav'),
      footer: inspect('.paygate-footer'),
    };
  });

  for (const region of [chromeFit.nav, chromeFit.footer]) {
    assert(!region.missing, `${region.rootSelector} is missing`);
    assert(!region.horizontallyClipped, `${region.rootSelector} has clipped horizontal content`);
    assert(
      region.controls.every(({ left, right }) => left >= -1 && right <= chromeFit.viewportWidth + 1),
      `${region.rootSelector} has a control outside the viewport: ${JSON.stringify(region.controls)}`,
    );
    assert(
      region.controls.every(({ clipped }) => !clipped),
      `${region.rootSelector} has a clipped control label: ${JSON.stringify(region.controls)}`,
    );
  }

  const sectionScreenshots = [];
  if (viewport.width >= 1491 || (theme === 'light' && viewport.width === 390)) {
    const sections = [
      ['flow', '.paygate-transform-section'],
      ['protected', '.paygate-protected-section'],
      ['proof', '.paygate-proof-section'],
      ['workspace', '.paygate-ops-section'],
      ['audience', '.paygate-audience-section'],
      ['footer', '.paygate-footer'],
    ];

    for (const [name, selector] of sections) {
      const section = page.locator(selector);
      assert(await section.count() === 1, `Expected one ${name} landing section`);
      await section.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(620);
      assert(await section.isVisible(), `${name} landing section did not reveal after scrolling`);
      const viewportLabel = viewport.width >= 1491 ? '1491x1055' : '390x844';
      const filename = `${theme}-section-${name}-${viewportLabel}.png`;
      await section.screenshot({ path: join(evidencePath, filename) });
      sectionScreenshots.push(filename);
    }
  }

  await context.close();
  return {
    theme,
    viewport,
    screenshot: screenshotName,
    sectionScreenshots,
    initial,
    landingMaterialState,
    assetDensity,
    pointerState,
    resetState,
    afterInteractions,
    anchorNavigation,
    chromeFit,
    errors,
  };
}

async function auditRetinaGate({ browser, baseUrl }) {
  const viewport = { width: 1280, height: 720 };
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  });
  const errors = [];

  try {
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    await context.addInitScript(() => {
      window.localStorage.setItem('paygate-theme', 'dark');
    });
    await page.route('**/api/**', (route) => route.fulfill({
      status: route.request().url().endsWith('/api/auth/me') ? 200 : 500,
      contentType: 'application/json',
      body: JSON.stringify(route.request().url().endsWith('/api/auth/me') ? { authenticated: false } : { error: 'Unexpected API call during landing audit' }),
    }));

    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('.paygate-gate-reference-art', { state: 'attached', timeout: 10_000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.locator('.paygate-transform-section').evaluate((element) => {
      element.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
    await page.waitForTimeout(620);

    const gate = await page.evaluate(async () => {
      const element = document.querySelector('.paygate-gate-reference-art');
      if (!(element instanceof HTMLImageElement)) return null;
      await element.decode();

      const source = new Image();
      source.src = element.currentSrc;
      await source.decode();
      const rect = element.getBoundingClientRect();

      return {
        currentSrc: element.currentSrc,
        sourceNaturalWidth: source.naturalWidth,
        sourceNaturalHeight: source.naturalHeight,
        intrinsicWidth: element.naturalWidth,
        intrinsicHeight: element.naturalHeight,
        renderedWidth: Math.round(rect.width),
        renderedHeight: Math.round(rect.height),
        devicePixelRatio: window.devicePixelRatio,
        densityX: source.naturalWidth / (rect.width * window.devicePixelRatio),
        densityY: source.naturalHeight / (rect.height * window.devicePixelRatio),
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    assert(gate, 'Retina gate artwork is missing');
    assert(gate.currentSrc.includes('paygate-gate-reference-transparent-2x.png'), `DPR 2 did not select the Retina gate: ${gate.currentSrc}`);
    assert(gate.sourceNaturalWidth === 506 && gate.sourceNaturalHeight === 948, `Unexpected Retina gate source dimensions: ${JSON.stringify(gate)}`);
    assert(gate.renderedWidth === 253 && gate.renderedHeight === 474, `Retina gate changed layout geometry: ${JSON.stringify(gate)}`);
    assert(gate.devicePixelRatio === 2, `Expected DPR 2, got ${gate.devicePixelRatio}`);
    assert(gate.densityX >= 0.98 && gate.densityY >= 0.98, `Retina gate is undersampled: ${JSON.stringify(gate)}`);
    assert(gate.scrollWidth <= gate.viewportWidth + 1, `Retina landing overflows horizontally: ${JSON.stringify(gate)}`);

    const screenshot = 'dark-retina-gate-253x474@2x.png';
    await page.locator('.paygate-gate-reference-art').screenshot({
      path: join(evidencePath, screenshot),
    });

    return { viewport, screenshot, gate, errors };
  } finally {
    await context.close();
  }
}

const port = Number(process.env.PAYGATE_LANDING_AUDIT_PORT || 0) || await getFreePort();
const baseUrl = process.env.PAYGATE_LANDING_AUDIT_URL || `http://127.0.0.1:${port}`;
const shouldStartServer = !process.env.PAYGATE_LANDING_AUDIT_URL;
const viewports = [
  { name: 'desktop-1491x1055', width: 1491, height: 1055 },
  { name: 'desktop-1280x720', width: 1280, height: 720 },
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
    results.push(await captureLanding({
      browser,
      baseUrl,
      theme: 'dark',
      viewport,
      suffix: viewport.name,
    }));
  }

  const retinaGate = await auditRetinaGate({ browser, baseUrl });
  await writeFile(join(evidencePath, 'landing-audit.json'), `${JSON.stringify({ baseUrl, results, retinaGate }, null, 2)}\n`, 'utf8');
  const errors = [...results.flatMap((result) => result.errors), ...retinaGate.errors];
  assert(errors.length === 0, `Landing browser errors: ${errors.join('; ')}`);
  console.log(`Landing visual audit passed for ${results.length} theme/viewport combinations plus DPR 2 gate coverage`);
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
