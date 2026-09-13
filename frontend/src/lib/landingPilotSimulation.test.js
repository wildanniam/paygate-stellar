import test from 'node:test';
import assert from 'node:assert/strict';
import { createLandingPilotSimulation } from './landingPilotSimulation.js';

function harness() {
  let now = 0;
  let next = 0;
  const queue = new Map();
  const states = [];
  const clock = {
    setTimeout(fn, delay) { const id = ++next; queue.set(id, { at: now + delay, fn }); return id; },
    clearTimeout(id) { queue.delete(id); },
  };
  const simulation = createLandingPilotSimulation((state) => states.push(state), clock);
  return { simulation, states, queue, advance(ms) {
    const until = now + ms;
    while (true) {
      const scheduled = [...queue].filter(([, entry]) => entry.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!scheduled) break;
      const [id, entry] = scheduled;
      queue.delete(id); now = entry.at; entry.fn();
    }
    now = until;
  } };
}

test('request waits at 402; duplicate input cannot credit twice; credit precedes delivery', () => {
  const { simulation: s, states, advance } = harness();
  s.pay(); assert.equal(s.state.step, 'idle');
  s.request(); s.request(); advance(10000);
  assert.equal(s.state.step, 'required'); assert.equal(s.state.credited, false);
  s.pay(); s.pay(); advance(600);
  assert.equal(s.state.step, 'credited'); assert.equal(s.state.credited, true);
  advance(300); assert.equal(s.state.step, 'forwarding');
  advance(2200); assert.equal(s.state.step, 'complete');
  assert.deepEqual(states.map((x) => x.step), ['requesting', 'required', 'verifying', 'credited', 'forwarding', 'complete']);
  s.pay(); s.request(); advance(20000);
  assert.equal(states.length, 6);
});

test('reset during verification invalidates even an already queued callback', () => {
  const h = harness(); const s = h.simulation;
  s.request(); h.advance(300); s.pay();
  const lateVerification = [...h.queue.values()][0].fn;
  s.reset(); lateVerification(); h.advance(10000);
  assert.deepEqual(s.state, { run: 1, step: 'idle', credited: false });
  s.request(); h.advance(300); s.pay(); h.advance(3100);
  assert.equal(s.state.step, 'complete');
  assert.equal(h.states.filter((state) => state.step === 'credited').length, 1);
});

test('reset after credit does not permit old forwarding or response to reach a new sample', () => {
  const h = harness(); const s = h.simulation;
  s.request(); h.advance(300); s.pay(); h.advance(600);
  const lateCallbacks = [...h.queue.values()].map((item) => item.fn);
  s.reset(); s.request(); lateCallbacks.forEach((fn) => fn()); h.advance(300);
  assert.deepEqual(s.state, { run: 1, step: 'required', credited: false });
});

test('dispose cancels callbacks and ignores later input', () => {
  const h = harness(); const s = h.simulation;
  s.request(); const late = [...h.queue.values()][0].fn; s.dispose();
  late(); s.pay(); s.reset(); h.advance(20000);
  assert.deepEqual(h.states.map((state) => state.step), ['requesting']);
  assert.equal(h.queue.size, 0);
});
