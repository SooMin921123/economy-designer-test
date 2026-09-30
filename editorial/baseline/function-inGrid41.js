function inGrid41(v,min,max,step=1){const x=num(v);return Number.isFinite(x)&&x>=min-1e-7&&x<=max+1e-7&&near((x-min)/step,Math.round((x-min)/step));}
