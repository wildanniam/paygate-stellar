export const FLOW_PROFILES = Object.freeze({
  hero: { radius: 185, strength: 19, light: 0.12, vertical: 0.8 },
  receipt: { radius: 155, strength: 16, light: 0.10, vertical: 1 },
  weather: { radius: 150, strength: 9, light: 0.07, vertical: 0.65 },
  path: { radius: 190, strength: 8, light: 0.08, vertical: 0.45 },
  access: { radius: 130, strength: 0, light: 0.22, vertical: 1 },
});

export function createFlowPoint() {
  return { x: 0, y: 0, dx: 0, dy: 0, energy: 0 };
}

/** Frame-rate independent relaxation, with a hard displacement limit. */
export function advanceFlow(point, target, seconds) {
  const dt = Math.min(0.05, Math.max(0, seconds));
  const follow = 1 - Math.exp(-13 * dt);
  const lagX = target.x - point.x;
  const lagY = target.y - point.y;
  point.x += lagX * follow;
  point.y += lagY * follow;
  const distance = Math.hypot(lagX, lagY);
  const gain = distance > 0 ? Math.min(distance / 70, 1) / distance : 0;
  point.dx = lagX * gain;
  point.dy = lagY * gain;
  point.energy = Math.max(point.energy * Math.exp(-4.6 * dt), Math.min(distance / 90, 1));
  if (point.energy < 0.001) point.energy = 0;
  return point.energy > 0 || distance > 0.05;
}

/** CSS object-fit and percent object-position, expressed as a source UV transform. */
export function fitMedia(width, height, sourceWidth, sourceHeight, fit = 'cover', position = [0.5, 0.5]) {
  const factor = fit === 'contain' ? Math.min(width / sourceWidth, height / sourceHeight) : Math.max(width / sourceWidth, height / sourceHeight);
  const renderedWidth = sourceWidth * factor;
  const renderedHeight = sourceHeight * factor;
  return {
    scale: [width / renderedWidth, height / renderedHeight],
    offset: [-(width - renderedWidth) * position[0] / renderedWidth, -(height - renderedHeight) * position[1] / renderedHeight],
  };
}

export function flowResolution(width, height, dpr = 1) {
  const ratio = Math.min(dpr, 1.25, 1600 / Math.max(width, height));
  return [Math.max(1, Math.round(width * ratio)), Math.max(1, Math.round(height * ratio))];
}
