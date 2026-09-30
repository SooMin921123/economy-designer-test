function done(id){const s=BYID[id];return s?.kind==='lesson'?state.read[id]===true:solved(id);}
