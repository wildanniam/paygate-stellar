import { Activity, ArrowRight, CalendarDays, CheckCircle2, Copy, Database, FileText, Fingerprint, Info, Layers3, LayoutDashboard, Link2, Plus, ShieldCheck, TrendingUp, Upload, Zap } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MarketingNavbar from '../components/MarketingNavbar.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import Button from '../components/ui/Button.jsx';

gsap.registerPlugin(ScrollTrigger);

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

export default function Landing() {
  const [heroActive, setHeroActive]   = useState('idle');
  const [copiedFlow, setCopiedFlow]   = useState(null);
  const [proofActive, setProofActive] = useState('mpp');
  const [proofVisible, setProofVisible] = useState(false);
  const [copiedProof, setCopiedProof] = useState(null);
  const [transformActive, setTransformActive] = useState('generate');
  const [copiedTransform, setCopiedTransform] = useState(null);
  const [protectedActive, setProtectedActive] = useState('forwarded');

  const landingRef     = useRef(null);
  const scrollProgressRef = useRef(null);
  const heroRailRef    = useRef(null);
  const proofRef       = useRef(null);
  const copyTimerRef   = useRef(null);
  const proofCopyTimerRef = useRef(null);
  const transformCopyTimerRef = useRef(null);

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

  useEffect(() => () => {
    window.clearTimeout(copyTimerRef.current);
    window.clearTimeout(proofCopyTimerRef.current);
    window.clearTimeout(transformCopyTimerRef.current);
  }, []);

  // ── Landing scroll motion foundation ──
  useGSAP(() => {
    const root = landingRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const progressBar = scrollProgressRef.current;
    const sections = gsap.utils.toArray('.fs', root);

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
      setTransformActive('proxy');
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
    heroIntro
      .from('.paygate-hero-title', { autoAlpha: 0, y: 24, duration: 0.72 }, 0.05)
      .from('.paygate-hero-copy', { autoAlpha: 0, y: 16, duration: 0.56 }, 0.18)
      .from('.paygate-hero-actions .pg-button', { autoAlpha: 0, y: 14, duration: 0.48, stagger: 0.08 }, 0.32);

    const setStage = () => {
      const current = {
        transform: transformActive,
        protected: protectedActive,
        proof: proofActive,
      };

      return {
        transform(stage) {
          if (current.transform === stage) return;
          current.transform = stage;
          setTransformActive(stage);
        },
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
      gsap.from(transformSection.querySelectorAll('.paygate-transform-head > *, .paygate-transform-panel, .paygate-transform-outcome'), {
        autoAlpha: 0,
        y: 20,
        scale: 0.99,
        duration: 0.64,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: {
          trigger: transformSection,
          start: 'top 76%',
          once: true,
        },
      });

      ScrollTrigger.create({
        trigger: transformSection,
        start: 'top 68%',
        end: 'bottom 34%',
        onUpdate: self => {
          const progress = self.progress;
          if (progress < 0.24) stage.transform('paste');
          else if (progress < 0.48) stage.transform('price');
          else if (progress < 0.74) stage.transform('generate');
          else stage.transform('proxy');
        },
        onEnter: () => stage.transform('paste'),
        onLeave: () => stage.transform('proxy'),
        onEnterBack: () => stage.transform('generate'),
      });
    }

    if (protectedSection) {
      gsap.from(protectedSection.querySelectorAll('.paygate-protected-head > *, .paygate-protected-card, .paygate-protected-branch, .paygate-protected-fact'), {
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
    const animated = [leftPill, rightPill, node, revenue, ...lines, ...arrows, ...statuses].filter(Boolean);

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

    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
    timeline
      .to(node, { autoAlpha: 1, scale: 1, y: 0, duration: 0.55 }, 0)
      .to(leftPill, { autoAlpha: 1, x: 0, duration: 0.48 }, 0.1)
      .to(rightPill, { autoAlpha: 1, x: 0, duration: 0.48 }, 0.22)
      .to(lines, { scaleX: 1, duration: 0.72, stagger: 0.08 }, 0.34)
      .to(arrows, { autoAlpha: 1, scale: 1, duration: 0.26, stagger: 0.08 }, 0.7)
      .to(statuses, { autoAlpha: 1, y: 0, duration: 0.36, stagger: 0.12 }, 0.88)
      .to(revenue, { autoAlpha: 1, y: 0, duration: 0.44 }, 1.28)
      .call(() => setHeroActive('challenge'), null, 1.05)
      .call(() => setHeroActive('paid'), null, 1.35)
      .call(() => setHeroActive('success'), null, 1.68)
      .call(() => setHeroActive('proxy'), null, 2.02)
      .call(() => setHeroActive('idle'), null, 2.9);

    return () => timeline.kill();
  }, { scope: heroRailRef });

  return (
    <div ref={landingRef} className="paygate-landing">

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

      <MarketingNavbar />

      {/* ── HERO ── */}
      <section className="paygate-hero">
        <div className="paygate-hero-inner">
          <h1 className="paygate-hero-title">
            Paste an API URL.
            <span>Charge per call.</span>
          </h1>

          <p className="paygate-hero-copy">
            PayGate creates a paid proxy, verifies payment, and tracks API revenue.
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
                  >
                    Generate paid endpoint
                  </Button>
                  <p>PayGate handles payment and forwards successful calls.</p>
                </div>
              </div>
            </article>

            <article
              className="paygate-transform-panel is-after"
              onMouseEnter={() => setTransformActive('proxy')}
              onFocus={() => setTransformActive('proxy')}
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
              tabIndex={0}
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
              <strong><BlockedTrafficIcon size={16} /> 402 blocked</strong>
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
              <strong><CheckCircle2 size={16} /> forwarded</strong>
            </button>

            <article
              className="paygate-protected-card is-guard"
              onMouseEnter={() => setProtectedActive('guard')}
              onFocus={() => setProtectedActive('guard')}
              tabIndex={0}
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
              <span>Paid</span>
              <strong><CheckCircle2 size={16} /> forwarded</strong>
            </button>

            <article
              className="paygate-protected-card is-upstream"
              onMouseEnter={() => setProtectedActive('upstream')}
              onFocus={() => setProtectedActive('upstream')}
              tabIndex={0}
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
