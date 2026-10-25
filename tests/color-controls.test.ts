import test from 'node:test';
import assert from 'node:assert/strict';
import { Window,type HTMLButtonElement,type HTMLElement,type HTMLInputElement } from 'happy-dom';
import { createElement,act } from 'react';
import { defaultConfig,type BioLink } from '../lib/config';
import type { LinkColors } from '../lib/appearance';

test('restaurar uma cor atualiza a prévia sem apagar as demais e permite cancelar/aplicar',async()=>{
 const win=new Window({url:'http://localhost:3000',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 const replacements:Record<string,unknown>={window:win,document:win.document,HTMLElement:win.HTMLElement,Node:win.Node,IS_REACT_ACT_ENVIRONMENT:true};
 const previous=new Map(Object.keys(replacements).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 for(const [key,value] of Object.entries(replacements))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
 let unmount:(()=>void)|undefined;
 try{
  const {createRoot}=await import('react-dom/client');const {LinkAppearance}=await import('../components/AppearanceControls');
  const container=win.document.createElement('div');win.document.body.append(container);const root=createRoot(container as unknown as globalThis.HTMLElement);unmount=()=>root.unmount();
  const link:BioLink={...defaultConfig.links[2],icon:'robot',colors:{iconBackground:'#FF000080',iconColor:'#EC4899',border:'#EC4899'}};
  let draft:LinkColors|null=null,applied:Partial<BioLink>|null=null;
  await act(async()=>root.render(createElement(LinkAppearance,{link,theme:{...defaultConfig.theme,accent:'#F97316'},onPreview:()=>{},onBack:()=>{},onDraft:(colors)=>{draft=colors;},edit:(next)=>{applied=next;}})));
  const reset=()=>container.querySelector<HTMLButtonElement>('[aria-label="Restaurar padrão de Fundo do ícone"]')!;
  assert.ok(reset());assert.equal(reset().disabled,false);
  await act(async()=>reset().click());
  assert.equal(draft!.iconBackground,undefined);assert.equal(draft!.iconColor,'#EC4899');assert.equal(draft!.border,'#EC4899');assert.equal(applied,null);
  assert.equal(reset().disabled,true);
  const sample=container.querySelector<HTMLElement>('[aria-label="Escolher Fundo do ícone"] i')!;
  assert.ok(sample.getAttribute('style')?.includes('249, 115, 22')||sample.getAttribute('style')?.includes('249,115,22'));
  const cancel=[...container.querySelectorAll('button')].find(b=>b.textContent==='Cancelar')!;
  await act(async()=>cancel.click());assert.equal(draft,null);assert.equal(reset().disabled,false);
  await act(async()=>reset().click());
  const apply=[...container.querySelectorAll('button')].find(b=>b.textContent?.includes('Aplicar cores'))!;
  await act(async()=>apply.click());assert.deepEqual(applied,{colors:{iconColor:'#EC4899',border:'#EC4899'}});
 }finally{
  if(unmount)await act(async()=>unmount!());await win.happyDOM.abort();
  for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
 }
});

test('seletor mostra a intensidade salva e escolhe novas cores sólidas, com opção de restaurar padrão',async()=>{
 const win=new Window({url:'http://localhost:3000'});
 const replacements:Record<string,unknown>={window:win,document:win.document,HTMLElement:win.HTMLElement,Node:win.Node,IS_REACT_ACT_ENVIRONMENT:true};
 const previous=new Map(Object.keys(replacements).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 for(const [key,value] of Object.entries(replacements))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
 let unmount:(()=>void)|undefined;
 try{
  const {createRoot}=await import('react-dom/client');const {default:ColorControl}=await import('../components/ColorControl');
  const container=win.document.createElement('div');win.document.body.append(container);const root=createRoot(container as unknown as globalThis.HTMLElement);unmount=()=>root.unmount();
  const changes:(string|undefined)[]=[];
  await act(async()=>root.render(createElement(ColorControl,{label:'Fundo do ícone',value:'#FFFFFF09',fallback:'#F9731624',alpha:true,onChange:(value)=>changes.push(value)})));
  await act(async()=>container.querySelector<HTMLButtonElement>('[aria-label="Escolher Fundo do ícone"]')!.click());
  assert.ok(container.querySelector('dialog[open]'));
  assert.equal(container.querySelector<HTMLInputElement>('input[type=range]')!.value,'4');
  assert.ok(container.querySelector('.color-transparency-note')?.textContent?.includes('4%'));
  await act(async()=>container.querySelector<HTMLButtonElement>('[aria-label="Cor #FFFFFF"]')!.click());
  assert.equal(container.querySelector<HTMLInputElement>('input[type=range]')!.value,'100');
  assert.equal(container.querySelector('.color-transparency-note'),null);
  assert.equal(changes.length,0,'a paleta ainda não aplica a alteração');
  await act(async()=>container.querySelector<HTMLButtonElement>('[aria-label="Cor #14B8A6"]')!.click());
  const choose=[...container.querySelectorAll<HTMLButtonElement>('dialog button')].find(b=>b.textContent?.includes('Usar esta cor'))!;
  await act(async()=>choose.click());assert.equal(changes[0],'#14B8A6');
  await act(async()=>container.querySelector<HTMLButtonElement>('[aria-label="Escolher Fundo do ícone"]')!.click());
  const solid=[...container.querySelectorAll<HTMLButtonElement>('dialog button')].find(b=>b.textContent==='Deixar cor sólida')!;
  await act(async()=>solid.click());
  assert.equal(container.querySelector<HTMLInputElement>('input[type=range]')!.value,'100');
  assert.equal(changes.length,1,'o atalho também mantém a alteração como rascunho');
  await act(async()=>container.querySelector<HTMLButtonElement>('dialog .restore-color')!.click());
  assert.equal(changes.length,2);assert.equal(changes[1],undefined);assert.equal(container.querySelector('dialog'),null);
 }finally{
  if(unmount)await act(async()=>unmount!());await win.happyDOM.abort();
  for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
 }
});
