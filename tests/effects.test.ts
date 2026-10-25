import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement,act,useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Window,type HTMLButtonElement } from 'happy-dom';
import { defaultConfig,linkSchema,type LinkEffect } from '../lib/config';
import { linkEffectAttributes } from '../lib/effects';
import LinkEffects from '../components/LinkEffects';

test('efeitos começam desligados e permitem até dois diferentes por link',()=>{
 const link=linkSchema.parse(defaultConfig.links[0]);
 assert.equal(link.effects,undefined);assert.equal(linkEffectAttributes(link)['data-link-effects'],undefined);
 assert.equal(renderToStaticMarkup(createElement(LinkEffects,{})),'');
 assert.deepEqual(linkSchema.parse({...link,effects:['pulse','shimmer']}).effects,['pulse','shimmer']);
 assert.equal(linkSchema.safeParse({...link,effects:['pulse','shimmer','glow']}).success,false);
 assert.equal(linkSchema.safeParse({...link,effects:['pulse','pulse']}).success,false);
 assert.equal(linkSchema.safeParse({...link,effects:['desconhecido']}).success,false);
 assert.equal(linkEffectAttributes({...link,effects:['pulse','shimmer']})['data-link-effects'],'pulse shimmer');
 const markup=renderToStaticMarkup(createElement(LinkEffects,{effects:['pulse','shimmer']}));
 assert.ok(markup.includes('link-fx--pulse'));assert.ok(markup.includes('link-fx--shimmer'));assert.ok(markup.includes('aria-hidden="true"'));
});

test('painel combina dois efeitos, bloqueia o terceiro e permite trocar ou desligar',async()=>{
 const win=new Window({url:'http://localhost:3000'});
 const replacements:Record<string,unknown>={window:win,document:win.document,HTMLElement:win.HTMLElement,Node:win.Node,IS_REACT_ACT_ENVIRONMENT:true};
 const previous=new Map(Object.keys(replacements).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 for(const [key,value] of Object.entries(replacements))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
 let unmount:(()=>void)|undefined;
 try{
  const {createRoot}=await import('react-dom/client');const {default:Controls}=await import('../components/LinkEffectControls');
  const changes:LinkEffect[][]=[];
  function Harness(){const [value,setValue]=useState<LinkEffect[]>([]);return createElement(Controls,{value,onChange:next=>{changes.push(next);setValue(next);}});}
  const container=win.document.createElement('div');win.document.body.append(container);const root=createRoot(container as unknown as globalThis.HTMLElement);unmount=()=>root.unmount();
  await act(async()=>root.render(createElement(Harness)));
  const option=(text:string)=>[...container.querySelectorAll<HTMLButtonElement>('.effect-option')].find(button=>button.textContent!.startsWith(text))!;
  assert.equal(container.querySelectorAll('[aria-pressed="true"]').length,0);
  await act(async()=>option('Pulsar').click());await act(async()=>option('Shimmer').click());
  assert.deepEqual(changes.at(-1),['pulse','shimmer']);assert.equal(option('Ícone flutuante').disabled,true);
  await act(async()=>option('Ícone flutuante').click());assert.equal(changes.length,2);
  await act(async()=>option('Pulsar').click());assert.equal(option('Ícone flutuante').disabled,false);
  await act(async()=>option('Ícone flutuante').click());assert.deepEqual(changes.at(-1),['shimmer','float']);
  const clear=[...container.querySelectorAll('button')].find(button=>button.textContent!.includes('Desligar todos'))!;
  await act(async()=>clear.click());assert.deepEqual(changes.at(-1),[]);assert.equal(container.querySelectorAll('[aria-pressed="true"]').length,0);
 }finally{
  if(unmount)await act(async()=>unmount!());await win.happyDOM.abort();
  for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
 }
});
