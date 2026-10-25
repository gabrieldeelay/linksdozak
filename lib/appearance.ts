import type { BioConfig,BioLink } from './config';
export type LinkColors=NonNullable<BioLink['colors']>;
export const themePresets=[
 {name:'Azul',accent:'#2D6BFF',background:'#050A17',glow:'#2D6BFF',secondaryGlow:'#1AA6F0'},
 {name:'Roxo',accent:'#854DFF',background:'#0D071A',glow:'#854DFF',secondaryGlow:'#D149D9'},
 {name:'Verde',accent:'#0C9A68',background:'#040F0D',glow:'#00C28B',secondaryGlow:'#0FA9A2'},
 {name:'Dourado',accent:'#B37C1B',background:'#110D05',glow:'#DFAE45',secondaryGlow:'#CF7F29'},
 {name:'Rosa',accent:'#C82D82',background:'#160813',glow:'#EC4899',secondaryGlow:'#A855F7'},
 {name:'Vermelho',accent:'#CC3247',background:'#16070B',glow:'#F04455',secondaryGlow:'#E87935'}
];
export function rgb(hex:string){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');}
export function themeVariables(t:BioConfig['theme']):Record<string,string>{
 const original=t.accent.toLowerCase()==='#2d6bff';
 return {
 '--bg':t.background,'--bg-rgb':rgb(t.background),'--bg-2':t.surface||(original?'#08122A':`color-mix(in srgb, ${t.accent} 9%, ${t.background})`),
 '--blue':t.accent,'--blue-rgb':rgb(t.accent),'--blue-2':original?'#4D8DFF':t.accent,'--blue-2-rgb':rgb(original?'#4D8DFF':t.accent),
 '--blue-3':original?'#8DB8FF':`color-mix(in srgb, ${t.accent} 50%, white)`,
 '--cta-rgb':rgb(original?'#1C4FE6':t.accent),'--beam':original?'#4D8DFF':t.accent,
 '--grad-cta':original?'linear-gradient(135deg,#1C4FE6 0%,#2A66FF 100%)':`linear-gradient(135deg,color-mix(in srgb,${t.accent} 80%,black),${t.accent})`,
 '--glow-color':t.glow||t.accent,'--cyan':t.secondaryGlow||(original?'#1AA6F0':t.accent),
 '--aurora-opacity':String((t.glowStrength??35)/100),
 '--glow-rad':`radial-gradient(circle,${(t.glow||t.accent).slice(0,7)}40 0%,transparent 70%)`,
 '--text':t.text||'#FFFFFF','--text-2':t.mutedText||'#B4BDD0','--text-3':t.mutedText||'#8590A8',
 '--card-solid':`color-mix(in srgb,${t.background} 94%,white)`
 };
}
export function linkVariables(l:BioLink):Record<string,string>{
 const c=l.colors||{},v:Record<string,string>={};
 const mapping={iconBackground:'--link-icon-bg',iconColor:'--link-icon-color',title:'--link-title',description:'--link-description',border:'--link-border',hoverBackground:'--link-hover-bg',hoverBorder:'--link-hover-border'} as const;
 for(const [key,variable] of Object.entries(mapping))if(c[key as keyof LinkColors])v[variable]=c[key as keyof LinkColors]!;
 if(c.background||c.backgroundEnd){const start=c.background||(l.featured?'var(--blue)':'var(--bg-2)');v['--link-bg']=c.backgroundEnd?`linear-gradient(135deg,${start},${c.backgroundEnd})`:start;}
 return v;
}
export function linkAttributes(l:BioLink){const c=l.colors||{};return {'data-link-bg':c.background||c.backgroundEnd?'true':undefined,'data-link-border':c.border?'true':undefined,'data-icon-bg':c.iconBackground?'true':undefined,'data-icon-color':c.iconColor?'true':undefined,'data-title-color':c.title?'true':undefined,'data-description-color':c.description?'true':undefined,'data-hover-bg':c.hoverBackground?'true':undefined,'data-hover-border':c.hoverBorder?'true':undefined};}
export function linkColorFallback(l:BioLink,key:keyof LinkColors,theme:BioConfig['theme']):string{
 const iconColors:Record<string,string>={telegram:'#29A9EA',instagram:'#E6683C',youtube:'#FF0033',app:'#00DC99',whatsapp:'#25D366'};
 const colors:Record<keyof LinkColors,string>={background:l.featured?theme.accent:'#0E1421',backgroundEnd:theme.accent,iconBackground:l.featured?'#FFFFFF29':(iconColors[l.icon]||theme.accent)+'24',iconColor:l.featured?'#FFFFFF':iconColors[l.icon]||theme.accent,title:'#FFFFFF',description:l.featured?'#FFFFFF':'#8590A8',border:l.featured?'#FFFFFF24':l.icon==='app'?'#00DC994D':'#FFFFFF14',hoverBackground:l.featured?theme.accent:'#141925',hoverBorder:theme.accent};
 return l.colors?.[key]||colors[key];
}
