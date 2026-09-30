function totalXP(){return STAGES.filter(s=>s.kind==='task'&&s.type!=='write'&&solved(s.id)).length*20;}
