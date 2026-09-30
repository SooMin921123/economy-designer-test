import fs from 'node:fs/promises';
const input=await fs.readFile('editorial/build.mjs','utf8');
const diagnostic=`\nlet parseSequence=0;\nfunction checkedEditorialParse(text,options){\n parseSequence++;\n try{return parse(text,options);}\n catch(error){console.error('EDITORIAL_PARSE_CONTEXT '+JSON.stringify({sequence:parseSequence,length:text.length,position:error.pos,line:error.loc?.line,column:error.loc?.column,message:error.message,context:text.slice(Math.max(0,error.pos-700),error.pos+700)}));throw error;}\n}\n`;
const transformed=input.replace(/\bparse\(/g,'checkedEditorialParse(')+diagnostic;
const temporary='editorial/.debug-build-generated.mjs';
await fs.writeFile(temporary,transformed);
try{await import('./.debug-build-generated.mjs?run='+Date.now());}
finally{await fs.rm(temporary,{force:true});}
