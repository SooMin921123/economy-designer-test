(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((x,i)=>near(x,b[i]))
