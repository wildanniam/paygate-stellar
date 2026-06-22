import { Activity, ArrowRight, Bot, CalendarDays, CheckCircle2, Copy, Database, FileText, Fingerprint, Github, Info, Layers3, LayoutDashboard, Link2, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { C, MONO as M } from '../colors.js';
import Button from '../components/ui/Button.jsx';

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
      <path d="M12 4.8v8.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="m8.6 10 3.4 3.4 3.4-3.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15.8v1.4c0 1 .8 1.8 1.8 1.8h6.4c1 0 1.8-.8 1.8-1.8v-1.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M9.2 15.8h5.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </ReceiptSvg>
  );
}

function PaymentRequiredIcon({ size = 24, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <rect x="6.7" y="10" width="10.6" height="8.6" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9.1 10V8.2a2.9 2.9 0 0 1 5.8 0V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="14.1" r="1" fill="currentColor" />
      <path d="M12 15.1v1.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="17.6" cy="6.8" r="2.2" fill="currentColor" opacity="0.20" />
      <path d="M16.7 6.8h1.8" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </ReceiptSvg>
  );
}

function MppVerifiedIcon({ size = 24, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <circle cx="12" cy="12" r="6.9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.8 12.2 11 14.4l4.3-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12h2M17 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.74" />
      <circle cx="17" cy="7" r="1.6" fill="currentColor" />
      <path d="M12 5.1v1.7M12 17.2v1.7" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" opacity="0.52" />
    </ReceiptSvg>
  );
}

