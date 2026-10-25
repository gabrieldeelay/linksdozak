import test from 'node:test';
import assert from 'node:assert/strict';
import { cropRect } from '../lib/crop';
test('recorta foto horizontal para perfil 1:1 sem distorcer',()=>{assert.deepEqual(cropRect(1600,900,1,1,0,0),{x:350,y:0,width:900,height:900});});
test('zoom e pan permanecem dentro da imagem em todas as proporções',()=>{for(const [w,h] of [[1600,900],[800,1800],[500,500]])for(const aspect of [1,16/9,4/5,9/16])for(const zoom of [1,1.5,4])for(const x of [-2,0,2])for(const y of [-2,0,2]){const r=cropRect(w,h,aspect,zoom,x,y);assert.ok(r.x>=0&&r.y>=0);assert.ok(r.x+r.width<=w+1e-8&&r.y+r.height<=h+1e-8);assert.ok(Math.abs(r.width/r.height-aspect)<1e-8);}});
test('arrastar até a direita mostra o lado esquerdo da foto',()=>{const r=cropRect(1600,900,1,2,1,-1);assert.equal(r.x,0);assert.equal(r.y,450);assert.equal(r.width,450);});
test('rejeita entradas inválidas antes de desenhar',()=>{for(const args of [[0,900,1,1,0,0],[900,900,0,1,0,0],[900,900,1,.5,0,0],[Infinity,900,1,1,0,0]])assert.throws(()=>cropRect(...args as [number,number,number,number,number,number]));});
