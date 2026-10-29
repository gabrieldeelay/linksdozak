import { NextResponse } from 'next/server';
import { authenticated,sameOrigin } from '@/lib/auth';
import { configSchema } from '@/lib/config';
import { readConfig,writeConfig } from '@/lib/store';
import { readPublicConfig,invalidatePublicConfig } from '@/lib/public-config';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{
 const isPublic=new URL(req.url).searchParams.get('public')==='1'||!await authenticated();
 const snapshot=await (isPublic?readPublicConfig():readConfig());
 return NextResponse.json(snapshot,{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Não foi possível acessar o armazenamento. As configurações não foram alteradas.'},{status:503,headers:{'Retry-After':'300'}});}}
export async function PUT(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Origem inválida.'},{status:403});
 if(!await authenticated())return NextResponse.json({error:'Sua sessão expirou. Entre novamente.'},{status:401});
 try{if(Number(req.headers.get('content-length')||0)>4000000)return NextResponse.json({error:'As imagens ultrapassam o limite de 4 MB.'},{status:413});const raw=await req.text();if(Buffer.byteLength(raw)>4000000)return NextResponse.json({error:'Configuração muito grande.'},{status:413});const body=JSON.parse(raw);const parsed=configSchema.safeParse(body.config);if(!parsed.success)return NextResponse.json({error:parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},{status:400});if(!Number.isInteger(body.version)||body.version<0)return NextResponse.json({error:'Versão inválida.'},{status:400});const result=await writeConfig(parsed.data,body.version);if(!result)return NextResponse.json({error:'A configuração mudou em outra sessão. Recarregue para obter a versão atual.'},{status:409});invalidatePublicConfig();return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Não foi possível salvar no servidor. Tente novamente.'},{status:503});}
}
