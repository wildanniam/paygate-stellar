import test from 'node:test';
import assert from 'node:assert/strict';
import { afterScrollSettles } from './afterScrollSettles.js';
function harness() {
  let queued, calls = 0, top = 1000;
  const stop = afterScrollSettles({measure:()=>({top}),viewportHeight:()=>800,onReady:()=>calls++,frame:cb=>{queued=cb;return 1;},cancelFrame:()=>{queued=null;}});
  return { stop, move(value){top=value;}, tick(now){const cb=queued;queued=null;cb?.(now);}, get calls(){return calls;} };
}
test('does not advance until the visible demo has stopped scrolling',()=>{
  const h=harness();h.tick(0);h.move(350);h.tick(100);h.move(120);h.tick(200);assert.equal(h.calls,0);
  h.tick(220);h.tick(240);h.tick(260);assert.equal(h.calls,1);h.tick(300);assert.equal(h.calls,1);
});
test('interrupted or cancelled navigation cannot start a hidden demo',()=>{
  const h=harness();h.tick(0);h.tick(1700);assert.equal(h.calls,0);
  const cancelled=harness();cancelled.move(100);cancelled.tick(0);cancelled.stop();cancelled.tick(200);assert.equal(cancelled.calls,0);
});
