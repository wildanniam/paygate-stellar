export const SHARE_WAVE_MS = 1500;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// A travelling crest with a trough on either side, rather than random equalizer bars.
export function shareWaveScale(x, time, pulses, pointer, presence) {
  let displacement = 0;
  for (const start of pulses) {
    const progress = (time - start) / SHARE_WAVE_MS;
    if (progress <= 0 || progress >= 1) continue;
    const distance = x - (-0.22 + progress * 1.44);
    const envelope = Math.sin(Math.PI * progress) ** 0.55;
    displacement += 0.7 * Math.exp(-((distance / 0.22) ** 2))
      * Math.cos(distance * 14) * envelope;
  }
  const distance = x - pointer;
  displacement += presence * 0.36 * Math.exp(-((distance / 0.27) ** 2))
    * Math.cos(distance * 14 - time / 260);
  return clamp(1 + displacement, 0.54, 1.68);
}

export function easeWave(current, target, elapsed, duration = 150) {
  return current + (target - current) * (1 - Math.exp(-Math.min(elapsed, 64) / duration));
}
