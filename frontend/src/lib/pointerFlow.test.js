import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceFlow, createFlowPoint, fitMedia, flowResolution, FLOW_PROFILES } from './pointerFlow.js';

test('a large pointer jump cannot exceed the displacement budget and relaxes to rest', () => {
  const point = createFlowPoint();
  const target = { x: 2000, y: -2000 };
  advanceFlow(point, target, 1 / 60);
  assert.ok(Math.hypot(point.dx, point.dy) <= 1.000001);
  assert.ok(point.energy <= 1);
  for (let i = 0; i < 240; i++) advanceFlow(point, target, 1 / 60);
  assert.ok(Math.hypot(point.x - target.x, point.y - target.y) < 0.01);
  assert.equal(point.energy, 0);
  assert.equal(advanceFlow(point, target, 1 / 60), false);
});

test('relaxation has consistent timing at 30, 60 and 120Hz', () => {
  const positions = [30, 60, 120].map(fps => {
    const point = createFlowPoint();
    for (let i = 0; i < fps / 2; i++) advanceFlow(point, { x: 300, y: 100 }, 1 / fps);
    return point;
  });
  for (const point of positions) {
    assert.ok(Math.abs(point.x - positions[0].x) < 0.00001);
    assert.ok(Math.abs(point.y - positions[0].y) < 0.00001);
  }
});

test('cover cropping and contain letterboxing respect object-position', () => {
  assert.deepEqual(fitMedia(100, 100, 200, 100), { scale: [0.5, 1], offset: [0.25, -0] });
  assert.deepEqual(fitMedia(100, 100, 200, 100, 'cover', [0.7, 0.5]), { scale: [0.5, 1], offset: [0.35, -0] });
  assert.deepEqual(fitMedia(200, 100, 100, 100, 'contain'), { scale: [2, 1], offset: [-0.5, -0] });
});

test('high-density and oversized surfaces stay within the GPU resolution budget', () => {
  assert.deepEqual(flowResolution(1000, 600, 3), [1250, 750]);
  assert.deepEqual(flowResolution(2400, 1600, 2), [1600, 1067]);
  assert.deepEqual(flowResolution(0, 0, 1), [1, 1]);
  assert.equal(FLOW_PROFILES.access.strength, 0);
  assert.ok(FLOW_PROFILES.path.strength < FLOW_PROFILES.receipt.strength);
});
