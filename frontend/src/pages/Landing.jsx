import { Activity, ArrowRight, CalendarDays, CheckCircle2, Copy, Database, FileText, Fingerprint, Info, Layers3, LayoutDashboard, Link2, Play, Plus, ShieldCheck, TrendingUp, Upload, Zap } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MarketingNavbar from '../components/MarketingNavbar.jsx';
import HeroWorkspace from '../components/HeroWorkspace.jsx';
import HowItWorksDiagram from '../components/HowItWorksDiagram.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import Button from '../components/ui/Button.jsx';

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

function GuardIcon(props) {
  return (
    <TransformIcon {...props}>
      <path d="M12 4.1 18.2 6v5.3c0 4-2.5 6.7-6.2 8.6-3.7-1.9-6.2-4.6-6.2-8.6V6L12 4.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.9 12 2.1 2.1 4.3-4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function MachineClientIcon(props) {
  return (
    <TransformIcon {...props}>
      <rect x="6.2" y="7.4" width="11.6" height="9.4" rx="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 7.4V5.6M14.5 7.4V5.6M8.2 12.2h.1M15.7 12.2h.1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M10.2 15.8h3.6M4.7 11.6H3.4M20.6 11.6h-1.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </TransformIcon>
  );
}

function UpstreamLockIcon(props) {
  return (
    <TransformIcon {...props}>
      <rect x="6.4" y="10.1" width="11.2" height="8.2" rx="2" stroke="currentColor" strokeWidth="1.85" />
      <path d="M9 10.1V8.2a3 3 0 0 1 6 0v1.9" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
      <circle cx="12" cy="14.2" r="1" fill="currentColor" />
      <path d="M12 15.2v1.1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </TransformIcon>
  );
}

function SecretKeyIcon(props) {
  return (
    <TransformIcon {...props}>
      <circle cx="8.7" cy="13.8" r="3.3" stroke="currentColor" strokeWidth="1.85" />
      <path d="M11.2 11.4 18.3 4.3M16.2 6.4l2.1 2.1M14.3 8.3l1.5 1.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.7" cy="13.8" r="0.85" fill="currentColor" />
    </TransformIcon>
  );
}

function BlockedTrafficIcon(props) {
  return (
    <TransformIcon {...props}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="m7.4 7.4 9.2 9.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

const PROOF_REASONS = [
  {
    tone: 'blue',
    label: 'Request identity',
    body: 'Unique request ID and timestamp.',
    icon: Fingerprint,
  },
  {
    tone: 'amber',
    label: 'Payment verification',
    body: 'Payment checked before forwarding.',
    icon: ShieldCheck,
  },
  {
    tone: 'green',
    label: 'Upstream result',
    body: 'Response and revenue are recorded.',
    icon: FileText,
  },
];

const PROTECTED_GUARD_ROWS = [
  { tone: 'blocked', label: 'Unpaid blocked', icon: BlockedTrafficIcon },
  { tone: 'green', label: 'Payment verified', icon: CheckCircle2 },
  { tone: 'blue', label: 'Request ID issued', icon: Fingerprint },
  { tone: 'purple', label: 'Secret header attached', icon: SecretKeyIcon },
];

const PROTECTED_FACTS = [
  { label: 'Unpaid traffic blocked', icon: GuardIcon },
  { label: 'Upstream URL stays private', icon: UpstreamLockIcon },
  { label: 'Secret header forwarding', icon: SecretKeyIcon },
  { label: 'Receipt per request', icon: ReceiptHeaderIcon },
];

const DASHBOARD_METRICS = [
  { label: 'Total calls', value: '12.4k', delta: '+18.6% vs last 30 days' },
  { label: 'Gross revenue', value: '$124.00', delta: '+21.3% vs last 30 days' },
  { label: 'Developer revenue', value: '$111.60', delta: '+21.7% vs last 30 days' },
  { label: 'Withdrawable', value: '$84.20', delta: '+16.4% vs last 30 days' },
];

const DASHBOARD_APIS = [
  { name: 'Weather signal', status: 'active', price: '$0.009/call', calls: '8.2k calls', revenue: '$73.80' },
  { name: 'Market feed', status: 'active', price: '$0.015/call', calls: '4.2k calls', revenue: '$50.20' },
];

const DASHBOARD_ACTIVITY = [
  { id: 'req_01HZ8XQ4', event: 'MPP verified', tone: 'purple', result: '200 OK', resultTone: 'green', revenue: '+0.009 USDC' },
  { id: 'req_01HZ8XR1', event: '402 required', tone: 'amber', result: 'blocked', resultTone: 'red', revenue: '$0.000' },
  { id: 'req_01HZ8XS9', event: 'forwarded', tone: 'blue', result: '200 OK', resultTone: 'green', revenue: '+0.015 USDC' },
];

const AUDIENCE_ROWS = [
  {
    title: 'Indie API builders',
    problem: 'Useful endpoints are hard to charge for.',
    outcome: 'Publish a paid endpoint in minutes.',
    icon: Fingerprint,
  },
  {
    title: 'Agent-facing API builders',
    problem: 'Agents need machine-readable paid access.',
    outcome: 'Expose API-native payment states.',
    icon: MachineClientIcon,
  },
  {
    title: 'Startup API owners',
    problem: 'Billing and access control slow API monetization.',
    outcome: 'Gate requests before they reach upstream.',
    icon: LayoutDashboard,
  },
  {
    title: 'Data/API sellers',
    problem: 'Successful requests need metering and revenue evidence.',
    outcome: 'Track calls, revenue, and withdrawable balance.',
    icon: Database,
  },
];

const AUDIENCE_TRUST_NOTES = [
  { label: 'Built on Stellar MPP', icon: Zap },
  { label: 'Request receipts included', icon: ReceiptHeaderIcon },
  { label: 'Upstream guard supported', icon: GuardIcon },
];

const LIGHT_THEME_ENABLED = false;

export default function Landing() {
  const [proofActive, setProofActive] = useState('mpp');
  const [proofVisible, setProofVisible] = useState(false);
  const [copiedProof, setCopiedProof] = useState(null);
  const [protectedActive, setProtectedActive] = useState('forwarded');
  const [theme, setTheme] = useState(() => {
    if (!LIGHT_THEME_ENABLED || typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('paygate-theme') === 'light' ? 'light' : 'dark';
  });

  const landingRef     = useRef(null);
  const scrollProgressRef = useRef(null);
  const proofRef       = useRef(null);
  const proofCopyTimerRef = useRef(null);

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

  useEffect(() => () => {
    window.clearTimeout(proofCopyTimerRef.current);
  }, []);

  useEffect(() => {
    if (!LIGHT_THEME_ENABLED) return;

    try {
      window.localStorage.setItem('paygate-theme', theme);
    } catch {
      // Local theme persistence is an enhancement; the landing still works when storage is unavailable.
    }
  }, [theme]);

  // ── Landing scroll motion foundation ──
  useGSAP(() => {
    const root = landingRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const progressBar = scrollProgressRef.current;
    const sections = gsap.utils.toArray('.fs:not(.paygate-transform-section)', root);

    if (progressBar) {
      gsap.set(progressBar, { scaleX: 0, transformOrigin: 'left center' });
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: self => gsap.set(progressBar, { scaleX: self.progress }),
      });
    }

    if (prefersReducedMotion) {
      gsap.set(sections, { autoAlpha: 1, y: 0, clearProps: 'transform,opacity,visibility' });
      setProofVisible(true);
      setProofActive('ok');
      setProtectedActive('forwarded');
      return;
    }

    gsap.set(sections, { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch(sections, {
      start: 'top 82%',
      once: true,
      onEnter: batch => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.78,
          ease: 'power3.out',
          stagger: 0.12,
          overwrite: true,
          clearProps: 'transform,opacity,visibility',
        });
      },
    });

    const heroIntro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const heroButtons = root.querySelectorAll('.paygate-hero-actions .pg-button');

    heroIntro
      .fromTo(
        '.paygate-hero-title',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.72, clearProps: 'opacity,visibility,transform' },
        0.05,
      )
      .fromTo(
        '.paygate-hero-copy',
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.56, clearProps: 'opacity,visibility,transform' },
        0.18,
      )
      .fromTo(
        heroButtons,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.08, clearProps: 'opacity,visibility,transform' },
        0.32,
      );

    const setStage = () => {
      const current = {
        protected: protectedActive,
        proof: proofActive,
      };

      return {
        protected(stage) {
          if (current.protected === stage) return;
          current.protected = stage;
          setProtectedActive(stage);
        },
        proof(stage) {
          if (current.proof === stage) return;
          current.proof = stage;
          setProofActive(stage);
        },
      };
    };

    const stage = setStage();
    const transformSection = root.querySelector('.paygate-transform-section');
    const protectedSection = root.querySelector('.paygate-protected-section');
    const proofSection = root.querySelector('.paygate-proof-section');
    const opsSection = root.querySelector('.paygate-ops-section');
    const audienceSection = root.querySelector('.paygate-audience-section');

    if (transformSection) {
      gsap.from(transformSection.querySelectorAll('.paygate-gate-header > *, .paygate-gate-route > *, .paygate-gate-lifecycle, .paygate-gate-footer'), {
        y: 18,
        duration: 0.72,
        ease: 'power3.out',
        stagger: 0.08,
        clearProps: 'transform',
        scrollTrigger: {
          trigger: transformSection,
          start: 'top 88%',
          once: true,
        },
      });
    }

    if (protectedSection) {
      gsap.from(protectedSection.querySelectorAll('.paygate-protected-head > *, .paygate-protected-card, .paygate-protected-fact'), {
        autoAlpha: 0,
        y: 18,
        scale: 0.99,
        duration: 0.62,
        ease: 'power3.out',
        stagger: 0.055,
        scrollTrigger: {
          trigger: protectedSection,
          start: 'top 76%',
          once: true,
        },
      });

      ScrollTrigger.create({
        trigger: protectedSection,
        start: 'top 68%',
        end: 'bottom 38%',
        onUpdate: self => {
          stage.protected(self.progress < 0.42 ? 'blocked' : 'forwarded');
        },
        onEnter: () => stage.protected('blocked'),
        onLeave: () => stage.protected('forwarded'),
        onEnterBack: () => stage.protected('forwarded'),
      });
    }

    if (proofSection) {
      gsap.from(proofSection.querySelectorAll('.paygate-proof-copy > *, .paygate-receipt-panel, .paygate-proof-metrics'), {
        autoAlpha: 0,
        y: 20,
        duration: 0.66,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: proofSection,
          start: 'top 76%',
          once: true,
        },
      });

      gsap.from(proofSection.querySelectorAll('.paygate-receipt-row'), {
        autoAlpha: 0,
        x: 18,
        duration: 0.48,
        ease: 'power2.out',
        stagger: 0.075,
        scrollTrigger: {
          trigger: proofSection.querySelector('.paygate-receipt-panel') || proofSection,
          start: 'top 78%',
          once: true,
        },
      });

      ScrollTrigger.create({
        trigger: proofSection,
        start: 'top 68%',
        end: 'bottom 40%',
        onEnter: () => setProofVisible(true),
        onEnterBack: () => setProofVisible(true),
        onUpdate: self => {
          const index = Math.min(PROOF_SEQUENCE.length - 1, Math.floor(self.progress * PROOF_SEQUENCE.length));
          stage.proof(PROOF_SEQUENCE[index]);
        },
      });
    }

    if (opsSection) {
      gsap.from(opsSection.querySelectorAll('.paygate-ops-head > *, .paygate-ops-shell'), {
        autoAlpha: 0,
        y: 22,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: opsSection,
          start: 'top 76%',
          once: true,
        },
      });

      gsap.from(opsSection.querySelectorAll('.paygate-ops-metric, .paygate-ops-table-row, .paygate-ops-withdraw'), {
        autoAlpha: 0,
        y: 16,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.055,
        scrollTrigger: {
          trigger: opsSection.querySelector('.paygate-ops-shell') || opsSection,
          start: 'top 72%',
          once: true,
        },
      });
    }

    if (audienceSection) {
      gsap.from(audienceSection.querySelectorAll('.paygate-audience-head > *, .paygate-audience-row, .paygate-audience-cta, .paygate-audience-trust span'), {
        autoAlpha: 0,
        y: 18,
        scale: 0.99,
        duration: 0.58,
        ease: 'power3.out',
        stagger: 0.055,
        scrollTrigger: {
          trigger: audienceSection,
          start: 'top 78%',
          once: true,
        },
      });
    }

    gsap.utils.toArray('.paygate-proof-reason', root)
      .forEach((element, index) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 18,
          scale: 0.985,
          duration: 0.58,
          delay: Math.min(index % 4, 3) * 0.045,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        });
      });
  }, { scope: landingRef });

  // ── Hero transformation rail ──
  return (
    <div ref={landingRef} className="paygate-landing" data-theme={theme}>

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
      <div ref={scrollProgressRef} className="paygate-scroll-progress" aria-hidden="true" />

      <MarketingNavbar
        theme={theme}
        onThemeChange={setTheme}
        themeToggleEnabled={LIGHT_THEME_ENABLED}
      />

      {/* ── HERO ── */}
      <section className="paygate-hero">
        <div className="paygate-hero-inner">
          <div className="paygate-hero-copy-block">
            <p className="paygate-hero-eyebrow">
              <span className="paygate-hero-eyebrow-dot" aria-hidden="true" />
              Monetize your API
            </p>

            <h1 className="paygate-hero-title">
            Paste an API URL.
            <span>Charge per call.</span>
            </h1>

            <p className="paygate-hero-copy">
            PayGate creates a paid proxy, verifies payments,
            <br className="paygate-hero-copy-break" />
            and tracks API revenue &mdash; so you can focus on building.
            </p>

            <div className="paygate-hero-actions">
              <Button
                as={Link}
                to="/apis/new"
                size="lg"
                iconAfter={<ArrowRight size={17} aria-hidden="true" />}
              >
                Create paid endpoint
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                icon={<Play size={16} aria-hidden="true" />}
              >
                See the flow
              </Button>
            </div>

            <div className="paygate-hero-trust" aria-label="PayGate product capabilities">
              <span className="paygate-hero-trust-kicker">Built for API developers</span>
              <i className="paygate-hero-trust-rule" aria-hidden="true" />
              <span className="paygate-hero-trust-proof">Testnet-ready payment rails</span>
            </div>
          </div>

          <HeroWorkspace proxyUrl={HERO_FLOW_URLS.proxy} />

        </div>
      </section>

      {/* ── TRANSFORMATION ── */}
      <section
        id="how-it-works"
        className="paygate-transform-section paygate-gate-section fs"
        aria-labelledby="paygate-transform-title"
      >
        <div className="paygate-concept-flow-wrap">
          <HowItWorksDiagram sourceUrl={HERO_FLOW_URLS.source} proxyUrl={HERO_FLOW_URLS.proxy} />
        </div>
      </section>

      {/* ── PROTECTED PAID CALLS ── */}
      <section
        id="protected-calls"
        className="paygate-protected-section fs"
        data-protected-active={protectedActive}
        aria-labelledby="paygate-protected-title"
      >
        <div className="paygate-protected-inner">
          <div className="paygate-protected-head">
            <p>Protected paid calls</p>
            <h2 id="paygate-protected-title">
              Keep your upstream API <span>private.</span>
            </h2>
            <p>
              PayGate verifies payment before forwarding and sends valid requests with your upstream secret header.
            </p>
          </div>

          <div className="paygate-protected-stage" aria-label="PayGate blocks unpaid traffic and forwards valid requests to a protected upstream API.">
            <article
              className="paygate-protected-card is-client"
              onMouseEnter={() => setProtectedActive('client')}
              onFocus={() => setProtectedActive('client')}
            >
              <div className="paygate-protected-card-title">
                <span><MachineClientIcon size={26} /></span>
                <h3>Machine client</h3>
              </div>

              <div className="paygate-protected-request">
                <span>GET</span>
                <code>/api/pay/api_123</code>
              </div>

              <div className="paygate-protected-client-divider" />

              <p>Typical clients</p>
              <div className="paygate-protected-client-chips">
                <span><MachineClientIcon size={17} /> agent</span>
                <span><CodeTileIcon size={17} /> script</span>
                <span><Database size={16} /> app</span>
              </div>
            </article>

            <button
              type="button"
              className="paygate-protected-branch is-blocked"
              onMouseEnter={() => setProtectedActive('blocked')}
              onFocus={() => setProtectedActive('blocked')}
              onBlur={() => setProtectedActive('forwarded')}
              aria-label="Unpaid request receives 402 blocked before reaching PayGate forwarding."
            >
              <span>Unpaid</span>
              <strong><BlockedTrafficIcon size={15} /> 402 blocked</strong>
              <i aria-hidden="true" />
            </button>

            <button
              type="button"
              className="paygate-protected-branch is-paid-left"
              onMouseEnter={() => setProtectedActive('forwarded')}
              onFocus={() => setProtectedActive('forwarded')}
              aria-label="Paid request is forwarded from the machine client to PayGate guard."
            >
              <span>Paid</span>
              <strong><CheckCircle2 size={15} /> paid</strong>
            </button>

            <article
              className="paygate-protected-card is-guard"
              onMouseEnter={() => setProtectedActive('guard')}
              onFocus={() => setProtectedActive('guard')}
            >
              <img src="/brand/paygate-mark.svg" alt="" />
              <h3>PayGate guard</h3>
              <span className="paygate-protected-gate-label">Payment gate</span>
              <div className="paygate-protected-guard-list">
                {PROTECTED_GUARD_ROWS.map(row => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} data-tone={row.tone}>
                      <Icon size={20} aria-hidden="true" />
                      <span>{row.label}</span>
                    </div>
                  );
                })}
              </div>
            </article>

            <button
              type="button"
              className="paygate-protected-branch is-paid-right"
              onMouseEnter={() => setProtectedActive('forwarded')}
              onFocus={() => setProtectedActive('forwarded')}
              aria-label="Paid request is forwarded from PayGate guard to the protected upstream API."
            >
              <span>Forward</span>
              <strong><CheckCircle2 size={15} /> forwarded</strong>
            </button>

            <article
              className="paygate-protected-card is-upstream"
              onMouseEnter={() => setProtectedActive('upstream')}
              onFocus={() => setProtectedActive('upstream')}
            >
              <div className="paygate-protected-card-title">
                <span><UpstreamLockIcon size={27} /></span>
                <h3>Protected upstream API</h3>
              </div>

              <div className="paygate-protected-upstream-url">
                <code>https://api.••••••.com/v1/signal</code>
                <span aria-hidden="true">hidden</span>
              </div>

              <div className="paygate-protected-code-label">Secret header check</div>

              <div className="paygate-protected-code" aria-label="X-PayGate-Secret upstream guard code snippet">
                <div>
                  <span>X-PayGate-Secret</span>
                  <Copy size={16} aria-hidden="true" />
                </div>
                <pre><code><span>1</span> if header !== <strong>PAYGATE_SECRET</strong>{'\n'}<span>2</span>   return 401</code></pre>
              </div>
            </article>
          </div>

          <div className="paygate-protected-facts" aria-label="Protected paid call guarantees">
            {PROTECTED_FACTS.map(fact => {
              const Icon = fact.icon;
              return (
                <div key={fact.label} className="paygate-protected-fact">
                  <Icon size={28} aria-hidden="true" />
                  <span>{fact.label}</span>
                </div>
              );
            })}
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
                Request receipt
              </p>
              <h2 id="paygate-proof-title">
                Every paid call leaves a <span>receipt.</span>
              </h2>
              <p>
                Track request identity, payment verification, upstream forwarding, and posted revenue from a single call.
              </p>

              <div className="paygate-proof-reasons" aria-label="What each receipt proves">
                {PROOF_REASONS.map(reason => {
                  const Icon = reason.icon;

                  return (
                    <div key={reason.label} className="paygate-proof-reason" data-tone={reason.tone}>
                      <span className="paygate-proof-reason-icon">
                        <Icon size={30} aria-hidden="true" />
                      </span>
                      <span>
                        <strong>{reason.label}</strong>
                        <small>{reason.body}</small>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="paygate-proof-stack">
              <div className="paygate-receipt-panel" aria-label="Live request receipt for a paid API call">
                <div className="paygate-receipt-head">
                  <div>
                    <span className="paygate-receipt-head-icon">
                      <ReceiptHeaderIcon size={26} />
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
                    {getProofCopyState('req') === 'copied' ? <ReceiptCopiedIcon size={18} /> : <ReceiptCopyIcon size={18} />}
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
                          <Icon size={28} />
                        </span>
                        <span className="paygate-receipt-label">{row.label}</span>
                        <i className="paygate-receipt-divider" aria-hidden="true" />
                        <code className="paygate-receipt-value">{row.value}</code>
                        <span className="paygate-receipt-copy" aria-hidden="true">
                          {copyState === 'copied' ? <ReceiptCopiedIcon size={19} /> : <ReceiptCopyIcon size={19} />}
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
                  <span className="is-forwarded">Forwarded to upstream <Activity size={17} aria-hidden="true" /></span>
                </div>
              </div>

              <aside className="paygate-proof-metrics" aria-label="Revenue outcome after a successful paid call">
                <div className="paygate-proof-metric">
                  <span className="paygate-proof-metric-icon">
                    <TrendingUp size={26} aria-hidden="true" />
                  </span>
                  <span>Developer revenue</span>
                  <strong>+0.009 USDC</strong>
                </div>
                <i className="paygate-proof-metric-divider" aria-hidden="true" />
                <div className="paygate-proof-metric">
                  <span className="paygate-proof-metric-icon">
                    <Layers3 size={26} aria-hidden="true" />
                  </span>
                  <span>PayGate fee</span>
                  <strong>+0.001 USDC</strong>
                </div>
                <p>
                  Escrow split posted after success
                  <Info size={15} aria-hidden="true" />
                </p>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section
        id="workspace"
        className="paygate-ops-section fs"
        aria-labelledby="paygate-ops-title"
      >
        <div className="paygate-ops-inner">
          <div className="paygate-ops-head">
            <p>Operate API revenue</p>
            <h2 id="paygate-ops-title">
              Monitor calls, revenue, and endpoints in <span>one workspace.</span>
            </h2>
            <p>
              Track calls, revenue, fees, escrow balance, and request activity without building billing infrastructure.
            </p>
          </div>

          <div className="paygate-ops-shell" aria-label="PayGate API revenue workspace preview">
            <aside className="paygate-ops-sidebar">
              <div className="paygate-ops-brand">
                <img src="/brand/paygate-mark.svg" alt="" />
                <strong>PayGate</strong>
              </div>

              <nav className="paygate-ops-nav" aria-label="Dashboard preview navigation">
                <span className="is-active"><LayoutDashboard size={22} aria-hidden="true" /> Overview</span>
                <span><CodeTileIcon size={22} aria-hidden="true" /> APIs</span>
                <span><Database size={22} aria-hidden="true" /> Payments</span>
                <span><Upload size={22} aria-hidden="true" /> Withdrawals</span>
              </nav>

              <div className="paygate-ops-live">
                <span><i aria-hidden="true" /> Live</span>
                <small>Stellar MPP</small>
                <ArrowRight size={16} aria-hidden="true" />
              </div>
            </aside>

            <main className="paygate-ops-main">
              <div className="paygate-ops-topbar">
                <h3>API revenue</h3>
                <div className="paygate-ops-controls">
                  <span className="paygate-ops-date"><CalendarDays size={17} aria-hidden="true" /> May 15 - Jun 15, 2026</span>
                  <span className="paygate-ops-range">
                    <button type="button">7D</button>
                    <button type="button" className="is-selected">30D</button>
                    <button type="button">90D</button>
                  </span>
                  <Button as={Link} to="/apis/new" size="sm" icon={<Plus size={18} aria-hidden="true" />} className="paygate-ops-create">
                    Create paid endpoint
                  </Button>
                </div>
              </div>

              <div className="paygate-ops-metrics" aria-label="API revenue metrics">
                {DASHBOARD_METRICS.map(metric => (
                  <div key={metric.label} className="paygate-ops-metric">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small><TrendingUp size={15} aria-hidden="true" /> {metric.delta}</small>
                  </div>
                ))}
              </div>

              <div className="paygate-ops-panels">
                <section className="paygate-ops-panel" aria-labelledby="paygate-ops-registry-title">
                  <div className="paygate-ops-panel-head">
                    <h4 id="paygate-ops-registry-title">API registry</h4>
                  </div>
                  <div className="paygate-ops-table is-registry">
                    <div className="paygate-ops-table-head" aria-hidden="true">
                      <span>API</span>
                      <span>Status</span>
                      <span>Price per call</span>
                      <span>Calls</span>
                      <span>Revenue</span>
                    </div>
                    {DASHBOARD_APIS.map(api => (
                      <div key={api.name} className="paygate-ops-table-row">
                        <span className="paygate-ops-api-name"><Database size={18} aria-hidden="true" /> {api.name}</span>
                        <span className="paygate-ops-badge is-green">{api.status}</span>
                        <span>{api.price}</span>
                        <span>{api.calls}</span>
                        <strong>{api.revenue}</strong>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="paygate-ops-link">View all APIs <ArrowRight size={16} aria-hidden="true" /></button>
                </section>

                <section className="paygate-ops-panel" aria-labelledby="paygate-ops-ledger-title">
                  <div className="paygate-ops-panel-head">
                    <h4 id="paygate-ops-ledger-title">Activity ledger</h4>
                    <button type="button">View all</button>
                  </div>
                  <div className="paygate-ops-table is-ledger">
                    <div className="paygate-ops-table-head" aria-hidden="true">
                      <span>Request ID</span>
                      <span>Event</span>
                      <span>Result</span>
                      <span>Revenue</span>
                    </div>
                    {DASHBOARD_ACTIVITY.map(row => (
                      <div key={row.id} className="paygate-ops-table-row">
                        <span className="paygate-ops-mono">{row.id}</span>
                        <span className={`paygate-ops-badge is-${row.tone}`}>{row.event}</span>
                        <span className={`paygate-ops-badge is-${row.resultTone}`}>{row.result}</span>
                        <strong className={row.revenue.startsWith('+') ? 'is-positive' : undefined}>{row.revenue}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="paygate-ops-withdraw">
                <span className="paygate-ops-withdraw-icon"><GuardIcon size={28} aria-hidden="true" /></span>
                <div>
                  <small>Escrow balance</small>
                  <strong>$84.20 <span>USDC</span></strong>
                </div>
                <i aria-hidden="true" />
                <div>
                  <small>Ready to withdraw</small>
                  <strong>$84.20 <span>USDC</span></strong>
                </div>
                <Button type="button" icon={<Upload size={18} aria-hidden="true" />} className="paygate-ops-withdraw-button">
                  Withdraw
                </Button>
              </div>
            </main>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="paygate-audience-section fs"
        aria-labelledby="paygate-audience-title"
      >
        <div className="paygate-audience-inner">
          <div className="paygate-audience-head">
            <p>Built for API owners</p>
            <h2 id="paygate-audience-title">
              Monetize the endpoints your users <span>already call.</span>
            </h2>
            <p>
              PayGate is for API owners and builders who want paid machine-readable access without rebuilding billing, metering, and revenue operations.
            </p>
          </div>

          <div className="paygate-audience-grid">
            <div className="paygate-audience-list" aria-label="PayGate use cases">
              {AUDIENCE_ROWS.map(row => {
                const Icon = row.icon;
                return (
                  <article key={row.title} className="paygate-audience-row">
                    <span className="paygate-audience-icon"><Icon size={30} aria-hidden="true" /></span>
                    <div className="paygate-audience-copy">
                      <h3>{row.title}</h3>
                      <p>{row.problem}</p>
                    </div>
                    <i aria-hidden="true" />
                    <div className="paygate-audience-outcome">
                      <CheckCircle2 size={30} aria-hidden="true" />
                      <p>{row.outcome}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="paygate-audience-cta" aria-label="Create your first paid endpoint">
              <div className="paygate-audience-cta-brand">
                <img src="/brand/paygate-mark.svg" alt="" />
                <strong>PayGate</strong>
              </div>
              <h3>Create your first paid endpoint</h3>
              <div className="paygate-audience-actions">
                <Button as={Link} to="/apis/new" size="lg">
                  Create paid endpoint <ArrowRight size={20} aria-hidden="true" />
                </Button>
                <Button
                  as="a"
                  href="https://github.com/wildanniam/paygate-stellar"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="lg"
                >
                  View docs <FileText size={18} aria-hidden="true" />
                </Button>
              </div>
              <div className="paygate-audience-url-flow">
                <span>From API URL</span>
                <div>
                  <code><Link2 size={18} aria-hidden="true" /> <span>api.company.com/signal</span></code>
                  <ArrowRight size={18} aria-hidden="true" />
                  <strong><CheckCircle2 size={18} aria-hidden="true" /> paid endpoint ready</strong>
                </div>
              </div>
            </aside>
          </div>

          <div className="paygate-audience-trust" aria-label="PayGate trust notes">
            {AUDIENCE_TRUST_NOTES.map(note => {
              const Icon = note.icon;
              return (
                <span key={note.label}>
                  <Icon size={26} aria-hidden="true" />
                  {note.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
