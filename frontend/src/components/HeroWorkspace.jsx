import {
  Activity,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronDown,
  Circle,
  Copy,
  Pause,
  Play,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const RANGE_DATA = {
  '7d': {
    label: 'Last 7 days',
    revenue: '+18.40 USDC',
    revenueNote: 'illustrative period trend',
    axis: ['20', '15', '10', '0'],
    points: [
      { label: 'Mon', value: '12.10', y: 178 },
      { label: 'Tue', value: '13.80', y: 160 },
      { label: 'Wed', value: '14.60', y: 154 },
      { label: 'Thu', value: '15.20', y: 138 },
      { label: 'Fri', value: '16.80', y: 126 },
      { label: 'Sat', value: '17.60', y: 86 },
      { label: 'Sun', value: '18.40', y: 48 },
    ],
    metrics: { calls: '628', success: '99.7%', latency: '128ms' },
  },
  '30d': {
    label: 'This month',
    revenue: '+84.20 USDC',
    revenueNote: 'illustrative period trend',
    axis: ['100', '75', '50', '0'],
    points: [
      { label: 'May 1', axisLabel: 'May 1', value: '42.10', chartX: 119, y: 126 },
      { label: 'May 4', value: '39.80', chartX: 188, y: 152 },
      { label: 'May 8', axisLabel: 'May 8', value: '46.30', chartX: 260, y: 118 },
      { label: 'May 12', value: '51.20', chartX: 326, y: 105 },
      { label: 'May 15', axisLabel: 'May 15', value: '48.90', chartX: 394, y: 119 },
      { label: 'May 22', axisLabel: 'May 22', value: '69.80', chartX: 474, y: 33 },
      { label: 'May 25', value: '67.40', chartX: 544, y: 42 },
      { label: 'May 27', value: '78.60', chartX: 619, y: -4 },
      { label: 'May 29', axisLabel: 'May 29', value: '84.20', chartX: 679, y: -25 },
    ],
    metrics: { calls: '2,842', success: '99.9%', latency: '124ms' },
  },
  '90d': {
    label: 'Last 90 days',
    revenue: '+241.60 USDC',
    revenueNote: 'illustrative period trend',
    axis: ['250', '175', '100', '0'],
    points: [
      { label: 'Apr', value: '98.00', y: 198 },
      { label: 'May', value: '121.50', y: 186 },
      { label: 'Jun', value: '158.40', y: 180 },
      { label: 'Jul', value: '182.90', y: 142 },
      { label: 'Aug', value: '207.30', y: 138 },
      { label: 'Sep', value: '226.80', y: 84 },
      { label: 'Oct', value: '241.60', y: 46 },
    ],
    metrics: { calls: '8,412', success: '99.8%', latency: '121ms' },
  },
};

const RANGE_OPTIONS = [
  { key: '7d', shortLabel: '7D' },
  { key: '30d', shortLabel: '30D' },
  { key: '90d', shortLabel: '90D' },
];

function LatencyWaveIcon({ size = 17, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 10c3.1-6 6.2-6 9.3 0s6.2 6 9.3 0" />
      <path d="M22.4 10c2.4-5.2 4.8-5.2 7.2 0s4.8 5.2 5.4 0" />
    </svg>
  );
}

const METRIC_DEFINITIONS = [
  { key: 'calls', label: 'Total Calls', note: 'paid requests', icon: ChartNoAxesColumnIncreasing },
  { key: 'success', label: 'Success Rate', note: '200 OK responses', icon: Circle },
  { key: 'latency', label: 'Avg. Latency', note: 'upstream response', icon: LatencyWaveIcon },
];

const CHART_START_X = 118;
const CHART_END_X = 675;

function getChartX(index, pointCount) {
  if (pointCount <= 1) return CHART_START_X;
  return CHART_START_X + ((CHART_END_X - CHART_START_X) * index) / (pointCount - 1);
}

function buildPath(points) {
  const positions = points.map((point) => ({ x: point.x, y: point.y }));
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  return positions.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const next = positions[index];
    const previous = positions[index - 1];
    const segment = next.x - previous.x;
    const controlOffset = segment / 3;
    const before = positions[index - 2] || previous;
    const after = positions[index + 1] || next;
    const incomingSlope = (next.y - before.y) / Math.max(1, next.x - before.x);
    const outgoingSlope = (after.y - previous.y) / Math.max(1, after.x - previous.x);
    const minimum = Math.min(previous.y, next.y);
    const maximum = Math.max(previous.y, next.y);
    const firstControlY = clamp(previous.y + incomingSlope * controlOffset, minimum, maximum);
    const secondControlY = clamp(next.y - outgoingSlope * controlOffset, minimum, maximum);

    // Smooth the period trend without introducing overshoot between data points.
    return `${path} C ${previous.x + controlOffset} ${firstControlY}, ${next.x - controlOffset} ${secondControlY}, ${next.x} ${next.y}`;
  }, '');
}

