'use client';
import { useRef,useState,useEffect,useCallback } from 'react';
import { Smartphone,Monitor,Maximize2,Minimize2,X,RotateCcw,ArrowUp,Link2,ArrowLeft } from 'lucide-react';
import type { BioConfig } from '@/lib/config';
export default function LivePreview({config,focus,visible,onClose}:{config:BioConfig;focus:{id:string;revision:number};visible:boolean;onClose:()=>void}){
 const iframe=useRef<HTMLIFrameElement>(null),stage=useRef<HTMLDivElement>(null);
 const [device,setDevice]=useState<'mobile'|'desktop'>('mobile'),[expanded,setExpanded]=useState(false),[bounds,setBounds]=useState({width:400,height:700}),[zoom,setZoom]=useState(100),[ready,setReady]=useState(false);
 const latest=useRef(config),currentFocus=useRef(focus);latest.current=config;currentFocus.current=focus;
 const send=useCallback((type:string,extra:Record<string,unknown>={})=>{iframe.current?.contentWindow?.postMessage({type,...extra},location.origin);},[]);
 const sync=useCallback(()=>send('bio-preview',{config:latest.current}),[send]);
 useEffect(()=>{const handler=(e:MessageEvent)=>{if(e.origin!==location.origin||e.source!==iframe.current?.contentWindow||e.data?.type!=='bio-preview-ready')return;setReady(true);sync();if(currentFocus.current.id)send('bio-preview-focus',{id:currentFocus.current.id});};addEventListener('message',handler);return()=>removeEventListener('message',handler);},[sync,send]);
 useEffect(()=>{sync();},[config,sync]);
 useEffect(()=>{if(focus.id)send('bio-preview-focus',{id:focus.id});},[focus,send]);
 useEffect(()=>{if(!stage.current)return;const observer=new ResizeObserver(([entry])=>setBounds({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(stage.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!expanded&&!visible)return;const before=document.body.style.overflow;document.body.style.overflow='hidden';const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setExpanded(false);onClose();}};addEventListener('keydown',escape);return()=>{document.body.style.overflow=before;removeEventListener('keydown',escape);};},[expanded,visible,onClose]);
 const width=device==='mobile'?390:1280,fit=Math.min(1,(bounds.width-16)/width),scale=Math.max(.1,fit*zoom/100),height=Math.max(350,(bounds.height-16)/scale);
 const selected=config.links.find(l=>l.id===focus.id);
 return <aside className={`preview-panel live-preview ${expanded?'preview-expanded':''} ${visible?'mobile-open':''}`} aria-label="Prévia ao vivo">
 <header className="preview-header"><span><i/>{ready?'PRÉVIA AO VIVO':'CARREGANDO PRÉVIA'}</span><div className="preview-window-actions"><button className="icon-button preview-expand" aria-label={expanded?'Reduzir prévia':'Ampliar prévia'} onClick={()=>setExpanded(!expanded)}>{expanded?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</button>{(expanded||visible)&&<button className="back-button" onClick={()=>{setExpanded(false);onClose();}} aria-label="Fechar prévia ampliada"><ArrowLeft size={17}/><span>Voltar ao painel</span></button>}</div></header>
 <div className="preview-tools"><div className="device-selector"><button aria-label="Prévia no celular" aria-pressed={device==='mobile'} onClick={()=>{setDevice('mobile');setZoom(100);}}><Smartphone size={16}/>Celular</button><button aria-label="Prévia no computador" aria-pressed={device==='desktop'} onClick={()=>{setDevice('desktop');setZoom(100);}}><Monitor size={16}/>Computador</button></div><label className="preview-zoom"><span>Zoom</span><select value={zoom} onChange={e=>setZoom(Number(e.target.value))} aria-label="Zoom da prévia"><option value={75}>75%</option><option value={100}>Ajustar</option><option value={125}>125%</option><option value={150}>150%</option></select></label></div>
 <div className="preview-navigation"><button onClick={()=>send('bio-preview-top')}><ArrowUp size={13}/>Topo</button><button onClick={()=>send('bio-preview-links')}><Link2 size={13}/>Links</button><button onClick={()=>{setReady(false);iframe.current?.contentWindow?.location.reload();}}><RotateCcw size={13}/>Repetir entrada</button></div>
 <div ref={stage} className={`preview-stage ${device}`}><div className="preview-scaled-space" style={{width:width*scale,height:height*scale}}><div className="preview-device" style={{width,height,transform:`scale(${scale})`,transformOrigin:'top left'}}><iframe ref={iframe} title="Prévia fiel do site público" src="/preview" onLoad={sync}/></div></div></div>
 <p className="preview-caption"><span/>{selected?`Editando: ${selected.title}`:`${width} px · layout real · alterações instantâneas`}</p>
 </aside>;
}
