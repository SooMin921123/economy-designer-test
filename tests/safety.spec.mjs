import { test as base, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const STORE = 'econverse431-guarded';
const MARKER = 'QA_ONLY_EXISTING_431';
const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const errors = [], consoleErrors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await use(page);
    await testInfo.attach('browser-diagnostics', { body: JSON.stringify({ errors, consoleErrors }, null, 2), contentType: 'application/json' });
    expect(errors, 'Unhandled browser runtime errors').toEqual([]);
  }
});
const app = (page, source) => page.evaluate(code => (0, eval)(code), source);
const disk = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORE);
const comparable = value => ({ ...value, activeSeconds42: 0 });
const protectedContent = value => ({
  regular: value.course41.records,
  notes: value.course41.notes,
  focus: value.records,
  focusNotes: value.notes,
  editor: value.editor,
  projects: value.projects42
});
async function boot(page, url = '/index.html') {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    try { return typeof (0, eval)('courseGo41') === 'function'; } catch { return false; }
  }, null, { timeout: 10000 });
  await expect(page.locator('#warning')).toBeHidden();
  return response;
}
async function settings(page) {
  await page.locator('header.top [data-action="settings"]').click();
}
async function seed(page) {
  await boot(page);
  await app(page, "courseGo41('course-task','C03-04')");
  for (const [i, value] of ['13', '19', '12', '21'].entries()) {
    await page.locator(`[data-cfield41="num"][data-i="${i}"]`).fill(value);
  }
  await page.locator('[data-action="c41-option"][data-key="choice"][data-i="1"]').click();
  await page.locator('[data-action="c41-confidence"][data-value="sure"]').click();
  await page.locator('[data-action="c41-submit"]').click();
  expect((await disk(page)).course41.records['C03-04'].solved).toBeTruthy();
  // Synthetic existing-data fixture only. No user's browser, backup or account data is read.
  await app(page, `state.course41.notes['3']=${JSON.stringify(MARKER)};state.notes.choice='QA_FOCUS_NOTE_431';state.editor.text='QA_EDITOR_NOTE_431';save()`);
  await settings(page);
  return disk(page);
}
async function chooseBackup(page, value) {
  const event = page.waitForEvent('filechooser');
  await page.locator('[data-action="restore"]').click();
  const chooser = await event;
  await chooser.setFiles({ name: 'synthetic-qa.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
}
async function readySW(page) {
  await page.evaluate(async () => {
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker readiness timeout')), 10000))
    ]);
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 });
}

