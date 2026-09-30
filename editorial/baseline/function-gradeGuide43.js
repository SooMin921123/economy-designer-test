function gradeGuide43(step,a){if(!step||!a)return false;if(step.type==='pick')return Number.isInteger(a.choice)&&a.choice===step.answer;return step.type==='num'&&numsEq(a.nums,step.answer);}
