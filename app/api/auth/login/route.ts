import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { createSession,verifyPassword,sameOrigin,cookieName,sessionOptions } from '@/lib/auth';
import { consumeLogin } from '@/lib/store';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Origem inválida.'},{status:403});
 try{
 if(Number(req.headers.get('content-length')||0)>4096)return NextResponse.json({error:'Solicitação inválida.'},{status:413});
 const {login,password}=await req.json();if(typeof login!=='string'||typeof password!=='string'||password.length>256)return NextResponse.json({error:'Credenciais inválidas.'},{status:400});
 const ip=process.env.VERCEL?req.headers.get('x-vercel-forwarded-for')||'unknown':'local';
 const key=createHash('sha256').update(ip).digest('hex');
 const [ipOk,globalOk]=await Promise.all([consumeLogin('ip:'+key,10),consumeLogin('admin',60)]);
 if(!ipOk||!globalOk)return NextResponse.json({error:'Muitas tentativas. Aguarde 15 minutos.'},{status:429,headers:{'Retry-After':'900'}});
 const passOk=verifyPassword(password);
 if(login!==(process.env.ADMIN_LOGIN||'admin')||!passOk)return NextResponse.json({error:'Login ou senha incorretos.'},{status:401});
 const res=NextResponse.json({ok:true});res.cookies.set(cookieName,createSession(),sessionOptions);res.headers.set('Cache-Control','no-store');return res;
 }catch{return NextResponse.json({error:'O servidor precisa de configuração. Verifique os segredos e o banco de dados.'},{status:503});}
}
