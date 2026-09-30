import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const BASE='d98c987d0581dd66e829f1d3ba8d9333c30916b4';
const fromBase=p=>execFileSync('git',['show',`${BASE}:${p}`],{encoding:'utf8',maxBuffer:20*1024*1024});
const files=execFileSync('git',['ls-tree','--name-only',BASE,'editorial/ko/'],{encoding:'utf8'}).trim().split('\n').filter(p=>p.endsWith('.json')&&!p.endsWith('/ui.json'));
const originals=JSON.parse(fromBase('editorial/catalog/runtime.json'));
const parts=new Map(files.map(p=>[p,JSON.parse(fromBase(p))]));
const index=new Map();
for(const [p,data] of parts)for(const [collection,items] of Object.entries(data))for(const id of Object.keys(items)){assert(!index.has(collection+'/'+id));index.set(collection+'/'+id,p);}
const choose=(c,id)=>Array.isArray(c)?c.find((x,i)=>String(x?.id??x?.name??i)===id):c[id];
function merge(target,patch){for(const [k,v] of Object.entries(patch)){if(v&&typeof v==='object'){if(!target[k])target[k]=Array.isArray(v)?[]:{};merge(target[k],v);}else target[k]=v;}return target;}
const before=structuredClone(originals);
for(const data of parts.values())for(const [col,items] of Object.entries(data))for(const [id,patch] of Object.entries(items))merge(choose(before[col],id),patch);
const overrides={};
for(const name of (await fs.readdir('editorial/ko2')).filter(n=>/\.json$/.test(n)&&n!=='interface.json').sort()){
 const data=JSON.parse(await fs.readFile('editorial/ko2/'+name,'utf8'));
 for(const [col,items] of Object.entries(data))for(const [id,patch] of Object.entries(items)){
  assert(index.has(col+'/'+id),'Unknown editorial target '+col+'/'+id);
  overrides[col]??={};assert(!overrides[col][id],'Duplicate ko-2 target '+col+'/'+id);overrides[col][id]=patch;
  merge(parts.get(index.get(col+'/'+id))[col][id],patch);
 }
}
assert.equal(Object.keys(overrides.CL41??{}).length,72,'All 72 lesson drafts are required');
for(const [col,items] of Object.entries(overrides))for(const [id,patch] of Object.entries(items)){
 if(col==='CL41')for(const key of ['title','goal','headings','paragraphs','example','steps','result','tip','caution','check'])assert(Object.hasOwn(patch,key),`${id} missing ${key}`);
}
// Editorial provenance remains in references and the git history, not in student paragraphs.
for(const data of parts.values())for(const [col,items] of Object.entries(data))for(const [id,patch] of Object.entries(items)){
 const original=choose(originals[col],id);if(original&&Object.hasOwn(original,'origin'))patch.origin='';
}
const after=structuredClone(originals);
for(const [p,data] of parts){for(const [col,items] of Object.entries(data))for(const [id,patch] of Object.entries(items))merge(choose(after[col],id),patch);await fs.writeFile(p,JSON.stringify(data,null,2)+'\n');}
let build=fromBase('editorial/build.mjs');
build=build.replace("['homeHTML','releaseHTML42','report431','courseProgressReport41']","['homeHTML','releaseHTML42','report431','courseProgressReport41','courseLessonHTML41']");
build=build.replaceAll("'ko-1'","'ko-2'").replaceAll('content="ko-1"','content="ko-2"');
await fs.writeFile('editorial/build.mjs',build);
const basePresentation=fromBase('editorial/presentation.js');
let supplement='';try{supplement=await fs.readFile('editorial/ko2/presentation.js','utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.writeFile('editorial/presentation.js',basePresentation+'\n'+supplement);
try{
 const ui=JSON.parse(await fs.readFile('editorial/ko2/interface.json','utf8'));
 await fs.writeFile('editorial/interface/zz-ko2.json',JSON.stringify(ui,null,2)+'\n');
}catch(e){if(e.code!=='ENOENT')throw e;}
// This assertion changes only the expected edition tag; all behavior checks stay intact.
const test=fromBase('tests/editorial.spec.mjs');
assert.equal(test.split("toHaveAttribute('content','ko-1')").length,2);
await fs.writeFile('tests/editorial.spec.mjs',test.replace("toHaveAttribute('content','ko-1')","toHaveAttribute('content','ko-2')"));
await fs.mkdir('editorial/ko2/reports',{recursive:true});
const changes=[];
function diff(a,b,path){
 if(typeof a==='string'&&typeof b==='string'){if(a!==b)changes.push({path,before:a,after:b});return;}
 if(a&&b&&typeof a==='object'&&typeof b==='object')for(const key of Object.keys(b)){if(Object.hasOwn(a,key))diff(a[key],b[key],path+'/'+key);}
}
for(const col of ['CL41','CT41','CU41','CAST','CASES','LESSONS','STAGES','GUIDES43','WORKSHOPS42','CAMPAIGNS42','PROJECTS42']){
 const items=Array.isArray(after[col])?after[col].map((v,i)=>[String(v?.id??v?.name??i),v]):Object.entries(after[col]);
 for(const [id,item] of items)diff(choose(before[col],id),item,col+'/'+id);
}
await fs.writeFile('editorial/ko2/reports/changes.jsonl',changes.map(x=>JSON.stringify(x)).join('\n')+'\n');
await fs.writeFile('editorial/ko2/reports/expected-runtime.json',JSON.stringify(after));
await fs.writeFile('editorial/ko2/reports/coverage.json',JSON.stringify({edition:'ko-2',base:BASE,overriddenObjects:Object.fromEntries(Object.entries(overrides).map(([k,v])=>[k,Object.keys(v).length])),changedTextFields:changes.filter(x=>!x.path.endsWith('/origin')).length,removedProvenanceFields:changes.filter(x=>x.path.endsWith('/origin')).length,publicDeployment:false},null,2));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grouped=new Map();for(const row of changes.filter(x=>!x.path.endsWith('/origin'))){const group=row.path.split('/').slice(0,2).join('/');if(!grouped.has(group))grouped.set(group,[]);grouped.get(group).push(row);}
const sections=[...grouped].map(([id,rows])=>'<details><summary>'+esc(id)+' · '+rows.length+'개 항목</summary>'+rows.map(r=>'<section><h3>'+esc(r.path)+'</h3><div class="pair"><article><b>변경 전 · ko-1</b><p>'+esc(r.before)+'</p></article><article><b>변경 후 · ko-2</b><p>'+esc(r.after)+'</p></article></div></section>').join('')+'</details>').join('');
await fs.writeFile('editorial/ko2/reports/문장_변경전후_대조표.html','<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>경제 설계자 문장 개정 대조표</title><style>body{font:17px/1.8 system-ui,sans-serif;max-width:1400px;margin:32px auto;padding:0 20px;background:#f7f8fa;color:#16252d}h1{font-size:30px}details{margin:16px 0;padding:18px;background:white;border:1px solid #d9e0e4;border-radius:8px}summary{cursor:pointer;font-weight:700}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}article{padding:18px;background:#f4f6f7}p{white-space:pre-wrap;overflow-wrap:anywhere}h3{font-size:14px;color:#536674}button{font:inherit;padding:8px 14px;margin-right:12px}@media(max-width:750px){.pair{grid-template-columns:1fr}}</style><h1>경제 설계자 4.3.1 문장 개정 대조표</h1><p>왼쪽은 기존 개정판(ko-1), 오른쪽은 승인된 문체를 적용한 ko-2 원고입니다. 공개 사이트에는 아직 반영하지 않았습니다. 아래 항목명은 검토용이며 학생 화면에는 표시하지 않습니다.</p><button onclick="document.querySelectorAll(\'details\').forEach(x=>x.open=true)">모두 펼치기</button><button onclick="document.querySelectorAll(\'details\').forEach(x=>x.open=false)">모두 접기</button>'+sections+'</html>');
console.log('KO2_PREPARED '+JSON.stringify({lessonDrafts:Object.keys(overrides.CL41).length,changes:changes.length,base:BASE}));
