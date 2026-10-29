import { cache } from 'react';
import { unstable_cache,revalidateTag } from 'next/cache';
import { readConfig } from './store';

export const publicConfigTag='bio-public-config';
const cached=unstable_cache(async()=>{
 const snapshot=await readConfig();
 return {...snapshot,config:{...snapshot.config,links:snapshot.config.links.filter(link=>link.enabled)}};
},['bio-public-config-v1'],{tags:[publicConfigTag],revalidate:86400});

// Share metadata/page reads, then reuse the last successful configuration across
// visitors. Local development keeps direct reads for editing and HTTP tests.
export const readPublicConfig=cache(async()=>process.env.VERCEL?cached():readConfig().then(snapshot=>({...snapshot,config:{...snapshot.config,links:snapshot.config.links.filter(link=>link.enabled)}})));
export function invalidatePublicConfig(){revalidateTag(publicConfigTag,{expire:0});}
