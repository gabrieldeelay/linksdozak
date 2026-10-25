'use client';
import { useEffect,useRef,useState,useId,type PointerEvent as ReactPointerEvent } from 'react';
import { Crop,Move,RotateCcw,X,ZoomIn,Check,Loader2 } from 'lucide-react';
import { cropRect } from '@/lib/crop';
type Props={src:string;label:string;aspect:number;circle?:boolean;onCancel:()=>void;onApply:(image:string)=>void};
export default function ImageCropDialog({src,label,aspect:initialAspect,circle=false,onCancel,onApply}:Props){
 const dialog=useRef<HTMLDialogElement>(null),frame=useRef<HTMLDivElement>(null),image=useRef<HTMLImageElement>(null);
 const [size,setSize]=useState({width:0,height:0}),[aspect,setAspect]=useState(initialAspect),[zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0}),[error,setError]=useState(''),[applying,setApplying]=useState(false);
 const drag=useRef<{id:number;x:number;y:number;panX:number;panY:number;rangeX:number;rangeY:number}|null>(null);
 const id=useId();
 useEffect(()=>{const node=dialog.current!;node.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{node.close();document.body.style.overflow=previous;};},[]);
 const ready=size.width>0&&size.height>0;
 const rect=ready?cropRect(size.width,size.height,aspect,zoom,pan.x,pan.y):null;
 function reset(){setZoom(1);setPan({x:0,y:0});}
 function pointerDown(e:ReactPointerEvent<HTMLDivElement>){if(!rect||!frame.current||e.button!==0)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);const bounds=frame.current.getBoundingClientRect();drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,panX:pan.x,panY:pan.y,rangeX:(size.width-rect.width)/rect.width*bounds.width/2,rangeY:(size.height-rect.height)/rect.height*bounds.height/2};}
 function pointerMove(e:ReactPointerEvent<HTMLDivElement>){const d=drag.current;if(!d||d.id!==e.pointerId)return;const clamp=(v:number)=>Math.max(-1,Math.min(1,v));setPan({x:d.rangeX>0?clamp(d.panX+(e.clientX-d.x)/d.rangeX):0,y:d.rangeY>0?clamp(d.panY+(e.clientY-d.y)/d.rangeY):0});}
 function apply(){if(!rect||!image.current)return;setApplying(true);setError('');try{
 const limit=circle?600:1600;const scale=Math.min(1,limit/Math.max(rect.width,rect.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(rect.width*scale));canvas.height=Math.max(1,Math.round(rect.height*scale));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas indisponível');ctx.imageSmoothingQuality='high';ctx.drawImage(image.current,rect.x,rect.y,rect.width,rect.height,0,0,canvas.width,canvas.height);const result=canvas.toDataURL('image/webp',.86);if(result.length>1800000){setError('O recorte ficou muito grande. Aumente um pouco o zoom ou escolha uma imagem menor.');return;}onApply(result);
 }catch{setError('Este endereço não permite recortar a imagem. Baixe a foto e envie o arquivo pelo botão Trocar imagem.');}finally{setApplying(false);}}
 const options=circle?[{value:1,label:'1:1 · Perfil'}]:[{value:1,label:'1:1'},{value:16/9,label:'16:9'},{value:4/5,label:'4:5'},{value:9/16,label:'9:16'},...(ready?[{value:size.width/size.height,label:'Original'}]:[])];
 return <dialog className="crop-dialog" ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-help`} onCancel={e=>{e.preventDefault();onCancel();}}>
 <div className="crop-header"><div><span className="crop-eyebrow"><Crop size={13}/>AJUSTAR IMAGEM</span><h2 id={`${id}-title`}>{label}</h2></div><button className="icon-button" type="button" aria-label="Cancelar recorte" onClick={onCancel}><X size={21}/></button></div>
 <p id={`${id}-help`} className="crop-help"><Move size={15}/>Arraste para enquadrar. Use o zoom para aproximar.</p>
 <div className="crop-workspace"><div ref={frame} className={`crop-frame ${circle?'circle-guide':''}`} style={{aspectRatio:aspect,maxWidth:`min(100%, ${Math.round(300*aspect)}px)`}} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}>
 <img ref={image} src={src} crossOrigin={src.startsWith('https:')?'anonymous':undefined} alt={`Recorte de ${label}`} draggable={false} onLoad={e=>{const img=e.currentTarget;if(img.naturalWidth*img.naturalHeight>60000000){setError('Imagem muito grande. Escolha uma foto com até 60 megapixels.');return;}setSize({width:img.naturalWidth,height:img.naturalHeight});}} onError={()=>setError('Não foi possível abrir a imagem para recorte. Envie o arquivo PNG, JPG ou WebP.')} style={rect?{width:`${size.width/rect.width*100}%`,height:`${size.height/rect.height*100}%`,left:`${-rect.x/rect.width*100}%`,top:`${-rect.y/rect.height*100}%`}:{opacity:0}}/>
 {!ready&&!error&&<Loader2 className="spin crop-loader" size={24}/>}
 <div className="crop-grid" aria-hidden="true"><i/><i/><i/><i/></div>{circle&&<div className="crop-circle" aria-hidden="true"/>}
 </div></div>
 <div className="crop-controls"><label className="crop-format"><span>Proporção</span><select value={aspect} onChange={e=>{setAspect(Number(e.target.value));reset();}} aria-label="Proporção do recorte">{options.map((option,i)=><option key={i} value={option.value}>{option.label}</option>)}</select></label>
 <label className="crop-slider"><span><ZoomIn size={14}/>Zoom <output>{zoom.toFixed(2)}×</output></span><input type="range" min="1" max="4" step=".01" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label>
 <div className="crop-position"><label className="crop-slider"><span>Posição horizontal</span><input type="range" min="-1" max="1" step=".01" value={pan.x} onChange={e=>setPan(p=>({...p,x:Number(e.target.value)}))}/></label><label className="crop-slider"><span>Posição vertical</span><input type="range" min="-1" max="1" step=".01" value={pan.y} onChange={e=>setPan(p=>({...p,y:Number(e.target.value)}))}/></label></div></div>
 {error&&<p className="crop-error" role="alert">{error}</p>}
 <footer className="crop-footer"><button type="button" className="subtle-button" onClick={reset}><RotateCcw size={14}/>Centralizar</button><div><button type="button" className="crop-cancel" onClick={onCancel}>Cancelar</button><button type="button" className="primary" disabled={!ready||applying} onClick={apply}>{applying?<Loader2 className="spin" size={15}/>:<Check size={15}/>}Aplicar recorte</button></div></footer>
 </dialog>;
}
