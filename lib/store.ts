import postgres from 'postgres';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { get,put,BlobPreconditionFailedError } from '@vercel/blob';
import { defaultConfig, type BioConfig } from './config';
export type Snapshot={config:BioConfig;version:number};
const dataDir=path.join(process.cwd(),'.data');
let db:ReturnType<typeof postgres>|undefined;
let initializing:Promise<void>|undefined;
export function storageMode(){return process.env.BLOB_READ_WRITE_TOKEN||process.env.BLOB_STORE_ID?'blob':process.env.DATABASE_URL?'postgresql':process.env.VERCEL?'unconfigured':'local';}
async function readBlob<T>(name:string):Promise<{data:T;etag:string}|null>{const blob=await get(name,{access:'private',useCache:false});if(!blob)return null;return {data:await new Response(blob.stream).json(),etag:blob.blob.etag};}
async function sql(){
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL não configurada.');
 db??=postgres(process.env.DATABASE_URL,{max:3,prepare:false,connect_timeout:10,idle_timeout:20,ssl:process.env.DATABASE_SSL==='disable'?false:'require'});
 initializing??=(async()=>{await db!`CREATE TABLE IF NOT EXISTS bio_config (id integer PRIMARY KEY CHECK(id=1), data jsonb NOT NULL, version integer NOT NULL DEFAULT 1)`;await db!`CREATE TABLE IF NOT EXISTS bio_login_limits (key text PRIMARY KEY, count integer NOT NULL, reset_at bigint NOT NULL)`;await db!`INSERT INTO bio_config (id,data,version) VALUES (1,${db!.json(defaultConfig)},1) ON CONFLICT (id) DO NOTHING`;})();
 try{await initializing;}catch(e){initializing=undefined;throw e;}return db;
}
export async function readConfig():Promise<Snapshot>{
 if(storageMode()==='blob'){const r=await readBlob<Snapshot>('bio/config.json');return r?.data||{config:structuredClone(defaultConfig),version:0};}
 if(storageMode()==='unconfigured')throw new Error('Conecte um banco PostgreSQL antes de publicar.');
 if(storageMode()==='postgresql'){const q=await sql();const [r]=await q`SELECT data,version FROM bio_config WHERE id=1`;return {config:r.data,version:r.version};}
 try{return JSON.parse(await fs.readFile(path.join(dataDir,'config.json'),'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;return {config:structuredClone(defaultConfig),version:0};}
}
let queue:Promise<unknown>=Promise.resolve();
export async function writeConfig(config:BioConfig,version:number):Promise<Snapshot|null>{
 if(storageMode()==='blob'){
 const old=await readBlob<Snapshot>('bio/config.json');if((old?.data.version||0)!==version)return null;const next={config,version:version+1};
 try{await put('bio/config.json',JSON.stringify(next),{access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:!!old,...(old?{ifMatch:old.etag}:{})});return next;}catch(e){if(e instanceof BlobPreconditionFailedError||e instanceof Error&&/already exists/i.test(e.message))return null;throw e;}}
 if(storageMode()==='postgresql'){const q=await sql();const rows=await q`UPDATE bio_config SET data=${q.json(config)},version=version+1 WHERE id=1 AND version=${version} RETURNING version`;return rows.length?{config,version:rows[0].version}:null;}
 if(storageMode()==='unconfigured')throw new Error('Banco não configurado.');
 const operation=queue.then(async()=>{const current=await readConfig();if(current.version!==version)return null;const next={config,version:version+1};await fs.mkdir(dataDir,{recursive:true});const temp=path.join(dataDir,'config.tmp');await fs.writeFile(temp,JSON.stringify(next));await fs.rename(temp,path.join(dataDir,'config.json'));return next;});queue=operation.catch(()=>{});return operation;
}
const limits=new Map<string,{count:number;reset:number}>();
export async function consumeLogin(key:string,max:number){
 const now=Date.now(),until=now+15*60*1000;
 if(storageMode()==='blob'){
 const name='bio/auth-limit-'+key.replace(/[^a-z0-9]/gi,'')+'.json';
 for(let attempt=0;attempt<5;attempt++){const old=await readBlob<{count:number;reset:number}>(name);const value=old&&old.data.reset>now?{...old.data,count:old.data.count+1}:{count:1,reset:until};if(value.count>max)return false;try{await put(name,JSON.stringify(value),{access:'private',contentType:'application/json',addRandomSuffix:false,allowOverwrite:!!old,...(old?{ifMatch:old.etag}:{})});return true;}catch(e){if(!(e instanceof BlobPreconditionFailedError||e instanceof Error&&/already exists/i.test(e.message)))throw e;}}
 return false;
 }
 if(storageMode()==='postgresql'){const q=await sql();const [r]=await q`INSERT INTO bio_login_limits (key,count,reset_at) VALUES (${key},1,${until}) ON CONFLICT (key) DO UPDATE SET count=CASE WHEN bio_login_limits.reset_at<${now} THEN 1 ELSE bio_login_limits.count+1 END, reset_at=CASE WHEN bio_login_limits.reset_at<${now} THEN ${until} ELSE bio_login_limits.reset_at END RETURNING count`;return r.count<=max;}
 if(storageMode()==='unconfigured')throw new Error('Banco não configurado.');
 const r=limits.get(key);if(!r||r.reset<now){limits.set(key,{count:1,reset:until});return true;}return ++r.count<=max;
}

