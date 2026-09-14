import test from 'node:test';
import assert from 'node:assert/strict';
import { mountPointerFlow } from './pointerFlowRenderer.js';
import { FLOW_PROFILES } from './pointerFlow.js';

// Exercise resource ownership and media scheduling without requiring a GPU in CI.
function surface(t, contextAvailable = true) {
  const frames = new Map();
  const videoFrames = new Map();
  const resources = new Set();
  let nextId = 1;
  let uploads = 0;
  let contextLost = false;
  const globals = {
    window: Object.assign(new EventTarget(), { devicePixelRatio: 2 }),
    requestAnimationFrame: callback => { const id = nextId++; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class { observe() {} disconnect() {} },
    getComputedStyle: () => ({ objectFit: 'cover', objectPosition: '50% 50%' }),
  };
  for (const [name, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name]);
  }
  const gl = new Proxy({
    COMPILE_STATUS: 1, LINK_STATUS: 2, NO_ERROR: 0,
    getShaderParameter: () => !contextLost,
    getProgramParameter: () => !contextLost,
    getError: () => 0,
    getShaderInfoLog: () => 'context was lost',
    getExtension: () => ({ loseContext: () => { contextLost = true; } }),
    texImage2D: () => { uploads++; },
  }, { get(target, name) {
    if (name in target) return target[name];
    if (name.startsWith('create')) return () => { const resource = {}; resources.add(resource); return resource; };
    if (name.startsWith('delete')) return resource => resources.delete(resource);
    return () => {};
  } });
  const canvas = Object.assign(new EventTarget(), {
    dataset: {}, clientWidth: 1200, clientHeight: 650, width: 1, height: 1,
    getContext: () => contextAvailable ? gl : null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 650 }),
  });
  const video = {
    readyState: 2, paused: false, error: null, currentTime: 0, currentSrc: '/film.mp4', videoWidth: 1920, videoHeight: 1080,
    requestVideoFrameCallback(callback) { const id = nextId++; videoFrames.set(id, callback); return id; },
    cancelVideoFrameCallback: id => videoFrames.delete(id),
  };
  const mediaHost = Object.assign(new EventTarget(), { querySelector: selector => selector === 'video' ? video : null });
  const eventHost = new EventTarget();
  function tick() {
    const pending = [...frames]; frames.clear();
    pending.forEach(([, callback]) => callback(16));
  }
  return { canvas, mediaHost, eventHost, frames, videoFrames, resources, tick, uploads: () => uploads };
}

test('StrictMode setup-cleanup-setup reuses the canvas and releases every callback/resource', t => {
  const s = surface(t);
  const mount = () => mountPointerFlow(s.canvas, s.mediaHost, s.eventHost, FLOW_PROFILES.hero);
  const first = mount();
  s.tick();
  assert.equal(s.canvas.dataset.flowState, 'ready');
  assert.equal(s.uploads(), 1);
  assert.equal(s.frames.size, 0, 'idle video waits for a fresh decoded frame');
  assert.equal(s.videoFrames.size, 1);
  first();
  assert.equal(s.resources.size, 0);
  assert.equal(s.videoFrames.size, 0);
  assert.equal(s.frames.size, 0);

  const second = mount();
  s.tick();
  assert.equal(s.canvas.dataset.flowState, 'ready', 'effect replay must not lose the shared canvas context');
  const [[id, fresh]] = s.videoFrames;
  s.videoFrames.delete(id);
  fresh();
  s.tick();
  assert.equal(s.uploads(), 3, 'only initial renders and a fresh video frame upload textures');
  second();
  s.eventHost.dispatchEvent(new Event('pointerleave'));
  globalThis.window.dispatchEvent(new Event('resize'));
  assert.equal(s.resources.size, 0);
  assert.equal(s.frames.size, 0);
  assert.equal(s.videoFrames.size, 0);
});

test('unavailable WebGL leaves a transparent fallback without scheduling frames', t => {
  const s = surface(t, false);
  const dispose = mountPointerFlow(s.canvas, s.mediaHost, s.eventHost, FLOW_PROFILES.hero);
  assert.equal(s.canvas.dataset.flowState, 'fallback');
  assert.equal(s.canvas.dataset.flowReason, 'context-unavailable');
  assert.equal(s.frames.size, 0);
  assert.doesNotThrow(dispose);
});
