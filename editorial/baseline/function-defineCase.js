function defineCase(c,steps){const found=CASES.find(x=>x.id===c);steps.forEach((s,i)=>{s.c=c;s.index=i;s.refs=s.refs||found.sources;STAGES.push(s);found.stageIds.push(s.id);});}
