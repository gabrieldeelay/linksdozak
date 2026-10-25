export type CropRect={x:number;y:number;width:number;height:number};
export function cropRect(imageWidth:number,imageHeight:number,aspect:number,zoom:number,panX:number,panY:number):CropRect{
 if(![imageWidth,imageHeight,aspect,zoom,panX,panY].every(Number.isFinite)||imageWidth<=0||imageHeight<=0||aspect<=0||zoom<1)throw new Error('Dimensões de recorte inválidas.');
 const width=Math.min(imageWidth,imageHeight*aspect)/zoom,height=width/aspect;
 const clamp=(v:number)=>Math.max(-1,Math.min(1,v));
 return {x:(imageWidth-width)/2*(1-clamp(panX)),y:(imageHeight-height)/2*(1-clamp(panY)),width,height};
}
