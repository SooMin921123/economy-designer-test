function speaker(c,text,mood='neutral'){return `<div class="speaker">${portrait(c.who,mood)}<div><b>${esc(CAST[c.who].name)} · ${esc(CAST[c.who].role)}</b><p>${esc(text)}</p></div></div>`;}
