#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const commands={
 help:[],suppliers:[],supplier:['supplier'],'onboarding-queue':[],
 'evidence-due':['days'],'reviews-due':['days'],'corrective-actions':[],performance:[],spend:[],concentration:[],
 compliance:[],attention:[],'weekly-review':[],activity:['supplier'],
 'add-supplier':['reference','name','owner','category','country','criticality','personal-data','overseas','insurance-required','spend','currency','actor'],
 'set-supplier':['supplier','name','owner','category','country','criticality','personal-data','overseas','insurance-required','spend','currency','actor'],
 'record-evidence':['supplier','kind','evidence','reviewed','expires','note','actor'],
 'open-finding':['supplier','title','severity','owner','due','actor'],
 'close-finding':['id','resolution','actor'],scorecard:['supplier','period','delivery','quality','evidence','actor'],
 'approve-supplier':['supplier','due','rationale','evidence','actor'],
 'suspend-supplier':['supplier','reason','actor'],'archive-supplier':['supplier','reason','actor'],
 log:['supplier','note','actor'],'draft-review':['supplier'],
 import:['file','id-column','name-column','owner-column','category-column','dry-run','actor'],export:[]
};
const writeCommands=new Set(['add-supplier','set-supplier','record-evidence','open-finding','close-finding','scorecard','approve-supplier','suspend-supplier','archive-supplier','log','import']);
const kinds=['identity','insurance','security','overseas'];
const today=()=>new Date().toISOString().slice(0,10);
export function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v))||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Use a real ISO date: YYYY-MM-DD');return v;}
function past(v){v=date(v);if(v>today())throw Error('Evidence and scorecard dates cannot be in the future');return v;}
function future(v){v=date(v);if(v<today())throw Error('Review due date cannot be in the past');return v;}
function required(o,k){if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Missing --${k}=value`);return o[k].trim();}
function choice(v,values){if(!values.includes(v))throw Error(`Expected one of: ${values.join(', ')}`);return v;}
export function money(v){if(!/^\d+(\.\d{1,2})?$/.test(String(v))||Number(v)>99999999999999.99)throw Error('Spend must be nonnegative with at most two decimals');return v;}
function integer(v,min,max){if(!/^\d+$/.test(String(v))||Number(v)<min||Number(v)>max)throw Error(`Use an integer from ${min} to ${max}`);return Number(v);}
function parse(args){
 const [cmd='help',...rest]=args;if(!(cmd in commands))throw Error(`Unknown command ${cmd}. Use help.`);
 const o={},pos=[];
 for(const a of rest){if(!a.startsWith('--')){pos.push(a);continue;}const at=a.indexOf('=');const k=a.slice(2,at<0?undefined:at);if(k in o)throw Error(`Duplicate option --${k}`);o[k]=at<0?true:a.slice(at+1);}
 for(const k of Object.keys(o)){if(k!=='json'&&!commands[cmd].includes(k))throw Error(`Unknown option --${k} for ${cmd}`);if(['json','dry-run'].includes(k)){if(o[k]!==true)throw Error(`--${k} is a bare flag`);}else if(o[k]===true)throw Error(`--${k} needs =value`);}
 if(cmd==='import'){if(pos.length!==1||pos[0]!=='gatekeeper')throw Error('Use import gatekeeper --file=vendors.csv --actor=Name');}else if(pos.length)throw Error('Unexpected positional arguments');
 return {cmd,o};
}
export function human(value){
 if(Array.isArray(value)){if(!value.length)return '(none)';return table(value,Object.keys(value[0]).map(key=>({key,label:key.replaceAll('_',' '),format:v=>v===null?'Unknown':typeof v==='object'?JSON.stringify(v):String(v),width:64})));}
 if(value&&typeof value==='object'&&Object.values(value).some(Array.isArray))return Object.entries(value).map(([k,v])=>`${k}\n${human(v)}`).join('\n\n');
 return JSON.stringify(value,null,2);
}
export async function resolve(db,what,term,lock=false){
 if(!['suppliers','findings'].includes(what))throw Error('Unsupported record type');
 const label=what==='suppliers'?'name':'title';const ref=what==='suppliers'?" or lower(reference)=lower($1)":'';
 const rows=await db.query(`select * from assurance.${what} where id::text=$1${ref} or lower(${label})=lower($1) order by id${lock?' for update':''}`,[term]);
 const found=rows.length?rows:await db.query(`select * from assurance.${what} where starts_with(id::text,$1) or strpos(lower(${label}),lower($1))>0 order by id${lock?' for update':''}`,[term]);
 if(!found.length)throw Error(`No matching ${what}: ${term}`);
 if(found.length!==1)throw Error(`Ambiguous ${what}; choose a reference or ID:\n${human(found.map(r=>({id:r.id,reference:r.reference||'',name:r[label]})))}`);
 return found[0];
}
const audit=(db,s,action,actor,note)=>db.query('insert into assurance.activity(supplier_id,action,actor,note) values($1,$2,$3,$4)',[s,action,actor,note]);
async function detail(db,id){return {supplier:(await db.query('select * from assurance.suppliers where id=$1',[id]))[0],qualification:(await db.query('select * from assurance.qualification where id=$1',[id]))[0],evidence:await db.query('select * from assurance.latest_evidence where supplier_id=$1 order by kind',[id]),findings:await db.query('select * from assurance.findings where supplier_id=$1 order by due_on,id',[id]),reviews:await db.query('select * from assurance.reviews where supplier_id=$1 order by created_at desc,id',[id]),activity:await db.query('select action,actor,note,created_at from assurance.activity where supplier_id=$1 order by created_at,id',[id])};}
function profile(o){
 const out={};
 for(const k of ['name','owner','category','country'])if(k in o)out[k]=required(o,k);
 if('criticality'in o)out.criticality=choice(o.criticality,['unknown','low','medium','high']);
 for(const k of ['personal-data','overseas'])if(k in o)out[k.replaceAll('-','_')]=choice(o[k],['unknown','yes','no']);
 if('insurance-required'in o)out.insurance_required=choice(o['insurance-required'],['true','false'])==='true';
 if('spend'in o)out.annual_spend=o.spend==='unknown'?null:money(o.spend);
 if('currency'in o){if(!/^[A-Z]{3}$/.test(o.currency))throw Error('Currency must be a three-letter uppercase code');out.currency=o.currency;}
 return out;
}
const ordered=' order by reference';
async function read(db,cmd,o){
 switch(cmd){
 case 'suppliers':return db.query('select reference,name,owner,criticality,state,qualification from assurance.qualification'+ordered);
 case 'onboarding-queue':return db.query("select reference,name,coalesce(owner,'Unassigned') owner,qualification from assurance.qualification where state='onboarding'"+ordered);
 case 'evidence-due':return db.query(`select r.reference,r.name,r.kind,coalesce(e.expires_on::text,'Missing') expires_on,case when e.id is null then 'missing' when e.expires_on<current_date then 'expired' else 'due soon' end reason from assurance.requirements r left join assurance.latest_evidence e on e.supplier_id=r.supplier_id and e.kind=r.kind where e.id is null or e.expires_on<=current_date+$1::integer order by r.reference,r.kind`,[integer(o.days??30,0,3650)]);
 case 'reviews-due':return db.query("select reference,name,coalesce(owner,'Unassigned') owner,review_due,qualification from assurance.qualification where state<>'archived' and (review_due is null or review_due<=current_date+$1::integer or qualification<>'approved') order by review_due nulls first,reference",[integer(o.days??30,0,3650)]);
 case 'corrective-actions':return db.query("select f.id,s.reference,s.name,f.title,f.severity,f.owner,f.due_on,(current_date-f.due_on) days_overdue from assurance.findings f join assurance.suppliers s on s.id=f.supplier_id where f.status='open' order by f.due_on,s.reference,f.id");
 case 'performance':return db.query('select reference,name,period_end,delivery_score,quality_score,result from assurance.scorecards'+ordered);
 case 'spend':return db.query("select coalesce(category,'Unclassified') category,coalesce(currency,'Unknown') currency,sum(annual_spend) recorded_annual_spend,count(*) filter(where annual_spend is null)::integer unknown_spends,count(*)::integer suppliers from assurance.suppliers where state<>'archived' group by category,currency order by category,currency");
 case 'concentration':return db.query("select coalesce(s.category,'Unclassified') category,count(*)::integer suppliers,count(*) filter(where s.criticality='high')::integer high_criticality,count(*) filter(where q.qualification='approved')::integer approved,count(*) filter(where q.qualification<>'approved')::integer needs_review from assurance.suppliers s join assurance.qualification q on q.id=s.id where s.state<>'archived' group by s.category order by s.category");
 case 'compliance':return db.query(`select reference,name,kind check_name,reason,basis from assurance.evidence_gaps
 union all select reference,name,'classification','unknown','Local classification policy' from assurance.suppliers where state<>'archived' and (criticality='unknown' or personal_data='unknown' or (personal_data='yes' and overseas='unknown')) order by reference,check_name`);
 case 'attention':return db.query('select * from assurance.review_queue'+ordered);
 case 'weekly-review':return {reviews:await read(db,'reviews-due',{}),evidence:await read(db,'evidence-due',{}),actions:await read(db,'corrective-actions',{}),performance:await read(db,'performance',{})};
 }
 return undefined;
}
function snapshotHash(row){return createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))))).digest('hex');}
async function importVendors(db,o){
 const file=required(o,'file'),actor=required(o,'actor'),raw=fs.readFileSync(file,'utf8'),rows=parseCsv(raw);
 if(!rows.length)throw Error('No vendor rows found');
 const ids=new Set();let added=0,unchanged=0;
 for(const [index,row]of rows.entries()){
  const value=(key,defaults)=>pick(row,...(o[key]?[o[key]]:defaults)).trim();
  const id=value('id-column',['Gatekeeper ID']),name=value('name-column',['Name','Vendor Name','Supplier Name']);
  if(!id||!name)throw Error(`Row ${index+2}: Gatekeeper ID and Name required; use explicit column mappings for renamed headings`);
  if(ids.has(id))throw Error(`Duplicate Gatekeeper ID ${id}`);ids.add(id);
  const hash=snapshotHash(row),old=(await db.query('select id,source_hash from assurance.suppliers where source_id=$1',[id]))[0];
  if(old){if(old.source_hash!==hash)throw Error(`Changed source row ${id}; reconcile changes with set-supplier before accepting a new source snapshot`);unchanged++;continue;}
  const vendor=(await db.query('insert into assurance.suppliers(reference,name,owner,category,source_id,source_payload,source_hash) values($1,$2,$3,$4,$5,$6,$7) returning id',[
   `GK-${id}`,name,value('owner-column',['Owner','Vendor Owner'])||null,value('category-column',['Category','Vendor Type','Type'])||null,id,JSON.stringify(row),hash]))[0];
  await audit(db,vendor.id,'import',actor,`Gatekeeper ID ${id}; imported as unapproved onboarding record`);added++;
 }
 if(!o['dry-run'])await db.query('insert into assurance.import_batches(file_hash,actor,added,unchanged) values($1,$2,$3,$4)',[createHash('sha256').update(raw).digest('hex'),actor,added,unchanged]);
 return {added,unchanged,dry_run:Boolean(o['dry-run']),scope:'Vendor register only. Source fields preserved; approvals and evidence require reconciliation.'};
}
async function execute(db,cmd,o){
 if(cmd==='help')return Object.entries(commands).map(([command,options])=>({command,options:options.map(k=>`--${k}`).join(' ')}));
 const result=await read(db,cmd,o);if(result!==undefined)return result;
 if(cmd==='import')return importVendors(db,o);
 if(cmd==='export'){
  const result={format:'supplier-assurance-v1',exported_at:new Date().toISOString(),records:{}};
  for(const t of ['suppliers','evidence','findings','performance','reviews','activity','import_batches'])result.records[t]=await db.query(`select * from assurance.${t} order by id`);
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'exports');fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,`assurance-${randomUUID()}.json`);fs.writeFileSync(file,JSON.stringify(result,null,2),{flag:'wx',mode:0o600});
  return {file,counts:Object.fromEntries(Object.entries(result.records).map(([k,v])=>[k,v.length]))};
 }
 if(cmd==='add-supplier'){
  const fields={reference:required(o,'reference'),name:required(o,'name'),...profile(o)},actor=required(o,'actor');
  const keys=Object.keys(fields),r=(await db.query(`insert into assurance.suppliers(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(fields)))[0];
  await audit(db,r.id,cmd,actor,'Created supplier for onboarding');return r;
 }
 if(cmd==='close-finding'){
  const f=await resolve(db,'findings',required(o,'id'),true);if(f.status==='closed')throw Error('Finding already closed');
  const s=(await db.query('select * from assurance.suppliers where id=$1 for update',[f.supplier_id]))[0];
  if(s.state==='archived')throw Error('Archived supplier is read-only');
  const actor=required(o,'actor'),resolution=required(o,'resolution');
  const r=(await db.query("update assurance.findings set status='closed',closed_on=current_date,resolution=$2,actor=$3 where id=$1 returning *",[f.id,resolution,actor]))[0];await audit(db,f.supplier_id,cmd,actor,resolution);return r;
 }
 if(cmd==='activity'&&!o.supplier)return db.query('select s.reference,a.action,a.actor,a.note,a.created_at from assurance.activity a left join assurance.suppliers s on s.id=a.supplier_id order by a.created_at,a.id');
 const s=await resolve(db,'suppliers',required(o,'supplier'),writeCommands.has(cmd));
 if(cmd==='supplier')return detail(db,s.id);
 if(cmd==='activity')return (await detail(db,s.id)).activity;
 if(cmd==='draft-review'){
  const d=await detail(db,s.id),dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,`supplier-review-${s.id}-${randomUUID()}.md`);
  const text=`# Supplier review: ${s.name}\n\nInternal draft. Check evidence references before deciding. Nothing has been sent.\n\nQualification: ${d.qualification.qualification}\n\n## Evidence\n\n${human(d.evidence.map(e=>({kind:e.kind,expires_on:e.expires_on,evidence:e.evidence_ref})))}\n\n## Corrective actions\n\n${human(d.findings.map(f=>({title:f.title,severity:f.severity,status:f.status,due_on:f.due_on})))}\n\n## Review decision\n\nRecord the reviewer, evidence checked, rationale and next review date.\n`;
  fs.writeFileSync(file,text,{flag:'wx',mode:0o600});return {file};
 }
 if(s.state==='archived')throw Error('Archived supplier is read-only');
 const actor=required(o,'actor');let row;
 switch(cmd){
 case 'set-supplier':{
  const fields=profile(o);if(!Object.keys(fields).length)throw Error('Provide at least one supplier field');
  row=(await db.query(`update assurance.suppliers set ${Object.keys(fields).map((k,i)=>`${k}=$${i+2}`).join(',')} where id=$1 returning *`,[s.id,...Object.values(fields)]))[0];break;
 }
 case 'record-evidence':{
  const reviewed=past(o.reviewed??today()),expires=date(required(o,'expires'));if(expires<reviewed)throw Error('Expiry precedes review date');
  row=(await db.query('insert into assurance.evidence(supplier_id,kind,evidence_ref,reviewed_on,expires_on,actor,note) values($1,$2,$3,$4,$5,$6,$7) returning *',[s.id,choice(required(o,'kind'),kinds),required(o,'evidence'),reviewed,expires,actor,required(o,'note')]))[0];break;
 }
 case 'open-finding':row=(await db.query('insert into assurance.findings(supplier_id,title,severity,owner,due_on,actor) values($1,$2,$3,$4,$5,$6) returning *',[s.id,required(o,'title'),choice(required(o,'severity'),['low','medium','high','critical']),required(o,'owner'),date(required(o,'due')),actor]))[0];break;
 case 'scorecard':row=(await db.query('insert into assurance.performance(supplier_id,period_end,delivery_score,quality_score,evidence_ref,actor) values($1,$2,$3,$4,$5,$6) returning *',[s.id,past(required(o,'period')),integer(required(o,'delivery'),0,100),integer(required(o,'quality'),0,100),required(o,'evidence'),actor]))[0];break;
 case 'approve-supplier':{
  const q=(await db.query('select * from assurance.qualification where id=$1',[s.id]))[0];
  if(!s.owner||s.criticality==='unknown'||s.personal_data==='unknown'||(s.personal_data==='yes'&&s.overseas==='unknown'))throw Error('Approval blocked: classify the supplier and assign an owner');
  if(q.evidence_gaps||q.critical_findings)throw Error(`Approval blocked: ${q.evidence_gaps} evidence gaps, ${q.critical_findings} critical findings`);
  const due=future(required(o,'due'));
  const current=(await db.query("update assurance.suppliers set state='active',review_due=$2 where id=$1 returning version",[s.id,due]))[0];
  row=(await db.query('insert into assurance.reviews(supplier_id,supplier_version,due_on,actor,rationale,evidence_ref) values($1,$2,$3,$4,$5,$6) returning *',[s.id,current.version,due,actor,required(o,'rationale'),required(o,'evidence')]))[0];break;
 }
 case 'suspend-supplier':case 'archive-supplier':{
  required(o,'reason');
  if(cmd==='archive-supplier'&&(await db.query("select 1 from assurance.findings where supplier_id=$1 and status='open'",[s.id])).length)throw Error('Close open findings before archiving');
  row=(await db.query('update assurance.suppliers set state=$2 where id=$1 returning *',[s.id,cmd==='suspend-supplier'?'suspended':'archived']))[0];break;
 }
 case 'log':required(o,'note');row={recorded:true};break;
 default:throw Error(`Unhandled command ${cmd}`);
 }
 await audit(db,s.id,cmd,actor,o.reason||o.note||o.rationale||`Recorded ${cmd} ${row.id||s.reference}`);return row;
}
export async function run(db,args){
 const {cmd,o}=parse(args);await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ');
 try{const result=await execute(db,cmd,o);await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return result;}
 catch(error){await db.exec('ROLLBACK');throw error;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{db=await getDb();const result=await run(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):human(result));}
 catch(e){console.error(process.argv.includes('--json')?JSON.stringify({error:e.message}):e.message);process.exitCode=1;}
 finally{if(db)await db.close();}
}
