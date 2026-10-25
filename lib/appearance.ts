import type { BioConfig,BioLink } from './config';
export type LinkColors=NonNullable<BioLink['colors']>;
export type LinkColorKey=Exclude<keyof LinkColors,'gradientEnabled'>;
export const themePresets=[
 {name:'Azul',accent:'#2D6BFF',background:'#050A17',glow:'#2D6BFF',secondaryGlow:'#1AA6F0'},
 {name:'Roxo',accent:'#854DFF',background:'#0D071A',glow:'#854DFF',secondaryGlow:'#D149D9'},
 {name:'Verde',accent:'#0C9A68',background:'#040F0D',glow:'#00C28B',secondaryGlow:'#0FA9A2'},
 {name:'Dourado',accent:'#B37C1B',background:'#110D05',glow:'#DFAE45',secondaryGlow:'#CF7F29'},
 {name:'Rosa',accent:'#C82D82',background:'#160813',glow:'#EC4899',secondaryGlow:'#A855F7'},
 {name:'Vermelho',accent:'#CC3247',background:'#16070B',glow:'#F04455',secondaryGlow:'#E87935'}
];
export function rgb(hex:string){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');}
export function themeSurface(t:BioConfig['theme']):string{
 if(t.surface)return t.surface;
 if(t.accent.toLowerCase()==='#2d6bff')return '#08122A';
 return '#'+[1,3,5].map(i=>Math.round(parseInt(t.accent.slice(i,i+2),16)*.09+parseInt(t.background.slice(i,i+2),16)*.91).toString(16).padStart(2,'0')).join('');
}
export function themeVariables(t:BioConfig['theme']):Record<string,string>{
 const original=t.accent.toLowerCase()==='#2d6bff';
 return {
 '--bg':t.background,'--bg-rgb':rgb(t.background),'--bg-2':themeSurface(t),
 '--blue':t.accent,'--blue-rgb':rgb(t.accent),'--blue-2':original?'#4D8DFF':t.accent,'--blue-2-rgb':rgb(original?'#4D8DFF':t.accent),
 '--blue-3':original?'#8DB8FF':`color-mix(in srgb, ${t.accent} 50%, white)`,
 '--line-p':`rgba(${rgb(t.accent)},.45)`,'--glow-p':`0 8px 32px rgba(${rgb(t.accent)},.18)`,'--glow-cta':`0 12px 40px rgba(${rgb(t.accent)},.35)`,
 '--cta-rgb':rgb(original?'#1C4FE6':t.accent),'--beam':original?'#4D8DFF':t.accent,
 '--grad-cta':original?'linear-gradient(135deg,#1C4FE6 0%,#2A66FF 100%)':`linear-gradient(135deg,color-mix(in srgb,${t.accent} 80%,black),${t.accent})`,
 '--glow-color':t.glow||t.accent,'--cyan':t.secondaryGlow||(original?'#1AA6F0':t.accent),
 '--aurora-opacity':String(t.backgroundGradientEnabled===false?0:(t.glowStrength??35)/100),
 '--background-effects':t.backgroundGradientEnabled===false?'none':'block',
 '--glow-rad':t.backgroundGradientEnabled===false?'none':`radial-gradient(circle,${(t.glow||t.accent).slice(0,7)}40 0%,transparent 70%)`,
 '--text':t.text||'#FFFFFF','--text-2':t.mutedText||'#B4BDD0','--text-3':t.mutedText||'#8590A8',
 '--card-solid':`color-mix(in srgb,${t.background} 94%,white)`
 };
}
export function linkVariables(l:BioLink,theme?:BioConfig['theme']):Record<string,string>{
 const c=l.colors||{},v:Record<string,string>={};
 if(theme){const defaults=linkDefaultColors(l,theme);v['--link-auto-icon-bg']=defaults.iconBackground;v['--link-auto-icon-color']=defaults.iconColor;}
 const mapping={iconBackground:'--link-icon-bg',iconColor:'--link-icon-color',title:'--link-title',description:'--link-description',border:'--link-border',hoverBackground:'--link-hover-bg',hoverBorder:'--link-hover-border'} as const;
 for(const [key,variable] of Object.entries(mapping))if(c[key as LinkColorKey])v[variable]=c[key as LinkColorKey]!;
 if(c.background||c.backgroundEnd||c.gradientEnabled!==undefined){
  const start=c.background||(l.featured?'var(--blue)':'var(--bg-2)');
  v['--link-bg']=theme?linkColorSample(l,'background',theme):isLinkGradientEnabled(l)?`linear-gradient(135deg,${start},${c.backgroundEnd||'var(--blue)'})`:c.background||(l.featured?'var(--blue)':'var(--card)');
 }
 return v;
}
export function linkAttributes(l:BioLink){const c=l.colors||{};return {'data-link-bg':c.background||c.backgroundEnd||c.gradientEnabled!==undefined?'true':undefined,'data-link-border':c.border?'true':undefined,'data-icon-bg':c.iconBackground?'true':undefined,'data-icon-color':c.iconColor?'true':undefined,'data-title-color':c.title?'true':undefined,'data-description-color':c.description?'true':undefined,'data-hover-bg':c.hoverBackground?'true':undefined,'data-hover-border':c.hoverBorder?'true':undefined};}
export function linkDefaultColors(l:BioLink,theme:BioConfig['theme']):Record<LinkColorKey,string>{
 const t=themeVariables(theme),generic=theme.accent.toLowerCase()==='#2d6bff'?'#8DB8FF':mixWithWhite(theme.accent,.5);
 const icons:Record<string,[string,string]>={telegram:['rgba(41,169,234,.14)','#29A9EA'],instagram:['rgba(220,39,67,.14)','#E6683C'],youtube:['rgba(255,0,51,.14)','#FF0033'],app:['rgba(0,220,153,.10)','#00DC99'],whatsapp:['#25D36620','#25D366']};
 const [iconBackground,iconColor]=icons[l.icon]||[`rgba(${rgb(theme.accent)},.14)`,generic];
 return {iconBackground,iconColor,background:l.featured?t['--grad-cta']:'rgba(255,255,255,.035)',backgroundEnd:theme.accent,title:l.featured?'#FFFFFF':theme.text||'#FFFFFF',description:l.featured?'#FFFFFF':theme.mutedText||'#8590A8',border:l.icon==='app'?'rgba(0,220,153,.30)':l.featured?'rgba(255,255,255,.14)':'rgba(255,255,255,.08)',hoverBackground:l.featured?t['--grad-cta']:l.icon==='instagram'?t['--card-solid']:'rgba(255,255,255,.06)',hoverBorder:l.featured?l.icon==='app'?'rgba(0,220,153,.30)':'rgba(255,255,255,.14)':l.icon==='app'?'rgba(0,220,153,.58)':l.icon==='instagram'?'transparent':`rgba(${rgb(theme.accent)},.45)`};
}
function mixWithWhite(hex:string,amount:number){return '#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-amount)+255*amount).toString(16).padStart(2,'0')).join('');}
export function isLinkGradientEnabled(l:BioLink):boolean{return l.colors?.gradientEnabled??!!(l.colors?.backgroundEnd||(!l.colors?.background&&l.featured));}
export function linkGradientStops(l:BioLink,theme:BioConfig['theme']):{start:string;end:string}{
 const original=theme.accent.toLowerCase()==='#2d6bff';
 const featuredStart=original?'#1C4FE6':'#'+[1,3,5].map(i=>Math.round(parseInt(theme.accent.slice(i,i+2),16)*.8).toString(16).padStart(2,'0')).join('');
 return {start:l.colors?.background||(l.colors?.backgroundEnd?(l.featured?theme.accent:themeSurface(theme)):l.featured?featuredStart:'#FFFFFF09'),end:l.colors?.backgroundEnd||(l.featured&&original?'#2A66FF':theme.accent)};
}
export function backgroundGradientSample(theme:BioConfig['theme']):string{
 if(theme.backgroundGradientEnabled===false)return theme.background;
 const t=themeVariables(theme),strength=(theme.glowStrength??35)/100;
 const tint=(color:string)=>`color-mix(in srgb,${color} ${strength*100}%,transparent)`;
 return `radial-gradient(ellipse at 12% 30%,${tint(t['--glow-color'])},transparent 68%),radial-gradient(ellipse at 90% 80%,${tint(t['--cyan'])},transparent 68%),linear-gradient(${theme.background},${theme.background})`;
}
export function linkColorSample(l:BioLink,key:LinkColorKey,theme:BioConfig['theme']):string{
 const colors=l.colors||{},defaults=linkDefaultColors(l,theme);
 if(key==='background'){
  const {start,end}=linkGradientStops(l,theme);
  if(colors.gradientEnabled===false)return colors.background||(l.featured?start:defaults.background);
  if(!colors.background&&!colors.backgroundEnd&&colors.gradientEnabled===undefined)return defaults.background;
  return isLinkGradientEnabled(l)?`linear-gradient(135deg,${start},${end})`:colors.background||defaults.background;
 }
 if(key==='hoverBackground')return colors.hoverBackground||(colors.background||colors.backgroundEnd||colors.gradientEnabled!==undefined?linkColorSample(l,'background',theme):defaults.hoverBackground);
 if(key==='hoverBorder')return colors.hoverBorder||colors.border||defaults.hoverBorder;
 if(key==='iconColor'&&l.icon==='instagram'&&!colors.iconColor)return 'linear-gradient(45deg,#F09433,#E6683C 25%,#DC2743 50%,#CC2366 75%,#BC1888)';
 return colors[key]||defaults[key];
}
// The picker needs a hexadecimal seed; the visible swatch retains the real CSS
// gradient/transparency instead of replacing it with this editable seed.
export function linkColorFallback(l:BioLink,key:LinkColorKey,theme:BioConfig['theme']):string{
 const colors={...l.colors};delete colors[key];
 const value=linkColorSample({...l,colors},key,theme);
 if(value.startsWith('#'))return value;
 const rgba=value.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
 if(rgba)return '#'+rgba.slice(1,4).map(v=>Number(v).toString(16).padStart(2,'0')).join('')+Math.round(Number(rgba[4])*255).toString(16).padStart(2,'0');
 return value==='transparent'?'#00000000':value.match(/#[0-9a-f]{6}/i)?.[0]||theme.accent;
}
export function colorLayers(...layers:string[]):string{
 return layers.map(layer=>/gradient\(/.test(layer)?layer:`linear-gradient(${layer},${layer})`).join(',');
}
