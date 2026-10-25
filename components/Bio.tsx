'use client';
import { useState,useEffect,useRef,type CSSProperties } from 'react';
import { type BioConfig,type BioLink,configSchema,destination } from '@/lib/config';
import { Icon } from './Icon';
import { themeVariables,linkVariables,linkAttributes } from '@/lib/appearance';
const classes:Record<string,string>={telegram:'tg',instagram:'ig',youtube:'yt',app:'app',whatsapp:'wa'};
export default function Bio({initial,preview=false}:{initial:BioConfig;preview?:boolean}){
 const [config,setConfig]=useState(initial),[copied,setCopied]=useState(false),[search,setSearch]=useState(''),[sticky,setSticky]=useState(false);
 const root=useRef<HTMLDivElement>(null),hero=useRef<HTMLElement>(null),media=useRef<HTMLDivElement>(null),spot=useRef<HTMLDivElement>(null),end=useRef<HTMLElement>(null);
 const c=config;
 useEffect(()=>{
 setSearch(location.search);
 if(preview){let frame=0,highlightTimer:ReturnType<typeof setTimeout>|undefined;let highlighted:Element|null=null;const receive=(e:MessageEvent)=>{if(e.origin!==location.origin||e.source!==parent)return;
 if(e.data?.type==='bio-preview'){const parsed=configSchema.safeParse(e.data.config);if(parsed.success)setConfig(parsed.data);return;}
 if(!['bio-preview-focus','bio-preview-top','bio-preview-links'].includes(e.data?.type))return;
 cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{
 if(e.data.type==='bio-preview-top'){scrollTo({top:0,behavior:'smooth'});return;}
 const target=e.data.type==='bio-preview-links'?root.current?.querySelector('.links'):Array.from(root.current?.querySelectorAll('[data-bio-link]')||[]).find(el=>el.getAttribute('data-bio-link')===e.data.id);
 if(target){target.scrollIntoView({behavior:'smooth',block:'center'});highlighted?.classList.remove('preview-focus');highlighted=target;target.classList.add('preview-focus');clearTimeout(highlightTimer);highlightTimer=setTimeout(()=>target.classList.remove('preview-focus'),1800);}
 });});};addEventListener('message',receive);parent.postMessage({type:'bio-preview-ready'},location.origin);return()=>{removeEventListener('message',receive);cancelAnimationFrame(frame);clearTimeout(highlightTimer);};}
 let running=false;const refresh=async()=>{if(running||document.hidden)return;running=true;try{const res=await fetch('/api/config',{cache:'no-store'});if(res.ok){const {config:next}=await res.json();setConfig(next);}}finally{running=false;}};
 const channel=new BroadcastChannel('bio-updates');channel.onmessage=refresh;const timer=setInterval(()=>void refresh().catch(()=>{}),10000);const visible=()=>void refresh().catch(()=>{});document.addEventListener('visibilitychange',visible);return()=>{clearInterval(timer);channel.close();document.removeEventListener('visibilitychange',visible);};
 },[preview]);
 useEffect(()=>{document.title=`${c.profile.name} — Links`;document.body.style.background=c.theme.background;return()=>{document.body.style.background='';};},[c.profile.name,c.theme.background]);
 useEffect(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||!c.theme.motion;
 const seen=new WeakSet<Element>();
 const io=new IntersectionObserver(entries=>{
   const entering=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
   let scrollIndex=0;
   entering.forEach(entry=>{const el=entry.target as HTMLElement;if(el.classList.contains('scroll-rv'))el.style.setProperty('--scroll-delay',`${Math.min(scrollIndex++,4)*110}ms`);el.classList.add('in');});
   for(const entry of entries){
     // Replay when an element comes back into view, without hiding cards that
     // are still partly visible at the viewport boundary.
     if(!entry.isIntersecting&&(entry.boundingClientRect.bottom<=0||entry.boundingClientRect.top>=innerHeight))entry.target.classList.remove('in');
   }
 },{threshold:.12,rootMargin:'0px 0px -4% 0px'});
 const observe=(node:Element)=>{const elements=[...(node.matches('.rv')?[node]:[]),...node.querySelectorAll('.rv')];for(const el of elements){if(seen.has(el))continue;seen.add(el);if(el.closest('main')||el.matches('footer'))el.classList.add('scroll-rv');io.observe(el);}};
 if(root.current)observe(root.current);
 // Newly enabled links and added sections must animate in the live preview,
 // too; an observer tied only to the link count misses those insertions.
 const additions=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof Element)observe(node);});
 if(root.current)additions.observe(root.current,{childList:true,subtree:true});
 let raf=0;const update=()=>{raf=0;const h=hero.current?.getBoundingClientRect();const e=end.current?.getBoundingClientRect();setSticky(!!h&&h.bottom<0&&(!e||e.top>innerHeight||e.bottom<0));if(media.current&&!reduced&&scrollY<(hero.current?.offsetHeight||0)+40)media.current.style.transform=`translate3d(0,${scrollY*.25}px,0)`;};
 const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);};const mouse=(e:MouseEvent)=>{if(!spot.current||reduced)return;spot.current.style.setProperty('--mx',`${e.clientX}px`);spot.current.style.setProperty('--my',`${e.clientY}px`);spot.current.classList.add('is-on');};
 addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll,{passive:true});if(matchMedia('(hover:hover) and (pointer:fine)').matches)addEventListener('mousemove',mouse,{passive:true});update();return()=>{io.disconnect();additions.disconnect();cancelAnimationFrame(raf);removeEventListener('scroll',scroll);removeEventListener('resize',scroll);removeEventListener('mousemove',mouse);};
 },[c.theme.motion,c.links.length]);
 async function copy(){try{await navigator.clipboard.writeText(c.profile.handle);setCopied(true);setTimeout(()=>setCopied(false),1500);}catch{setCopied(false);}}
 const active=c.links.filter(l=>l.enabled);const closing=active.find(l=>l.id===c.closing.linkId);
 function card(l:BioLink,index:number){return <a key={l.id} className={`card card--${classes[l.icon]||'generic'} ${l.featured?'card--hero':''} rv`} data-bio-link={l.id} {...linkAttributes(l)} style={{'--d':index,...linkVariables(l)} as CSSProperties} href={destination(l,c.theme.passUtm,search)} target="_blank" rel="noopener noreferrer" aria-label={`${l.title} — abre em nova aba`} onClick={e=>{if(preview)e.preventDefault();}}><span className="tile"><Icon name={l.icon} monochrome={!!l.colors?.iconColor}/></span><span className="card__txt"><span className="card__t">{l.title}{l.live&&<i className="live" aria-label="Comunidade ativa"/>}</span><span className="card__s">{l.description}</span></span><span className="card__go"><Icon name="arrow"/></span></a>;}
 const style=themeVariables(c.theme) as CSSProperties;
 return <div ref={root} className={`bio-root js ${c.theme.motion?'':'no-motion'}`} style={style}>
 <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap"/><link rel="stylesheet" href="/bio.css"/>
 <div className="aurora" aria-hidden="true"><i/><i/></div><div className="spot" ref={spot} aria-hidden="true"/>
 <header className="hero" ref={hero}><div className="hero__media" ref={media}><picture><source media="(max-width:719px)" srcSet={c.profile.heroMobile}/><img className="hero__img is-ready" src={c.profile.hero} fetchPriority="high" alt="Foto de capa"/></picture></div><div className="hero__scrim"/><div className="hero__glow"/>
 <img className="hero__mark rv" src={c.profile.logo} width="40" height="40" alt={`Símbolo de ${c.profile.name}`}/>
 <div className="hero__content wrap"><div className="ava rv" style={{'--d':1} as CSSProperties}><span className="ava__halo"/><img src={c.profile.avatar} width="112" height="112" alt={`Retrato de ${c.profile.name}`}/><span className="ava__feixe"/></div>
 {c.profile.badge&&<p className="badge rv" style={{'--d':2} as CSSProperties}><i/>{c.profile.badge}</p>}
 <h1 className="name rv" style={{'--d':3} as CSSProperties}>{c.profile.name}</h1><button className="handle rv" style={{'--d':4} as CSSProperties} onClick={copy} aria-label={`Copiar o perfil ${c.profile.handle}`}><span id="handleTxt">{copied?'copiado ✓':<><b>{c.profile.handle.startsWith('@')?'@':''}</b>{c.profile.handle.replace(/^@/,'')}</>}</span></button><span className="sr" aria-live="polite">{copied?'Perfil copiado':''}</span><p className="bio rv" style={{'--d':5} as CSSProperties}>{c.profile.bio}</p></div></header>
 <main className="wrap stack"><section className="links" aria-label={`Canais de ${c.profile.name}`}>{active.map(card)}</section>
 {c.context.enabled&&<section className="ctx" aria-label="O que você encontra">{c.context.items.map((item,i)=><div key={i} className="ctx__i rv" style={{'--d':i} as CSSProperties}><span className="ctx__ic"><Icon name={item.icon}/></span><div><h2 className="ctx__t">{item.title}</h2><p className="ctx__p">{item.description}</p></div></div>)}</section>}
 {c.closing.enabled&&closing&&<section className="close" ref={end}><h2 className="close__h rv">{c.closing.title}</h2><a className="btn close__b rv" {...linkAttributes(closing)} style={linkVariables(closing) as CSSProperties} href={destination(closing,c.theme.passUtm,search)} target="_blank" rel="noopener noreferrer" onClick={e=>{if(preview)e.preventDefault();}}><Icon name={closing.icon}/>{closing.title}<span className="btn__go"><Icon name="arrow"/></span></a></section>}</main>
 <footer className="foot wrap rv"><div className="foot__id"><img src={c.profile.logo} width="22" height="22" alt=""/><span>{c.profile.name}</span></div><p className="foot__c">{c.footer.copyright}</p><p className="foot__r">{c.footer.disclaimer}</p></footer>
 {c.closing.sticky&&closing&&<div className={`dock ${sticky?'is-on':''}`} inert={!sticky}><a className="btn" {...linkAttributes(closing)} style={linkVariables(closing) as CSSProperties} href={destination(closing,c.theme.passUtm,search)} target="_blank" rel="noopener noreferrer" onClick={e=>{if(preview)e.preventDefault();}}>{closing.title}<span className="btn__go"><Icon name="arrow"/></span></a></div>}
 </div>;
}
