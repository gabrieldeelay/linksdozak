export function previewGeometry(device:'mobile'|'desktop',bounds:{width:number;height:number},zoom:number){
 const width=device==='mobile'?390:1280,height=device==='mobile'?844:900;
 const fit=Math.max(.1,Math.min(1,(bounds.width-16)/width,(bounds.height-16)/height));
 const scale=zoom===0?fit:zoom/100;
 return {width,height,scale};
}
