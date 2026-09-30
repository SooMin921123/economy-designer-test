import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const root='editorial/ko2/reports/';
const expected=JSON.parse(await fs.readFile(root+'expected-runtime.json','utf8'));
const browser=await chromium.launch();
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const normalize=s=>s.replace(/\s+/g,' ').trim();
const rows=[],rendered=[],flags=[];let authoredTextChecks=0;
const flagPattern=/비교값|개념의 출발|조건과 설명의 범위|직접 연결|확정 기록|숙달 인증|판정 범위|교재가|수능특강은|덮어쓰지|임의의 승수|강의를 작성할 때/;
const choose=(c,id)=>Array.isArray(c)?c.find((x,i)=>String(x?.id??x?.name??i)===id):c?.[id];
function checkPatch(actual,patch,path){
 if(typeof patch==='string'){assert.equal(actual,patch,path+' authored text did not reach runtime');authoredTextChecks++;return;}
 if(patch&&typeof patch==='object'){assert(actual&&typeof actual==='object',path+' missing');for(const[k,v]of Object.entries(patch))checkPatch(actual[k],v,path+'/'+k);}
}
try{
 await page.goto('http://127.0.0.1:4173/revised/economy-designer-4.3.1-ko.html');
 await page.waitForFunction(()=>typeof window.courseGo41==='function');
 assert.equal(await page.locator('meta[name="editorial-revision"]').getAttribute('content'),'ko-2');
 const actual=await page.evaluate(()=>JSON.parse(JSON.stringify({CL41,CT41,CU41,GUIDES43,LESSONS,STAGES,CASES,CAST,WORKSHOPS42,CAMPAIGNS42,PROJECTS42})));
 for(const n of (await fs.readdir('editorial/ko2')).filter(n=>n.endsWith('.json')&&n!=='interface.json')){
  const data=JSON.parse(await fs.readFile('editorial/ko2/'+n,'utf8'));
  for(const[col,items]of Object.entries(data))for(const[id,patch]of Object.entries(items))checkPatch(choose(actual[col],id),patch,col+'/'+id);
 }
 function walk(v,path){if(typeof v==='string'){rows.push({path,text:v});if(flagPattern.test(v))flags.push({path,text:v});}else if(v&&typeof v==='object')for(const[k,x]of Object.entries(v))walk(x,path+'/'+k);}
 for(const[name,collection]of Object.entries(actual))walk(collection,name);
 for(const[id,lesson]of Object.entries(expected.CL41)){
  assert.deepEqual(actual.CL41[id].paragraphs,lesson.paragraphs,id+' runtime paragraphs');
  assert.equal(actual.CL41[id].title,lesson.title,id+' runtime title');
  await page.evaluate(id=>courseGo41('course-lesson',id),id);
  const paras=await page.locator('#app .lessonbody > p').allTextContents();
  assert.deepEqual(paras.map(normalize),lesson.paragraphs.map(normalize),id+' rendered paragraphs');
  assert.equal(await page.locator('#app .lessonbody > p').first().evaluate(el=>getComputedStyle(el).whiteSpace),'pre-line',id+' paragraph breaks');
  for(const tab of ['read','example','teach']){
   await page.locator('[data-action="c41-lesson-tab"][data-value="'+tab+'"]').first().click();
   if(tab==='example')await page.locator('[data-action="c41-example-all"]').click();
   const text=await page.locator('#app').innerText();rendered.push({id,tab,text});
   assert(!/비교값|개념의 출발|조건과 설명의 범위|뒤의 단계에서 정부가 등장|강의를 작성할 때/.test(text),id+' stale learner copy');
  }
 }
 await page.evaluate(()=>courseGo41('course-lesson','L01-1'));await page.screenshot({path:root+'L01-1-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>courseGo41('course-lesson','L03-2'));await page.screenshot({path:root+'L03-2-mobile-viewport.png',fullPage:true});
 assert.deepEqual(errors,[]);
 await fs.writeFile(root+'active-text.jsonl',rows.map(x=>JSON.stringify(x)).join('\n'));
 await fs.writeFile(root+'rendered-lessons.jsonl',rendered.map(x=>JSON.stringify(x)).join('\n'));
 await fs.writeFile(root+'wording-flags.jsonl',flags.map(x=>JSON.stringify(x)).join('\n'));
 const report={passed:true,edition:'ko-2',lessons:72,lessonTabs:rendered.length,authoredTextChecks,actualParagraphEquality:true,preservedParagraphBreaks:true,screenTextEqualsDraft:true,runtimeStringCount:rows.length,wordingReviewFlags:flags.length,errors,physicalDeviceTest:false};
 await fs.writeFile(root+'render-audit.json',JSON.stringify(report,null,2));console.log('KO2_RENDER '+JSON.stringify(report));
}finally{await context.close();await browser.close();}