function buildAreaPath(points) {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  return `${buildPath(points)} L ${lastPoint.x} 214 L ${firstPoint.x} 214 Z`;
}

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

function setMotionVariables(element, x, y) {
  if (!element) return;

  const set = (name, value, unit = 'px') => element.style.setProperty(name, `${value}${unit}`);

  set('--workspace-back-x', x * 11);
  set('--workspace-back-y', y * 7);
  set('--workspace-middle-x', x * 7);
  set('--workspace-middle-y', y * 5);
  set('--workspace-front-x', x * 4);
  set('--workspace-front-y', y * 3);
  set('--workspace-surface-x', x * 2.6);
  set('--workspace-surface-y', y * 2.1);
  set('--workspace-surface-z', Math.abs(x) + Math.abs(y) > 0.08 ? 11 : 0);
  set('--workspace-surface-rotate-x', y * -1.8, 'deg');
  set('--workspace-surface-rotate-y', x * 2.2, 'deg');
  set('--workspace-surface-rotate-z', x * 0.32, 'deg');
  set('--workspace-shine-x', 50 + x * 30, '%');
  set('--workspace-shine-y', 38 + y * 24, '%');
}

export default function HeroWorkspace({ proxyUrl }) {
  const [range, setRange] = useState('30d');
  const [activeMetric, setActiveMetric] = useState(null);
  const [activePoint, setActivePoint] = useState(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);
  const [copyState, setCopyState] = useState('idle');
  const workspaceRef = useRef(null);
  const rangeMenuRef = useRef(null);
  const motionFrameRef = useRef(null);
  const motionTargetRef = useRef({ x: 0, y: 0 });
  const motionValueRef = useRef({ x: 0, y: 0 });
  const copyTimerRef = useRef(null);
  const data = RANGE_DATA[range];

  const points = useMemo(() => data.points.map((point, index) => ({
    ...point,
    x: point.chartX ?? getChartX(index, data.points.length),
  })), [data]);

  useEffect(() => {
    const element = workspaceRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { rootMargin: '120px 0px', threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    window.clearTimeout(copyTimerRef.current);
    window.cancelAnimationFrame(motionFrameRef.current);
  }, []);

  useEffect(() => {
    if (!isRangeMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!rangeMenuRef.current?.contains(event.target)) setIsRangeMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsRangeMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isRangeMenuOpen]);

  const animatePointer = () => {
    const element = workspaceRef.current;
    if (!element) return;

    const target = motionTargetRef.current;
    const current = motionValueRef.current;
    const easing = target.x === 0 && target.y === 0 ? 0.22 : 0.12;
    current.x += (target.x - current.x) * easing;
    current.y += (target.y - current.y) * easing;
    if (Math.abs(target.x - current.x) < 0.005) current.x = target.x;
    if (Math.abs(target.y - current.y) < 0.005) current.y = target.y;
    setMotionVariables(element, current.x, current.y);

    const settled = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
    if (!settled) motionFrameRef.current = window.requestAnimationFrame(animatePointer);
    else motionFrameRef.current = null;
  };

  const schedulePointerMotion = () => {
    if (motionFrameRef.current === null) motionFrameRef.current = window.requestAnimationFrame(animatePointer);
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = workspaceRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    motionTargetRef.current = {
      x: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1)),
      y: Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1)),
    };
    element.dataset.pointerActive = 'true';
    schedulePointerMotion();
  };

  const handlePointerLeave = () => {
    const element = workspaceRef.current;
    if (!element) return;
    motionTargetRef.current = { x: 0, y: 0 };
    element.dataset.pointerActive = 'false';
    schedulePointerMotion();
  };

  const handleRangeChange = (nextRange) => {
    setRange(nextRange);
    setActivePoint(null);
    setIsTooltipVisible(false);
    setIsRangeMenuOpen(false);
  };

  const handleCopy = async () => {
    try {
      await copyText(proxyUrl);
      setCopyState('copied');
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('error');
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  const selectedPoint = points[activePoint] || points[points.length - 1];

  return (
    <div
      ref={workspaceRef}
      className="paygate-hero-workspace"
      data-paused={isPaused ? 'true' : 'false'}
      data-visible={isVisible ? 'true' : 'false'}
      data-pointer-active="false"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="paygate-workspace-rail is-back" aria-hidden="true" />
      <div className="paygate-workspace-rail is-middle" aria-hidden="true" />
      <div className="paygate-workspace-rail is-front" aria-hidden="true" />

      <div className="paygate-workspace-surface">
        <div className="paygate-workspace-topbar">
          <div className="paygate-workspace-window-title">
            <span className="paygate-workspace-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>PayGate / Revenue workspace</span>
          </div>
          <div className="paygate-workspace-toolbar-actions">
            <span className="paygate-workspace-preview-label">Illustrative testnet preview</span>
            <button
              type="button"
              className="paygate-workspace-icon-button"
              onClick={() => setIsPaused((paused) => !paused)}
              aria-label={isPaused ? 'Play revenue chart animation' : 'Pause revenue chart animation'}
              title={isPaused ? 'Play chart animation' : 'Pause chart animation'}
            >
              {isPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="paygate-workspace-heading">
          <div>
            <p className="paygate-workspace-label">Revenue</p>
            <strong>{data.revenue}</strong>
            <span>{data.revenueNote}</span>
          </div>
          <div className="paygate-workspace-range-menu-wrap" ref={rangeMenuRef}>
            <button
              type="button"
              className="paygate-workspace-status"
              aria-haspopup="menu"
              aria-expanded={isRangeMenuOpen}
              onClick={() => setIsRangeMenuOpen((open) => !open)}
            >
              <span className="paygate-workspace-status-dot" aria-hidden="true" />
              <span>{data.label}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            {isRangeMenuOpen ? (
              <div className="paygate-workspace-range-menu" role="menu" aria-label="Revenue chart range">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={range === option.key}
                    className={range === option.key ? 'is-active' : ''}
                    onClick={() => handleRangeChange(option.key)}
                  >
                    <span>{RANGE_DATA[option.key].label}</span>
                    <small>{option.shortLabel}</small>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="paygate-workspace-chart-shell">
          <div className="paygate-workspace-y-axis" aria-hidden="true">
            {data.axis.map((label) => <span key={label}>{label}</span>)}
          </div>
          <div
            className="paygate-workspace-chart"
            data-range={range}
            aria-label={`Illustrative API revenue trend for ${data.label}`}
            onMouseLeave={() => setIsTooltipVisible(false)}
          >
            <svg viewBox="0 0 680 240" preserveAspectRatio="none" role="img" aria-labelledby="paygate-workspace-chart-title">
              <title id="paygate-workspace-chart-title">Illustrative PayGate API revenue trend</title>
              <path className="paygate-workspace-chart-area" d={buildAreaPath(points)} />
              <path key={range} className="paygate-workspace-chart-line" d={buildPath(points)} pathLength="1" />
              {points.map((point, index) => (
                <circle
                  key={point.label}
                  className={activePoint === index ? 'is-active' : ''}
                  cx={point.x}
                  cy={point.y}
                  r={activePoint === index ? 5 : 3.5}
                  tabIndex="0"
                  role="button"
                  aria-label={`${point.label}: ${point.value} USDC`}
                  onClick={() => {
                    setActivePoint(index);
                    setIsTooltipVisible(true);
                  }}
                  onMouseEnter={() => {
                    setActivePoint(index);
                    setIsTooltipVisible(true);
                  }}
                  onFocus={() => {
                    setActivePoint(index);
                    setIsTooltipVisible(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setActivePoint(index);
                    }
                  }}
                />
            ))}
            </svg>
            {isTooltipVisible && activePoint !== null ? (
              <div
                className="paygate-workspace-chart-tooltip"
                style={{ left: `${(selectedPoint.x / 680) * 100}%`, top: `${(selectedPoint.y / 240) * 100}%` }}
                aria-live="polite"
              >
                <strong>{selectedPoint.value} USDC</strong>
                <span>{selectedPoint.label}</span>
              </div>
            ) : null}
            <div className="paygate-workspace-x-axis" aria-hidden="true">
              {points
                .filter((point) => point.axisLabel || range !== '30d')
                .map((point) => <span key={point.label}>{point.axisLabel || point.label}</span>)}
            </div>
          </div>
        </div>

        <div className="paygate-workspace-range" role="group" aria-label="Quickly change revenue chart range">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={range === option.key}
              className={range === option.key ? 'is-active' : ''}
              onClick={() => handleRangeChange(option.key)}
            >
              {option.shortLabel}
            </button>
          ))}
        </div>

        <div className="paygate-workspace-metrics">
          {METRIC_DEFINITIONS.map((metric) => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.key}
                type="button"
                className={activeMetric === metric.key ? 'is-active' : ''}
                aria-pressed={activeMetric === metric.key}
                onClick={() => setActiveMetric(metric.key)}
              >
                <span className="paygate-workspace-metric-icon"><Icon size={17} aria-hidden="true" /></span>
                <span className="paygate-workspace-metric-copy">
                  <span>{metric.label}</span>
                  <strong>{data.metrics[metric.key]}</strong>
                  <small>{metric.note}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="paygate-workspace-footer">
          <div className="paygate-workspace-footer-health">
            <span className="paygate-workspace-status-dot" aria-hidden="true" />
            <span>Paid endpoint healthy</span>
            <ShieldCheck size={15} aria-hidden="true" />
          </div>
          <div className="paygate-workspace-footer-meta">
            <span><WalletCards size={14} aria-hidden="true" /> 2 active APIs</span>
            <span><Activity size={14} aria-hidden="true" /> MPP ready</span>
          </div>
          <button
            type="button"
            className="paygate-workspace-copy"
            onClick={handleCopy}
            aria-label={`${copyState === 'copied' ? 'Copied' : 'Copy'} paid endpoint ${proxyUrl}`}
          >
            <span>{copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy endpoint'}</span>
            {copyState === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
}
