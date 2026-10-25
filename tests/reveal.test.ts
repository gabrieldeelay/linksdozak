import test from 'node:test';
import assert from 'node:assert/strict';
import { createDominoTimeline } from '../lib/reveal';
test('dominó mantém cada cartão separado mesmo com callbacks em pares',()=>{const q=createDominoTimeline();const starts=[q.reserve(0),q.reserve(0),40+q.reserve(40),40+q.reserve(40),120+q.reserve(120),120+q.reserve(120)];assert.deepEqual(starts,[0,260,520,780,1040,1300]);});
test('depois de uma pausa a sequência começa sem espera acumulada',()=>{const q=createDominoTimeline();q.reserve(0);q.reserve(20);assert.equal(q.reserve(5000),0);assert.equal(q.reserve(5000),260);});
