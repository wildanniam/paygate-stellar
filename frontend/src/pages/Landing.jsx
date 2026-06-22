import { Activity, ArrowRight, Bot, CalendarDays, CheckCircle2, Copy, Database, FileText, Fingerprint, Github, Info, Layers3, LayoutDashboard, Link2, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { C, MONO as M } from '../colors.js';
import Button from '../components/ui/Button.jsx';

const KW   = t => <span style={{ color: C.purple }}>{t}</span>;
const STR  = t => <span style={{ color: C.green }}>{t}</span>;
const FN   = t => <span style={{ color: C.amber }}>{t}</span>;

const HERO_FLOW_URLS = {
  source: 'https://api.company.com/v1/signal',
  proxy: 'https://paygate.app/api/pay/api_123',
};

const PROOF_SEQUENCE = ['received', 'required', 'mpp', 'ok'];

function ReceiptSvg({ size = 24, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function ReceiptHeaderIcon({ size = 22, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <path
        d="M7.4 3.8h9.2c.9 0 1.6.7 1.6 1.6v15l-2.1-1.2-2.1 1.2-2-1.2-2.1 1.2-2-1.2-2.1 1.2v-15c0-.9.7-1.6 1.6-1.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.1 8h5.8M9.1 11.4h5.8M9.1 14.8h3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16.9" cy="14.8" r="1.2" fill="currentColor" />
    </ReceiptSvg>
  );
}

function RequestReceivedIcon({ size = 24, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <path d="M12 4.8v8.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m8.4 10.1 3.6 3.6 3.6-3.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6.2 16.2v1.3c0 1 .8 1.8 1.8 1.8h8c1 0 1.8-.8 1.8-1.8v-1.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M8.4 16.2h7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </ReceiptSvg>
  );
}

function PaymentRequiredIcon({ size = 24, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <rect x="6.3" y="10.1" width="11.4" height="8.4" rx="2.1" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8.9 10.1V8.4a3.1 3.1 0 0 1 6.2 0v1.7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <path d="M12 15.1v1.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="17.4" cy="6.3" r="2.1" fill="currentColor" opacity="0.18" />
      <path d="M16.5 6.3h1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </ReceiptSvg>
  );
}

function MppVerifiedIcon({ size = 24, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <circle cx="12" cy="12" r="7.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.7 12.2 11 14.5l4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4.7v2.2M19.3 12h-2.1M12 19.3v-2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.72" />
      <circle cx="17.4" cy="6.6" r="1.4" fill="currentColor" />
    </ReceiptSvg>
  );
}

function UpstreamReturnedIcon({ size = 24, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <path d="M18 7.2h-6.4a5 5 0 0 0-5 5v.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="m9 9.8-2.4 2.5L9 14.7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.3" cy="16.5" r="3.1" stroke="currentColor" strokeWidth="1.7" />
      <path d="m14.9 16.4 1 1 1.8-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </ReceiptSvg>
  );
}

function ReceiptCopyIcon({ size = 17, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <rect x="8.1" y="7" width="9" height="9" rx="1.9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 12.7H5.4c-.9 0-1.6-.7-1.6-1.6V5.4c0-.9.7-1.6 1.6-1.6h5.7c.9 0 1.6.7 1.6 1.6V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </ReceiptSvg>
  );
}

function ReceiptCopiedIcon({ size = 17, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <circle cx="12" cy="12" r="7.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.8 12.1 2.1 2.1 4.4-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </ReceiptSvg>
  );
}

const PROOF_ROWS = [
  {
    key: 'received',
    tone: 'blue',
    label: 'Request received',
    value: 'GET /api/pay/api_123',
    time: '13:23:45.213',
    icon: RequestReceivedIcon,
    copyValue: 'GET /api/pay/api_123',
  },
  {
    key: 'required',
    tone: 'amber',
    label: 'Payment required',
    value: '402 Required',
    time: '13:23:45.276',
    icon: PaymentRequiredIcon,
    copyValue: '402 Required',
  },
  {
    key: 'mpp',
    tone: 'purple',
    label: 'MPP verified',
    value: 'pay_8d7a2c0e',
    time: '13:23:45.312',
    icon: MppVerifiedIcon,
    copyValue: 'pay_8d7a2c0e',
  },
  {
    key: 'ok',
    tone: 'green',
    label: 'Upstream returned',
    value: '200 OK',
    time: '13:23:45.589',
    icon: UpstreamReturnedIcon,
    copyValue: '200 OK',
  },
];

const PROOF_CHIPS = [
  { label: 'Request IDs', icon: Fingerprint },
  { label: 'Escrow split', icon: Layers3 },
  { label: 'Dashboard logs', icon: FileText },
  { label: 'Agent-ready', icon: Bot },
];

function useCountUp(target, duration, active, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const tid = setTimeout(() => {
      let startTime = null;
      const step = ts => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        setValue((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(tid);
  }, [active, target, duration, delay]);
  return value;
}

function TerminalDots() {
  return (
    <div className="flex" style={{ gap: 6 }}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((bg, i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: bg }} />
      ))}
    </div>
  );
}

function BrandFeatureIcon({ src, alt }) {
  return (
    <span className="paygate-feature-brand-icon">
      <img src={src} alt={alt} />
    </span>
  );
}

export default function Landing() {
  const [h, setH] = useState({
    navCta: false, ctaBtn: false, card: null, feat: null,
  });
  const hov = (key, val) => setH(prev => ({ ...prev, [key]: val }));

  const [scrollPct, setScrollPct]     = useState(0);
  const [statsActive, setStatsActive] = useState(false);
  const [activeSteps, setActiveSteps] = useState([false, false, false]);
  const [magnetCta, setMagnetCta]     = useState({ x: 0, y: 0 });
  const [heroActive, setHeroActive]   = useState('idle');
  const [copiedFlow, setCopiedFlow]   = useState(null);
  const [proofActive, setProofActive] = useState('mpp');
  const [proofVisible, setProofVisible] = useState(false);
  const [copiedProof, setCopiedProof] = useState(null);

  // Card stagger states
  const [problemVis, setProblemVis] = useState([false, false, false]);
  const [featVis, setFeatVis]       = useState([false, false, false, false]);

  const heroRailRef    = useRef(null);
  const proofRef       = useRef(null);
  const copyTimerRef   = useRef(null);
  const proofCopyTimerRef = useRef(null);
  const problemRef     = useRef(null);
  const howItWorksRef  = useRef(null);
  const ctaBottomRef   = useRef(null);
  const problemCardsRef = useRef(null);
  const featCardsRef    = useRef(null);

  const resetHeroActive = useCallback(() => setHeroActive('idle'), []);

  const copyHeroUrl = useCallback(async key => {
    const value = HERO_FLOW_URLS[key];
    if (!value) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }

      window.clearTimeout(copyTimerRef.current);
      setHeroActive(key);
      setCopiedFlow(key);
      copyTimerRef.current = window.setTimeout(() => setCopiedFlow(null), 1500);
    } catch {
      window.clearTimeout(copyTimerRef.current);
      setCopiedFlow(`${key}-error`);
      copyTimerRef.current = window.setTimeout(() => setCopiedFlow(null), 1500);
    }
  }, []);

  const getHeroCopyState = key => {
    if (copiedFlow === key) return 'copied';
    if (copiedFlow === `${key}-error`) return 'error';
    return 'idle';
  };

  const copyProofValue = useCallback(async (key, value) => {
    if (!value) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }

      window.clearTimeout(proofCopyTimerRef.current);
      setCopiedProof(key);
      setProofActive(key);
      proofCopyTimerRef.current = window.setTimeout(() => setCopiedProof(null), 1500);
    } catch {
      window.clearTimeout(proofCopyTimerRef.current);
      setCopiedProof(`${key}-error`);
      proofCopyTimerRef.current = window.setTimeout(() => setCopiedProof(null), 1500);
    }
  }, []);

  const getProofCopyState = key => {
    if (copiedProof === key) return 'copied';
    if (copiedProof === `${key}-error`) return 'error';
    return 'idle';
  };

  // ── Fade-in: JS-driven so SSR/no-JS sees content; IO with rootMargin + 800ms fallback ──
  useEffect(() => {
    const els = [...document.querySelectorAll('.fs')];
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.65s ease-out, transform 0.65s ease-out';
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 120px 0px' });
    els.forEach(el => obs.observe(el));
    const fallback = setTimeout(() => {
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    }, 800);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  useEffect(() => () => {
    window.clearTimeout(copyTimerRef.current);
    window.clearTimeout(proofCopyTimerRef.current);
  }, []);

  // ── Scroll progress ──
  useEffect(() => {
    const onScroll = () => {
      const d = document.documentElement;
      setScrollPct(d.scrollTop / (d.scrollHeight - d.clientHeight) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Stats count-up ──
  useEffect(() => {
    const el = problemRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsActive(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── How It Works step activation ──
  useEffect(() => {
    const el = howItWorksRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        [0, 1, 2].forEach(i =>
          setTimeout(() => {
            setActiveSteps(prev => { const n = [...prev]; n[i] = true; return n; });
          }, 400 + i * 480)
        );
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Problem cards stagger ──
  useEffect(() => {
    const el = problemCardsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        [0, 1, 2].forEach(i =>
          setTimeout(() => setProblemVis(p => { const n = [...p]; n[i] = true; return n; }), i * 130)
        );
        obs.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 80px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Request-time proof activation ──
  useEffect(() => {
    const el = proofRef.current;
    if (!el) return;

    let intervalId = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;

      setProofVisible(true);
      setProofActive('mpp');

      if (!prefersReducedMotion) {
        let index = PROOF_SEQUENCE.indexOf('mpp');
        intervalId = window.setInterval(() => {
          index = (index + 1) % PROOF_SEQUENCE.length;
          setProofActive(PROOF_SEQUENCE[index]);
        }, 1450);
      }

      obs.disconnect();
    }, { threshold: 0.24, rootMargin: '0px 0px -8% 0px' });

    obs.observe(el);

    return () => {
      obs.disconnect();
      window.clearInterval(intervalId);
    };
  }, []);

  // ── Features cards stagger ──
  useEffect(() => {
    const el = featCardsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        [0, 1, 2, 3].forEach(i =>
          setTimeout(() => setFeatVis(p => { const n = [...p]; n[i] = true; return n; }), i * 110)
        );
        obs.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 80px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Hero transformation rail ──
  useGSAP(() => {
    const root = heroRailRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const leftPill = root.querySelector('[data-flow-pill="source"]');
    const rightPill = root.querySelector('[data-flow-pill="proxy"]');
    const node = root.querySelector('[data-flow-node]');
    const lines = root.querySelectorAll('[data-flow-line]');
    const arrows = root.querySelectorAll('[data-flow-arrow]');
    const statuses = root.querySelectorAll('[data-status-step]');
    const revenue = root.querySelector('[data-revenue-split]');
    const dashboard = root.querySelector('[data-dashboard-preview]');
    const animated = [leftPill, rightPill, node, revenue, dashboard, ...lines, ...arrows, ...statuses].filter(Boolean);

    if (prefersReducedMotion) {
      gsap.set(animated, { clearProps: 'all' });
      return;
    }

    gsap.set(leftPill, { autoAlpha: 0, x: -32 });
    gsap.set(rightPill, { autoAlpha: 0, x: 32 });
    gsap.set(node, { autoAlpha: 0, scale: 0.9, y: 8 });
    gsap.set(lines, { scaleX: 0, transformOrigin: 'center center' });
    gsap.set(arrows, { autoAlpha: 0, scale: 0.75 });
    gsap.set(statuses, { autoAlpha: 0, y: 14 });
    gsap.set(revenue, { autoAlpha: 0, y: 16 });
    gsap.set(dashboard, { autoAlpha: 0, y: 28 });

    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
    timeline
      .to(node, { autoAlpha: 1, scale: 1, y: 0, duration: 0.55 }, 0)
      .to(leftPill, { autoAlpha: 1, x: 0, duration: 0.48 }, 0.1)
      .to(rightPill, { autoAlpha: 1, x: 0, duration: 0.48 }, 0.22)
      .to(lines, { scaleX: 1, duration: 0.72, stagger: 0.08 }, 0.34)
      .to(arrows, { autoAlpha: 1, scale: 1, duration: 0.26, stagger: 0.08 }, 0.7)
      .to(statuses, { autoAlpha: 1, y: 0, duration: 0.36, stagger: 0.12 }, 0.88)
      .to(revenue, { autoAlpha: 1, y: 0, duration: 0.44 }, 1.28)
      .to(dashboard, { autoAlpha: 1, y: 0, duration: 0.62 }, 1.42);

    return () => timeline.kill();
  }, { scope: heroRailRef });

  // ── Magnetic CTA ──
  const applyMagnet = useCallback((e, ref, setter) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
    setter({
      x: clamp((e.clientX - cx) * 0.14, -3, 3),
      y: clamp((e.clientY - cy) * 0.14, -3, 3),
    });
  }, []);

  // ── Count-up values ──
  const cents     = useCountUp(30, 1500, statsActive, 300);
  const wks       = useCountUp(4,  1200, statsActive, 400);
  const trillions = useCountUp(5,  1800, statsActive, 500);

  const statDisplays = [
    `$0.${Math.round(cents).toString().padStart(2, '0')} + 2.9%`,
    `2–${Math.ceil(wks) || 0} weeks`,
    `$3–${Math.ceil(trillions) || 0}T`,
  ];

  const stepsCount = activeSteps.filter(Boolean).length;

  // Shared card transition (covers both stagger reveal + hover)
  const cardTransition = 'opacity 0.5s ease-out, transform 0.5s ease-out, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease';

  return (
    <div className="paygate-landing">

      {/* SVG noise filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" />
          </filter>
        </defs>
      </svg>
      <div className="noise-grain" />

      {/* Scroll progress */}
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 100,
        height: 2, pointerEvents: 'none',
        width: '100%',
        transform: `scaleX(${scrollPct / 100})`,
        transformOrigin: 'left center',
        background: `linear-gradient(90deg, ${C.accent}, ${C.flowBlue})`,
        opacity: 0.92,
        transition: 'transform 0.08s linear',
      }} />

      {/* ── NAVBAR ── */}
      <nav className="paygate-nav">
        <div className="paygate-nav-inner">
          <Link className="paygate-brand-link" to="/" aria-label="PayGate home">
            <span className="paygate-brand-mark" aria-hidden="true">
              <img src="/brand/paygate-mark.svg" alt="" />
            </span>
            <span>PayGate</span>
          </Link>

          <div className="paygate-nav-center" aria-label="Primary navigation">
            <a href="#features">Product</a>
            <a href="#how-it-works">How it works</a>
            <a href="https://github.com/wildanniam/paygate-stellar" target="_blank" rel="noopener noreferrer">Docs</a>
            <a href="#features">Pricing</a>
          </div>

          <div className="paygate-nav-actions">
            <Link className="paygate-nav-secondary" to="/dashboard">
              Dashboard
            </Link>
            <Link
              className="paygate-nav-cta"
              to="/apis/new"
            >
              Create paid endpoint
            </Link>
            <a
              className="paygate-nav-icon desktop-nav-link"
              href="https://github.com/wildanniam/paygate-stellar"
              target="_blank" rel="noopener noreferrer"
              aria-label="View PayGate on GitHub"
              onMouseEnter={() => hov('navCta', true)}
              onMouseLeave={() => hov('navCta', false)}
              data-active={h.navCta ? 'true' : 'false'}
            >
              <Github size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="paygate-hero">
        <div className="paygate-hero-inner">
          <h1 className="paygate-hero-title">
            Paste an API URL.
            <span>Charge per call.</span>
          </h1>

          <p className="paygate-hero-copy">
            PayGate creates a paid proxy, verifies MPP payments, and tracks API revenue.
          </p>

          <div className="paygate-hero-actions">
            <Button
              as={Link}
              to="/apis/new"
              size="lg"
              icon={<ArrowRight size={17} aria-hidden="true" />}
            >
              Create paid endpoint
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              icon={<Link2 size={17} aria-hidden="true" />}
            >
              See the flow
            </Button>
          </div>

          <div
            ref={heroRailRef}
            className="paygate-flow-stage"
            data-hero-active={heroActive}
            data-copy-state={copiedFlow || 'idle'}
            onMouseLeave={resetHeroActive}
            aria-label="PayGate turns an original API URL into a paid proxy URL, blocks unpaid requests with 402, accepts MPP payment, forwards the request upstream, and records revenue."
          >
            <div className="paygate-flow-grid">
              <div className="paygate-flow-label paygate-flow-label-left">Your API URL</div>
              <div className="paygate-flow-label paygate-flow-label-right">Your paid endpoint</div>

              <button
                type="button"
                className="paygate-flow-pill is-source"
                data-flow-pill="source"
                data-copy-state={getHeroCopyState('source')}
                onClick={() => copyHeroUrl('source')}
                onMouseEnter={() => setHeroActive('source')}
                onFocus={() => setHeroActive('source')}
                onBlur={resetHeroActive}
                aria-label={`Copy original API URL ${HERO_FLOW_URLS.source}`}
              >
                <span className="paygate-flow-pill-icon">
                  {getHeroCopyState('source') === 'copied' ? <CheckCircle2 size={19} aria-hidden="true" /> : <Link2 size={19} aria-hidden="true" />}
                </span>
                <code>{HERO_FLOW_URLS.source}</code>
                <span className="paygate-copy-feedback" aria-hidden="true">
                  {getHeroCopyState('source') === 'copied' ? 'Copied' : getHeroCopyState('source') === 'error' ? 'Error' : 'Copy'}
                </span>
              </button>

              <div className="paygate-flow-connector is-left" aria-hidden="true">
                <span data-flow-line />
                <ArrowRight data-flow-arrow size={34} strokeWidth={2.4} />
              </div>

              <div
                className="paygate-node-wrap"
                data-flow-node
                onMouseEnter={() => setHeroActive('node')}
                onFocus={() => setHeroActive('node')}
                onBlur={resetHeroActive}
                tabIndex={0}
                aria-label="PayGate paid proxy verifies payment and forwards authorized API calls."
              >
                <div className="paygate-node-matrix" aria-hidden="true" />
                <div className="paygate-node-card">
                  <img src="/brand/paygate-mark.svg" alt="" />
                  <strong>PayGate</strong>
                  <span>Paid proxy</span>
                </div>
              </div>

              <div className="paygate-flow-connector is-right" aria-hidden="true">
                <span data-flow-line />
                <ArrowRight data-flow-arrow size={34} strokeWidth={2.4} />
              </div>

              <button
                type="button"
                className="paygate-flow-pill is-proxy"
                data-flow-pill="proxy"
                data-copy-state={getHeroCopyState('proxy')}
                onClick={() => copyHeroUrl('proxy')}
                onMouseEnter={() => setHeroActive('proxy')}
                onFocus={() => setHeroActive('proxy')}
                onBlur={resetHeroActive}
                aria-label={`Copy paid endpoint URL ${HERO_FLOW_URLS.proxy}`}
              >
                <span className="paygate-flow-pill-icon">
                  {getHeroCopyState('proxy') === 'copied' ? <CheckCircle2 size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}
                </span>
                <code>{HERO_FLOW_URLS.proxy}</code>
                <span className="paygate-copy-feedback" aria-hidden="true">
                  {getHeroCopyState('proxy') === 'copied' ? 'Copied' : getHeroCopyState('proxy') === 'error' ? 'Error' : 'Copy'}
                </span>
              </button>
            </div>

            <div className="paygate-status-track" aria-hidden="true">
              <span />
            </div>

            <div className="paygate-status-row">
              <button
                type="button"
                className="paygate-lifecycle-chip is-warning"
                data-status-step
                onMouseEnter={() => setHeroActive('challenge')}
                onFocus={() => setHeroActive('challenge')}
                onBlur={resetHeroActive}
                onClick={() => setHeroActive('challenge')}
                aria-label="Step one, unpaid request receives a 402 payment required response."
              >
                <span className="paygate-lifecycle-number">1</span>
                <ShieldCheck size={20} aria-hidden="true" />
                <strong>402 Required</strong>
              </button>
              <button
                type="button"
                className="paygate-lifecycle-chip is-paid"
                data-status-step
                onMouseEnter={() => setHeroActive('paid')}
                onFocus={() => setHeroActive('paid')}
                onBlur={resetHeroActive}
                onClick={() => setHeroActive('paid')}
                aria-label="Step two, the machine client pays with MPP."
              >
                <span className="paygate-lifecycle-number">2</span>
                <CheckCircle2 size={20} aria-hidden="true" />
                <strong>MPP Paid</strong>
              </button>
              <button
                type="button"
                className="paygate-lifecycle-chip is-success"
                data-status-step
                onMouseEnter={() => setHeroActive('success')}
                onFocus={() => setHeroActive('success')}
                onBlur={resetHeroActive}
                onClick={() => setHeroActive('success')}
                aria-label="Step three, paid request is forwarded and receives a 200 OK response."
              >
                <span className="paygate-lifecycle-number">3</span>
                <CheckCircle2 size={20} aria-hidden="true" />
                <strong>200 OK</strong>
              </button>
            </div>

            <div className="paygate-revenue-split" data-revenue-split>
              <div>
                <TrendingUp size={30} aria-hidden="true" />
                <span>
                  <strong>+0.009 USDC</strong>
                  developer
                </span>
              </div>
              <i aria-hidden="true" />
              <div>
                <span>
                  <strong>+0.001 fee</strong>
                  PayGate fee
                </span>
              </div>
            </div>

            <div className="paygate-dashboard-preview" data-dashboard-preview aria-hidden="true">
              <aside>
                <div className="paygate-preview-brand">
                  <img src="/brand/paygate-mark.svg" alt="" />
                  <strong>PayGate</strong>
                </div>
                <div className="paygate-preview-nav is-active">
                  <LayoutDashboard size={15} />
                  Dashboard
                </div>
                <div className="paygate-preview-nav">
                  <Database size={15} />
                  APIs
                </div>
              </aside>
              <main>
                <div className="paygate-preview-head">
                  <strong>Overview</strong>
                  <div>
                    <span><CalendarDays size={14} /> May 15 - Jun 15, 2026</span>
                    <span className="is-selected">30D</span>
                  </div>
                </div>
                <div className="paygate-preview-metrics">
                  {[
                    ['Total Calls', '12.4k'],
                    ['Gross Revenue', '$124.00'],
                    ['Developer Revenue', '$111.60'],
                    ['Withdrawable', '$84.20'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small><Activity size={12} /> live revenue</small>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>

      <section
        id="proof"
        ref={proofRef}
        className="paygate-proof-section fs"
        data-proof-visible={proofVisible ? 'true' : 'false'}
        data-proof-active={proofActive}
        aria-labelledby="paygate-proof-title"
      >
        <div className="paygate-proof-inner">
          <div className="paygate-proof-grid">
            <div className="paygate-proof-copy">
              <p className="paygate-proof-eyebrow">
                <span aria-hidden="true" />
                Request-time receipt
              </p>
              <h2 id="paygate-proof-title">
                Every paid call leaves a <span>receipt.</span>
              </h2>
              <p>
                PayGate rejects unpaid traffic, verifies MPP, forwards valid requests, and posts revenue to your dashboard.
              </p>
            </div>

            <div className="paygate-receipt-panel" aria-label="Live request receipt for a paid API call">
              <div className="paygate-receipt-head">
                <div>
                  <span className="paygate-receipt-head-icon">
                    <ReceiptHeaderIcon size={22} />
                  </span>
                  <strong>Live request receipt</strong>
                </div>
                <button
                  type="button"
                  className="paygate-receipt-id"
                  data-copy-state={getProofCopyState('req')}
                  onClick={() => copyProofValue('req', 'req_01HZ8XQ4F2J7Q9K3T6V1')}
                  aria-label="Copy request id req_01HZ8XQ4F2J7Q9K3T6V1"
                >
                  <span>REQ ID:</span>
                  <code>req_01HZ8XQ4F2J7Q9K3T6V1</code>
                  {getProofCopyState('req') === 'copied' ? <ReceiptCopiedIcon size={16} /> : <ReceiptCopyIcon size={16} />}
                </button>
              </div>

              <div className="paygate-receipt-rows">
                {PROOF_ROWS.map(row => {
                  const Icon = row.icon;
                  const copyState = getProofCopyState(row.key);

                  return (
                    <button
                      key={row.key}
                      type="button"
                      className="paygate-receipt-row"
                      data-tone={row.tone}
                      data-active={proofActive === row.key ? 'true' : 'false'}
                      data-copy-state={copyState}
                      onMouseEnter={() => setProofActive(row.key)}
                      onFocus={() => setProofActive(row.key)}
                      onClick={() => copyProofValue(row.key, row.copyValue)}
                      aria-label={`Copy ${row.label}: ${row.copyValue}`}
                    >
                      <span className="paygate-receipt-status">
                        <Icon size={24} />
                      </span>
                      <span className="paygate-receipt-label">{row.label}</span>
                      <i className="paygate-receipt-divider" aria-hidden="true" />
                      <code className="paygate-receipt-value">{row.value}</code>
                      <span className="paygate-receipt-copy" aria-hidden="true">
                        {copyState === 'copied' ? <ReceiptCopiedIcon size={17} /> : <ReceiptCopyIcon size={17} />}
                      </span>
                      <time>{row.time}</time>
                    </button>
                  );
                })}
              </div>

              <div className="paygate-receipt-foot">
                <span className="is-live"><i aria-hidden="true" /> Live</span>
                <span>Region: <strong>SGP</strong></span>
                <span>Latency: <strong>142ms</strong></span>
                <span className="is-forwarded">Forwarded to upstream <Activity size={15} aria-hidden="true" /></span>
              </div>
            </div>

            <aside className="paygate-proof-metrics" aria-label="Revenue outcome after a successful paid call">
              <div className="paygate-proof-metric">
                <span className="paygate-proof-metric-icon">
                  <TrendingUp size={24} aria-hidden="true" />
                </span>
                <span>Developer revenue</span>
                <strong>+0.009 USDC</strong>
                <small><TrendingUp size={15} aria-hidden="true" /> +12.4% vs last hour</small>
              </div>
              <i className="paygate-proof-metric-divider" aria-hidden="true" />
              <div className="paygate-proof-metric">
                <span className="paygate-proof-metric-icon">
                  <Layers3 size={24} aria-hidden="true" />
                </span>
                <span>PayGate fee</span>
                <strong>+0.001 USDC</strong>
                <small><TrendingUp size={15} aria-hidden="true" /> +8.7% vs last hour</small>
              </div>
              <p>
                Escrow split posted after success
                <Info size={15} aria-hidden="true" />
              </p>
            </aside>
          </div>

          <div className="paygate-proof-chips" aria-label="Request-time proof capabilities">
            {PROOF_CHIPS.map(chip => {
              const Icon = chip.icon;

              return (
                <div key={chip.label} className="paygate-proof-chip">
                  <Icon size={28} aria-hidden="true" />
                  <span>{chip.label}</span>
                  <CheckCircle2 size={21} aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" ref={problemRef} className="fs">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 640, margin: '0 auto', lineHeight: 1.1 }}>
            Micropayment monetization<br />is fundamentally broken.
          </h2>
          <p style={{ color: C.text2, fontSize: 17, maxWidth: 620, margin: '16px auto 56px', lineHeight: 1.65 }}>
            The protocol that fixes this launched in March 2026.<br />
            Most developers still can't access it.
          </p>

          <div ref={problemCardsRef} className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            {[
              {
                stat: statDisplays[0],
                sub: 'per Stripe transaction',
                body: "Charging $0.01 per API call? Traditional payment rails eat the entire margin before you see a cent.",
              },
              {
                stat: statDisplays[1],
                sub: 'to integrate MPP manually',
                body: "The protocol exists. The SDK exists. But wiring it into a real API requires deep knowledge of Stellar internals, HTTP 402 flows, and USDC — knowledge most developers don't have time to acquire.",
              },
              {
                stat: statDisplays[2],
                sub: 'projected agentic commerce by 2030',
                body: "Galaxy Research estimates $3–5 trillion in agentic commerce by 2030. MPP is the protocol that enables it. PayGate is the tool that makes it accessible.",
              },
            ].map((card, i) => (
              <div
                key={i}
                onMouseEnter={() => hov('card', i)}
                onMouseLeave={() => hov('card', null)}
                style={{
                  opacity: problemVis[i] ? 1 : 0,
                  transform: problemVis[i] ? 'translateY(0)' : 'translateY(24px)',
                  background: h.card === i ? C.surfaceHover : C.surface,
                  border: `1px solid ${h.card === i ? C.borderHover : C.border}`,
                  borderTopColor: h.card === i ? 'rgba(135,146,166,0.36)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: 32, textAlign: 'left',
                  boxShadow: h.card === i ? '0 18px 42px rgba(0,0,0,0.28)' : 'none',
                  transition: cardTransition,
                }}
              >
                <div style={{ ...M, fontSize: 28, fontWeight: 800, color: C.text1 }}>{card.stat}</div>
                <div style={{ ...M, fontSize: 12, color: C.text3, marginTop: 4 }}>{card.sub}</div>
                <div style={{ borderTop: `1px solid ${C.border}`, margin: '20px 0' }} />
                <p style={{ color: C.text2, fontSize: 15, lineHeight: 1.6 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" ref={howItWorksRef} className="fs">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 520, lineHeight: 1.1, marginBottom: 18 }}>
            Register. Protect.<br />Get paid per call.
          </h2>
          <p style={{ color: C.text2, fontSize: 17, maxWidth: 620, lineHeight: 1.65, margin: '0 0 64px' }}>
            PayGate keeps the setup short: create the paid endpoint, guard your upstream API, then let the proxy handle request payment evidence.
          </p>

          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Connector track */}
            <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 1, background: C.border }} />
            {/* Connector fill */}
            <div style={{
              position: 'absolute', left: 4, top: 0, bottom: 0, width: 1,
              background: `linear-gradient(to bottom, ${C.accentSoft}, rgba(124,58,237,0.28))`,
              opacity: 0.8,
              transform: `scaleY(${stepsCount / 3})`,
              transformOrigin: 'top center',
              transition: 'transform 0.65s ease-out',
            }} />

            {[
              {
                num: '01', title: 'Register your API',
                body: 'Enter your upstream API base URL, the GET path you want to monetize, and the USDC price per call.',
                visual: (
                  <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 16px 34px rgba(0,0,0,0.24)',
                  }}>
                    {[
                      { label: 'Upstream Base URL', val: 'https://api.yourservice.com', active: false },
                      { label: 'GET Path', val: '/v1/data', active: false },
                      { label: 'Price per call (USDC)', val: '0.01', active: true },
                    ].map((f, fi) => (
                      <div key={fi} style={{
                        padding: '12px 16px',
                        background: f.active ? '#161616' : C.surfaceHover,
                        borderBottom: fi < 2 ? `1px solid ${C.border}` : 'none',
                        borderLeft: f.active ? `2px solid ${C.accent}` : '2px solid transparent',
                        transition: 'all 0.2s ease',
                      }}>
                        <div style={{ ...M, fontSize: 12, color: f.active ? C.text2 : C.text3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                        <div style={{ ...M, fontSize: 13, color: f.active ? C.text1 : C.text2 }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                num: '02', title: 'Create paid proxy',
                body: (
                  <>PayGate gives you a proxy URL and API secret. Agents call the PayGate URL, not your original upstream API.</>
                ),
                visual: (
                  <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: '32px 24px',
                    boxShadow: '0 16px 34px rgba(0,0,0,0.24)',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'rgba(134,239,172,0.12)',
                        border: '1px solid rgba(134,239,172,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, color: C.green,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}>✓</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(134,239,172,0.08)',
                        border: '1px solid rgba(134,239,172,0.2)',
                        color: C.green, borderRadius: 8,
                        padding: '10px 20px', fontSize: 14, ...M,
                      }}>
                        Proxy Ready
                      </div>
                      <p style={{ ...M, fontSize: 12, color: C.text3, textAlign: 'center', margin: 0 }}>
                        /api/pay/api_123 created
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                num: '03', title: 'Protect and monetize',
                body: 'Add the secret guard to your upstream API. PayGate verifies payment, forwards paid requests, and tracks revenue in your dashboard.',
                visual: (
                  <div style={{
                    background: C.codeBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 16px 34px rgba(0,0,0,0.24)',
                  }}>
                    <div className="flex items-center justify-between" style={{ background: '#111111', borderBottom: `1px solid ${C.border}`, padding: '8px 14px' }}>
                      <TerminalDots />
                      <span style={{ ...M, fontSize: 12, color: C.text3 }}>upstream-api.js</span>
                    </div>
                    <pre style={{ ...M, fontSize: 13, lineHeight: 1.8, padding: '16px 20px', margin: 0, overflowX: 'auto' }}>
                      <code>
                        {KW('if')}{' (req.'}{FN('get')}{'('}{STR("'X-PayGate-Secret'")}{') !== PAYGATE_SECRET) {\n'}
                        {'  '}{KW('return')}{' res.'}{FN('status')}{'(401).'}{FN('json')}{'({ error: '}{STR("'Unauthorized'")}{' });\n'}
                        {'}'}
                      </code>
                    </pre>
                  </div>
                ),
              },
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: i < 2 ? 72 : 0 }}>
                {/* Step dot */}
                <div style={{
                  position: 'absolute', left: -37, top: 6,
                  width: 10, height: 10, borderRadius: '50%',
                  background: activeSteps[i] ? C.accent : C.border,
                  boxShadow: activeSteps[i] ? '0 0 0 5px rgba(124,58,237,0.12)' : 'none',
                  transition: 'background 0.35s ease, box-shadow 0.35s ease',
                }} />
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 56, alignItems: 'center' }}>
                  <div style={{ opacity: activeSteps[i] ? 1 : 0.4, transition: 'opacity 0.5s ease' }}>
                    <div style={{
                      ...M, fontSize: 12, marginBottom: 10,
                      color: activeSteps[i] ? C.accentSoft : 'rgba(167,139,250,0.46)',
                      transition: 'color 0.35s ease',
                    }}>
                      {step.num}
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: C.text1, marginBottom: 12 }}>{step.title}</h3>
                    <p style={{ color: C.text2, lineHeight: 1.6 }}>{step.body}</p>
                  </div>
                  <div className="hidden md:block" style={{
                    opacity: activeSteps[i] ? 1 : 0.25,
                    transform: activeSteps[i] ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s',
                  }}>
                    {step.visual}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="fs">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 560, lineHeight: 1.1, marginBottom: 18 }}>
            Built for developers<br />who want to ship.
          </h2>
          <p style={{ color: C.text2, fontSize: 17, maxWidth: 640, lineHeight: 1.65, margin: '0 0 48px' }}>
            The product primitives stay close to the API workflow: proxy URLs, revenue evidence, upstream protection, and machine-client payment behavior.
          </p>

          <div ref={featCardsRef} className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            {[
              {
                icon: <BrandFeatureIcon src="/brand/paygate-asset-api.svg" alt="" />,
                title: 'Paid Proxy URLs',
                body: 'Register an upstream endpoint and PayGate creates a public proxy URL that agents can call when they need paid API access.',
              },
              {
                icon: <BrandFeatureIcon src="/brand/paygate-asset-chart.svg" alt="" />,
                title: 'Revenue Dashboard',
                body: 'Track registered APIs, paid calls, gross revenue, platform fees, request status, escrow balance, and testnet transaction hashes.',
              },
              {
                icon: <BrandFeatureIcon src="/brand/paygate-asset-code.svg" alt="" />,
                title: 'Simple Upstream Protection',
                body: 'PayGate gives each API a secret header. Your upstream API checks that header so buyers cannot bypass the paid proxy.',
              },
              {
                icon: <BrandFeatureIcon src="/brand/paygate-asset-signal.svg" alt="" />,
                title: 'Built for Machine Clients',
                body: 'The demo flow is made for agents and scripts: request, receive 402, pay with Stellar MPP, retry, and receive JSON.',
              },
            ].map((feat, i) => (
              <div
                key={i}
                onMouseEnter={() => hov('feat', i)}
                onMouseLeave={() => hov('feat', null)}
                style={{
                  opacity: featVis[i] ? 1 : 0,
                  transform: featVis[i] ? 'translateY(0)' : 'translateY(24px)',
                  background: h.feat === i ? C.surfaceHover : C.surface,
                  border: `1px solid ${h.feat === i ? C.borderHover : C.border}`,
                  borderTopColor: h.feat === i ? 'rgba(135,146,166,0.36)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: 32,
                  boxShadow: h.feat === i ? '0 18px 42px rgba(0,0,0,0.26)' : 'none',
                  transition: cardTransition,
                }}
              >
                <div className="paygate-feature-icon-shell" data-active={h.feat === i ? 'true' : 'false'}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text1, marginBottom: 10 }}>{feat.title}</h3>
                <p style={{ color: C.text2, fontSize: 15, lineHeight: 1.6 }}>{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="fs" style={{
        width: '100%', padding: '120px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #050609, #080A0F)',
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background:
            'linear-gradient(90deg, transparent, rgba(135,146,166,0.055), transparent), repeating-linear-gradient(90deg, transparent 0 92px, rgba(135,146,166,0.035) 93px, transparent 94px)',
          pointerEvents: 'none', zIndex: 0,
          opacity: 0.75,
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800,
            letterSpacing: '-0.02em', lineHeight: 1.1,
            maxWidth: 640, margin: '0 auto',
          }}>
            <span style={{ color: C.text1 }}>Your API has value.</span>
            <br />
            <span style={{ color: '#D9D2FF' }}>
              Make every call paid.
            </span>
          </h2>
          <p style={{ color: C.text2, fontSize: 18, marginTop: 20 }}>
            Create a PayGate proxy and start testing pay-per-call access.
          </p>
          <div style={{ marginTop: 40 }}>
            <Link
              ref={ctaBottomRef}
              to="/apis/new"
              onMouseEnter={() => hov('ctaBtn', true)}
              onMouseLeave={() => { hov('ctaBtn', false); setMagnetCta({ x: 0, y: 0 }); }}
              onMouseMove={e => applyMagnet(e, ctaBottomRef, setMagnetCta)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: h.ctaBtn ? '#6D28D9' : C.accent,
                color: C.text1, textDecoration: 'none',
                padding: '16px 32px', borderRadius: 8, fontSize: 16, fontWeight: 600,
                boxShadow: h.ctaBtn ? '0 18px 38px rgba(0,0,0,0.34)' : '0 0 0 rgba(0,0,0,0)',
                transition: 'background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
                transform: `translate(${magnetCta.x}px, ${magnetCta.y}px)`,
              }}
            >
              <Zap size={18} /> Create paid endpoint
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px 24px', textAlign: 'center' }}>
        <div className="flex items-center justify-center" style={{ gap: 16, maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ ...M, fontSize: 13, color: C.text3 }}>
            © 2026 PayGate · Built on Stellar · MPP
          </span>
          <a
            href="https://github.com/wildanniam/paygate-stellar"
            target="_blank" rel="noopener noreferrer"
            style={{ color: C.text3, transition: 'color 0.15s ease', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = C.text1}
            onMouseLeave={e => e.currentTarget.style.color = C.text3}
          >
            <Github size={14} />
          </a>
        </div>
      </footer>
    </div>
  );
}
