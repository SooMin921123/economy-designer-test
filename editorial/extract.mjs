import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { parse } from 'acorn';
const source = await fs.readFile('source/economy-designer-4.3.1.html', 'utf8');
const js = source.match(/<script id="app-code">([\s\S]*?)<\/script>/)[1];
const ast = parse(js, { ecmaVersion:'latest', locations:true });
const literals=[];
function walk(n){if(!n || typeof n!=='object')return;if(n.type==='Literal'&&typeof n.value==='string'&&/[가-힣]/.test(n.value))literals.push({line:n.loc.start.line+source.slice(0,source.indexOf(js)).split('\n').length-1,text:n.value});for(const [k,v] of Object.entries(n)){if(k==='loc')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
walk(ast);
const browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();
await page.goto('http://127.0.0.1:4173/source/economy-designer-4.3.1.html');
const names=[...js.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)].map(m=>m[1]).filter(n=>/^(COURSE41|CL41|CT41|CU41|LESSONS|STAGES|CASES|CAST|WORKSHOPS42|CAMPAIGNS42|PROJECTS42|GUIDE|G[UL]|FOUNDATION)/.test(n));
const values=await page.evaluate(names=>Object.fromEntries([...new Set(names)].map(name=>{try{return[name,JSON.parse(JSON.stringify((0,eval)(name)))];}catch{return[name,null];}})),names);
await context.close();await browser.close();
await fs.mkdir('editorial/catalog',{recursive:true});
await fs.writeFile('editorial/catalog/runtime.json',JSON.stringify(values,null,2));
for(const [name,value] of Object.entries(values)){
 if(value&&typeof value==='object')await fs.writeFile(`editorial/catalog/${name}.jsonl`,(Array.isArray(value)?value:Object.entries(value).map(([id,v])=>({key:id,...v}))).map(v=>JSON.stringify(v)).join('\n')+'\n');
}
await fs.writeFile('editorial/catalog/literals.jsonl',literals.map((x,i)=>JSON.stringify({n:i,...x})).join('\n')+'\n');
const report={baseline:'9cca53cd0691571f0748c4d2b85f21442b105dd4',sha256:createHash('sha256').update(source).digest('hex'),bytes:Buffer.byteLength(source),names:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,Array.isArray(v)?v.length:v&&typeof v==='object'?Object.keys(v).length:typeof v])),koreanStringLiterals:literals.length};
await fs.writeFile('editorial/catalog/summary.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
