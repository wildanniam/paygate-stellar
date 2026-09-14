import test from 'node:test';
import assert from 'node:assert/strict';
import { easeWave, shareWaveScale, SHARE_WAVE_MS } from './shareWave.js';

test('a price impulse crosses the entire split and settles exactly to rest', () => {
  const peakAt = time => Array.from({ length: 30 }, (_, i) =>
    shareWaveScale(i / 29, time, [0], 0.5, 0)).reduce((peak, scale, i, scales) =>
    scale > scales[peak] ? i : peak, 0);
  assert.ok(peakAt(400) < 8);
  assert.ok(peakAt(800) > 13 && peakAt(800) < 20);
  assert.ok(peakAt(1250) >= 27, 'the fee bars belong to the same travelling wave');
  for (let i = 0; i < 30; i++) {
    assert.equal(shareWaveScale(i / 29, SHARE_WAVE_MS, [0], 0.5, 0), 1);
    assert.equal(shareWaveScale(i / 29, 0, [], 0.5, 0), 1);
  }
});

test('hover deforms nearby bars much more than distant bars, and moves over time', () => {
  const near = shareWaveScale(0.2, 0, [], 0.2, 1);
  const far = shareWaveScale(1, 0, [], 0.2, 1);
  assert.ok(near > 1.3);
  assert.ok(Math.abs(far - 1) < 0.001);
  assert.ok(shareWaveScale(0.2, 800, [], 0.2, 1) < 0.7);
});

test('overlapping impulses remain finite and inside the reserved visual space', () => {
  for (let time = 0; time <= 2400; time += 16) {
    for (let i = 0; i < 30; i++) {
      const scale = shareWaveScale(i / 29, time, [0, 200, 350], 0.5, 1);
      assert.ok(Number.isFinite(scale) && scale >= 0.54 && scale <= 1.68);
    }
  }
});

test('pointer easing is frame-rate independent and never jumps past its target', () => {
  const at30 = easeWave(0, 1, 1000 / 30);
  const at60 = easeWave(easeWave(0, 1, 1000 / 60), 1, 1000 / 60);
  assert.ok(Math.abs(at30 - at60) < 0.000001);
  assert.ok(easeWave(0.8, 0.1, 5000) > 0.1);
  let presence = 1;
  for (let i = 0; i < 100; i++) presence = easeWave(presence, 0, 16, 220);
  assert.ok(presence < 0.002, 'hover release eventually lets the renderer sleep');
});
