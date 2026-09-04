import {
  ArrowRight,
  Check,
  Copy,
  Link2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const FLOW_SEQUENCE = ['request', 'required', 'paid', 'success'];

const FLOW_STAGE_COPY = {
  request: 'Request received. PayGate is checking the call.',
  required: 'Payment is required before the upstream API is reached.',
  paid: 'MPP payment verified. The request can continue.',
  success: 'Payment verified and the response returned upstream.',
};

const FLOW_STAGE_LABELS = {
  request: 'Request received',
  required: '402 Required',
  paid: 'MPP payment verified',
  success: '200 OK returned',
};

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the browser-compatible copy path when permission is denied.
    }
  }

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

function stageRank(stage) {
  return FLOW_SEQUENCE.indexOf(stage);
}

function EndpointCard({ kind, label, url, copied, active, onCopy }) {
  const isProxy = kind === 'proxy';

  return (
    <article
      className={`paygate-concept-flow-endpoint paygate-gate-endpoint is-${kind}`}
      data-active={active ? 'true' : 'false'}
    >
      <div className="paygate-concept-flow-endpoint-label paygate-gate-endpoint-label">
        <span>{label}</span>
      </div>
      <button
        type="button"
        className="paygate-concept-flow-url paygate-gate-url"
        onClick={onCopy}
        aria-label={`${copied ? 'Copied' : 'Copy'} ${isProxy ? 'paid endpoint' : 'original API'} URL ${url}`}
      >
        <span className="paygate-concept-flow-url-icon paygate-gate-url-icon">
          {copied ? <Check size={17} aria-hidden="true" /> : <Link2 size={17} aria-hidden="true" />}
        </span>
        <code>{url}</code>
        <span className="paygate-concept-flow-url-action">
          {copied ? 'Copied' : <Copy size={14} aria-hidden="true" />}
        </span>
      </button>
    </article>
  );
}

function FlowConnector({ side, active }) {
  return (
    <div
      className={`paygate-concept-flow-connector paygate-gate-connector is-${side} ${active ? 'is-active' : ''}`}
      aria-hidden="true"
    >
      <div className="paygate-gate-streams">
        {[-12, -6, 0, 6, 12].map((offset, index) => (
          <span
            key={offset}
            className="paygate-gate-stream"
            style={{ '--stream-offset': `${offset}px`, '--stream-delay': `${index * -0.18}s` }}
          />
        ))}
      </div>
      {side === 'right' ? (
        <ArrowRight size={17} strokeWidth={1.7} />
      ) : (
        <span className="paygate-gate-ingress-dot" />
      )}
    </div>
  );
}

function PaymentNetwork() {
  const offsets = [-60, -48, -36, -25, -15, -7, 0, 7, 15, 25, 36, 48, 60];
  const rightOffsets = [-14, -8, -2, 5, 14, 25, 38, 52, 66, 80, 94, 108, 122];
  const leftPath = offset => `M 250 166 C 298 166, 350 ${166 + offset * 0.18}, 410 ${166 + offset * 0.70} C 454 ${166 + offset}, 480 ${166 + offset * 0.38}, 500 166`;
  const rightPath = offset => `M 500 166 C 558 ${166 + offset * 0.06}, 622 ${174 + offset * 0.18}, 706 ${190 + offset * 0.42} C 810 ${214 + offset * 0.72}, 892 ${166 + offset * 1.12}, 1000 ${154 + offset * 0.84}`;
  const particles = [
    { side: 'left', cx: 250, cy: 166, r: 3.1 },
    { side: 'left', cx: 310, cy: 163, r: 1.8 },
    { side: 'left', cx: 354, cy: 172, r: 1.7 },
    { side: 'left', cx: 395, cy: 157, r: 1.9 },
    { side: 'left', cx: 433, cy: 177, r: 1.7 },
    { side: 'left', cx: 466, cy: 162, r: 1.5 },
    { side: 'right', cx: 560, cy: 166, r: 1.7 },
    { side: 'right', cx: 620, cy: 178, r: 1.7 },
    { side: 'right', cx: 682, cy: 196, r: 1.8 },
    { side: 'right', cx: 744, cy: 220, r: 1.7 },
    { side: 'right', cx: 808, cy: 236, r: 1.5 },
    { side: 'right', cx: 875, cy: 264, r: 1.8 },
    { side: 'right', cx: 940, cy: 286, r: 1.6 },
  ];

  return (
    <svg
      className="paygate-gate-network"
      viewBox="0 0 1000 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g className="paygate-gate-network-side is-left">
        {offsets.map(offset => (
          <path
            key={`left-${offset}`}
            d={leftPath(offset)}
          />
        ))}
      </g>
      <g className="paygate-gate-network-side is-right">
        {rightOffsets.map(offset => (
          <path
            key={`right-${offset}`}
            d={rightPath(offset)}
          />
        ))}
      </g>
      <g className="paygate-gate-network-pulse">
        {rightOffsets.map(offset => (
          <path key={`left-pulse-${offset}`} d={leftPath(offset)} />
        ))}
        {offsets.map(offset => (
          <path key={`right-pulse-${offset}`} d={rightPath(offset)} />
        ))}
      </g>
      <g className="paygate-gate-network-dots">
        {particles.map(({ side, cx, cy, r }, index) => (
          <circle
            className="paygate-gate-network-particle"
            key={`${side}-dot-${index}`}
            cx={cx}
            cy={cy}
            r={r}
          />
        ))}
      </g>
    </svg>
  );
}

