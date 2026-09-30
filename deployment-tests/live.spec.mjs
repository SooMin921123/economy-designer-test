import { test as base, expect, chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
const STORE='econverse431-guarded';
const URL_ROOT=process.env.PAGES_URL;
const url = (p='index.html') => new URL(p,URL_ROOT).href;
const app = (page,code) => page.evaluate(code=>(0,eval)(code),code);
const disk = page => page.evaluate(key=>JSON.parse(localStorage.getItem(key)),STORE);
const normalizeTime = x => ({...x,activeSeconds42:0});
const sha = data => createHash('sha256').update(data).digest('hex');
const source = await fs.readFile('revised/economy-designer-4.3.1-ko.html','utf8');
const expectedCode = source.match(/<script id="app-code">([\s\S]*?)<\/script>/)[1].replace(/\r\n/g,'\n');
const test = base.extend({ page: async ({page},use,testInfo)=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await use(page);
  await testInfo.attach('runtime-errors',{body:JSON.stringify(errors),contentType:'application/json'});
  expect(errors).toEqual([]);
}});
async function boot(page,target=url()) {
  const response=await page.goto(target,{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page.locator('.brand')).toContainText('경제 설계자 4.3.1');
  await page.waitForFunction(()=>typeof window.courseGo41==='function',null,{timeout:12000});
  await expect(page.locator('#warning')).toBeHidden();
  return response;
}
const settings = page => page.locator('header.top [data-action="settings"]').click();
async function ready(page) {
  await page.evaluate(()=>Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('SW readiness timeout')),12000))]));
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:12000});
}
async function answer(page) {
  await app(page,"courseGo41('course-task','C03-04')");
  for(const [i,value] of ['13','19','12','21'].entries()) await page.locator(`[data-cfield41="num"][data-i="${i}"]`).fill(value);
  await page.locator('[data-action="c41-option"][data-key="choice"][data-i="1"]').click();
  await page.locator('[data-action="c41-confidence"][data-value="sure"]').click();
  await page.locator('[data-action="c41-submit"]').click();
  expect((await disk(page)).course41.records['C03-04'].solved).toBeTruthy();
}

test('HTTPS deployment commit, complete learning script and home viewport match',async({page},info)=>{
  const response=await boot(page);
  expect(await page.evaluate(()=>isSecureContext)).toBe(true);
  expect(page.url()).toBe(url());
  const actual=(await page.locator('#app-code').textContent()).replace(/\r\n/g,'\n');
  expect(actual).toBe(expectedCode);
  expect(await app(page,'[COURSE41.lessons.length,regularTasks42().length,GUIDES43.length]')).toEqual([72,195,30]);
  const meta=await page.request.get(url('deployment.json')+'?check='+Date.now());
  expect(meta.status()).toBe(200);
  expect((await meta.json()).commit).toBe(process.env.GITHUB_SHA);
  const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  expect(size.width).toBe(info.project.use.viewport.width);
  expect(size.scroll).toBeLessThanOrEqual(size.width+1);
  await info.attach('https-response',{body:JSON.stringify({url:response.url(),status:response.status(),security:await response.securityDetails(),viewport:size,scriptSHA256:sha(actual)}),contentType:'application/json'});
});

test('public manifest, actual PNG icons and scope-specific service worker',async({page,context},info)=>{
  await boot(page); await ready(page);
  const manifestResponse=await page.request.get(url('manifest.webmanifest'));
  expect(manifestResponse.status()).toBe(200);
  const m=await manifestResponse.json();
  expect(m.display).toBe('standalone'); expect(new URL(m.scope,url('manifest.webmanifest')).href).toBe(URL_ROOT);
  expect(new URL(m.start_url,url('manifest.webmanifest')).href).toBe(url());
  for(const size of [180,192,512]) {
    const dimensions=await page.evaluate(async size=>{const i=new Image();i.src=`./icon-${size}.png`;await i.decode();return [i.naturalWidth,i.naturalHeight];},size);
    expect(dimensions).toEqual([size,size]);
  }
  const registration=await page.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return {scope:r.scope,script:r.active.scriptURL};});
  expect(registration).toEqual({scope:URL_ROOT,script:url('sw.js')});
  const client=await context.newCDPSession(page);
  const parsed=await client.send('Page.getAppManifest');
  expect(parsed.errors||[]).toEqual([]);
  await info.attach('manifest-and-scope',{body:JSON.stringify({manifest:m,registration,parsed}),contentType:'application/json'});
});

test('Chromium installability diagnostics report no errors; not OS installation',async({page,context},info)=>{
  await boot(page); await ready(page);
  const client=await context.newCDPSession(page);
  await client.send('Page.enable');
  const result=await client.send('Page.getInstallabilityErrors');
  await info.attach('installability-diagnostic',{body:JSON.stringify({result,meaning:'Chromium protocol diagnostic only. No OS installation performed.'}),contentType:'application/json'});
  expect(result.installabilityErrors).toEqual([]);
});

test('public-site localStorage settings and synthetic existing answer survive reload',async({page})=>{
  await boot(page); await answer(page);
  const before=(await disk(page)).course41.records['C03-04'];
  await settings(page); await page.locator('[data-setting="reduced"]').check();
  await boot(page);
  expect((await disk(page)).settings.reduced).toBe(true);
  expect((await disk(page)).course41.records['C03-04']).toEqual(before);
});

