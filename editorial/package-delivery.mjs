import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const build=await read('editorial/reports/build.json');
const tests=await read('editorial/reports/regressions.json');
const structure=await read('editorial/review/structure-check.json');
const pwa=await read('evidence/pages-build.json');
assert.equal(tests.passed,true,'Do not release an unpassed edition');
assert.equal(structure.passed,true,'Runtime structure check must pass');
const html=await fs.readFile('revised/economy-designer-4.3.1-ko.html');
const hash=x=>createHash('sha256').update(x).digest('hex');
assert.equal(hash(html),build.revisedSHA256);
assert.equal(pwa.runtimeSHA256,build.revisedSHA256);
await fs.rm('delivery',{recursive:true,force:true});await fs.mkdir('delivery');
await fs.writeFile('delivery/economy-designer-4.3.1-ko.html',html);
execFileSync('python3',['-c',`import json,pathlib,zipfile
root=pathlib.Path('_site')
names=json.loads((root/'deployment.json').read_text())['publishedFiles']
assert sorted(p.name for p in root.iterdir())==sorted(names)
with zipfile.ZipFile('delivery/economy-designer-4.3.1-ko-pwa.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in names:
  assert '/' not in name and '..' not in name
  z.write(root/name,name)
`]);
const run='https://github.com/SooMin921123/economy-designer-test/actions/runs/'+tests.runId;
const byProject=Object.fromEntries([...new Set(tests.tests.map(t=>t.project))].map(project=>[project,tests.tests.filter(t=>t.project===project).length]));
const text=`# 경제 설계자 4.3.1 · 문장 개정판\n\n## 파일 사용\n\n\`economy-designer-4.3.1-ko.html\`은 단일 학습 파일입니다. 파일 미리보기가 아니라 JavaScript 실행을 허용하는 웹 브라우저에서 여세요. 파일 직접 열기 방식의 저장 지원은 브라우저마다 다를 수 있습니다.\n\n\`economy-designer-4.3.1-ko-pwa.zip\`은 정적 웹 서버에 올리는 설치용 묶음입니다. 압축을 푼 뒤 같은 폴더 구조로 HTTPS에서 제공해야 서비스 워커를 이용할 수 있습니다. 처음 한 번은 온라인으로 접속해야 하며, 실제 휴대폰의 홈 화면 설치는 별도 확인 대상입니다.\n\n## 개정 범위\n\n정규 강의 72개, 정규 문제 195개와 종합 문제 24단계, 단계별 풀이 30개(90단계), 집중 탐구 12강과 24활동, 단원 제목과 실험실·작성 활동·화면 안내를 다듬었습니다. 새 문항을 추가한 판은 아닙니다.\n\n강의에는 내용에 맞는 소제목을 붙였습니다. 발문과 해설에서 주체·단위·시점·계산 가정을 분명히 하고, 개발 이력과 검증 안내는 학생의 학습 화면과 구분하였습니다.\n\n## 이번 파일의 검증\n\n전체 브라우저 테스트 ${tests.tests.length}개 통과, 실패 ${tests.failed.length}개입니다. 프로젝트별 실행 수는 ${JSON.stringify(byProject)}입니다.\n\n[실제 GitHub Actions 실행](${run}) · 검사 커밋: \`${tests.commit}\`\n\n각 환경에서 72강의 세 탭과 확인 문제, 219개 정규·종합 문항 화면, 집중 탐구 36단계, 단계별 풀이 90단계를 확인했습니다. 저장·새로고침, 관련 강의 왕복 답안 유지, 빈 슬라이더, 백업 미리보기·취소·적용과 복구, manifest·서비스 워커, 온라인 접속 후 오프라인 실행을 기존 회귀 검사로 점검했습니다. 상세 시나리오와 결과는 동봉한 validation-results.json을 따릅니다.\n\n자동 화면·채점 검사는 모든 교재 원문과의 내용 전수 대조나 전문가의 출간 승인을 뜻하지 않습니다. 모바일 Chromium 화면 검사는 실제 iPhone·Android 기기의 홈 화면 설치와 OS 재부팅 검사를 대신하지 않습니다.\n\n## 원본과 학습 기록\n\n기존 보존 원본 및 중괄호 두 개를 복구한 기준 HTML은 변경하지 않았습니다. 개정판은 별도 파일이며 수치·정답·문항 식별자·참고 자료 연결의 구조를 대조했습니다. 저장 키는 \`econverse431-guarded\`로 유지합니다.\n\n기록은 현재 브라우저의 저장 공간에 남습니다. 다른 기기·브라우저·주소·파일 경로로 옮기기 전에는 기존 앱에서 백업을 받으세요. 복원 미리보기는 현재 기록을 바꾸지 않으며, 확인 후 적용하면 백업 기록으로 교체합니다. 두 기록을 병합하는 기능은 아닙니다.\n\n## 파일 확인\n\n개정 HTML SHA-256: \`${build.revisedSHA256}\`\n기준 HTML SHA-256: \`${build.baselineSHA256}\`\n\n교재 PDF·HWP와 개인 학습 기록은 이 묶음에 포함하지 않았습니다.\n`;
await fs.writeFile('delivery/README-ko.md',text);
await fs.writeFile('delivery/validation-results.json',JSON.stringify({build,structure,tests,pwa},null,2));
const sums=[];for(const name of (await fs.readdir('delivery')).sort())sums.push(hash(await fs.readFile('delivery/'+name))+'  '+name);
await fs.writeFile('delivery/SHA256SUMS.txt',sums.join('\n')+'\n');
console.log('DELIVERY_READY '+JSON.stringify({run:tests.runId,htmlSHA256:build.revisedSHA256,files:await fs.readdir('delivery')}));
