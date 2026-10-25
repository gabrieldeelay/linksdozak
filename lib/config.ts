import { z } from 'zod';
export const iconNames=['marca','telegram','app','instagram','youtube','whatsapp','link','mail','globe','music','video','graduation','shield','star','calendar','store','github','tiktok'] as const;
export type IconName=typeof iconNames[number];
const image=z.string().max(1800000).refine(v=>/^\/assets\/[a-z0-9.-]+$/i.test(v)||/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(v)||/^https:\/\//.test(v),'Use uma imagem HTTPS ou envie um arquivo PNG, JPG ou WebP.');
const url=z.url().max(2048).refine(v=>['http:','https:','mailto:','tel:'].includes(new URL(v).protocol),'Use um endereço http, https, mailto ou tel.');
const color=z.string().regex(/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i,'Use uma cor hexadecimal.');
export const linkColorsSchema=z.object({background:color.optional(),backgroundEnd:color.optional(),iconBackground:color.optional(),iconColor:color.optional(),title:color.optional(),description:color.optional(),border:color.optional(),hoverBackground:color.optional(),hoverBorder:color.optional()});
export const linkSchema=z.object({id:z.string().min(1).max(80),title:z.string().min(1).max(100),description:z.string().max(200),url,icon:z.enum(iconNames),enabled:z.boolean(),featured:z.boolean(),live:z.boolean(),direct:z.boolean(),colors:linkColorsSchema.optional()});
export const configSchema=z.object({
  profile:z.object({name:z.string().min(1).max(100),handle:z.string().max(80),bio:z.string().max(500),badge:z.string().max(80),avatar:image,hero:image,heroMobile:image,logo:image}),
  theme:z.object({accent:z.string().regex(/^#[0-9a-f]{6}$/i),background:z.string().regex(/^#[0-9a-f]{6}$/i),motion:z.boolean(),passUtm:z.boolean(),glow:color.optional(),secondaryGlow:color.optional(),glowStrength:z.number().min(0).max(100).optional(),surface:color.optional(),text:color.optional(),mutedText:color.optional()}),
  links:z.array(linkSchema).max(50).refine(v=>new Set(v.map(x=>x.id)).size===v.length,'IDs duplicados.'),
  context:z.object({enabled:z.boolean(),items:z.array(z.object({title:z.string().max(80),description:z.string().max(200),icon:z.enum(iconNames)})).max(6)}),
  closing:z.object({enabled:z.boolean(),title:z.string().max(150),linkId:z.string().max(80),sticky:z.boolean()}),
  footer:z.object({copyright:z.string().max(200),disclaimer:z.string().max(500)})
});
export type BioConfig=z.infer<typeof configSchema>;
export type BioLink=z.infer<typeof linkSchema>;
export const defaultConfig:BioConfig={
 profile:{name:'Giovani Brandi',handle:'@giobrandii',bio:'Mercado financeiro, todos os dias. Análises, lives e comunidade.',badge:'Comunidade aberta',avatar:'/assets/avatar.webp',hero:'/assets/hero.webp',heroMobile:'/assets/hero-mobile.webp',logo:'/assets/logo.png'},
 theme:{accent:'#2D6BFF',background:'#050A17',motion:true,passUtm:true},
 links:[
 {id:'cadastro',title:'Realizar cadastro',description:'Comece pelo primeiro passo',url:'https://bit.ly/giobrandiregistro?utm_content=cadastro',icon:'marca',enabled:true,featured:true,live:false,direct:false},
 {id:'telegram',title:'Telegram',description:'t.me/realgiobrandi',url:'https://t.me/Giooficial_bot?start=6a4865ec5865d45e050674ed',icon:'telegram',enabled:true,featured:false,live:true,direct:false},
 {id:'app',title:'App de Gerenciamento',description:'Melhore a sua gestão',url:'https://aff.tradeprofittrack.com/r/giobrandi',icon:'app',enabled:true,featured:false,live:false,direct:true},
 {id:'instagram',title:'Instagram',description:'@giobrandii',url:'https://www.instagram.com/giobrandii',icon:'instagram',enabled:true,featured:false,live:false,direct:false},
 {id:'youtube',title:'YouTube',description:'@giovanibrandi',url:'https://www.youtube.com/@giovanibrandi',icon:'youtube',enabled:true,featured:false,live:false,direct:false}],
 context:{enabled:true,items:[{title:'Lives de operação',description:'Sessões ao vivo operando no mercado.',icon:'video'},{title:'Aula gratuita',description:'Material completo pra quem está começando.',icon:'graduation'},{title:'Transparência',description:'As operações são mostradas ao vivo no grupo.',icon:'shield'}]},
 closing:{enabled:true,title:'Todo o resto começa aqui.',linkId:'cadastro',sticky:true},
 footer:{copyright:'© 2026 · Todos os direitos reservados',disclaimer:'Conteúdo educacional. Operações no mercado financeiro envolvem risco e não há garantia de resultado.'}
};
export function destination(link:BioLink,pass:boolean,search=''){
 const u=new URL(link.url);
 if(pass&&!link.direct&&['https:','http:'].includes(u.protocol)){
 const p=new URLSearchParams(search);for(const k of ['utm_source','utm_medium','utm_campaign','utm_term','utm_id','gclid','fbclid','ttclid'])if(p.has(k))u.searchParams.set(k,p.get(k)!);
 u.searchParams.set('utm_content',link.id);
 }return u.toString();
}
