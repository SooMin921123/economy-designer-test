function stash(){if(route.view==='stage'&&r){const s=BYID[route.id];if(s?.kind==='task'&&!feedback){state.drafts[s.id]=cleanResponse(s,r);save();}}}
