import fs from 'node:fs/promises';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import * as acorn from 'acorn';

const base = '9cca53cd0691571f0748c4d2b85f21442b105dd4';
const html = execFileSync('git', ['show', `${base}:source/economy-designer-4.3.1.html`], {maxBuffer: 8e6}).toString('utf8');
const match = /<script\b[^>]*id=["']app-code["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
if (!match) throw new Error('app-code not found');
const code = match[1];
const ast = acorn.parse(code, {ecmaVersion:'latest', locations:true});
const names = new Set();
for (const n of ast.body) {
  if (n.type === 'VariableDeclaration') for (const d of n.declarations) if(d.id.type === 'Identifier') names.add(d.id.name);
  if (n.type === 'FunctionDeclaration') names.add(n.id.name);
}
await fs.mkdir('editorial/baseline', {recursive:true});
const server = http.createServer((req,res)=>{res.writeHead(200, {'content-type':'text/html; charset=utf-8'});res.end(html);});
await new Promise(resolve=>server.listen(8765,'127.0.0.1',resolve));
const browser = await chromium.launch();
const page = await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765/', {waitUntil:'domcontentloaded'});
await page.waitForTimeout(250);
const inventory = await page.evaluate(ns=>{
 const out={}; for(const name of ns) {try {const x=(0,eval)(name); if(typeof x === 'function') out[name]={kind:'function',source:String(x)}; else if(x&&typeof x==='object') {try {out[name]={kind:Array.isArray(x)?'array':'object', value:JSON.parse(JSON.stringify(x))};}catch{out[name]={kind:'unserializable'};}} else out[name]={kind:typeof x,value:x}; }catch(e){out[name]={kind:'unavailable',error:e.message};}}
 return out;
}, [...names]);
let text='# Effective content inventory\n\nBase '+base+'\n\n';
for(const [name,v] of Object.entries(inventory)) {
 if (v.kind==='function') continue;
 text+=name+' | '+v.kind+' | '+(v.value && typeof v.value==='object' ? Object.keys(v.value).length+' entries; '+Object.keys(v.value).slice(0,12).join(',') : String(v.value))+'\n';
 if(v.value && typeof v.value==='object') await fs.writeFile('editorial/baseline/'+name+'.json', JSON.stringify(v.value,null,2));
}
await fs.writeFile('editorial/baseline/inventory.md',text+'\nPage errors: '+JSON.stringify(errors)+'\n');
const funs = Object.fromEntries(Object.entries(inventory).filter(([,v])=>v.kind==='function').map(([k,v])=>[k,v.source]));
await fs.writeFile('editorial/baseline/functions.json',JSON.stringify(funs,null,2));
for(const [name,value] of Object.entries(funs)) await fs.writeFile('editorial/baseline/function-'+name+'.js', value+'\n');
const strings=[];
function walk(n,anc=[]) {if(!n||typeof n!=='object') return; if(n.type==='Literal' && typeof n.value==='string' && /[가-힣]/.test(n.value)) strings.push({start:n.start,end:n.end,line:n.loc.start.line,value:n.value,context:anc.slice(-3).join('/')}); if(n.type==='TemplateElement'&&/[가-힣]/.test(n.value.raw))strings.push({start:n.start,end:n.end,line:n.loc.start.line,value:n.value.raw,template:true}); for(const [k,v] of Object.entries(n)) {if(['loc','start','end','value','raw'].includes(k))continue;if(Array.isArray(v))v.forEach(c=>walk(c,[...anc,n.type]));else if(v&&typeof v==='object')walk(v,[...anc,n.type]);}}
walk(ast);
await fs.writeFile('editorial/baseline/literals.json',JSON.stringify(strings,null,2));
await fs.writeFile('editorial/baseline/source-lines.txt',code.split('\n').map((l,i)=>String(i+1).padStart(4)+' '+l).join('\n'));
for(const name of ['CL41','CT41']) {
 const value=inventory[name]?.value;if(!value)continue;
 for(let ch=0;ch<=15;ch++) {const rows=Object.values(value).filter(x=>Number(x.ch)===ch);if(rows.length)await fs.writeFile(`editorial/baseline/${name}-${String(ch).padStart(2,'0')}.json`,JSON.stringify(rows,null,2));}
}
console.log(text);
await browser.close();server.close();
if(errors.length)throw new Error('Baseline browser errors: '+errors.join('; '));
