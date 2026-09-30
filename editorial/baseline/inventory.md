# Effective content inventory

Base 9cca53cd0691571f0748c4d2b85f21442b105dd4

BUILD | string | 4.3.1-recovery.1
STORE | string | econverse431-guarded
DATA_VERSION | number | 1
REF | object | 4 entries; E76,E77,D77,A86
CAST | array | 6 entries; 0,1,2,3,4,5
CASES | array | 3 entries; 0,1,2
LESSONS | array | 12 entries; 0,1,2,3,4,5,6,7,8,9,10,11
STAGES | array | 36 entries; 0,1,2,3,4,5,6,7,8,9,10,11
DAY | array | 3 entries; 0,1,2
BYID | object | 36 entries; CH-L1,CH-T1,CH-T2,CH-L2,CH-T3,CH-T4,CH-L3,CH-T5,CH-T6,CH-L4,CH-T7,CH-W
LBYID | object | 12 entries; CH-L1,CH-L2,CH-L3,CH-L4,PG-L1,PG-L2,PG-L3,PG-L4,TR-L1,TR-L2,TR-L3,TR-L4
state | object | 18 entries; schema,contentVersion,build,read,records,drafts,notes,last,settings,exposure,editor,returnTask
storeOK | boolean | true
route | object | 2 entries; view,id
r | object | null
feedback | object | null
lessonSteps | number | 0
lessonDepth | string | basic
labCase | string | choice
lab | object | 7 entries; case,choice,cBenefit,others,paid,y,x
audioCtx | object | null
toastTimer | object | null
pendingInstall | object | null
swRegistration | object | null
MANUAL_TESTS | array | 57 entries; 0,1,2,3,4,5,6,7,8,9,10,11
SHELL | string | <header class="top"><div class="topinner"><button class="brand" data-action="home" aria-label="사건 지도로"><span class="brandmark">◈</span><span><strong>경제 설계자 4.3.1</strong><small>도시의 두 번째 장부</small></span></button><div id="xp" class="xp"></div><button class="small" data-action="settings">설정·백업</button></div><div id="warning" class="warning" hidden role="status"></div></header><main id="app" class="main"><article class="card"><h1>경제 설계자를 여는 중입니다.</h1><p>이 화면이 계속 보이면 JavaScript 실행이 가능한 브라우저에서 열어 주세요.</p></article></main><nav class="nav" aria-label="학습 메뉴"><div id="nav" class="navinner"></div></nav><div id="toast" class="toast" role="status" aria-live="polite" hidden></div><input id="restore" type="file" accept=".json,application/json" hidden><noscript><p>게임 실행에는 JavaScript가 필요합니다.</p></noscript>
SW_CODE | string | 'use strict';
const PREFIX='econverse4-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=PREFIX+'integrated431-1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith(PREFIX)&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url),root=new URL(self.registration.scope);if(req.method!=='GET'||url.origin!==root.origin||!url.pathname.startsWith(root.pathname))return;const allowed=ASSETS.map(p=>new URL(p,self.registration.scope).pathname);if(req.mode!=='navigate'&&!allowed.includes(url.pathname))return;event.respondWith(caches.open(CACHE).then(async cache=>{const key=req.mode==='navigate'?new URL('./index.html',self.registration.scope).href:req;const hit=await cache.match(key,{ignoreSearch:true});if(hit)return hit;return fetch(req);}));});

reloadOnController | boolean | false
M01 | object | 4 entries; version,runtime,scope,original
RELATED41 | object | 24 entries; CH-T1,CH-T2,CH-T3,CH-T4,CH-T5,CH-T6,CH-T7,CH-W,PG-T1,PG-T2,PG-T3,PG-T4
COURSE41 | object | 5 entries; version,chapters,lessons,tasks,reviewLog
CREF41 | object | 16 entries; E75,E76,E77,V62,V64,C97,D77,B48,F88,F89,F90,F91
NEG41 | array | 5 entries; 0,1,2,3,4
POS41 | array | 5 entries; 0,1,2,3,4
CAMPAIGNS42 | array | 6 entries; 0,1,2,3,4,5
PROJECTS42 | array | 6 entries; 0,1,2,3,4,5
CU41 | object | 16 entries; 0,1,2,3,4,5,6,7,8,9,10,11
CT41 | object | 219 entries; C01-01,C01-02,C01-03,C01-04,C01-05,C01-06,C01-07,C01-08,C01-09,C01-10,R01-1,R01-2
CL41 | object | 72 entries; L01-1,L01-2,L01-3,L02-1,L02-2,L02-3,L03-1,L03-2,L03-3,L04-1,L04-2,L04-3
BOUNDARIES41 | object | 15 entries; 1,2,3,4,5,6,7,8,9,10,11,12
CF41 | object | 8 entries; view,task,response,result,lesson,lessonStep,lessonTab,returnTo
COURSE_TYPES41 | object | 14 entries; pick,multi,map,sort,fix,num,inspect,ledger,build,range,external,public
RELEASE42 | object | 5 entries; name,version,authorRuntime,note,targetMinutes
related42 | object | 24 entries; S1-1,S1-2,S1-3,S1-4,S2-1,S2-2,S2-3,S2-4,S3-1,S3-2,S3-3,S3-4
WORKSHOPS42 | array | 12 entries; 0,1,2,3,4,5,6,7,8,9,10,11
LAB_VALUES42 | object | 12 entries; 1,2,3,4,5,6,7,8,9,10,11,12
ACTIVE_LAB42 | number | 1
DISTRICTS42 | array | 6 entries; 0,1,2,3,4,5
LAST_TEST42 | object | null
lastActionAt42 | number | 1790734301931
lastTick42 | number | 1790734301931
COURSE_RUNTIME_EXPECTATIONS42 | object | 14 entries; C08_05,C09_07,C10_06,X10_1,C11_02,X11_1,C12_08,X12_1,C13_05,X13_1,C14_03,C14_08
SUPPLEMENTS42 | array | 27 entries; 0,1,2,3,4,5,6,7,8,9,10,11
GUIDES43 | array | 30 entries; 0,1,2,3,4,5,6,7,8,9,10,11
GUIDE_BY43 | object | 30 entries; G01-1,G01-2,G02-1,G02-2,G03-1,G03-2,G04-1,G04-2,G05-1,G05-2,G06-1,G06-2
feedbackG43 | object | null
guideExpected43 | object | 23 entries; G02-2,G03-1,G03-2,G04-1,G04-2,G05-1,G05-2,G06-1,G07-2,G08-1,G09-1,G09-2
LINKS431 | object | 79 entries; C08-02,C08-04,C08-07,C08-08,C08-09,R08-1,R08-2,X08-1,C09-04,C09-05,C09-07,C09-08
COMPATIBLE431 | array | 3 entries; 0,1,2
RECOVERY_KEY431 | string | econverse431-guarded::before-replace
RESTORE431 | object | null
RESTORE_BUSY431 | boolean | false
TESTING431 | boolean | false

Page errors: []
