function publicCalc(others,paid){const total=others.reduce((a,b)=>a+b,0)+paid,lit=total>=24;return {total,lit,remaining:lit?10-paid:10,value:lit?20-paid:10};}
