import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

// This guard permits only the two diagnosed missing function-closing braces.
// It does not rewrite the original, learning content, answer keys or grading logic.
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
assert.equal(runtime.toString('utf8'), expected, 'Unreviewed runtime/content/answer change');
const code = text => {
  const match = text.match(/<script id="app-code">([\s\S]*?)<\/script>/);
  assert.ok(match, 'app-code script missing');
  return match[1];
};
let originalSyntaxError;
try { new Script(code(original.toString('utf8'))); }
catch (error) { originalSyntaxError = error.message; }
assert.ok(originalSyntaxError, 'The preserved original no longer reproduces its diagnosed syntax error');
new Script(code(runtime.toString('utf8')), { filename: 'economy-designer-4.3.1-runtime.js' });
const paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const forbidden = paths.filter(p => /\.(pdf|hwp|hwpx|docx|xlsx)$/i.test(p) || (/\.json$/i.test(p) && !['package.json', 'package-lock.json'].includes(p)));
assert.deepEqual(forbidden, [], 'Do not commit textbook PDFs, personal records or backup JSON');
const report = {
  capturedOriginalCommit: '8f83588aaace3e36d3d092d5187b996e59cecd61',
  capturedOriginalBlob: gitBlob(original),
  capturedOriginalBytes: original.length,
  capturedOriginalSHA256: hash('sha256', original),
  runtimeBlob: gitBlob(runtime),
  runtimeBytes: runtime.length,
  runtimeSHA256: hash('sha256', runtime),
  permittedEdits: 'Exactly two missing function-closing braces; all other bytes unchanged',
  originalSyntax: { status: 'known failure reproduced', message: originalSyntaxError },
  runtimeSyntax: 'passed',
  trackedFilePolicy: 'passed',
  driveMetadataObserved: { bytes: 631908, modifiedTime: '2026-09-28T23:49:25.979Z' },
  note: 'Drive metadata did not expose a checksum through the connector. Original hash refers to the initial captured source, not an independently fetched current Drive checksum.'
};
await fs.mkdir('evidence', { recursive: true });
await fs.writeFile('evidence/source-integrity.json', JSON.stringify(report, null, 2));
console.log('SOURCE_INTEGRITY ' + JSON.stringify(report));
