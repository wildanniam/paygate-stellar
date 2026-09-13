import { useEffect, useRef, useState } from 'react';

const BASE = '/brand/hero-violet/';

export default function HeroMedia({ motion, stageRef }) {
  const videoRef = useRef(null);
  const fieldRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [source, setSource] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const stage = stageRef.current;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    observer.observe(stage);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [stageRef]);

  useEffect(() => {
    if (motion && visible) setSource(true);
    const video = videoRef.current;
    let active = true;
    if (motion && visible && source && !failed) {
      video.play()?.catch(() => { if (active) setPlaying(false); });
    } else video?.pause();
    return () => { active = false; video?.pause(); };
  }, [motion, visible, source, failed]);

  useEffect(() => {
    const stage = stageRef.current;
    const field = fieldRef.current;
    const pointer = window.matchMedia('(pointer: fine)');
    let frame;
    let point = null;
    function reset() {
      point = null;
      cancelAnimationFrame(frame);
      frame = null;
      field.style.setProperty('--field-x', '0px');
      field.style.setProperty('--field-y', '0px');
      field.style.setProperty('--light-opacity', '0');
    }
    function move(event) {
      if (event.pointerType === 'touch' || !pointer.matches) return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const rect = stage.getBoundingClientRect();
        if (!point) return;
        const x = Math.max(0, Math.min(1, (point.x - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (point.y - rect.top) / rect.height));
        field.style.setProperty('--field-x', `${(x - .5) * -54}px`);
        field.style.setProperty('--field-y', `${(y - .5) * -28}px`);
        field.style.setProperty('--light-x', `${x * 100}%`);
        field.style.setProperty('--light-y', `${y * 100}%`);
        field.style.setProperty('--light-opacity', '.55');
      });
    }
    if (motion && visible) {
      stage.addEventListener('pointermove', move);
      stage.addEventListener('pointerleave', reset);
    } else reset();
    return () => { stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', reset); reset(); };
  }, [motion, visible, stageRef]);

  return <div className="lp-art" ref={fieldRef} aria-hidden="true" data-media-state={failed ? 'fallback' : playing ? 'video' : 'poster'}>
    <div className="lp-art-field">
      <picture><source media="(max-width: 640px)" srcSet={`${BASE}field-mobile.webp`} /><img src={`${BASE}field.webp`} width="1920" height="1072" alt="" fetchPriority="high" /></picture>
      {source && <video ref={videoRef} src={`${BASE}field.mp4`} muted playsInline loop preload="auto" tabIndex={-1} className={playing && !failed ? 'is-playing' : ''} onPlaying={() => setPlaying(true)} onError={() => { setFailed(true); setPlaying(false); }} />}
    </div>
    <div className="lp-art-shade" />
    <div className="lp-art-light" />
  </div>;
}
