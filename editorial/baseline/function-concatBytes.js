function concatBytes(chunks){const len=chunks.reduce((a,b)=>a+b.length,0),b=new Uint8Array(len);let p=0;for(const x of chunks){b.set(x,p);p+=x.length;}return b;}
