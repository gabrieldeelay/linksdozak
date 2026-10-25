import type { LinkEffect } from '@/lib/config';

export default function LinkEffects({effects=[]}:{effects?:LinkEffect[]}){
 return <>{effects.filter(effect=>effect!=='float').map(effect=><span key={effect} className={`link-fx link-fx--${effect}`} aria-hidden="true"/>)}</>;
}
