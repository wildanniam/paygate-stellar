import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/PAYGATE_V1_DEMO_GUIDE.md';

export default function PilotNav({ explore }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);

  useEffect(() => {
    let frame;
    const update = () => {
      setScrolled(window.scrollY > 24);
      const line = window.innerHeight * .4;
      const sections = [['sample-request', 'request'], ['capabilities-title', 'pricing'], ['setup-title', 'setup'], ['payment-records', null], ['get-started', null]];
      let current = null;
      for (const [id, name] of sections) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top < line) current = name;
      }
      setActive(current);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOutside = event => { if (!header.current?.contains(event.target)) setOpen(false); };
    const onKey = event => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    const desktop = window.matchMedia('(min-width: 701px)');
    const closeOnDesktop = event => { if (event.matches) setOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);

  return <header className="lp-nav" ref={header} data-scrolled={scrolled} data-open={open} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <Link to="/" className="lp-brand" aria-label="PayGate home"><img src="/brand/paygate-mark.svg" alt="" width="35" height="35" /><span>PayGate</span></Link>
    <button ref={toggle} className="lp-menu-toggle" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="pilot-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    <nav id="pilot-navigation" aria-label="Main navigation">
      <button type="button" aria-current={active === 'request' ? 'location' : undefined} onClick={() => { setOpen(false); explore(); }}>Try a request</button>
      <a aria-current={active === 'pricing' ? 'location' : undefined} href="#capabilities-title" onClick={() => setOpen(false)}>Pricing</a>
      <a aria-current={active === 'setup' ? 'location' : undefined} href="#setup-title" onClick={() => setOpen(false)}>Setup</a>
      <a href={GUIDE} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Docs <ArrowUpRight size={12} /></a>
    </nav>
    <Link to="/dashboard" className="lp-dashboard">Dashboard <ArrowUpRight size={15} /></Link>
  </header>;
}
