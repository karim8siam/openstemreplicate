import {writeFile,access} from 'node:fs/promises';import path from 'node:path';
const month=process.argv.find(x=>/^\d{4}-\d{2}$/.test(x));
if(!month){console.error('Usage: npm run new-month -- 2026-10');process.exit(1);}
const dir=path.resolve(import.meta.dirname,'../data');const out=path.join(dir,month+'.json');
try{await access(out);console.error('Refusing to overwrite existing curated month: '+out);process.exit(1);}catch(e){if(e.code!=='ENOENT')throw e;}
const template={month,status:'editorial-draft',selectionNote:'DRAFT — independently verify all primary sources, write original summaries, then change status to editorial-curated and build.',reviewedOn:'',papers:[]};
await writeFile(out,JSON.stringify(template,null,2)+'\n');console.log('Created draft '+out+'. No papers are published until editors add and verify records and rerun npm run build.');
