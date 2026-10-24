import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
export const cookieName='bio_session';
export function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return `scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
export function verifyPassword(password:string,hash=process.env.ADMIN_PASSWORD_HASH||''){
 const [method,salt,expected]=hash.split(':');if(method!=='scrypt'||!salt||!expected)return false;
 const a=scryptSync(password,salt,64),b=Buffer.from(expected,'hex');return a.length===b.length&&timingSafeEqual(a,b);
}
function secret(){const s=process.env.SESSION_SECRET;if(!s||s.length<32||!process.env.ADMIN_PASSWORD_HASH)throw new Error('Configure os segredos de autenticação.');return s+process.env.ADMIN_PASSWORD_HASH;}
export function createSession(){const body=Buffer.from(JSON.stringify({exp:Date.now()+8*3600000,nonce:randomBytes(24).toString('hex')})).toString('base64url');return body+'.'+createHmac('sha256',secret()).update(body).digest('base64url');}
export function validSession(token:string){try{const [body,sig,...rest]=token.split('.');if(rest.length||!body||!sig)return false;const a=Buffer.from(createHmac('sha256',secret()).update(body).digest('base64url'));const b=Buffer.from(sig);if(a.length!==b.length||!timingSafeEqual(a,b))return false;const {exp}=JSON.parse(Buffer.from(body,'base64url').toString());return typeof exp==='number'&&exp>Date.now()&&exp<=Date.now()+8*3600000;}catch{return false;}}
export async function authenticated(){return validSession((await cookies()).get(cookieName)?.value||'');}
export function sameOrigin(req:Request){try{const origin=req.headers.get('origin');if(!origin)return false;const parsed=new URL(origin);const host=req.headers.get('host')||new URL(req.url).host;return parsed.host===host&&parsed.protocol===(process.env.VERCEL?'https:':new URL(req.url).protocol);}catch{return false;}}
export const sessionOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/',maxAge:8*3600};


