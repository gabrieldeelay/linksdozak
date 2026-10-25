import { ArrowRight, Globe, Mail, Link, Music2, Video, GraduationCap, ShieldCheck, Star, Calendar, Store, Github, MessageCircle, Instagram, Youtube, Bot, ChartCandlestick } from 'lucide-react';
import type { IconName } from '@/lib/config';
import { useId } from 'react';
export const iconLabels:Record<IconName,string>={marca:'Cadastro',telegram:'Telegram',app:'Gerenciamento',robot:'Robô',trade:'Trade',instagram:'Instagram',youtube:'YouTube',whatsapp:'WhatsApp',link:'Link',mail:'E-mail',globe:'Site',music:'Música',video:'Lives',graduation:'Aulas',shield:'Proteção',star:'Destaque',calendar:'Agenda',store:'Loja',github:'GitHub',tiktok:'TikTok'};
export function Icon({name,className='ic',monochrome=false}:{name:IconName|'arrow';className?:string;monochrome?:boolean}){
 const id=useId();
 if(name==='instagram'&&monochrome)return <Instagram className={className} aria-hidden="true"/>;
 if(name==='app'&&monochrome)return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="7"/><circle cx="7" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="17" cy="12" r="1" fill="currentColor"/></svg>;
 if(name==='instagram')return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id={id} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#F09433"/><stop offset=".25" stopColor="#E6683C"/><stop offset=".5" stopColor="#DC2743"/><stop offset=".75" stopColor="#CC2366"/><stop offset="1" stopColor="#BC1888"/></linearGradient></defs><g stroke={`url(#${id})`}><rect x="2.7" y="2.7" width="18.6" height="18.6" rx="5.4"/><circle cx="12" cy="12" r="4.1"/></g><circle cx="17.4" cy="6.7" r="1.2" fill={`url(#${id})`} stroke="none"/></svg>;
 if(name==='youtube')return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><rect x="2.2" y="5" width="19.6" height="14" rx="4.4"/><path fill="currentColor" stroke="none" d="m10.3 9.05 5.35 2.95-5.35 2.95z"/></svg>;
 if(name==='marca')return <svg className={`${className} ic--marca`} viewBox="0 0 636 462" aria-hidden="true"><path fill="currentColor" stroke="none" d="M0 0L93 0L157 187L479 187L543 0L636 0L557 231L636 462L543 462L479 275L157 275L93 462L0 462L79 231Z"/></svg>;
 if(name==='telegram')return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M22.2 2.9 1.95 10.7c-.55.21-.54.99.02 1.18l5.02 1.68 1.9 5.86c.19.57.9.73 1.31.28l2.63-2.9 5.03 3.68c.44.33 1.06.09 1.18-.44l3.63-16.2c.13-.57-.42-1.03-.97-.83Z"/><path stroke="#000" strokeOpacity=".24" d="m9.3 19.4-.31-5.84L19.4 5.6"/></svg>;
 if(name==='app')return <img src="/assets/app.webp" width="31" height="22" alt=""/>;
 if(name==='whatsapp')return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.3l1.4-4.8a8.5 8.5 0 1 1 16.1-4Z"/><path d="M8.1 7.5c-.7 1-.6 2.5 1.3 4.7 2 2.2 4.5 3.4 5.7 2.7l1.2-1.4-2.6-1.3-1 1c-1.3-.4-2.6-1.8-3-2.8l.7-.8-1.2-2.2Z"/></svg>;
 const C={arrow:ArrowRight,robot:Bot,trade:ChartCandlestick,instagram:Instagram,youtube:Youtube,link:Link,mail:Mail,globe:Globe,music:Music2,video:Video,graduation:GraduationCap,shield:ShieldCheck,star:Star,calendar:Calendar,store:Store,github:Github,tiktok:Music2}[name]||MessageCircle;
 return <C className={className} aria-hidden="true"/>;
}
