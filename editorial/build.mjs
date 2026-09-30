import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parse } from 'acorn';
const BASELINE_SHA256='7e634b816ed143e752569bc9ddc509d2d026e92cad08939952998e2d23072706';
const sha256=x=>createHash('sha256').update(x).digest('hex');
const baseline=await fs.readFile('source/economy-designer-4.3.1.html','utf8');
assert.equal(sha256(baseline),BASELINE_SHA256,'Original verified app must remain unchanged');
const original=JSON.parse(await fs.readFile('editorial/catalog/runtime.json','utf8'));
const patches={};
for(const name of (await fs.readdir('editorial/ko')).filter(x=>x.endsWith('.json')&&x!=='ui.json').sort()){
 const file=JSON.parse(await fs.readFile(path.join('editorial/ko',name),'utf8'));
 for(const [collection,objects] of Object.entries(file)){
  patches[collection]??={};
  for(const [id,edits] of Object.entries(objects)){
   assert(!patches[collection][id],`Duplicate editorial entry: ${collection}/${id}`);
   patches[collection][id]=edits;
  }
 }
}
const ui=JSON.parse(await fs.readFile('editorial/ko/ui.json','utf8'));
const log=[];const substitutions=new Map();const conflicts=new Set();
const select=(collection,id)=>Array.isArray(collection)?collection.find((v,i)=>String(v?.id??v?.name??i)===id):collection?.[id];
function addReplacement(oldText,newText,where){
 assert.equal(typeof oldText,'string',`Non-text change: ${where}`);
 assert.equal(typeof newText,'string',`Non-text replacement: ${where}`);
 if(oldText===newText)return;
 log.push({where,before:oldText,after:newText});
 if(substitutions.has(oldText)&&substitutions.get(oldText)!==newText)conflicts.add(oldText);
 else substitutions.set(oldText,newText);
}
function inspect(oldValue,edits,where){
 if(typeof edits==='string'){addReplacement(oldValue,edits,where);return;}
 assert(oldValue&&typeof oldValue==='object',`Missing edit target: ${where}`);
 if(Array.isArray(edits)){assert(Array.isArray(oldValue));assert.equal(edits.length,oldValue.length,`Array length changed: ${where}`);}
 for(const [key,value] of Object.entries(edits)){
  if(key==='headings'&&where.startsWith('CL41/')){assert(Array.isArray(value)&&value.length===3&&value.every(v=>typeof v==='string'));continue;}
  assert(Object.hasOwn(oldValue,key),`Unknown field: ${where}/${key}`);
  inspect(oldValue[key],value,`${where}/${key}`);
 }
}
for(const [collection,objects] of Object.entries(patches)){
 assert(original[collection],`Missing baseline collection ${collection}`);
 for(const [id,edits] of Object.entries(objects))inspect(select(original[collection],id),edits,`${collection}/${id}`);
}
for(const text of conflicts)substitutions.delete(text);
function copyText(text){
 let out=substitutions.get(text)??text;
 for(const [from,to] of ui.text){out=out.split(from).join(to);}
 // Only typography inside Korean text; no code, numeric data, IDs or equations are reinterpreted.
 if(/[가-힣]/.test(out)&&!/^https?:/.test(out))out=out.replace(/([가-힣])(?=\d)/g,'$1 ').replace(/,([가-힣])/g,', $1');
 return out;
}
const match=baseline.match(/<script id="app-code">([\s\S]*?)<\/script>/);assert(match);
const js=match[1];const offset=match.index+match[0].indexOf(js);const ast=parse(js,{ecmaVersion:'latest'});const edits=[];const literalLog=[];
function walk(n){
 if(!n||typeof n!=='object')return;
 if(n.type==='Literal'&&typeof n.value==='string'&&/[가-힣]/.test(n.value)){
  const changed=copyText(n.value);
  if(changed!==n.value){edits.push([n.start,n.end,JSON.stringify(changed)]);literalLog.push({line:js.slice(0,n.start).split('\n').length+9,before:n.value,after:changed});}
 }
 for(const [key,value] of Object.entries(n)){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
}
walk(ast);let compiled=js;
for(const [start,end,text] of edits.sort((a,b)=>b[0]-a[0]))compiled=compiled.slice(0,start)+text+compiled.slice(end);
// Verify every executable AST node before the presentation-only heading change.
function skeleton(n){
 if(Array.isArray(n))return n.map(skeleton);
 if(!n||typeof n!=='object')return n;
 const out={};for(const [k,v] of Object.entries(n)){
  if(['start','end','raw','loc'].includes(k))continue;
  if(n.type==='Literal'&&typeof n.value==='string'&&k==='value')out[k]='<TEXT>';
  else out[k]=skeleton(v);
 }return out;
}
assert.deepEqual(skeleton(parse(compiled,{ecmaVersion:'latest'})),skeleton(ast),'Executable program changed during literal editing');
// Give each lesson its own three descriptive subheadings, without touching any grading path.
const headingsPattern=/\[(?:'|")개념의 출발(?:'|"),(?:'|")구분해야 할 기준(?:'|"),(?:'|")조건과 설명의 범위(?:'|")\]\[i\]/g;
let headingCount=0;
compiled=compiled.replace(headingsPattern,()=>{headingCount++;return '(l.headings||["개념 이해","핵심 설명","예제 풀이"])[i]';});
// The data block handles strings assembled by older wrappers and repeated strings that have different contexts.
// It updates only declared text fields. Answer keys, numeric data, IDs and storage routines are not writable here.
const footer=`\n/* KOREAN_EDITION_431_BEGIN */\nconst KOREAN_EDITION_431=${JSON.stringify(patches)};\n(function applyKoreanEdition431(){\n const tables={CL41,CT41,CU41,LESSONS,STAGES,CASES,CAST,GUIDES43,WORKSHOPS42,CAMPAIGNS42,PROJECTS42};\n const choose=(c,id)=>Array.isArray(c)?c.find((v,i)=>String(v?.id??v?.name??i)===id):c[id];\n function write(target,patch){for(const [key,value] of Object.entries(patch)){if(key==='headings'){target[key]=value.slice();continue;}if(typeof value==='string'){if(typeof target[key]!=='string')throw new Error('Invalid editorial field');target[key]=value;}else{if(!target[key]||typeof target[key]!=='object')throw new Error('Invalid editorial object');write(target[key],value);}}}\n for(const [name,objects] of Object.entries(KOREAN_EDITION_431))for(const [id,patch] of Object.entries(objects)){const target=choose(tables[name],id);if(!target)throw new Error('Missing editorial target: '+name+'/'+id);write(target,patch);}\n})();\n/* KOREAN_EDITION_431_END */\n`;
const boot="if(document.readyState==='loading')";assert.equal(compiled.split(boot).length,2);
compiled=compiled.replace(boot,footer+'\n'+boot);parse(compiled,{ecmaVersion:'latest'});
let html=baseline.slice(0,offset)+compiled+baseline.slice(offset+js.length);
for(const [from,to] of ui.shell??[])html=html.split(from).join(to);
html=html.replace('</head>','<meta name="editorial-revision" content="ko-1"></head>');
assert(html.includes("STORE='econverse431-guarded'"));
await fs.mkdir('revised',{recursive:true});await fs.mkdir('editorial/reports',{recursive:true});
await fs.writeFile('revised/economy-designer-4.3.1-ko.html',html);
const report={edition:'ko-1',baseline:'9cca53cd0691571f0748c4d2b85f21442b105dd4',baselineSHA256:BASELINE_SHA256,revisedSHA256:sha256(html),textFieldChanges:log.length,literalChanges:literalLog.length,headingsRendererReplacements:headingCount,objects:Object.fromEntries(Object.entries(patches).map(([k,v])=>[k,Object.keys(v).length])),executableASTOutsidePresentationChange:'identical after masking string literals',storageKey:'econverse431-guarded',gradingData:'runtime equality must also be checked by the browser suite',sourceDocumentsPublished:false};
await fs.writeFile('editorial/reports/build.json',JSON.stringify(report,null,2)+'\n');
await fs.writeFile('editorial/reports/changes.jsonl',log.map(x=>JSON.stringify(x)).join('\n')+'\n');
await fs.writeFile('editorial/reports/literal-changes.jsonl',literalLog.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log('KOREAN_BUILD '+JSON.stringify(report));
