function(t,a=CF41.response){if(t.type==='num')return textTable(['항목','정답'],t.d.labels.map((label,i)=>[label,exactNumber42(t.answer[i])]));return rationalSolution42(t,a);}
