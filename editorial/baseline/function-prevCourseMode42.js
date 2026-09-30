function courseMode41(t,a){if(a.assisted||a.help)return 'assisted';return cpState41().exposed[t.id]||cpState41().records[t.id]?.solved||cpState41().records[t.id]?.history?.length?'recheck':'first';}
