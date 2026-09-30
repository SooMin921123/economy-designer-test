import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';

// Build from a fresh, isolated app instance. Never deploy a test's seeded state.
const html = await fs.readFile('revised/economy-designer-4.3.1-ko.html', 'utf8');
const codeOf = text => text.match(/<script id="app-code">([\s\S]*?)<\/script>/)[1].replace(/\r\n/g, '\n');
const sha256 = data => createHash('sha256').update(data).digest('hex');
const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
assert.match(commit, /^[a-f0-9]{40}$/);
await fs.mkdir('evidence', { recursive: true });
await fs.rm('_site', { recursive: true, force: true });
await fs.mkdir('_site');
const server = http.createServer((req, res) => {
  if (req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(html);
  } else { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true, serviceWorkers: 'block' });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', e => errors.push(e.message));
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.waitForFunction(() => typeof window.courseGo41 === 'function');
  assert.equal(await page.locator('#warning').isVisible(), false);
  const counts = await page.evaluate(() => (0, eval)('[COURSE41.lessons.length, regularTasks42().length, GUIDES43.length]'));
  assert.deepEqual(counts, [72, 195, 30]);
  await page.locator('header.top [data-action="settings"]').click();
  const pending = page.waitForEvent('download');
  await page.locator('[data-action="pwa-zip"]').click();
  await (await pending).saveAs('evidence/pages-app-export.zip');
  assert.deepEqual(errors, []);
} finally {
  await context.close(); await browser.close();
  await new Promise(resolve => server.close(resolve));
}
const assets = ['index.html', 'manifest.webmanifest', 'sw.js', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
execFileSync('python3', ['-c', `import json, pathlib, sys, zipfile
assets=json.loads(sys.argv[1]); root=pathlib.Path('_site')
with zipfile.ZipFile('evidence/pages-app-export.zip') as z:
    assert z.testzip() is None, 'ZIP CRC failure'
    assert len(z.namelist()) == len(set(z.namelist())), 'Duplicate ZIP entry'
    assert sum(i.file_size for i in z.infolist()) < 12000000, 'Oversized export'
    for name in assets:
        assert name in z.namelist(), 'Missing deploy asset: '+name
        (root/name).write_bytes(z.read(name))
`, JSON.stringify(assets)]);
let index = await fs.readFile('_site/index.html', 'utf8');
assert.equal(codeOf(index), codeOf(html), 'Learning/answer script must not change during packaging');
// Test site indexing only; no app-code, storage-key or educational changes.
index = index.replace('</head>', '<meta name="robots" content="noindex,nofollow"><meta name="deployment-commit" content="'+commit+'"></head>');
await fs.writeFile('_site/index.html', index);
const manifest = JSON.parse(await fs.readFile('_site/manifest.webmanifest', 'utf8'));
assert.equal(manifest.start_url, './index.html');
assert.equal(manifest.scope, './');
assert.equal(manifest.display, 'standalone');
for (const size of [180,192,512]) {
  const png = await fs.readFile(`_site/icon-${size}.png`);
  assert.equal(png.subarray(1,4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size);
}
// Version the deployment cache: otherwise a changed HTML can leave an old cache in use.
// The original scope-specific PREFIX, activation policy and fetch logic are unchanged.
let sw = await fs.readFile('_site/sw.js', 'utf8');
const oldCache = "const CACHE=PREFIX+'integrated431-1';";
assert.equal(sw.split(oldCache).length-1, 1);
const cacheVersion = 'pages431-'+sha256(index).slice(0,16);
sw = sw.replace(oldCache, 'const CACHE=PREFIX+'+JSON.stringify(cacheVersion)+';');
await fs.writeFile('_site/sw.js', sw);
await fs.writeFile('_site/robots.txt', 'User-agent: *\nDisallow: /\n');
const files = {};
for (const name of [...assets,'robots.txt']) files[name] = sha256(await fs.readFile(path.join('_site', name)));
const metadata = { schema:'economy431-deployment-1', commit, build:'4.3.1-recovery.1', storageKey:'econverse431-guarded', runtimeSHA256:sha256(Buffer.from(html)), learningScriptSHA256:sha256(codeOf(html)), cacheVersion, files, publishedFiles:[...assets,'robots.txt','deployment.json'], sourceEdits:'Korean wording edition ko-2; original verified source preserved; numeric data and identifiers checked separately', packagingEdits:'App exporter, noindex/deployment metadata, content-versioned SW cache only', physicalDeviceValidation:'not performed' };
await fs.writeFile('_site/deployment.json', JSON.stringify(metadata, null, 2));
assert.deepEqual((await fs.readdir('_site')).sort(), metadata.publishedFiles.slice().sort());
await fs.writeFile('evidence/pages-build.json', JSON.stringify(metadata,null,2));
console.log('PAGES_BUILD '+JSON.stringify(metadata));
