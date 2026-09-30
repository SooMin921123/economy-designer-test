async function(button){const action=button.dataset.action;
 if(action==='c41-related'){const back=captureCourseReturn431();if(back){save();courseGo41('course-lesson',back.lesson);}return;}
 if(action==='related'){const lesson=captureFocusReturn431();if(lesson){save();go('lesson',lesson);}return;}
 if(action==='restore'){stash();$('restore').click();return;}
 if(action==='reset'){stageRestore431(JSON.stringify(empty()),'현재4.3.1 학습 기록 초기화');return;}
 if(action==='backup'||action==='s431-backup'){stash();download(JSON.stringify(state,null,2),'경제설계자4_3_1_개인기록백업.json','application/json;charset=utf-8');return;}
 if(action==='s431-original'){if(RESTORE431)download(RESTORE431.rawText,'경제설계자_선택한원본백업.json','application/json;charset=utf-8');return;}
 if(action==='s431-apply'){applyRestore431();return;}
 if(action==='s431-cancel'){RESTORE431=null;go('settings');return;}
 if(['s431-import43','s431-import42','g43-import42'].includes(action)){try{const key=action==='s431-import43'?'econverse43-guided':'econverse42-integrated',text=localStorage.getItem(key);if(text===null){toast('같은 브라우저에서 해당 기록을 찾지 못했습니다. 이전 파일의 JSON백업을 선택하세요.');return;}stageRestore431(text,key+'에서 복사할 기록');}catch(e){alert('이전 기록을 교체하지 않았습니다: '+e.message);}return;}
 if(['v42-import41','import-original41'].includes(action)){toast('이 패치의 답안 복원은72강4.2·4.3·4.3.1만 지원합니다. 이전 원본과 백업을 보관하세요.3.1 메모 가져오기는 별도입니다.');return;}
 if(action==='s431-recovery'){try{const text=localStorage.getItem(RECOVERY_KEY431);if(!text){toast('아직 교체 전 보관 기록이 없습니다.');return;}const checkpoint=JSON.parse(text);if(checkpoint.schema!=='econverse-rollback-1'||typeof checkpoint.liveBefore!=='string')throw new Error('보관 기록 형식 확인 필요');stageRestore431(checkpoint.liveBefore,'교체 전 보관 기록 · '+String(checkpoint.at||''));}catch(e){alert('보관 기록을 적용하지 않았습니다: '+e.message);}return;}
 if(action==='s431-recovery-export'){try{const text=localStorage.getItem(RECOVERY_KEY431);if(!text){toast('보관 기록이 없습니다.');return;}const checkpoint=JSON.parse(text);download(checkpoint.liveBefore,'경제설계자_교체전개인기록.json','application/json;charset=utf-8');}catch(e){alert('보관 기록을 내보내지 못했습니다: '+e.message);}return;}
 if(['s431-report','g43-report','c41-export-report'].includes(action)){download(report431(),'경제설계자4_3_1_수정근거와검증범위.txt');return;}
 if(action==='c41-export-lectures'){download(courseMarkdown41(),'경제설계자4_3_1_72강원고.md','text/markdown;charset=utf-8');return;}
 if(action==='c41-export-notes'){download(courseNotesText41(),'경제설계자4_3_1_단원메모.txt');return;}
 return actionBefore431(button);
}
