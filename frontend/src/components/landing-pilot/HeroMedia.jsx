import { useEffect, useRef, useState } from 'react';
import PointerFlow from './PointerFlow.jsx';

const BASE = '/brand/hero-violet/';

export default function HeroMedia({ motion, stageRef }) {
  const videoRef = useRef(null);
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

  return <div className="lp-art" aria-hidden="true" data-media-state={failed ? 'fallback' : playing ? 'video' : 'poster'}>
    <div className="lp-art-field">
      <picture><source media="(max-width: 640px)" srcSet={`${BASE}field-mobile.webp`} /><img src={`${BASE}field.webp`} width="1920" height="1072" alt="" fetchpriority="high" /></picture>
      {source && <video ref={videoRef} src={`${BASE}field.mp4`} muted playsInline loop preload="auto" tabIndex={-1} className={playing && !failed ? 'is-playing' : ''} onPlaying={() => setPlaying(true)} onError={() => { setFailed(true); setPlaying(false); }} />}
      <PointerFlow active={motion && visible} profile="hero" eventHostRef={stageRef} />
    </div>
    <div className="lp-art-shade" />
  </div>;
}
