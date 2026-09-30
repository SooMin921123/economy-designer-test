import fs from 'node:fs/promises';
const report=JSON.parse(await fs.readFile('evidence/results.json','utf8'));
const rows=[];
function visit(suite){
 for(const spec of suite.specs??[])for(const t of spec.tests??[]){
  const last=t.results?.at(-1);
  rows.push({title:spec.title,file:spec.file??suite.file,project:t.projectName,status:t.status,resultStatus:last?.status,durationMs:last?.duration,errors:(last?.errors??[]).map(x=>(x.message??x.value??String(x)).slice(0,4000))});
 }
 for(const child of suite.suites??[])visit(child);
}
for(const suite of report.suites??[])visit(suite);
const result={runId:process.env.GITHUB_RUN_ID??null,commit:process.env.GITHUB_SHA??null,stats:report.stats,tests:rows,failed:rows.filter(x=>x.status!=='expected'),passed:rows.length>0&&rows.every(x=>x.status==='expected')};
await fs.mkdir('editorial/reports',{recursive:true});await fs.writeFile('editorial/reports/regressions.json',JSON.stringify(result,null,2)+'\n');
console.log('EDITORIAL_REGRESSIONS '+JSON.stringify({passed:result.passed,stats:result.stats,failed:result.failed}));
