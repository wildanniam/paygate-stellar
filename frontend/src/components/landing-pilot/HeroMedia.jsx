import { useEffect, useRef, useState } from 'react';

const BASE = '/brand/pilot/';

export default function HeroMedia({ run, credited, started, motion, skip }) {
  const videoRef = useRef(null);
  const shellRef = useRef(null);
  const attemptedRun = useRef(null);
  const [visual, setVisual] = useState('closed');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const shell = shellRef.current;
    let active = true;
    let settled = false;
    let startup;
    let deadline;
    let observer;

    video.pause();
    // Seek only while hidden: Reset must never reverse the opening on screen.
    try { video.currentTime = 0; } catch { /* metadata may not exist yet */ }
    setVisual(credited ? 'pending' : 'closed');

    function finish() {
      if (!active || settled) return;
      settled = true;
      clearTimeout(startup);
      clearTimeout(deadline);
      video.pause();
      setVisual('open');
    }

    function playing() {
      if (!active || settled) return;
      clearTimeout(startup);
      setVisual('playing');
    }

    function visibility() {
      if (document.hidden) finish();
    }

    if (credited) {
      const alreadyAttempted = attemptedRun.current === run;
      attemptedRun.current = run;
      if (alreadyAttempted || !motion || skip || document.hidden) {
        finish();
      } else {
        video.addEventListener('playing', playing);
        ['ended', 'error', 'stalled'].forEach((event) => video.addEventListener(event, finish));
        document.addEventListener('visibilitychange', visibility);
        observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) finish();
        }, { threshold: 0 });
        observer.observe(shell);
        startup = setTimeout(finish, 2000);
        deadline = setTimeout(finish, 8000);
        video.play()?.catch(finish);
      }
    }

    return () => {
      active = false;
      clearTimeout(startup);
      clearTimeout(deadline);
      observer?.disconnect();
      video.removeEventListener('playing', playing);
      ['ended', 'error', 'stalled'].forEach((event) => video.removeEventListener(event, finish));
      document.removeEventListener('visibilitychange', visibility);
      video.pause();
    };
  }, [run, credited, motion, skip]);

  return (
    <div ref={shellRef} className={`lp-media lp-media--${visual}`} aria-hidden="true" data-media-state={visual}>
      <img className="lp-poster lp-poster--closed" src={`${BASE}hero-closed.webp`} alt="" width="1600" height="892" fetchPriority="high" onError={() => setFailed(true)} />
      {started && <img className="lp-poster lp-poster--open" src={`${BASE}hero-open.webp`} alt="" width="1600" height="892" />}
      <video ref={videoRef} className="lp-film" src={started ? `${BASE}hero-opening.mp4` : undefined} muted playsInline preload={started ? 'auto' : 'none'} tabIndex={-1} />
      {failed && <div className="lp-media-fallback"><span /> <span /></div>}
      <div className="lp-media-shade" />
    </div>
  );
}
