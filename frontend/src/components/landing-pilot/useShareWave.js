import { useEffect, useRef } from 'react';
import { easeWave, shareWaveScale, SHARE_WAVE_MS } from '../../lib/shareWave.js';

export default function useShareWave(motion, value) {
  const cardRef = useRef(null);
  const graphicRef = useRef(null);
  const playRef = useRef(null);
  const previousValue = useRef(value);

  useEffect(() => {
    const card = cardRef.current;
    const graphic = graphicRef.current;
    if (!motion || !card || !graphic) return;
    const bars = [...graphic.querySelectorAll('i')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    let visible = false;
    let frame = 0;
    let last = 0;
    let pulses = [];
    let pending = 0;
    let hover = false;
    let presence = 0;
    let pointer = 0.5;
    let target = 0.5;
    const enabled = () => visible && !document.hidden && !reduce.matches;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pulses = [];
      hover = false;
      presence = 0;
      graphic.dataset.wave = 'rest';
      bars.forEach(bar => bar.style.removeProperty('transform'));
    };
    const tick = time => {
      frame = 0;
      if (!enabled()) return reset();
      const elapsed = last ? time - last : 16;
      last = time;
      pointer = easeWave(pointer, target, elapsed, 110);
      presence = easeWave(presence, hover ? 1 : 0, elapsed, hover ? 160 : 220);
      pulses = pulses.filter(start => time - start < SHARE_WAVE_MS);
      if (!hover && presence < 0.002 && !pulses.length) return reset();
      bars.forEach((bar, index) => {
        const scale = shareWaveScale(index / (bars.length - 1), time, pulses, pointer, presence);
        bar.style.transform = `scaleY(${scale.toFixed(4)})`;
      });
      graphic.dataset.wave = 'active';
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && enabled()) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const play = () => {
      if (document.hidden || reduce.matches) return;
      if (!visible) {
        pending = performance.now();
        return;
      }
      // Bound rapid price changes; a new impulse blends with the preceding wave.
      pulses = [...pulses.slice(-2), performance.now()];
      wake();
    };
    const move = event => {
      if (!enabled() || !fine.matches || event.pointerType === 'touch') return;
      const rect = graphic.getBoundingClientRect();
      target = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      hover = true;
      wake();
    };
    const leave = () => { hover = false; };
    const preferenceChange = () => { pending = 0; reset(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
      else if (pending && performance.now() - pending < 1800) play();
      pending = 0;
    });
    observer.observe(card);
    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
    document.addEventListener('visibilitychange', preferenceChange);
    reduce.addEventListener('change', preferenceChange);
    fine.addEventListener('change', preferenceChange);
    playRef.current = play;
    return () => {
      observer.disconnect();
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      card.removeEventListener('pointercancel', leave);
      document.removeEventListener('visibilitychange', preferenceChange);
      reduce.removeEventListener('change', preferenceChange);
      fine.removeEventListener('change', preferenceChange);
      playRef.current = null;
      reset();
    };
  }, [motion]);

  useEffect(() => {
    if (previousValue.current !== value) playRef.current?.();
    previousValue.current = value;
  }, [value]);

  return { cardRef, graphicRef };
}
