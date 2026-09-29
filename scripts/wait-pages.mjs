import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = new URL(process.env.PAGES_URL);
assert.equal(base.protocol,'https:');
assert.equal(base.hostname.toLowerCase(),'soomin921123.github.io');
assert.equal(base.pathname,'/economy-designer-test/');
let last;
for (let attempt=1; attempt<=36; attempt++) {
  try {
    const url = new URL('deployment.json',base); url.searchParams.set('check', Date.now().toString());
    const response = await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
    assert.equal(response.status,200);
    const data = await response.json();
    assert.equal(data.commit,process.env.GITHUB_SHA,'CDN still serves a different deployment');
    await fs.mkdir('evidence',{recursive:true});
    await fs.writeFile('evidence/live-deployment.json',JSON.stringify(data,null,2));
    console.log('PUBLIC_DEPLOYMENT_CONFIRMED '+JSON.stringify({url:base.href,commit:data.commit,attempt}));
    process.exit(0);
  } catch(error) { last=error; console.log('Waiting for Pages propagation: '+error.message); }
  await new Promise(resolve=>setTimeout(resolve,5000));
}
throw last;
