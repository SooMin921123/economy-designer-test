import fs from 'node:fs/promises';
const raw=JSON.parse(await fs.readFile('evidence/live-results.json','utf8'));
const tests=[];
function walk(suites){for(const suite of suites||[]){for(const spec of suite.specs||[])for(const t of spec.tests||[])tests.push({name:spec.title,project:t.projectName,expectedStatus:t.expectedStatus,outcome:t.status,attempts:t.results.map(r=>({status:r.status,duration:r.duration,error:r.error?.message||null}))});walk(suite.suites);}}
walk(raw.suites);
const passed=tests.filter(t=>t.expectedStatus==='passed'&&t.outcome==='expected'&&t.attempts.length===1&&t.attempts[0].status==='passed').length;
const result={commit:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,url:process.env.PAGES_URL,total:tests.length,passed,notPassed:tests.length-passed,runnerErrors:raw.errors||[],physicalDevice:'not tested',OSInstallation:'not performed',tests};
await fs.writeFile('evidence/live-summary.json',JSON.stringify(result,null,2));
const md='# Public HTTPS verification\n\nCommit: '+result.commit+'\n\nURL: '+result.url+'\n\nActual result: '+passed+'/'+tests.length+' passed; '+result.notPassed+' not passed.\n\nNo physical iPhone/Android or OS home-screen installation was performed.\n\n|Project|Scenario|Result|\n|---|---|---|\n'+tests.map(t=>'|'+t.project+'|'+t.name+'|'+t.attempts.map(r=>r.status).join(', ')+'|').join('\n');
await fs.writeFile('evidence/LIVE_SUMMARY.md',md);
if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,md);
console.log('LIVE_RESULT '+JSON.stringify(result));
if(!tests.length||result.notPassed||(raw.errors||[]).length)process.exitCode=1;
