'use client';
import type { LinkEffect } from '@/lib/config';
import { linkEffectOptions } from '@/lib/effects';
import { Check,Sparkles,RotateCcw } from 'lucide-react';

export default function LinkEffectControls({value=[],onChange,motion=true}:{value?:LinkEffect[];onChange:(effects:LinkEffect[])=>void;motion?:boolean}){
 function toggle(effect:LinkEffect){
  if(value.includes(effect))onChange(value.filter(item=>item!==effect));
  else if(value.length<2)onChange([...value,effect]);
 }
 return <section className="link-effects-panel" aria-label="Efeitos deste link">
  <header><h3><Sparkles size={18}/>Efeitos do link</h3><span className="effect-count" role="status">{value.length}/2 ativos</span></header>
  <p>Combine até dois efeitos. Todos ficam desligados por padrão. As escolhas aparecem na prévia e são salvas automaticamente.</p>
  <div className="link-effects-grid">{linkEffectOptions.map(effect=>{
   const selected=value.includes(effect.id);
   return <button key={effect.id} type="button" className={`effect-option ${selected?'is-selected':''}`} aria-pressed={selected} disabled={!selected&&value.length>=2} onClick={()=>toggle(effect.id)}>
    <span className="effect-option-title">{effect.title}<span className="effect-check" aria-hidden="true">{selected&&<Check size={14}/>}</span></span><small>{effect.description}</small>
   </button>;
  })}</div>
  {value.length>=2&&<p className="effects-hint" role="status">Dois efeitos ativos. Desative um para escolher outro.</p>}
  {!motion&&<p className="effects-hint">As animações gerais do site estão desligadas. Ative-as para ver estes efeitos em movimento.</p>}
  <button className="subtle-button" type="button" disabled={!value.length} onClick={()=>onChange([])}><RotateCcw size={15}/>Desligar todos os efeitos deste link</button>
 </section>;
}
