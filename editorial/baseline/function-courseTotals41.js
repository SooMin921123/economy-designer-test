function courseTotals41(t,a){const vals=t.d.labels.map(()=>0);let cost=0;t.d.items.forEach((it,i)=>{const n=a.counts[i]||0;cost+=it[1]*n;it[2].forEach((v,j)=>vals[j]+=n*v);});return {cost,vals};}