test('existing synthetic solved answers and notes survive reload; contexts stay isolated', async ({ page, browser }) => {
  const before = await seed(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(protectedContent(await disk(page))).toEqual(protectedContent(before));
  const other = await browser.newContext();
  try {
    const otherPage = await other.newPage();
    await boot(otherPage, 'http://127.0.0.1:4173/index.html');
    const value = await disk(otherPage);
    expect(value?.course41?.records?.['C03-04']?.solved).toBeFalsy();
    expect(value?.course41?.notes?.['3']).not.toBe(MARKER);
    expect(protectedContent(await disk(page))).toEqual(protectedContent(before));
  } finally { await other.close(); }
});

test('real file-input preview and cancel preserve memory and localStorage', async ({ page }) => {
  const before = await seed(page);
  const memoryBefore = await app(page, 'comparableState431(state)');
  const incoming = structuredClone(before);
  incoming.course41.notes['3'] = 'QA_INCOMING_NOT_APPLIED_431';
  await chooseBackup(page, incoming);
  await expect(page.locator('[data-action="s431-apply"]')).toBeDisabled();
  expect(comparable(await disk(page))).toEqual(comparable(before));
  expect(await app(page, 'comparableState431(state)')).toBe(memoryBefore);
  await page.locator('[data-action="s431-cancel"]').click();
  expect(comparable(await disk(page))).toEqual(comparable(before));
  expect(await app(page, 'comparableState431(state)')).toBe(memoryBefore);
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(protectedContent(await disk(page))).toEqual(protectedContent(before));
});

test('unknown-ID backup is rejected without replacing existing records', async ({ page }, testInfo) => {
  const before = await seed(page);
  const incoming = structuredClone(before);
  incoming.course41.records['QA-UNKNOWN-ID'] = { history: [], solved: null };
  let message = '';
  page.once('dialog', async dialog => { message = dialog.message(); await dialog.accept(); });
  await chooseBackup(page, incoming);
  await expect.poll(() => message).toContain('복원을 시작하지 않았습니다');
  expect(comparable(await disk(page))).toEqual(comparable(before));
  await expect(page.locator('[data-action="s431-apply"]')).toHaveCount(0);
  await testInfo.attach('expected-rejection', { body: message, contentType: 'text/plain' });
});

test('confirmed synthetic restore persists and checkpoint recovery restores prior records', async ({ page }) => {
  const before = await seed(page);
  const incoming = structuredClone(before);
  incoming.course41.notes['3'] = 'QA_CONFIRMED_REPLACEMENT_431';
  await chooseBackup(page, incoming);
  await page.locator('[data-restoreconfirm431]').check();
  await page.locator('[data-action="s431-apply"]').click();
  await expect.poll(async () => (await disk(page)).course41.notes['3']).toBe('QA_CONFIRMED_REPLACEMENT_431');
  const checkpoint = await page.evaluate(key => JSON.parse(localStorage.getItem(key + '::before-replace')), STORE);
  expect(protectedContent(JSON.parse(checkpoint.liveBefore))).toEqual(protectedContent(before));
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect((await disk(page)).course41.notes['3']).toBe('QA_CONFIRMED_REPLACEMENT_431');
  await settings(page);
  await page.locator('[data-action="s431-recovery"]').click();
  await expect(page.locator('[data-action="s431-apply"]')).toBeDisabled();
  await page.locator('[data-restoreconfirm431]').check();
  await page.locator('[data-action="s431-apply"]').click();
  await expect.poll(async () => (await disk(page)).course41.notes['3']).toBe(MARKER);
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(protectedContent(await disk(page))).toEqual(protectedContent(before));
});

test('offline new tab is served by service worker; cold offline context cannot load', async ({ page, context, browser }) => {
  const before = await seed(page);
  await readySW(page);
  await context.setOffline(true);
  const fresh = await context.newPage();
  const session = await context.newCDPSession(fresh);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.close();
  try {
    const response = await boot(fresh, 'http://127.0.0.1:4173/index.html#course-task/C03-04');
    expect(response.fromServiceWorker()).toBe(true);
    expect(await fresh.evaluate(() => navigator.onLine)).toBe(false);
    expect((await disk(fresh)).course41.records['C03-04']).toEqual(before.course41.records['C03-04']);
    await expect(fresh.locator('[data-action="c41-submit"]')).toBeVisible();
    await fresh.locator('[data-cfield41="num"][data-i="0"]').fill('17');
    await app(fresh, 'stash()');
    expect((await disk(fresh)).course41.drafts['C03-04'].nums[0]).toBe('17');
    const cold = await browser.newContext({ offline: true });
    try {
      const coldPage = await cold.newPage();
      await expect(coldPage.goto('http://127.0.0.1:4173/index.html', { timeout: 10000 })).rejects.toThrow();
    } finally { await cold.close(); }
  } finally {
    await context.setOffline(false);
    await fresh.close();
  }
});

test('app-generated PWA ZIP excludes private fixtures and its own assets reopen offline', async ({ page, browser }, testInfo) => {
  await seed(page);
  const pending = page.waitForEvent('download');
  await page.locator('[data-action="pwa-zip"]').click();
  const download = await pending;
  const zipPath = testInfo.outputPath('app-generated-pwa.zip');
  await download.saveAs(zipPath);
  const unpacked = testInfo.outputPath('app-generated-pwa');
  const names = JSON.parse(execFileSync('python3', ['-c', `import json, pathlib, sys, zipfile
root = pathlib.Path(sys.argv[2]).resolve()
with zipfile.ZipFile(sys.argv[1]) as z:
    assert z.testzip() is None, 'Invalid ZIP CRC'
    assert sum(i.file_size for i in z.infolist()) < 12000000, 'Unexpected archive size'
    for i in z.infolist():
        target = (root / i.filename).resolve()
        assert target.is_relative_to(root), 'Unsafe ZIP path'
    z.extractall(root)
    print(json.dumps(z.namelist()))
`, zipPath, unpacked], { encoding: 'utf8' }));
  const markers = [MARKER, 'QA_FOCUS_NOTE_431', 'QA_EDITOR_NOTE_431'];
  for (const name of names.filter(n => !n.endsWith('/'))) {
    const data = await fs.readFile(path.join(unpacked, name));
    for (const marker of markers) expect(data.toString('utf8'), `Private fixture leaked to ${name}`).not.toContain(marker);
    expect(name).not.toMatch(/\.(pdf|hwp|hwpx)$/i);
  }
  const assets = ['index.html', 'manifest.webmanifest', 'sw.js', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
  for (const name of assets) expect(names).toContain(name);
  const scriptOf = html => html.match(/<script id="app-code">([\s\S]*?)<\/script>/)[1].replace(/\r\n/g, '\n');
  expect(scriptOf(await fs.readFile(path.join(unpacked, 'index.html'), 'utf8'))).toBe(scriptOf(await fs.readFile('source/economy-designer-4.3.1.html', 'utf8')));
  const folder = `qa-export-${testInfo.project.name}`;
  const hosted = path.resolve('public', folder);
  await fs.mkdir(hosted, { recursive: true });
  for (const name of assets) await fs.copyFile(path.join(unpacked, name), path.join(hosted, name));
  const exported = await browser.newContext();
  const exportPage = await exported.newPage();
  const errors = [];
  exportPage.on('pageerror', error => errors.push(error.message));
  try {
    await boot(exportPage, `http://127.0.0.1:4173/${folder}/index.html`);
    expect(await app(exportPage, '[COURSE41.lessons.length,regularTasks42().length,GUIDES43.length]')).toEqual([72, 195, 30]);
    for (const size of [180, 192, 512]) {
      const actual = await exportPage.evaluate(async size => {
        const img = new Image(); img.src = `./icon-${size}.png`; await img.decode();
        return [img.naturalWidth, img.naturalHeight];
      }, size);
      expect(actual).toEqual([size, size]);
    }
    await readySW(exportPage);
    await exported.setOffline(true);
    const response = await exportPage.reload({ waitUntil: 'domcontentloaded' });
    expect(response.fromServiceWorker()).toBe(true);
    await expect(exportPage.locator('.brand')).toContainText('경제 설계자 4.3.1');
    await exportPage.screenshot({ path: testInfo.outputPath('exported-pwa-offline.png'), fullPage: true });
    expect(errors).toEqual([]);
  } finally { await exported.close(); }
  await testInfo.attach('export-scope', { body: JSON.stringify({ files: names, scope: 'App-generated package, real PNG assets, isolated Chromium offline reload. Not OS installation.' }, null, 2), contentType: 'application/json' });
});
