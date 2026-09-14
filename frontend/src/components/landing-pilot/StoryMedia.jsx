import { useEffect, useRef, useState } from 'react';
import '../../styles/story-media.css';

/** Decorative artwork: only loads its film near the viewport; always keeps a poster. */
export default function StoryMedia({ name, motion, video = false, className = '', basePath = '/brand/visual-story' }) {
  const container = useRef(null);
  const player = useRef(null);
  const [visible, setVisible] = useState(false);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const base = `${basePath}/${name}`;

  useEffect(() => {
    let intersecting = false;
    const update = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    }, { threshold: 0.08 });
    observer.observe(container.current);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  useEffect(() => {
    if (visible && motion && video) setLoad(true);
    let current = true;
    const element = player.current;
    if (visible && motion && !failed) element?.play()?.catch(() => { if (current) setPlaying(false); });
    else element?.pause();
    return () => { current = false; element?.pause(); };
  }, [visible, motion, video, load, failed]);

  return <div ref={container} className={`story-media ${className}`} aria-hidden="true" data-visible={visible} data-media-state={failed ? 'fallback' : playing ? 'video' : 'poster'}>
    <picture><source media="(max-width: 640px)" srcSet={`${base}-small.webp`} /><img src={`${base}.webp`} alt="" loading="lazy" decoding="async" /></picture>
    {video && load && <video ref={player} src={`${base}.mp4`} muted playsInline loop preload="none" tabIndex={-1} className={playing && !failed ? 'is-playing' : ''} onPlaying={() => setPlaying(true)} onError={() => { setFailed(true); setPlaying(false); }} />}
  </div>;
}
