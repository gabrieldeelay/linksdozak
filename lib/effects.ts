import type { BioLink,LinkEffect } from './config';

export const linkEffectOptions:{id:LinkEffect;title:string;description:string}[]=[
 {id:'pulse',title:'Pulsar',description:'O botão cresce e volta suavemente, com um contorno pulsante.'},
 {id:'shimmer',title:'Shimmer',description:'Uma luz suave atravessa o botão devagar, com uma pausa entre passadas.'},
 {id:'float',title:'Ícone flutuante',description:'O ícone flutua com movimento visível e uma leve inclinação.'},
 {id:'glow',title:'Brilho na borda',description:'Um halo luminoso acende por dentro e por fora da borda.'}
];
export function linkEffectAttributes(link:BioLink){return {'data-link-effects':link.effects?.length?link.effects.join(' '):undefined};}
