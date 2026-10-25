import type { BioLink,LinkEffect } from './config';

export const linkEffectOptions:{id:LinkEffect;title:string;description:string}[]=[
 {id:'pulse',title:'Pulsar',description:'O botão cresce e volta suavemente, com um contorno pulsante.'},
 {id:'shimmer',title:'Shimmer',description:'Uma luz suave atravessa o botão devagar, com uma pausa entre passadas.'},
 {id:'float',title:'Ícone flutuante',description:'O ícone sobe e desce devagar.'},
 {id:'glow',title:'Brilho na borda',description:'A borda ganha um brilho que acende e suaviza.'}
];
export function linkEffectAttributes(link:BioLink){return {'data-link-effects':link.effects?.length?link.effects.join(' '):undefined};}
