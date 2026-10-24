import Bio from '@/components/Bio';
import { readConfig } from '@/lib/store';
import type { Metadata } from 'next';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{try{const {config:c}=await readConfig();return {title:`${c.profile.name} — Links`,description:c.profile.bio,icons:{icon:c.profile.logo},openGraph:{title:`${c.profile.name} — Links`,description:c.profile.bio,locale:'pt_BR',type:'website'}};}catch{return {title:'Links do Zak'};}}
export default async function Page(){try{const {config}=await readConfig();return <Bio initial={{...config,links:config.links.filter(l=>l.enabled)}}/>;}catch{return <main style={{background:'#050A17',color:'white',fontFamily:'system-ui',minHeight:'100vh',display:'grid',placeContent:'center',textAlign:'center'}}><h1>Estamos preparando tudo.</h1><p>O site estará disponível assim que o banco de dados for conectado.</p><a style={{color:'#8db8ff'}} href="/admin">Abrir painel administrativo</a></main>;}}
