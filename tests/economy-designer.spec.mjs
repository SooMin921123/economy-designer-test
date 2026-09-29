import { test, expect } from '@playwright/test';

const STORE = 'econverse431-guarded';

async function boot(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    try { return typeof (0, eval)('courseGo41') === 'function'; }
    catch { return false; }
  });
  await expect(page.locator('.brand')).toContainText('경제 설계자 4.3.1');
  await expect(page.locator('#warning')).toBeHidden();
}

async function appEval(page, source) {
  return page.evaluate(code => (0, eval)(code), source);
}

async function goTask(page, id) {
  await appEval(page, `courseGo41('course-task',${JSON.stringify(id)})`);
  await expect(page.locator('[data-action="c41-submit"]')).toBeVisible();
}

test('4.3.1 boots cleanly in Desktop Chromium and mobile viewport', async ({ page }, testInfo) => {
  await boot(page);
  const script = await page.locator('#app-code').textContent();
  expect(script).toContain("const BUILD='4.3.1-recovery.1'");
  expect(script).toContain("STORE='econverse431-guarded'");

  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  if (testInfo.project.name === 'desktop-chromium') expect(dimensions.width).toBe(1440);
  if (testInfo.project.name === 'mobile-chromium') expect(dimensions.width).toBe(390);
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
  await expect(page.locator('nav.nav')).toBeVisible();
});

test('localStorage survives an actual settings change and reload', async ({ page }) => {
  await boot(page);
  await page.locator('header.top [data-action="settings"]').click();
  const reduced = page.locator('[data-setting="reduced"]');
  await expect(reduced).toBeVisible();
  await reduced.check();

  await expect.poll(async () => page.evaluate(key => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).settings?.reduced : null;
  }, STORE)).toBe(true);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof document.querySelector === 'function');
  await page.locator('header.top [data-action="settings"]').click();
  await expect(page.locator('[data-setting="reduced"]')).toBeChecked();
});

test('related lecture round trip preserves submitted C03-04 answer and record', async ({ page }) => {
  await boot(page);
  await goTask(page, 'C03-04');

  const values = ['13', '19', '12', '21'];
  for (let i = 0; i < values.length; i++) {
    await page.locator(`[data-cfield41="num"][data-i="${i}"]`).fill(values[i]);
  }
  await page.locator('[data-action="c41-option"][data-key="choice"][data-i="1"]').click();
  await page.locator('[data-action="c41-confidence"][data-value="sure"]').click();
  await page.locator('[data-action="c41-submit"]').click();

  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).course41.records['C03-04'], STORE);
  expect(before?.solved).toBeTruthy();

  await page.locator('[data-action="c41-related"]').click();
  await expect(page.locator('[data-action="c41-return"]')).toBeVisible();
  await page.locator('[data-action="c41-return"]').click();

  for (let i = 0; i < values.length; i++) {
    await expect(page.locator(`[data-cfield41="num"][data-i="${i}"]`)).toHaveValue(values[i]);
  }
  const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).course41.records['C03-04'], STORE);
  expect(after).toEqual(before);
});

test('empty C13-04 slider value is restored after navigation and full reload', async ({ page }) => {
  await boot(page);
  await goTask(page, 'C13-04');

  const number = page.locator('input[type="number"][data-cfield41="value"]');
  await number.fill('');
  await appEval(page, "courseGo41('course-unit','13')");
  await appEval(page, "courseGo41('course-task','C13-04')");
  await expect(page.locator('input[type="number"][data-cfield41="value"]')).toHaveValue('');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    try { return typeof (0, eval)('courseGo41') === 'function'; }
    catch { return false; }
  });
  await goTask(page, 'C13-04');
  await expect(page.locator('input[type="number"][data-cfield41="value"]')).toHaveValue('');
});

test('restore preview and cancel are non-destructive', async ({ page }) => {
  await boot(page);
  await page.locator('header.top [data-action="settings"]').click();
  await page.locator('[data-setting="reduced"]').check();

  const beforeMemory = await appEval(page, 'comparableState431(state)');
  const beforeDisk = await page.evaluate(key => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.stringify({ ...JSON.parse(raw), activeSeconds42: 0 }) : null;
  }, STORE);

  const incoming = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORE);
  incoming.course41.notes['3'] = 'Playwright incoming backup marker';

  await page.evaluate(text => {
    globalThis.__pwRestore = text;
    (0, eval)("stageRestore431(globalThis.__pwRestore,'Playwright QA backup')");
  }, JSON.stringify(incoming));

  await expect(page.getByRole('heading', { name: '기록을 교체하기 전에 확인하세요' })).toBeVisible();
  await expect(page.locator('[data-action="s431-apply"]')).toBeDisabled();
  await page.locator('[data-action="s431-cancel"]').click();

  const afterMemory = await appEval(page, 'comparableState431(state)');
  const afterDisk = await page.evaluate(key => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.stringify({ ...JSON.parse(raw), activeSeconds42: 0 }) : null;
  }, STORE);
  expect(afterMemory).toBe(beforeMemory);
  expect(afterDisk).toBe(beforeDisk);
});

test('manifest and service worker are valid and active', async ({ page }) => {
  await boot(page);
  const manifest = await page.evaluate(async () => {
    const response = await fetch('./manifest.webmanifest', { cache: 'no-store' });
    return { ok: response.ok, data: await response.json() };
  });
  expect(manifest.ok).toBe(true);
  expect(manifest.data.start_url).toBe('./index.html');
  expect(manifest.data.display).toBe('standalone');
  expect(manifest.data.icons.map(x => x.src)).toEqual(['./icon-192.png', './icon-512.png']);

  const active = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL || '';
  });
  expect(active).toMatch(/\/sw\.js$/);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
});

test('online first load is reusable offline through the service worker cache', async ({ page, context }) => {
  await boot(page);
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.brand')).toContainText('경제 설계자 4.3.1');
  const cachedManifest = await page.evaluate(async () => {
    const response = await fetch('./manifest.webmanifest');
    return response.ok && (await response.json()).start_url === './index.html';
  });
  expect(cachedManifest).toBe(true);
  await context.setOffline(false);
});
