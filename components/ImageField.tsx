'use client';
import { useEffect,useRef,useState } from 'react';
import dynamic from 'next/dynamic';
import { Crop,Upload } from 'lucide-react';
const CropDialog=dynamic(()=>import('./ImageCropDialog'),{ssr:false});
export default function ImageField({label,value,onChange,portrait=false,circle=false,aspect=16/9}:{label:string;value:string;onChange:(s:string)=>void;portrait?:boolean;circle?:boolean;aspect?:number}){
 const [error,setError]=useState(''),[source,setSource]=useState<string|null>(null),[draftUrl,setDraftUrl]=useState(value.startsWith('data:')?'':value);
 const objectUrl=useRef<string|null>(null),fileInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{setDraftUrl(value.startsWith('data:')?'':value);},[value]);
 useEffect(()=>()=>{if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);},[]);
 function close(){setSource(null);if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current=null;}}
 function upload(file?:File){if(!file)return;setError('');if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Escolha PNG, JPG ou WebP.');return;}if(file.size>15*1024*1024){setError('A imagem deve ter até 15 MB.');return;}if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);objectUrl.current=URL.createObjectURL(file);setSource(objectUrl.current);}
 function useUrl(){const url=draftUrl.trim();if(!url)return;try{if(!url.startsWith('/assets/')&&new URL(url).protocol!=='https:')throw new Error();onChange(url);setError('');}catch{setError('Use uma URL HTTPS válida.');}}
 return <div className="image-field"><span className="field-label">{label}</span><div className={`image-upload ${portrait?'portrait':''} ${circle?'round-avatar':''}`}><img src={value} alt={label}/><label><Upload size={16}/><span>Trocar imagem</span><input ref={fileInput} type="file" aria-label={`Enviar ${label}`} accept="image/png,image/jpeg,image/webp" onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/></label></div>
 <div className="image-crop-actions"><button type="button" className="subtle-button" onClick={()=>{setError('');setSource(value);}}><Crop size={14}/>Ajustar enquadramento</button><small>{circle?'1:1 · guia circular':portrait?'1:1 · logotipo':aspect===16/9?'16:9 · capa horizontal':'4:5 · capa para celular'}</small></div>
 {error&&<small className="error" role="alert">{error}</small>}<label className="field"><span>Ou use uma URL HTTPS</span><div className="image-url-input"><input value={draftUrl} onChange={e=>setDraftUrl(e.target.value)} placeholder="https://..." aria-label={`URL de ${label}`}/><button type="button" className="subtle-button" disabled={!draftUrl.trim()||draftUrl===value} onClick={useUrl}>Usar URL</button></div></label>
 {source&&<CropDialog src={source} label={label} aspect={portrait?1:aspect} circle={circle} onCancel={close} onApply={result=>{onChange(result);close();}}/>}</div>;
}
