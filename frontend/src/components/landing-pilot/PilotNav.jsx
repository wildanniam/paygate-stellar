import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/PAYGATE_V1_DEMO_GUIDE.md';

export default function PilotNav({ explore }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
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
      <button type="button" onClick={() => { setOpen(false); explore(); }}>Try a request</button>
      <a href="#capabilities-title" onClick={() => setOpen(false)}>Product</a>
      <a href="#setup-title" onClick={() => setOpen(false)}>How it works</a>
      <a href={GUIDE} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Docs <ArrowUpRight size={12} /></a>
    </nav>
    <Link to="/dashboard" className="lp-dashboard">Dashboard <ArrowUpRight size={15} /></Link>
  </header>;
}
