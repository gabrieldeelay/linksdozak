import test from 'node:test';
import assert from 'node:assert/strict';
import { previewGeometry } from '../lib/preview';
test('zoom não modifica o viewport nem o recorte da capa',()=>{const base=previewGeometry('mobile',{width:420,height:650},0);for(const zoom of [75,100,125,150]){const next=previewGeometry('mobile',{width:420,height:650},zoom);assert.equal(next.width,base.width);assert.equal(next.height,base.height);assert.equal(next.scale,zoom/100);}});
test('ajustar cabe dentro do espaço disponível sem cortar o dispositivo',()=>{for(const device of ['mobile','desktop'] as const){const size=previewGeometry(device,{width:340,height:550},0);assert.ok(size.width*size.scale<=324);assert.ok(size.height*size.scale<=534);}});
test('ampliar a prévia mantém as dimensões reais de celular e computador',()=>{assert.deepEqual(previewGeometry('mobile',{width:1600,height:1000},0),{width:390,height:844,scale:1});assert.deepEqual(previewGeometry('desktop',{width:1600,height:1000},0),{width:1280,height:900,scale:1});});
