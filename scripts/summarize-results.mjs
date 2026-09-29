import fs from 'node:fs/promises';
await fs.mkdir('evidence', { recursive: true });
const rows = [];
let report;
try { report = JSON.parse(await fs.readFile('evidence/results.json', 'utf8')); }
catch { report = { suites: [] }; }
function walk(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        rows.push({ name: spec.title, project: test.projectName, expectedStatus: test.expectedStatus, outcome: test.status, attempts: (test.results || []).map(r => ({ status: r.status, duration: r.duration, error: r.error?.message || null })) });
      }
    }
    walk(suite.suites || []);
  }
}
walk(report.suites || []);
const status = row => row.attempts.length && row.expectedStatus === 'passed' && row.attempts.every(x => x.status === 'passed') ? 'PASS' : row.attempts.some(x => x.status === 'skipped') ? 'SKIPPED' : 'FAIL_OR_NOT_RUN';
const counts = { total: rows.length, passed: rows.filter(r => status(r) === 'PASS').length, failedOrNotRun: rows.filter(r => status(r) === 'FAIL_OR_NOT_RUN').length, skipped: rows.filter(r => status(r) === 'SKIPPED').length };
const metadata = { commit: process.env.GITHUB_SHA || null, runId: process.env.GITHUB_RUN_ID || null, attempt: process.env.GITHUB_RUN_ATTEMPT || null, node: process.version, counts, limits: ['Chromium desktop and mobile viewport only; no physical iPhone/Android test', 'Offline browser behavior is not OS home-screen installation', 'Loopback CI hosting only; GitHub Pages and production HTTPS not deployed', 'Synthetic isolated records only; no real user backups accessed', 'Passing these paths is not all-content correctness or exhaustive storage-failure verification'], tests: rows };
await fs.writeFile('evidence/summary.json', JSON.stringify(metadata, null, 2));
let text = '# 경제 설계자 4.3.1 검증 결과\n\n';
text += `Commit: ${metadata.commit}\n\nRun: ${metadata.runId} / attempt ${metadata.attempt}\n\n`;
text += `Total ${counts.total}; passed ${counts.passed}; failed/not run ${counts.failedOrNotRun}; skipped ${counts.skipped}.\n\n`;
text += '| Project | Test | Result |\n|---|---|---|\n';
for (const row of rows) text += `| ${row.project} | ${row.name.replaceAll('|','/')} | ${status(row)} |\n`;
text += '\n## 검증 범위의 제한\n\n' + metadata.limits.map(x => '- ' + x).join('\n') + '\n';
if (!rows.length) text += '\nNo completed test report was produced. Do not claim a pass.\n';
await fs.writeFile('evidence/SUMMARY.md', text);
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, text);
console.log('QA_RESULT_SUMMARY ' + JSON.stringify(metadata));
