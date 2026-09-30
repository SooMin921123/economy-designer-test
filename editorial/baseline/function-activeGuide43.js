function activeGuide43(){if(route.view!=='course-guide')return null;const g=GUIDE_BY43[route.id];if(!g)return null;const r=rec43(g,true);return {g,r,i:r.index,s:g.steps[r.index],e:r.steps[r.index]};}
