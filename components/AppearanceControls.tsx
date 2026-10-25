'use client';
import { Eye,RotateCcw,Palette } from 'lucide-react';
import type { BioConfig,BioLink } from '@/lib/config';
import { themePresets,linkColorFallback,type LinkColors } from '@/lib/appearance';
import ColorControl from './ColorControl';
export function LinkAppearance({link,theme,edit,onPreview}:{link:BioLink;theme:BioConfig['theme'];edit:(v:Partial<BioLink>)=>void;onPreview:()=>void}){
 const fields:{key:keyof LinkColors;label:string;alpha?:boolean}[]=[{key:'iconBackground',label:'Fundo do ícone',alpha:true},{key:'iconColor',label:'Cor do ícone'},{key:'background',label:'Fundo do botão',alpha:true},{key:'backgroundEnd',label:'Segunda cor do degradê',alpha:true},{key:'title',label:'Título'},{key:'description',label:'Descrição'},{key:'border',label:'Borda',alpha:true},{key:'hoverBackground',label:'Fundo ao passar o mouse',alpha:true},{key:'hoverBorder',label:'Borda ao passar o mouse',alpha:true}];
 return <section className="link-appearance"><header><div><Palette size={15}/><h3>Cores deste link</h3></div><button className="subtle-button" onClick={onPreview}><Eye size={13}/>Ver na prévia</button></header><p>O fundo do ícone e o fundo do botão são independentes. Ajuste a opacidade para manter a transparência.</p><div className="link-color-grid">{fields.map(f=><ColorControl key={f.key} label={f.label} value={link.colors?.[f.key]} fallback={linkColorFallback(link,f.key,theme)} alpha={f.alpha} onChange={value=>edit({colors:{...link.colors,[f.key]:value}})}/>)}</div><button className="subtle-button" disabled={!Object.values(link.colors||{}).some(Boolean)} onClick={()=>edit({colors:undefined})}><RotateCcw size={13}/>Restaurar cores automáticas deste link</button></section>;
}
export function ThemeAppearance({theme,onChange}:{theme:BioConfig['theme'];onChange:(value:Partial<BioConfig['theme']>)=>void}){
 return <section className="settings-panel"><h2>Tema completo do site</h2><p className="panel-subtitle">Mude a identidade inteira: luzes de fundo, degradê da capa, aro do perfil, botões e detalhes.</p><div className="theme-presets">{themePresets.map(p=><button key={p.name} aria-pressed={theme.accent===p.accent} onClick={()=>onChange({accent:p.accent,background:p.background,glow:p.glow,secondaryGlow:p.secondaryGlow,surface:undefined,glowStrength:35})}><span style={{background:`radial-gradient(circle at 30% 20%,${p.glow}aa,${p.background} 75%)`,borderColor:p.accent}}/>{p.name}</button>)}</div>
 <ColorControl label="Cor principal do tema" value={theme.accent} fallback="#2D6BFF" onChange={accent=>onChange({accent:accent||'#2D6BFF',glow:undefined,secondaryGlow:undefined,surface:undefined})}/>
 <ColorControl label="Cor base do fundo" value={theme.background} fallback="#050A17" onChange={background=>onChange({background:background||'#050A17'})}/>
 <ColorControl label="Luz principal do fundo" value={theme.glow} fallback={theme.accent} onChange={glow=>onChange({glow})}/>
 <ColorControl label="Luz secundária do fundo" value={theme.secondaryGlow} fallback={theme.accent.toLowerCase()==='#2d6bff'?'#1AA6F0':theme.accent} onChange={secondaryGlow=>onChange({secondaryGlow})}/>
 <label className="theme-strength"><span>Intensidade das luzes <output>{theme.glowStrength??35}%</output></span><input type="range" min="0" max="100" step="1" value={theme.glowStrength??35} onChange={e=>onChange({glowStrength:Number(e.target.value)})}/><small>Use 0% para manter o fundo sem luzes em movimento.</small></label>
 <ColorControl label="Fundo dos blocos de contexto" value={theme.surface} fallback="#08122A" onChange={surface=>onChange({surface})}/>
 <ColorControl label="Texto principal" value={theme.text} fallback="#FFFFFF" onChange={text=>onChange({text})}/>
 <ColorControl label="Texto secundário" value={theme.mutedText} fallback="#B4BDD0" onChange={mutedText=>onChange({mutedText})}/>
 <p className="appearance-note">As cores individuais dos links têm prioridade sobre o tema. Use “Restaurar cores automáticas” no link para voltar a acompanhar o tema.</p>
 </section>;
}
