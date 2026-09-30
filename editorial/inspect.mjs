import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { parse } from 'acorn';
const names=['CAST','CASES','LESSONS','STAGES','COURSE41','CL41','CT41','CU41','CAMPAIGNS42','PROJECTS42','WORKSHOPS42','GUIDES43','GUIDE_BY43'];
const baseline=JSON.parse(await fs.readFile('editorial/catalog/runtime.json','utf8'));
const html=await fs.readFile('revised/economy-designer-4.3.1-ko.html','utf8');
const js=html.match(/<script id="app-code">([\s\S]*?)<\/script>/)[1];
const candidates=new Set(['homeHTML','courseHub41','courseUnit41','libraryHTML','courseLessonHTML41','courseTaskHTML41','courseHint41','courseRefs41','guideHub43','guidePage43','campaignHub42','campaignHTML42','projectHTML42','workshopHTML42','labResult42','settingsHTML','releaseHTML42','report431','refsHTML','lessonHTML','playHTML','notesHTML']);
function collect(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id)candidates.add(n.id.name);if(n.type==='VariableDeclarator'&&n.id.type==='Identifier')candidates.add(n.id.name);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(collect);else if(v&&typeof v==='object')collect(v);}}
collect(parse(js,{ecmaVersion:'latest'}));
const browser=await chromium.launch();const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4173/revised/economy-designer-4.3.1-ko.html');
 await page.waitForFunction(()=>{try{return typeof (0,eval)('courseGo41')==='function';}catch{return false;}});
 const actual=await page.evaluate(names=>Object.fromEntries(names.map(name=>{try{return[name,JSON.parse(JSON.stringify((0,eval)(name)))];}catch{return[name,null];}})),names);
 function shape(v,key=''){
  if(Array.isArray(v))return v.map(x=>shape(x,key));
  if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([k])=>k!=='headings').map(([k,x])=>[k,shape(x,k)]));
  if(typeof v==='string')return ['id','key','ch','type','group','lesson','who','mode','action','refs'].includes(key)?v:'<TEXT>';
  return v;
 }
 assert.deepEqual(shape(actual),shape(baseline),'Question structure, identifiers or numeric data changed');
 assert.equal(Object.keys(actual.CL41).length,72);assert.equal(actual.GUIDES43.length,30);assert.equal(actual.COURSE41.lessons.length,72);
 const headingCount=Object.values(actual.CL41).filter(x=>Array.isArray(x.headings)&&x.headings.length===3).length;assert.equal(headingCount,72);
 await fs.mkdir('editorial/review/functions',{recursive:true});
 const functionTexts=await page.evaluate(names=>names.map(name=>{try{const value=(0,eval)(name);return typeof value==='function'?{name,source:value.toString()}:null;}catch{return null;}}).filter(x=>x&&/[가-힣]/.test(x.source)&&(/<\w|Before|before|Hint|hint|Result|result|Label|label/.test(x.source+' '+x.name))),[...candidates]);
 await fs.writeFile('editorial/review/function-index.json',JSON.stringify(functionTexts.map(x=>({name:x.name,characters:x.source.length})),null,2));
 await fs.writeFile('editorial/review/current-functions.jsonl',functionTexts.map(x=>JSON.stringify(x)).join('\n')+'\n');
 for(const item of functionTexts){await fs.writeFile('editorial/review/functions/'+item.name+'.txt',item.source);}
 const routes=[['home',null],['course',null],['course-unit','3'],['library',null],['course-task','C03-04'],['course-lesson','L03-2'],['course-guides',null],['course-guide','G03-1'],['course-campaigns',null],['course-projects',null],['course-project','P2'],['course-workshops',null],['course-workshop','4'],['settings',null],['studio',null],['review',null],['lab',null]];
 for(const [view,id] of routes){await page.evaluate(([view,id])=>go(view,id,false),[view,id]);await fs.writeFile('editorial/review/'+view+(id?'-'+id:'')+'.txt',await page.locator('body').innerText());}
 await page.evaluate(()=>go('home',null,false));await page.screenshot({path:'editorial/review/home-desktop.png',fullPage:true});
 const report={passed:errors.length===0,lessons:72,individualHeadings:headingCount,regularTasks:actual.COURSE41.chapters.reduce((n,c)=>n+c.main.length+c.review.length+c.transfer.length,0),allRuntimeTasks:Object.keys(actual.CT41).length,guides:30,legacyLessons:actual.LESSONS.length,legacyStages:actual.STAGES.length,routeTextSamples:routes.length,errors,storageKey:await page.evaluate(()=>(0,eval)('STORE'))};
 await fs.writeFile('editorial/review/structure-check.json',JSON.stringify(report,null,2));assert.equal(errors.length,0,errors.join('\n'));
 console.log('EDITORIAL_STRUCTURE_PASS '+JSON.stringify(report));
}finally{await context.close();await browser.close();}
