import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const input=await fs.readFile('editorial/build.mjs','utf8');
const oldImport="import { parse } from 'acorn';";
assert.equal(input.split(oldImport).length,2);
const diagnostic=`\nlet parseSequence=0;\nfunction parse(text,options){\n parseSequence++;\n try{return acornParse(text,options);}\n catch(error){console.error('EDITORIAL_PARSE_CONTEXT '+JSON.stringify({sequence:parseSequence,length:text.length,position:error.pos,line:error.loc?.line,column:error.loc?.column,message:error.message,context:text.slice(Math.max(0,error.pos-700),error.pos+700)}));throw error;}\n}\n`;
const transformed=diagnostic+input.replace(oldImport,"import { parse as acornParse } from 'acorn';");
const temporary='editorial/.debug-build-generated.mjs';
await fs.writeFile(temporary,transformed);
try{await import('./.debug-build-generated.mjs?run='+Date.now());}
finally{await fs.rm(temporary,{force:true});}