test('public-site related lecture round trip preserves answer and history',async({page})=>{
  await boot(page);await answer(page);
  const record=(await disk(page)).course41.records['C03-04'];
  await page.locator('[data-action="c41-related"]').click();
  await page.locator('[data-action="c41-return"]').click();
  for(const [i,v] of ['13','19','12','21'].entries()) await expect(page.locator(`[data-cfield41="num"][data-i="${i}"]`)).toHaveValue(v);
  expect((await disk(page)).course41.records['C03-04']).toEqual(record);
});

test('public-site empty slider survives navigation and reload',async({page})=>{
  await boot(page); await app(page,"courseGo41('course-task','C13-04')");
  await page.locator('input[type="number"][data-cfield41="value"]').fill('');
  await app(page,"courseGo41('course-unit','13')");
  await app(page,"courseGo41('course-task','C13-04')");
  await expect(page.locator('input[type="number"][data-cfield41="value"]')).toHaveValue('');
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('input[type="number"][data-cfield41="value"]')).toHaveValue('');
  expect(await app(page,'CF41.response.value')).toBeNull();
});

test('public-site file backup preview and cancel are non-destructive',async({page})=>{
  await boot(page);await answer(page);await settings(page);
  const before=await disk(page), incoming=structuredClone(before);
  incoming.course41.notes['3']='CI_SYNTHETIC_NOT_A_USER_BACKUP';
  const event=page.waitForEvent('filechooser');await page.locator('[data-action="restore"]').click();
  await (await event).setFiles({name:'synthetic-ci.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(incoming))});
  await expect(page.locator('[data-action="s431-apply"]')).toBeDisabled();
  expect(normalizeTime(await disk(page))).toEqual(normalizeTime(before));
  await page.locator('[data-action="s431-cancel"]').click();
  expect(normalizeTime(await disk(page))).toEqual(normalizeTime(before));
  await page.reload({waitUntil:'domcontentloaded'});
  expect((await disk(page)).course41.records).toEqual(before.course41.records);
  expect((await disk(page)).course41.notes).toEqual(before.course41.notes);
});

test('public-site offline reload, new tab, network denial and cold-context control',async({page,context,browser},info)=>{
  await boot(page);await answer(page);await ready(page);
  const record=(await disk(page)).course41.records['C03-04'];
  await context.route('**/*',route=>route.continue());
  const next=await context.newPage();
  const errors=[];next.on('pageerror',e=>errors.push(e.message));
  await context.setOffline(true);
  try {
    const reloaded=await page.reload({waitUntil:'domcontentloaded'});expect(reloaded.fromServiceWorker()).toBe(true);
    await page.close();
    const response=await boot(next,url('index.html#course-task/C03-04'));
    expect(response.fromServiceWorker()).toBe(true);
    const probe=await next.evaluate(async()=>{try{await fetch('./__never_cached_ci_probe__?t='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(5000)});return false;}catch(e){return e.name==='TypeError';}});
    expect(probe).toBe(true);
    expect((await disk(next)).course41.records['C03-04']).toEqual(record);
    await next.locator('[data-cfield41="num"][data-i="0"]').fill('17');await app(next,'stash()');
    expect((await disk(next)).course41.drafts['C03-04'].nums[0]).toBe('17');
    const cold=await browser.newContext({offline:true,viewport:info.project.use.viewport,isMobile:info.project.name==='mobile-chromium',hasTouch:info.project.name==='mobile-chromium'});
    try {const blank=await cold.newPage();await expect(blank.goto(url(),{timeout:10000})).rejects.toThrow();}finally{await cold.close();}
    expect(errors).toEqual([]);
    await info.attach('offline-proof',{body:JSON.stringify({servedByServiceWorker:response.fromServiceWorker(),uncachedNetworkDenied:probe,storedAnswerUnchanged:true,offlineDraftSaved:true,coldContextRejected:true}),contentType:'application/json'});
    await next.screenshot({path:info.outputPath('public-offline-new-tab.png'),fullPage:true});
  } catch(error) {
    if(!next.isClosed())await next.screenshot({path:info.outputPath('public-offline-failed.png'),fullPage:true}).catch(()=>{});
    throw error;
  } finally {await context.setOffline(false);await next.close();}
});

test('temporary browser profile survives full Chromium process restart offline',async({},info)=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'economy431-ci-only-'));
  const options={headless:true,viewport:info.project.use.viewport,isMobile:info.project.name==='mobile-chromium',hasTouch:info.project.name==='mobile-chromium',serviceWorkers:'allow',ignoreHTTPSErrors:false};
  let ctx;
  try {
    ctx=await chromium.launchPersistentContext(dir,options);
    let page=await ctx.newPage();await boot(page);await answer(page);await ready(page);
    const record=(await disk(page)).course41.records['C03-04'];
    await ctx.close();ctx=null;
    ctx=await chromium.launchPersistentContext(dir,{...options,offline:true});
    // The runner's trace:'on' already records this context; do not start tracing twice.
    page=await ctx.newPage();const response=await boot(page,url('index.html#course-task/C03-04'));
    expect(response.fromServiceWorker()).toBe(true);
    expect((await disk(page)).course41.records['C03-04']).toEqual(record);
    await page.screenshot({path:info.outputPath('public-process-restart-offline.png'),fullPage:true});
    // Let the runner finalize and attach its trace.zip, including failures and assertions.
    await info.attach('restart-scope',{body:'Isolated CI browser process restart. Not phone OS restart or installed home-screen app.',contentType:'text/plain'});
  }finally{if(ctx)await ctx.close();await fs.rm(dir,{recursive:true,force:true});}
});
