import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root='editorial/ko2/';
const docs=new Map();
for(const n of (await fs.readdir(root)).filter(n=>n.endsWith('.json')&&n!=='interface.json'))docs.set(n,JSON.parse(await fs.readFile(root+n,'utf8')));
const owners=new Map();
for(const [name,data] of docs)for(const[col,items]of Object.entries(data))for(const id of Object.keys(items)){assert(!owners.has(col+'/'+id),'Duplicate '+col+'/'+id);owners.set(col+'/'+id,name);}
const get=(col,id)=>{const name=owners.get(col+'/'+id);assert(name,'Missing '+col+'/'+id);return docs.get(name)[col][id];};
for(const [col,n]of Object.entries({CL41:72,CT41:219,GUIDES43:30,LESSONS:12,STAGES:36,WORKSHOPS42:12,PROJECTS42:6,CAMPAIGNS42:6,CU41:16,CAST:6,CASES:3})){
 assert.equal([...owners.keys()].filter(k=>k.startsWith(col+'/')).length,n,'Incomplete '+col+' prose pass');
}
const row=get('CT41','C13-07');row.prompt=row.prompt.replace('곡선의 안쪽·위쪽·바깥쪽 중 어디에 해당하는지','곡선 안쪽, 곡선 위, 곡선 바깥쪽 중 어디에 해당하는지');
for(const[id,labels]of Object.entries({
 'C04-06':['A의 편익−명시적 비용','B의 반환금을 포함한 편익−명시적 비용'],
 'R04-2':['A의 편익−명시적 비용','변경 후 B의 편익−명시적 비용'],
 'X07-1':['A의 편익−가격','B의 윤리적 만족을 포함한 편익−가격']
})){const r=get('CT41',id);r.d??={};r.d.labels=labels;}
get('CT41','C08-01').d.rows[0]='이자 수익을 기대할 수 있지만 시세 차익은 기대할 수 없다.';
get('CT41','R01-1').d??={};get('CT41','R01-1').d.options=['정책이 시행된 시대적 배경과 목적을 비교한다.','정부가 개입했으므로 같은 자본주의의 단계로 구분한다.','두 정책 모두 민간의 상품 거래를 금지했다고 본다.'];
// Remove repetitive notices where the same conditions are already explicit in the example/body.
for(const id of ['L05-4','L06-2','L08-4','L09-1','L09-2','L09-3','L09-4','L10-1','L10-5','L11-3','L12-2','L12-3','L13-4','L13-5','L14-3','L14-5'])get('CL41',id).caution='';
const l7=get('CL41','L07-4');l7.paragraphs=l7.paragraphs.map(x=>x.replace('근로 조건도 좋아졌다고 알 수는 없다.','근로 조건이 좋아졌는지는 알 수 없다.'));
const l12=get('CL41','L12-3');
l12.paragraphs[2]='생산량이 100개에서 200개로 늘어난 경우를 다시 살펴보자. 총비용은 200에서 300으로 늘었지만 생산량은 두 배가 되었다. 그 결과 한 개당 비용은 2에서 1.5로 줄었다. 규모의 경제는 이처럼 총비용이 아니라 평균 생산 단가의 변화로 파악한다.';
get('CL41','L13-5').tip='절대 우위는 같은 투입량에서 생산할 수 있는 수량을 비교한다. 비교 우위는 두 재화의 최대 생산량 비율로 구한 기회비용을 비교한다.';
get('CL41','L13-5').result='양국의 X재 1개 생산의 기회비용은 Y재 0.5개로 같다. 주어진 생산 조건에서는 양국 모두 양의 교역 이익을 얻는 교환 비율이 없다.';
get('LESSONS','CH-L3').advanced='두 대안이 같은 수준으로 유리해지는 금액과 어느 한 대안이 더 유리해지는 금액은 다르다. 반환금을 정수로만 받을 수 있다면 두 대안이 같아지는 금액을 구한 뒤 그다음 정수에서의 결과를 살펴볼 수 있다. 동률을 허용하는지에 따라 경계값을 포함할지가 달라진다.';
for(const[name,data]of docs)await fs.writeFile(root+name,JSON.stringify(data,null,2)+'\n');
const ui=JSON.parse(await fs.readFile(root+'interface.json','utf8'));
// Remaining occurrences are short legacy control labels for this explicitly defined expression.
if(!ui.text.some(([x])=>x==='비교값'))ui.text.push(['비교값','편익−명시적 비용']);
await fs.writeFile(root+'interface.json',JSON.stringify(ui,null,2)+'\n');
await fs.mkdir(root+'reports',{recursive:true});
await fs.writeFile(root+'reports/semantic-review.json',JSON.stringify({
 base:'d98c987d0581dd66e829f1d3ba8d9333c30916b4',
 preserved:['original and recovery baseline bytes','numeric answer keys and values','grading algorithms','localStorage keys and restore guards','counts and task identifiers','choice/array lengths'],
 beyondStyle:[
 {id:'C01-05',change:'Replace paper-colour distraction with economic-policy comparisons; correct answer index unchanged.'},
 {id:'C06-07',change:'Reword distractors to contrast an agreement with price equality or few suppliers; no new legal judgment.'},
 {id:'C11-07',change:'Ask directly about uncertainty and preference for safety; keep correction target and answer indices.'},
 {id:'G07-1/2',change:'Replace the real-case-legality disclaimer question with a question identifying collective action rights. Two options and correct index 1 retained. This changes the tested subtopic, not just style.'},
 {id:'R01-1',change:'Replace deletion-of-keyword distractor with an incorrect economic-policy claim; correct index unchanged.'},
 {id:'S1-3,C15-09,X15-1',change:'Clarify incorrect assertions about policy purpose and conclusions unsupported by missing data; truth values and answer indices retained.'}
 ],
 nonGradingCodeChange:'The optional-caution self-check now accepts an empty string; numeric grading and all 36 existing browser tests are retained.',
 editorialLimits:['No claim that automated browser success certifies prose quality or publication readiness.','Physical iPhone/Android installation not tested.','Public main branch and Pages site not changed.']
},null,2));
console.log('KO2_FULL_COVERAGE '+JSON.stringify(Object.fromEntries(['CL41','CT41','GUIDES43','LESSONS','STAGES','WORKSHOPS42','PROJECTS42','CAMPAIGNS42','CU41','CAST','CASES'].map(c=>[c,[...owners.keys()].filter(k=>k.startsWith(c+'/')).length]))));
