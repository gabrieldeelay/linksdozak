'use client';
import { useRef,type MouseEvent,type PointerEvent } from 'react';

export function useDialogDismiss(onDismiss:()=>void){
 const startedOutside=useRef(false);
 function isBackdrop(e:MouseEvent<HTMLDialogElement>|PointerEvent<HTMLDialogElement>){
  if(e.target!==e.currentTarget)return false;
  const bounds=e.currentTarget.getBoundingClientRect();
  return e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom;
 }
 return {
  onPointerDown:(e:PointerEvent<HTMLDialogElement>)=>{startedOutside.current=e.button===0&&isBackdrop(e);},
  onPointerCancel:()=>{startedOutside.current=false;},
  onClick:(e:MouseEvent<HTMLDialogElement>)=>{
   const dismiss=startedOutside.current&&isBackdrop(e);startedOutside.current=false;
   if(dismiss)onDismiss();
  }
 };
}
