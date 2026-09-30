function lastAttempt(s){const h=state.records[s.id]?.history;return h?.length?h[h.length-1].response:null;}
