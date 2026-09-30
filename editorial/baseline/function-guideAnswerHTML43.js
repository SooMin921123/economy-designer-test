function guideAnswerHTML43(s){return s.type==='pick'?'<p><b>판단:</b> '+esc(s.options[s.answer])+'</p>':textTable(['빈칸','값'],s.labels.map((v,i)=>[v,exactNumber42(s.answer[i])]));}
