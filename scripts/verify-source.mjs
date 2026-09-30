import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

// The captured original and the recovered baseline must still differ by exactly two braces.
const original = await fs.readFile('reference/original-economy-designer-4.3.1.html');
const runtime = await fs.readFile('source/economy-designer-4.3.1.html');
const hash = (algo, data) => createHash(algo).update(data).digest('hex');
const gitBlob = data => hash('sha1', Buffer.concat([Buffer.from(`blob ${data.length}\0`), data]));
assert.equal(gitBlob(original), '8153fedc78a394a5f912fc58dfe88e2d2885d5c6', 'Captured Drive original changed');
let expected = original.toString('utf8');
const targets = [
  "toast('4.1기록을 복사했습니다. 신규 문제의 정답은 자동으로 만들지 않았습니다.');break;}};",
  "state=next;storeOK=true;save();go('home');break;}};"
];
for (const target of targets) {
  assert.equal(expected.split(target).length - 1, 1, 'Runtime repair target must be unique');
  expected = expected.replace(target, target.slice(0, -1) + '};');
}
assert.equal(runtime.toString('utf8'), expected, 'Unreviewed baseline/content/answer change');
const code = text => {
  const match = text.match(/<script id="app-code">([\s\S]*?)<\/script>/);
  assert.ok(match, 'app-code script missing');
  return match[1];
};
let originalSyntaxError;
try { new Script(code(original.toString('utf8'))); }
catch (error) { originalSyntaxError = error.message; }
assert.ok(originalSyntaxError, 'The preserved original must reproduce its diagnosed syntax error');
new Script(code(runtime.toString('utf8')), { filename: 'economy-designer-4.3.1-baseline.js' });

const paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const tables=new Set(['CAST','CASES','LESSONS','STAGES','COURSE41','CL41','CT41','CU41','CAMPAIGNS42','PROJECTS42','WORKSHOPS42','GUIDES43','GUIDE_BY43']);
const reports=new Set(['editorial/catalog/summary.json','editorial/reports/build.json','editorial/reports/input-validation.json','editorial/reports/activation.json','editorial/reports/regressions.json','editorial/review/function-index.json','editorial/review/structure-check.json']);
const forbidden=paths.filter(p=>/\.(pdf|hwp|hwpx|docx|xlsx)$/i.test(p));
assert.deepEqual(forbidden,[],'Do not commit source textbooks or personal document files');
let authoredJsonFiles=0;
async function trackedText(p){
 try{return await fs.readFile(p,'utf8');}
 catch(e){if(e.code!=='ENOENT')throw e;return execFileSync('git',['show','HEAD:'+p],{encoding:'utf8',maxBuffer:32*1024*1024});}
}
function rejectBackup(value,p){
 if(!value||typeof value!=='object')return;
 assert(!(Object.hasOwn(value,'course41')&&Object.hasOwn(value,'records')),`Learning-state backup is not permitted: ${p}`);
 assert(!Object.hasOwn(value,'liveBefore'),`Recovery checkpoint is not permitted: ${p}`);
 assert(!(Object.hasOwn(value,'drafts')&&Object.hasOwn(value,'records')&&Object.hasOwn(value,'notes')),`Personal learning records are not permitted: ${p}`);
 for(const child of Object.values(value))rejectBackup(child,p);
}
for(const p of paths.filter(p=>/\.json$/i.test(p))){
 if(['package.json','package-lock.json'].includes(p))continue;
 const value=JSON.parse(await trackedText(p));rejectBackup(value,p);
 const keys=Object.keys(value);
 if(p==='editorial/catalog/runtime.json'){
  assert(keys.length===tables.size&&keys.every(k=>tables.has(k)),'Runtime catalog must contain only static course tables');
 }else if(/^editorial\/ko\/[^/]+\.json$/.test(p)&&p!=='editorial/ko/ui.json'){
  assert(keys.length>0&&keys.every(k=>tables.has(k)),`Not an authored course patch: ${p}`);
 }else if(p==='editorial/ko/ui.json'||/^editorial\/interface\/[^/]+\.json$/.test(p)){
  assert(keys.every(k=>['text','shell','exact'].includes(k)),`Not a UI wording file: ${p}`);
  for(const list of Object.values(value)){assert(Array.isArray(list));for(const pair of list)assert(Array.isArray(pair)&&pair.length===2&&pair.every(x=>typeof x==='string'),`Invalid UI text pair in ${p}`);}
 }else assert(reports.has(p),`Unapproved JSON path; personal backups must not be committed: ${p}`);
 authoredJsonFiles++;
}
// Line-oriented catalogs and wording diffs are static authoring data, not state exports.
for(const p of paths.filter(p=>/\.jsonl$/i.test(p))){
 assert(/^editorial\/(catalog|reports|review)\/[^/]+\.jsonl$/.test(p),`Unapproved JSONL path: ${p}`);
 for(const line of (await trackedText(p)).split('\n').filter(x=>x.trim()))rejectBackup(JSON.parse(line),p);
}
const report = {
  capturedOriginalCommit: '8f83588aaace3e36d3d092d5187b996e59cecd61',
  capturedOriginalBlob: gitBlob(original),
  capturedOriginalBytes: original.length,
  capturedOriginalSHA256: hash('sha256', original),
  runtimeBlob: gitBlob(runtime),
  runtimeBytes: runtime.length,
  runtimeSHA256: hash('sha256', runtime),
  permittedEdits: 'Exactly two missing function-closing braces in baseline; original and baseline otherwise unchanged',
  originalSyntax: { status: 'known failure reproduced', message: originalSyntaxError },
  runtimeSyntax: 'passed',
  trackedFilePolicy: 'passed: textbook files blocked; authored JSON schema checked; learning-state backups and checkpoints blocked',
  authoredJsonFiles,
  editorialEdition: 'Validated independently by editorial/build.mjs and browser data-integrity tests',
  driveMetadataObserved: { bytes: 631908, modifiedTime: '2026-09-28T23:49:25.979Z' },
  note: 'The original hash identifies the initially captured source, not an independently fetched current Drive checksum.'
};
await fs.mkdir('evidence', { recursive: true });
await fs.writeFile('evidence/source-integrity.json', JSON.stringify(report, null, 2));
console.log('SOURCE_INTEGRITY ' + JSON.stringify(report));
