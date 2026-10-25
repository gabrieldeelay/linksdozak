'use client';
import { useState,useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
export default function ColorControl({label,value,fallback,onChange,alpha=false}:{label:string;value?:string;fallback:string;onChange:(value:string|undefined)=>void;alpha?:boolean}){
 const color=value||fallback,[draft,setDraft]=useState(color);
 useEffect(()=>setDraft(color),[color]);
 const opacity=color.length===9?parseInt(color.slice(7),16):255;
 function choose(hex:string){onChange(hex+(alpha&&opacity<255?opacity.toString(16).padStart(2,'0'):''));}
 return <div className="custom-color"><div className="custom-color-main"><span>{label}<small>{value?'Personalizada':'Automática'}</small></span><label className="color-swatch" style={{background:color}}><input type="color" aria-label={label} value={color.slice(0,7)} onChange={e=>choose(e.target.value)}/></label><input className="color-hex" aria-label={`Código de ${label}`} value={draft} maxLength={alpha?9:7} onChange={e=>{const s=e.target.value;setDraft(s);if((alpha?/^#[0-9a-f]{6}([0-9a-f]{2})?$/i:/^#[0-9a-f]{6}$/i).test(s))onChange(s);}} onBlur={()=>setDraft(color)}/><button className="icon-button" title="Restaurar cor automática" aria-label={`Restaurar ${label}`} disabled={!value} onClick={()=>onChange(undefined)}><RotateCcw size={13}/></button></div>{alpha&&<label className="color-opacity"><span>Opacidade</span><input type="range" aria-label={`Opacidade de ${label}`} min="0" max="100" value={Math.round(opacity/255*100)} onChange={e=>onChange(color.slice(0,7)+Math.round(Number(e.target.value)/100*255).toString(16).padStart(2,'0'))}/><output>{Math.round(opacity/255*100)}%</output></label>}</div>;
}
