import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

test.use({ serviceWorkers:'block' });
const baseline=JSON.parse(await fs.readFile('editorial/catalog/runtime.json','utf8'));
const collectionNames=['CAST','CASES','LESSONS','STAGES','COURSE41','CL41','CT41','CU41','CAMPAIGNS42','PROJECTS42','WORKSHOPS42','GUIDES43','GUIDE_BY43'];
const sourceHash='7e634b816ed143e752569bc9ddc509d2d026e92cad08939952998e2d23072706';
const forbidden=/AUTHOR RUNTIME NOT RUN|향후 사건 연결용|3\.1 기존 문제의 발문|원문 확인은 이전|숏컷·집필 심화/;
function immutableShape(value,key=''){
 if(Array.isArray(value))return value.map(x=>immutableShape(x,key));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>k!=='headings').map(([k,v])=>[k,immutableShape(v,k)]));
 if(typeof value==='string')return ['id','key','ch','type','group','lesson','who','mode','action','refs'].includes(key)?value:'<TEXT>';
 return value;
}
async function start(page){
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/index.html');
 await page.waitForFunction(()=>typeof window.courseGo41==='function');
 await expect(page.locator('meta[name="editorial-revision"]')).toHaveAttribute('content','ko-2');
 return errors;
}
async function fits(page,where){
 const size=await page.evaluate(()=>({viewport:innerWidth,root:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
 expect(Math.max(size.root,size.body)-size.viewport,where+' page overflow').toBeLessThanOrEqual(1);
}
async function attach(testInfo,name,value){await testInfo.attach(name,{body:JSON.stringify(value,null,2),contentType:'application/json'});}

test('Korean edition preserves original source, all numeric data, answers, IDs and references',async({page},testInfo)=>{
 const errors=await start(page);
 expect(createHash('sha256').update(await fs.readFile('source/economy-designer-4.3.1.html')).digest('hex')).toBe(sourceHash);
 const actual=await page.evaluate(names=>Object.fromEntries(names.map(name=>[name,JSON.parse(JSON.stringify((0,eval)(name)))])),collectionNames);
 expect(immutableShape(actual)).toEqual(immutableShape(baseline));
 expect(Object.keys(actual.CL41)).toHaveLength(72);
 expect(Object.keys(actual.CT41)).toHaveLength(219);
 expect(actual.GUIDES43).toHaveLength(30);
 for(const lesson of Object.values(actual.CL41))expect(lesson.headings,lesson.id).toHaveLength(3);
 const build=JSON.parse(await fs.readFile('editorial/reports/build.json','utf8'));
 expect(build.objects).toMatchObject({CL41:72,CT41:219,GUIDES43:30,LESSONS:12,STAGES:36,CU41:16,WORKSHOPS42:12});
 expect(errors).toEqual([]);await attach(testInfo,'korean-edition-data-integrity',build);
});

test('All 72 lessons render their three tabs, worked examples and correct mini-quiz feedback',async({page},testInfo)=>{
 test.setTimeout(240000);const errors=await start(page);let checked=0;
 const lessons=await page.evaluate(()=>Object.values(CL41).map(l=>({id:l.id,title:l.title,headings:l.headings,answer:l.check.a})));
 for(const lesson of lessons){
  await page.evaluate(id=>courseGo41('course-lesson',id),lesson.id);
  await expect(page.locator('#app h1')).toHaveText(lesson.title);
  await expect(page.locator('#app .lessonbody h3')).toHaveText(lesson.headings);
  expect(await page.locator('#app').innerText(),lesson.id).not.toMatch(forbidden);
  await fits(page,lesson.id+' read');
  await page.locator('[data-action="c41-lesson-tab"][data-value="example"]').first().click();
  await page.locator('[data-action="c41-example-all"]').click();
  await expect(page.locator('#app .example .equation')).toBeVisible();
  await page.locator('[data-action="c41-mini"][data-i="'+lesson.answer+'"]').click();
  await expect(page.locator('#app .feedback').first()).not.toHaveClass(/wrong/);
  await expect(page.locator('#app .feedback').first()).toContainText('정답입니다.');
  await fits(page,lesson.id+' example');
  await page.locator('[data-action="c41-lesson-tab"][data-value="teach"]').click();
  await fits(page,lesson.id+' explanation');checked++;
 }
 expect(errors).toEqual([]);await attach(testInfo,'all-lesson-tabs-and-mini-quizzes',{lessons:checked,tabs:checked*3,miniQuizzes:checked,errors});
});

test('All 219 course task screens and 36 focused-case stages render without stale metadata or page overflow',async({page},testInfo)=>{
 test.setTimeout(180000);const errors=await start(page);
 const tasks=await page.evaluate(()=>Object.values(CT41).map(t=>({id:t.id,title:t.title})));
 for(const task of tasks){
  await page.evaluate(id=>courseGo41('course-task',id),task.id);
  await expect(page.locator('#app h1')).toHaveText(task.title);
  await expect(page.locator('[data-action="c41-submit"]')).toBeVisible();
  expect(await page.locator('#app').innerText(),task.id).not.toMatch(forbidden);
  await fits(page,task.id);
 }
 const stages=await page.evaluate(()=>STAGES.map(s=>s.id));
 for(const id of stages){await page.evaluate(id=>go('stage',id,false),id);await expect(page.locator('#app')).not.toBeEmpty();expect(await page.locator('#app').innerText(),id).not.toMatch(forbidden);await fits(page,id);}
 expect(errors).toEqual([]);await attach(testInfo,'all-task-route-results',{courseTaskScreens:tasks.length,focusedCaseStages:stages.length,errors});
});

test('All 30 guided practices accept their unchanged answers through all 90 real UI steps',async({page},testInfo)=>{
 test.setTimeout(300000);const errors=await start(page);
 const guides=await page.evaluate(()=>GUIDES43.map(g=>({id:g.id,steps:g.steps.map(s=>({type:s.type,answer:s.answer}))})));
 let steps=0;
 for(const guide of guides){
  await page.evaluate(id=>go('course-guide',id,false),guide.id);
  for(let index=0;index<guide.steps.length;index++){
   const step=guide.steps[index];
   if(step.type==='pick')await page.locator('[data-action="g43-pick"][data-i="'+step.answer+'"]').click();
   else for(let k=0;k<step.answer.length;k++)await page.locator('[data-gnum43="'+k+'"]').fill(String(step.answer[k]));
   await page.locator('[data-action="g43-confidence"][data-value="sure"]').click();
   await page.locator('[data-action="g43-submit"]').click();
   await expect(page.locator('#gfeedback43 .feedback'),guide.id+' step '+index).not.toHaveClass(/wrong/);
   await fits(page,guide.id+' step '+index);steps++;
   if(index<2)await page.locator('[data-action="g43-next"]').click();
  }
  await expect(page.locator('.guidedone43')).toBeVisible();
 }
 expect(await page.evaluate(()=>GUIDES43.filter(doneGuide43).length)).toBe(30);
 expect(errors).toEqual([]);await attach(testInfo,'guided-practice-completion',{guides:guides.length,steps,errors});
});

test('Internal self-checks run on the Korean edition without changing learning records',async({page},testInfo)=>{
 test.setTimeout(90000);const errors=await start(page);
 const result=await page.evaluate(()=>{
  const memory=JSON.stringify(state),stored=localStorage.getItem(STORE);
  const checks=runChecks();
  return {total:checks.length,failed:checks.filter(x=>!x.ok),memoryPreserved:JSON.stringify(state)===memory,storedPreserved:localStorage.getItem(STORE)===stored};
 });
 await attach(testInfo,'internal-checks',result);
 expect(result.total).toBeGreaterThan(0);expect(result.failed).toEqual([]);
 expect(result.memoryPreserved).toBe(true);expect(result.storedPreserved).toBe(true);expect(errors).toEqual([]);
});