export default function HowItWorksDiagram({ sourceUrl, proxyUrl }) {
  const [copied, setCopied] = useState(null);
  const [activeStage, setActiveStage] = useState('success');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const copyTimerRef = useRef(null);
  const flowRef = useRef(null);

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), []);

  useEffect(() => {
    const element = flowRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.18,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying || !isInView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const interval = window.setInterval(() => {
      setActiveStage(current => {
        const nextIndex = (stageRank(current) + 1) % FLOW_SEQUENCE.length;
        return FLOW_SEQUENCE[nextIndex];
      });
    }, 2600);

    return () => window.clearInterval(interval);
  }, [isPlaying, isInView]);

  const handleCopy = async (kind, value) => {
    try {
      await copyText(value);
      setCopied(kind);
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const selectStage = stage => {
    setActiveStage(stage);
    setIsPlaying(false);
  };

  const replay = () => {
    setActiveStage('request');
    setIsPlaying(true);
  };

  const currentRank = stageRank(activeStage);
  const hasReached = stage => currentRank >= stageRank(stage);

  return (
    <div
      ref={flowRef}
      className="paygate-concept-flow paygate-gate-flow"
      data-flow-stage={activeStage}
      data-flow-playing={isPlaying ? 'true' : 'false'}
      data-flow-visible={isInView ? 'true' : 'false'}
      aria-label="PayGate request and payment flow"
    >
      <div className="paygate-concept-flow-glow paygate-gate-glow" aria-hidden="true" />

      <div className="paygate-concept-flow-header paygate-gate-header">
        <div className="paygate-gate-heading">
          <p className="paygate-gate-eyebrow">How it works</p>
          <h2 id="paygate-transform-title" className="paygate-gate-title">
            One gate between your API and <span>every paid call.</span>
          </h2>
        </div>

        <div className="paygate-concept-flow-controls paygate-gate-controls">
          <span className="paygate-concept-flow-note" aria-live="polite">{FLOW_STAGE_LABELS[activeStage]}</span>
          <button
            type="button"
            className="paygate-concept-flow-replay paygate-gate-control"
            onClick={isPlaying ? () => setIsPlaying(false) : replay}
            aria-label={isPlaying ? 'Pause flow animation' : 'Replay PayGate flow'}
            title={isPlaying ? 'Pause flow animation' : 'Replay PayGate flow'}
          >
            {isPlaying ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
            <span>{isPlaying ? 'Pause' : 'Replay'}</span>
          </button>
          <button
            type="button"
            className="paygate-concept-flow-reset paygate-gate-control"
            onClick={replay}
            aria-label="Restart PayGate flow"
            title="Restart PayGate flow"
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="paygate-concept-flow-route paygate-gate-route">
        <PaymentNetwork />
        <EndpointCard
          kind="source"
          label="Your API"
          url={sourceUrl}
          active={activeStage === 'request'}
          copied={copied === 'source'}
          onCopy={() => handleCopy('source', sourceUrl)}
        />

        <FlowConnector side="left" active={hasReached('required')} />

        <article
          className={`paygate-concept-flow-gate paygate-gate-object ${hasReached('required') ? 'is-active' : ''}`}
          aria-label="PayGate paid proxy payment gate"
        >
          <img
            className="paygate-gate-reference-art"
            src="/brand/paygate-gate-reference-transparent.png"
            srcSet="/brand/paygate-gate-reference-transparent.png 1x, /brand/paygate-gate-reference-transparent-2x.png 2x"
            alt=""
            aria-hidden="true"
            decoding="async"
          />
          <span className="paygate-gate-plane paygate-gate-portal is-back" aria-hidden="true">
            <span className="paygate-gate-portal-frame">
              <span className="paygate-gate-portal-beam is-top" />
              <span className="paygate-gate-portal-beam is-right" />
              <span className="paygate-gate-portal-beam is-bottom" />
              <span className="paygate-gate-portal-beam is-left" />
            </span>
          </span>
          <span className="paygate-gate-plane paygate-gate-portal is-front" aria-hidden="true">
            <span className="paygate-gate-portal-frame">
              <span className="paygate-gate-portal-opening" />
              <span className="paygate-gate-portal-beam is-top" />
              <span className="paygate-gate-portal-beam is-right" />
              <span className="paygate-gate-portal-beam is-bottom" />
              <span className="paygate-gate-portal-beam is-left" />
            </span>
          </span>
          <span className="paygate-gate-plane paygate-gate-portal is-middle" aria-hidden="true">
            <span className="paygate-gate-portal-frame">
              <span className="paygate-gate-portal-beam is-top" />
              <span className="paygate-gate-portal-beam is-right" />
              <span className="paygate-gate-portal-beam is-bottom" />
              <span className="paygate-gate-portal-beam is-left" />
            </span>
          </span>
          <span className="paygate-gate-ground" aria-hidden="true" />
          <span className="paygate-gate-core">
            <span className="paygate-concept-flow-gate-mark paygate-gate-mark">
              <img src="/brand/paygate-mark.svg" alt="" />
            </span>
          </span>
          <span className="paygate-gate-verified">
            <ShieldCheck size={13} aria-hidden="true" />
            Payment verified
          </span>
          <span className="paygate-gate-accessible-label">PayGate paid proxy</span>
        </article>

        <FlowConnector side="right" active={hasReached('paid')} />

        <EndpointCard
          kind="proxy"
          label="Your paid endpoint"
          url={proxyUrl}
          active={activeStage === 'success'}
          copied={copied === 'proxy'}
          onCopy={() => handleCopy('proxy', proxyUrl)}
        />
      </div>

      <div className="paygate-concept-flow-outcomes paygate-gate-lifecycle" role="group" aria-label="PayGate flow outcomes">
        <div className="paygate-concept-flow-branch" aria-hidden="true" />
        <p className="paygate-gate-lifecycle-heading">On every call</p>
        <button
          type="button"
          className={`paygate-concept-flow-status paygate-gate-step is-warning ${activeStage === 'required' ? 'is-active' : ''} ${hasReached('paid') ? 'is-complete' : ''}`}
          aria-pressed={activeStage === 'required'}
          onClick={() => selectStage('required')}
        >
          <span className="paygate-gate-step-dot" aria-hidden="true" />
          <strong>402 Required</strong>
          <span className="paygate-gate-accessible-detail">Access blocked until payment</span>
        </button>
        <button
          type="button"
          className={`paygate-concept-flow-status paygate-gate-step is-paid ${activeStage === 'paid' ? 'is-active' : ''} ${hasReached('success') ? 'is-complete' : ''}`}
          aria-pressed={activeStage === 'paid'}
          onClick={() => selectStage('paid')}
        >
          <span className="paygate-gate-step-dot" aria-hidden="true" />
          <strong>MPP Paid</strong>
          <span className="paygate-gate-accessible-detail">Payment verified on Stellar</span>
        </button>
        <button
          type="button"
          className={`paygate-concept-flow-status paygate-gate-step is-success ${activeStage === 'success' ? 'is-active' : ''}`}
          aria-pressed={activeStage === 'success'}
          onClick={() => selectStage('success')}
        >
          <span className="paygate-gate-step-dot" aria-hidden="true" />
          <strong>200 OK</strong>
          <span className="paygate-gate-accessible-detail">Forwarded to your upstream API</span>
        </button>
      </div>

      <div className="paygate-concept-flow-revenue paygate-gate-footer">
        <span>Testnet</span>
      </div>

      <p className="paygate-concept-flow-sr-status" aria-live="polite">
        {FLOW_STAGE_COPY[activeStage]}
      </p>
    </div>
  );
}