function UpstreamReturnedIcon({ size = 24, ...props }) {
  return (
    <ReceiptSvg size={size} {...props}>
      <path d="m10.2 6.8-5.1 5.1 5.1 5.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.8 11.9h12.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
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

function TransformIcon({ size = 22, children, ...props }) {
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

function BillingIcon(props) {
  return (
    <TransformIcon {...props}>
      <path d="M7.1 4.4h9.8c.8 0 1.4.6 1.4 1.4v13.8l-2-1.1-2.1 1.1-2.2-1.1-2.1 1.1-2.2-1.1-2 1.1V5.8c0-.8.6-1.4 1.4-1.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8.4h6M9 11.7h6M9 15h3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </TransformIcon>
  );
}

function GuardIcon(props) {
  return (
    <TransformIcon {...props}>
      <path d="M12 4.1 18.2 6v5.3c0 4-2.5 6.7-6.2 8.6-3.7-1.9-6.2-4.6-6.2-8.6V6L12 4.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.9 12 2.1 2.1 4.3-4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </TransformIcon>
  );
}

function RevenueLineIcon(props) {
  return (
    <TransformIcon {...props}>
      <path d="M4.6 16.7 9 12.4l3.3 2.7 6.7-7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.7 7.7H19v4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.6 19.3h14.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.36" />
    </TransformIcon>
  );
}

function AgentNodesIcon(props) {
  return (
    <TransformIcon {...props}>
      <circle cx="7.4" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.6" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.4 18.3c.5-2.2 1.8-3.4 3.7-3.4s3.2 1.2 3.7 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.2 18.3c.5-2.2 1.8-3.4 3.7-3.4s3.2 1.2 3.7 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 10.4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.58" />
    </TransformIcon>
  );
}

function CodeTileIcon(props) {
  return (
    <TransformIcon {...props}>
      <path d="m9.1 8.2-3.5 3.7 3.5 3.9M14.9 8.2l3.5 3.7-3.5 3.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12.9 6.8-1.8 10.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.64" />
    </TransformIcon>
  );
}

function ApiTileIcon(props) {
  return (
    <TransformIcon {...props}>
      <rect x="4.5" y="6.2" width="15" height="11.6" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.1 14.5V10l2.2 4.5 2.2-4.5v4.5M14.7 10v4.5M16.8 10v4.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </TransformIcon>
  );
}

function SignalTileIcon(props) {
  return (
    <TransformIcon {...props}>
      <path d="M6.5 14.8V9.2M10.2 17V7M13.9 15.7V8.3M17.5 13.7v-3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </TransformIcon>
  );
}

function EndpointSparkIcon(props) {
  return (
    <TransformIcon {...props}>
      <path d="M12 3.8 13.4 8l4.1 1.4-4.1 1.4L12 15l-1.4-4.2-4.1-1.4 4.1-1.4L12 3.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M18.4 14.2 19 16l1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8ZM5.6 14.2l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4Z" fill="currentColor" />
    </TransformIcon>
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

const TRANSFORM_PROBLEMS = [
  {
    label: 'Manual billing',
    body: 'Invoices, spreadsheets, chasing payments',
    icon: BillingIcon,
  },
  {
    label: 'Custom auth',
    body: 'Build and maintain your own access layer',
    icon: GuardIcon,
  },
  {
    label: 'No per-call revenue',
    body: 'Useful calls stay free and unmonetized',
    icon: RevenueLineIcon,
  },
  {
    label: 'Hard to share with agents',
    body: 'Complex setup for AI agents and clients',
    icon: AgentNodesIcon,
  },
];

const TRANSFORM_OUTCOMES = [
  {
    tone: 'amber',
    label: '402',
    body: 'Before payment',
    detail: 'Access blocked until paid',
    icon: GuardIcon,
  },
  {
    tone: 'purple',
    label: 'MPP verified',
    body: 'Payment verified on Stellar',
    detail: 'Credential accepted',
    icon: GuardIcon,
  },
  {
    tone: 'green',
    label: '200',
    body: 'Forwarded',
    detail: 'Request sent to your API',
    icon: CheckCircle2,
  },
  {
    tone: 'revenue',
    label: '+0.009 USDC',
    body: 'Your revenue per call',
    detail: 'Posted to dashboard',
    icon: RevenueLineIcon,
  },
];

function BrandFeatureIcon({ src, alt }) {
  return (
    <span className="paygate-feature-brand-icon">
      <img src={src} alt={alt} />
    </span>
  );
}

export default function Landing() {
  const [h, setH] = useState({
    navCta: false, feat: null,
  });
  const hov = (key, val) => setH(prev => ({ ...prev, [key]: val }));

  const [scrollPct, setScrollPct]     = useState(0);
  const [magnetCta, setMagnetCta]     = useState({ x: 0, y: 0 });
  const [heroActive, setHeroActive]   = useState('idle');
  const [copiedFlow, setCopiedFlow]   = useState(null);
  const [proofActive, setProofActive] = useState('mpp');
  const [proofVisible, setProofVisible] = useState(false);
  const [copiedProof, setCopiedProof] = useState(null);
  const [transformActive, setTransformActive] = useState('generate');
  const [copiedTransform, setCopiedTransform] = useState(null);

  // Card stagger states
  const [featVis, setFeatVis]       = useState([false, false, false, false]);

  const heroRailRef    = useRef(null);
  const proofRef       = useRef(null);
  const copyTimerRef   = useRef(null);
  const proofCopyTimerRef = useRef(null);
  const transformCopyTimerRef = useRef(null);
  const ctaBottomRef   = useRef(null);
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

  const copyTransformValue = useCallback(async (key, value) => {
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

      window.clearTimeout(transformCopyTimerRef.current);
      setTransformActive(key);
      setCopiedTransform(key);
      transformCopyTimerRef.current = window.setTimeout(() => setCopiedTransform(null), 1500);
    } catch {
      window.clearTimeout(transformCopyTimerRef.current);
      setCopiedTransform(`${key}-error`);
      transformCopyTimerRef.current = window.setTimeout(() => setCopiedTransform(null), 1500);
    }
  }, []);

  const getTransformCopyState = key => {
    if (copiedTransform === key) return 'copied';
    if (copiedTransform === `${key}-error`) return 'error';
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
    window.clearTimeout(transformCopyTimerRef.current);
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
            <Button
              as={Link}
              className="paygate-nav-cta"
              to="/apis/new"
            >
              Create paid endpoint
            </Button>
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

      {/* ── TRANSFORMATION ── */}
      <section
        id="how-it-works"
        className="paygate-transform-section fs"
        data-transform-active={transformActive}
        aria-labelledby="paygate-transform-title"
      >
        <div className="paygate-transform-inner">
          <div className="paygate-transform-head">
            <p>Transform in minutes</p>
            <h2 id="paygate-transform-title">
              From ordinary API to <span>paid endpoint</span>
            </h2>
            <p>
              Paste your URL, choose a price, and share a proxy that handles payment before every call.
            </p>
          </div>

          <div className="paygate-transform-stage" aria-label="PayGate transforms an ordinary API into a paid endpoint">
            <div className="paygate-transform-beam" aria-hidden="true" />
            <div className="paygate-transform-floaters" aria-hidden="true">
              <span className="is-code"><CodeTileIcon size={25} /></span>
              <span className="is-api"><ApiTileIcon size={25} /></span>
              <span className="is-chart"><RevenueLineIcon size={25} /></span>
              <span className="is-guard"><GuardIcon size={25} /></span>
              <span className="is-money"><RevenueLineIcon size={25} /></span>
              <span className="is-signal"><SignalTileIcon size={25} /></span>
            </div>

            <article
              className="paygate-transform-panel is-before"
              onMouseEnter={() => setTransformActive('paste')}
              onFocus={() => setTransformActive('paste')}
            >
              <h3>Your API today</h3>
              <button
                type="button"
                className="paygate-transform-url"
                data-copy-state={getTransformCopyState('source')}
                onClick={() => copyTransformValue('source', HERO_FLOW_URLS.source)}
                aria-label={`Copy original API URL ${HERO_FLOW_URLS.source}`}
              >
                <span className="paygate-transform-url-icon"><Link2 size={18} aria-hidden="true" /></span>
                <code>{HERO_FLOW_URLS.source}</code>
                <span className="paygate-transform-copy">
                  {getTransformCopyState('source') === 'copied' ? <CheckCircle2 size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                </span>
              </button>

              <div className="paygate-transform-problem-divider" />
              <p className="paygate-transform-label">The problem</p>

              <div className="paygate-transform-problems">
                {TRANSFORM_PROBLEMS.map(problem => {
                  const Icon = problem.icon;
                  return (
                    <div key={problem.label} className="paygate-transform-problem-row">
                      <span><Icon size={18} aria-hidden="true" /></span>
                      <div>
                        <strong>{problem.label}</strong>
                        <small>{problem.body}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="paygate-transform-panel is-action" aria-label="PayGate setup actions">
              <div
                className="paygate-transform-step"
                data-active={transformActive === 'paste' ? 'true' : 'false'}
                onMouseEnter={() => setTransformActive('paste')}
                onFocus={() => setTransformActive('paste')}
                tabIndex={0}
              >
                <span className="paygate-transform-step-number">1</span>
                <div>
                  <strong>Paste URL</strong>
                  <button
                    type="button"
                    className="paygate-transform-mini-url"
                    data-copy-state={getTransformCopyState('paste')}
                    onClick={() => copyTransformValue('paste', HERO_FLOW_URLS.source)}
                    aria-label={`Copy pasted API URL ${HERO_FLOW_URLS.source}`}
                  >
                    <Link2 size={15} aria-hidden="true" />
                    <code>{HERO_FLOW_URLS.source}</code>
                    {getTransformCopyState('paste') === 'copied' ? <CheckCircle2 size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div
                className="paygate-transform-step"
                data-active={transformActive === 'price' ? 'true' : 'false'}
                onMouseEnter={() => setTransformActive('price')}
                onFocus={() => setTransformActive('price')}
                tabIndex={0}
              >
                <span className="paygate-transform-step-number">2</span>
                <div>
                  <strong>Set price per call</strong>
                  <div className="paygate-transform-price-control" aria-hidden="true">
                    <span>$</span>
                    <code>0.009</code>
                    <span>USDC</span>
                  </div>
                  <small>You earn $0.009 per successful call</small>
                </div>
              </div>

              <div
                className="paygate-transform-step"
                data-active={transformActive === 'generate' ? 'true' : 'false'}
                onMouseEnter={() => setTransformActive('generate')}
                onFocus={() => setTransformActive('generate')}
                tabIndex={0}
              >
                <span className="paygate-transform-step-number">3</span>
                <div>
                  <strong>Generate proxy</strong>
                  <Button
                    as={Link}
                    to="/apis/new"
                    className="paygate-transform-generate"
                    icon={<span className="paygate-transform-button-mark"><img src="/brand/paygate-mark.svg" alt="" /></span>}
                  >
                    Generate paid endpoint
                  </Button>
                  <p>PayGate handles payment and forwards successful calls.</p>
                </div>
              </div>
            </article>

            <article
              className="paygate-transform-panel is-after"
              onMouseEnter={() => setTransformActive('generate')}
              onFocus={() => setTransformActive('generate')}
            >
              <div className="paygate-transform-after-title">
                <span><EndpointSparkIcon size={25} /></span>
                <h3>Paid endpoint</h3>
              </div>

              <button
                type="button"
                className="paygate-transform-url"
                data-copy-state={getTransformCopyState('proxy')}
                onClick={() => copyTransformValue('proxy', HERO_FLOW_URLS.proxy)}
                aria-label={`Copy paid endpoint URL ${HERO_FLOW_URLS.proxy}`}
              >
                <span className="paygate-transform-url-icon"><Link2 size={18} aria-hidden="true" /></span>
                <code>{HERO_FLOW_URLS.proxy}</code>
                <span className="paygate-transform-copy">
                  {getTransformCopyState('proxy') === 'copied' ? <CheckCircle2 size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                </span>
              </button>

              <div className="paygate-transform-chip-row">
                <span>$0.009 / call</span>
                <span><ShieldCheck size={14} aria-hidden="true" /> MPP guard enabled</span>
              </div>

              <div className="paygate-transform-live">
                <p>Live example</p>
                <div>
                  <span aria-hidden="true" />
                  <small>REQ ID</small>
                  <code>req_01HZ8XQ4F2J7Q9K3T6V1</code>
                  <time>13:23:45</time>
                  <ReceiptCopyIcon size={16} />
                </div>
              </div>

              <div className="paygate-transform-result-grid">
                <div>
                  <span>Revenue today</span>
                  <strong>+0.009 USDC</strong>
                  <small><TrendingUp size={15} aria-hidden="true" /> posted after success</small>
                </div>
                <div>
                  <span>Success rate</span>
                  <strong>99.8%</strong>
                  <small>200 OK</small>
                </div>
              </div>

              <p className="paygate-transform-after-note">
                <i aria-hidden="true" /> Payment collected before every call
              </p>
            </article>
          </div>

          <div className="paygate-transform-outcomes" aria-label="Paid endpoint outcomes">
            {TRANSFORM_OUTCOMES.map(outcome => {
              const Icon = outcome.icon;
              return (
                <div key={outcome.label} className="paygate-transform-outcome" data-tone={outcome.tone}>
                  <span><Icon size={24} aria-hidden="true" /></span>
                  <div>
                    <strong>{outcome.label}</strong>
                    <p>{outcome.body}</p>
                    <small>{outcome.detail}</small>
                  </div>
                </div>
              );
            })}
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
            <Button
              as={Link}
              ref={ctaBottomRef}
              to="/apis/new"
              size="lg"
              className="paygate-bottom-cta"
              onMouseLeave={() => setMagnetCta({ x: 0, y: 0 })}
              onMouseMove={e => applyMagnet(e, ctaBottomRef, setMagnetCta)}
              style={{
                '--pg-magnet-x': `${magnetCta.x}px`,
                '--pg-magnet-y': `${magnetCta.y}px`,
              }}
              icon={<Zap size={18} aria-hidden="true" />}
            >
              Create paid endpoint
            </Button>
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
