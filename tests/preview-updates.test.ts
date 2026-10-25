import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { createElement,act } from 'react';
import { defaultConfig } from '../lib/config';

test('prévia mantém todos os cartões após trocar ícone, cores e visibilidade',async()=>{
 const win=new Window({url:'http://localhost:3000',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableIframePageLoading:true}});
 const messages:Record<string,unknown>[]=[],parent={postMessage:(data:Record<string,unknown>)=>messages.push(data)};
 const observers:FakeObserver[]=[];
 class FakeObserver{
   targets=new Set<Element>();
   constructor(private callback:IntersectionObserverCallback){observers.push(this);}
   observe(el:Element){this.targets.add(el);}
   disconnect(){this.targets.clear();}
   unobserve(el:Element){this.targets.delete(el);}
   reveal(){for(const target of this.targets)if(target.isConnected)this.callback([{target,isIntersecting:true,boundingClientRect:{top:100,bottom:180}} as IntersectionObserverEntry],this as unknown as IntersectionObserver);}
 }
 const replacements:Record<string,unknown>={window:win,document:win.document,Element:win.Element,HTMLElement:win.HTMLElement,Node:win.Node,MutationObserver:win.MutationObserver,IntersectionObserver:FakeObserver,location:win.location,parent,innerHeight:844,scrollY:0,matchMedia:win.matchMedia.bind(win),requestAnimationFrame:win.requestAnimationFrame.bind(win),cancelAnimationFrame:win.cancelAnimationFrame.bind(win),addEventListener:win.addEventListener.bind(win),removeEventListener:win.removeEventListener.bind(win),IS_REACT_ACT_ENVIRONMENT:true};
 const previous=new Map(Object.keys(replacements).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 for(const [key,value] of Object.entries(replacements))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
 let unmount:(()=>void)|undefined;
 try{
 const {createRoot}=await import('react-dom/client');const {default:Bio}=await import('../components/Bio');
 const container=win.document.createElement('div');win.document.body.append(container);const root=createRoot(container as unknown as HTMLElement);unmount=()=>root.unmount();
 await act(async()=>root.render(createElement(Bio,{initial:defaultConfig,preview:true})));
 assert.equal(container.querySelectorAll('[data-bio-link]').length,0,'não deve mostrar conteúdo de referência antes da sincronização');
 let config=structuredClone(defaultConfig);config.links.push({...config.links[0],id:'extra',title:'Link adicional',featured:false});
 async function receive(revision:number){await act(async()=>{win.dispatchEvent(new win.MessageEvent('message',{origin:win.location.origin,source:parent as never,data:{type:'bio-preview',revision,config}}));await Promise.resolve();});}
 await receive(1);for(const observer of observers)observer.reveal();
 assert.equal(container.querySelectorAll('[data-bio-link]').length,6);
 const original=container.querySelector('[data-bio-link="app"]')!;
 assert.equal(original.getAttribute('data-revealed'),'true');
 config=structuredClone(config);config.links[2].icon='robot';config.links[2].title='Robô Atlas';config.links[2].colors={iconColor:'#FACC15'};
 await receive(2);
 const changed=container.querySelector('[data-bio-link="app"]')!;
 assert.equal(changed,original,'React mantém o cartão existente');
 assert.ok(changed.className.includes('card--generic'));
 assert.equal(changed.getAttribute('data-revealed'),'true','a troca de classe não pode esconder o cartão');
 assert.equal(changed.getAttribute('data-scroll-reveal'),'true');
 assert.ok(changed.textContent?.includes('Robô Atlas'));
 config=structuredClone(config);config.links[2].enabled=false;await receive(3);assert.equal(container.querySelectorAll('[data-bio-link]').length,5);
 config=structuredClone(config);config.links[2].enabled=true;await receive(4);for(const observer of observers)observer.reveal();
 assert.equal(container.querySelectorAll('[data-bio-link]').length,6);
 assert.equal(container.querySelector('[data-bio-link="app"]')?.getAttribute('data-revealed'),'true');
 assert.ok(messages.some(m=>m.type==='bio-preview-applied'&&m.revision===4&&m.links===6));
 }finally{
 if(unmount)await act(async()=>unmount!());await win.happyDOM.abort();
 for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
 }
});
