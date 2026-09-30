function expose41(s,reason){if(!s||s.type==='write')return;state.exposure=state.exposure||{};state.exposure[s.id]={seen:true,reason,at:new Date().toISOString()};}
