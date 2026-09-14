// Wait for the destination to be visible and stable before starting its demonstration.
// The caller owns scrolling; cancellation also prevents stale work after route changes.
export function afterScrollSettles({ measure, viewportHeight, onReady, frame = requestAnimationFrame, cancelFrame = cancelAnimationFrame, maxDuration = 1600 }) {
  let id;
  let cancelled = false;
  let started;
  let previous;
  let stable = 0;
  function tick(now) {
    if (cancelled) return;
    started ??= now;
    const rect = measure();
    if (!rect) return;
    const visible = rect.top >= 0 && rect.top < viewportHeight() * .55;
    stable = visible && previous !== undefined && Math.abs(rect.top - previous) < .5 ? stable + 1 : 0;
    previous = rect.top;
    if (stable >= 3 && now - started >= 120) { onReady(); return; }
    // A user may have interrupted scrolling. Do not start an off-screen request.
    if (now - started >= maxDuration) return;
    id = frame(tick);
  }
  id = frame(tick);
  return () => { cancelled = true; cancelFrame(id); };
}
