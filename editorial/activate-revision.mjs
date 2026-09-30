import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const oldPath='source/economy-designer-4.3.1.html';
const newPath='revised/economy-designer-4.3.1-ko.html';
const digest=x=>createHash('sha256').update(x).digest('hex');
const baseline=await fs.readFile(oldPath);
assert.equal(digest(baseline),'7e634b816ed143e752569bc9ddc509d2d026e92cad08939952998e2d23072706');
const changes=[];
async function replaceOnce(file,from,to){
 const old=await fs.readFile(file,'utf8');
 if(!old.includes(from)){assert(old.includes(to),`Neither expected old nor new text in ${file}`);return;}
 assert.equal(old.split(from).length,2,`Replacement must be unique in ${file}`);
 const next=old.replace(from,to);await fs.writeFile(file,next);changes.push({file,from,to,beforeSHA256:digest(old),afterSHA256:digest(next)});
}
const p=JSON.parse(await fs.readFile('package.json','utf8'));
const before=JSON.stringify(p);
p.devDependencies.acorn='8.15.0';
p.scripts.prepare='node editorial/build.mjs && node scripts/prepare-pwa.mjs';
if(JSON.stringify(p)!==before){await fs.writeFile('package.json',JSON.stringify(p,null,2)+'\n');changes.push({file:'package.json',change:'Compile the authored edition before preparing the PWA; pin Acorn 8.15.0'});}
await replaceOnce('scripts/prepare-pwa.mjs',"path.join(ROOT, 'source', 'economy-designer-4.3.1.html')","path.join(ROOT, 'revised', 'economy-designer-4.3.1-ko.html')");
await replaceOnce('scripts/prepare-pwa.mjs',"name: '경제 설계자 4.3 · 도시의 두 번째 장부'","name: '경제 설계자 4.3.1 · 문장 개정판'");
await replaceOnce('scripts/prepare-pwa.mjs',"description: '개념 강의와 시각적 퍼즐로 배우는 첫 세 경제 사건'","description: '경제 개념 72강과 단계별 풀이, 연습 문제로 공부하는 경제 학습실'");
await replaceOnce('scripts/build-pages.mjs',"'"+oldPath+"'","'"+newPath+"'");
await replaceOnce('scripts/build-pages.mjs',"sourceEdits:'Only previously verified two function-closing braces'","sourceEdits:'Korean wording edition ko-1; original verified source preserved; numeric data and identifiers checked separately'");
// Keep complete-script equality assertions: only their expected input artifact changes.
await replaceOnce('tests/safety.spec.mjs',"'"+oldPath+"'","'"+newPath+"'");
await replaceOnce('deployment-tests/live.spec.mjs',"'"+oldPath+"'","'"+newPath+"'");
await replaceOnce('editorial/ko/questions-11.json','환율 상승을 받는 쪽과 내는 쪽','환율 상승과 거래 당사자의 입장');
assert.equal(digest(await fs.readFile(oldPath)),digest(baseline));
await fs.mkdir('editorial/reports',{recursive:true});
await fs.writeFile('editorial/reports/activation.json',JSON.stringify({baselinePreserved:true,expectedRuntime:newPath,changes},null,2)+'\n');
console.log('KOREAN_ACTIVATION '+JSON.stringify(changes));
