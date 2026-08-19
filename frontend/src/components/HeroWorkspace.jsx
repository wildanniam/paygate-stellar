import { useMemo, useRef, useState } from 'react';

const RANGE_ORDER = ['7d', '30d', '90d'];

const RANGE_DATA = {
  '7d': {
    label: 'Last 7 days',
    revenue: '+18.40 USDC',
    axis: ['18.4', '12.3', '6.1', '0'],
    dates: [
      { x: 202, label: 'Mon' },
      { x: 344, label: 'Wed' },
      { x: 492, label: 'Fri' },
      { x: 642, label: 'Sat' },
      { x: 776, label: 'Sun' },
    ],
    points: [
      { x: 202, y: 344, label: 'Mon', value: '4.20' },
      { x: 286, y: 330, label: 'Tue', value: '6.10' },
      { x: 370, y: 306, label: 'Wed', value: '8.30' },
      { x: 454, y: 278, label: 'Thu', value: '10.90' },
      { x: 538, y: 262, label: 'Fri', value: '12.70' },
      { x: 632, y: 211, label: 'Sat', value: '15.80' },
      { x: 774, y: 173, label: 'Sun', value: '18.40' },
    ],
    metrics: { calls: '628', success: '99.7%', latency: '128ms' },
  },
  '30d': {
    label: 'This month',
    revenue: '+84.20 USDC',
    axis: ['84.2', '56.1', '28.1', '0'],
    dates: [
      { x: 202, label: 'May 1' },
      { x: 344, label: 'May 8' },
      { x: 492, label: 'May 15' },
      { x: 642, label: 'May 22' },
      { x: 776, label: 'May 29' },
    ],
    points: [
      { x: 202, y: 346, label: 'May 1', value: '12.40' },
      { x: 272, y: 337, label: 'May 4', value: '16.10' },
      { x: 344, y: 312, label: 'May 8', value: '24.80' },
      { x: 416, y: 302, label: 'May 12', value: '31.50' },
      { x: 488, y: 274, label: 'May 15', value: '42.10' },
      { x: 558, y: 254, label: 'May 18', value: '49.80' },
      { x: 628, y: 207, label: 'May 22', value: '63.40' },
      { x: 702, y: 181, label: 'May 26', value: '75.60' },
      { x: 778, y: 154, label: 'May 29', value: '84.20' },
    ],
    metrics: { calls: '2,842', success: '99.9%', latency: '124ms' },
  },
  '90d': {
    label: 'Last 90 days',
    revenue: '+241.60 USDC',
    axis: ['241.6', '161.0', '80.5', '0'],
    dates: [
      { x: 202, label: 'Aug' },
      { x: 344, label: 'Sep' },
      { x: 492, label: 'Oct' },
      { x: 642, label: 'Nov' },
      { x: 776, label: 'Dec' },
    ],
    points: [
      { x: 202, y: 354, label: 'Aug 1', value: '38.20' },
      { x: 274, y: 341, label: 'Aug 15', value: '52.40' },
      { x: 346, y: 329, label: 'Sep 1', value: '67.10' },
      { x: 418, y: 294, label: 'Sep 15', value: '98.30' },
      { x: 490, y: 276, label: 'Oct 1', value: '121.50' },
      { x: 560, y: 236, label: 'Oct 15', value: '158.40' },
      { x: 630, y: 212, label: 'Nov 1', value: '182.90' },
      { x: 704, y: 169, label: 'Nov 15', value: '215.70' },
      { x: 778, y: 133, label: 'Dec 1', value: '241.60' },
    ],
    metrics: { calls: '8,412', success: '99.8%', latency: '121ms' },
  },
};

const METRICS = [
  {
    key: 'calls',
    label: 'Total Calls',
    note: 'paid requests',
    path: 'M118 463 Q116 463 114 471 L95 545 Q93 556 105 557 L306 554 Q314 554 316 545 L330 468 Q332 458 321 458 Z',
    textX: 126,
    iconX: 280,
    contentY: 0,
  },
  {
    key: 'success',
    label: 'Success Rate',
    note: 'successful calls',
    path: 'M347 456 Q344 456 342 465 L326 542 Q324 551 336 551 L531 545 Q539 545 541 536 L552 458 Q554 449 543 449 Z',
    textX: 354,
    iconX: 502,
    contentY: -4,
  },
  {
    key: 'latency',
    label: 'Avg. Latency',
    note: 'upstream response',
    path: 'M568 447 Q565 447 563 456 L551 535 Q549 544 560 543 L750 535 Q758 535 760 526 L770 448 Q772 439 761 439 Z',
    textX: 575,
    iconX: 720,
    contentY: -8,
  },
];

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function buildSmoothPath(points) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = points[index - 1];
    const before = points[index - 2] || previous;
    const after = points[index + 1] || point;
    const segment = point.x - previous.x;
    const offset = segment * 0.36;
    const incomingSlope = (point.y - before.y) / Math.max(1, point.x - before.x);
    const outgoingSlope = (after.y - previous.y) / Math.max(1, after.x - previous.x);
    const minimum = Math.min(previous.y, point.y);
    const maximum = Math.max(previous.y, point.y);
    const firstY = clamp(previous.y + incomingSlope * offset, minimum, maximum);
    const secondY = clamp(point.y - outgoingSlope * offset, minimum, maximum);

    return `${path} C ${previous.x + offset} ${firstY}, ${point.x - offset} ${secondY}, ${point.x} ${point.y}`;
  }, '');
}

function metricIcon(metric, iconX) {
  if (metric === 'calls') {
    return (
      <g className="paygate-workspace-metric-icon" transform={`translate(${iconX} 500)`} aria-hidden="true">
        <path d="M0 20V11M8 20V5M16 20V0" />
        <path d="M-3 22H20" opacity="0.45" />
      </g>
    );
  }

  if (metric === 'success') {
    return (
      <g className="paygate-workspace-metric-icon" transform={`translate(${iconX} 500)`} aria-hidden="true">
        <circle cx="8" cy="10" r="10" />
        <path d="m3 10 3 3 7-8" />
      </g>
    );
  }

  return (
    <g className="paygate-workspace-metric-icon" transform={`translate(${iconX} 502)`} aria-hidden="true">
      <path d="M-2 12c4-9 8-9 12 0s8 9 12 0" />
    </g>
  );
}

export default function HeroWorkspace() {
  const [range, setRange] = useState('30d');
  const [activePoint, setActivePoint] = useState(null);
  const [activeMetric, setActiveMetric] = useState(null);
  const workspaceRef = useRef(null);
  const data = RANGE_DATA[range];
  const chartPath = useMemo(() => buildSmoothPath(data.points), [data.points]);
  const areaPath = `${chartPath} L 778 392 L 202 392 Z`;

  const cycleRange = () => {
    const index = RANGE_ORDER.indexOf(range);
    setRange(RANGE_ORDER[(index + 1) % RANGE_ORDER.length]);
    setActivePoint(null);
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = workspaceRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    element.style.setProperty('--workspace-scene-rx', `${y * -1.15}deg`);
    element.style.setProperty('--workspace-scene-ry', `${x * 1.55}deg`);
    element.style.setProperty('--workspace-scene-x', `${x * 4}px`);
    element.style.setProperty('--workspace-scene-y', `${y * 3}px`);
    element.style.setProperty('--workspace-shine-x', `${44 + x * 13}%`);
    element.style.setProperty('--workspace-shine-y', `${36 + y * 11}%`);
    element.dataset.pointerActive = 'true';
  };

  const resetPointer = () => {
    const element = workspaceRef.current;
    if (!element) return;
    element.style.setProperty('--workspace-scene-rx', '0deg');
    element.style.setProperty('--workspace-scene-ry', '0deg');
    element.style.setProperty('--workspace-scene-x', '0px');
    element.style.setProperty('--workspace-scene-y', '0px');
    element.style.setProperty('--workspace-shine-x', '44%');
    element.style.setProperty('--workspace-shine-y', '36%');
    element.dataset.pointerActive = 'false';
    setActivePoint(null);
    setActiveMetric(null);
  };

  const handleKeyboardAction = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div
      ref={workspaceRef}
      className="paygate-hero-workspace"
      data-pointer-active="false"
      data-paused="false"
      data-range={range}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <svg
        className="paygate-workspace-surface"
        viewBox="0 0 1070 744"
        role="img"
        aria-labelledby="paygate-workspace-title paygate-workspace-description"
      >
        <title id="paygate-workspace-title">PayGate revenue workspace</title>
        <desc id="paygate-workspace-description">
          An illustrative testnet revenue dashboard showing cumulative paid API calls, success rate, and latency.
        </desc>

        <defs>
          <clipPath id="paygate-workspace-face-clip" clipPathUnits="userSpaceOnUse">
            <path d="M166 45 Q157 46 153 61 L26 591 Q20 616 43 623 L811 634 Q833 634 840 610 L944 50 Q949 20 925 14 Z" />
          </clipPath>
          <linearGradient id="paygate-workspace-face-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#252b3a" stopOpacity="0.34" />
            <stop offset="0.46" stopColor="#0d111b" stopOpacity="0.18" />
            <stop offset="1" stopColor="#6f5cff" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="paygate-workspace-face-glass-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="0.48" stopColor="#f8f8ff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#9b87ff" stopOpacity="0.11" />
          </linearGradient>
          <linearGradient id="paygate-workspace-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8c79ff" stopOpacity="0.26" />
            <stop offset="0.7" stopColor="#725cff" stopOpacity="0.055" />
            <stop offset="1" stopColor="#725cff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="paygate-workspace-area-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7864ff" stopOpacity="0.19" />
            <stop offset="0.72" stopColor="#8b78ff" stopOpacity="0.035" />
            <stop offset="1" stopColor="#8b78ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="paygate-workspace-line" x1="202" y1="340" x2="778" y2="145" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7765ff" />
            <stop offset="0.54" stopColor="#a894ff" />
            <stop offset="1" stopColor="#7967ff" />
          </linearGradient>
          <radialGradient id="paygate-workspace-hover-light">
            <stop offset="0" stopColor="#aa9aff" stopOpacity="0.20" />
            <stop offset="0.42" stopColor="#7461ff" stopOpacity="0.065" />
            <stop offset="1" stopColor="#7461ff" stopOpacity="0" />
          </radialGradient>
          <filter id="paygate-workspace-line-glow" x="-30%" y="-70%" width="160%" height="240%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="paygate-workspace-point-glow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="paygate-workspace-ambient" aria-hidden="true">
          <path d="M28 245H116L151 202" />
          <path d="M10 388H86L125 430" />
          <path d="M854 120H1006L1042 94" />
          <path d="M870 506H1000L1045 550" />
          <circle cx="116" cy="245" r="3" />
          <circle cx="86" cy="388" r="2.5" />
          <circle cx="1006" cy="120" r="3" />
          <circle cx="1000" cy="506" r="2.5" />
        </g>

        <image
          className="paygate-workspace-shell-image is-dark"
          href="/brand/paygate-workspace-shell-v2-tight.png"
          x="0"
          y="0"
          width="1070"
          height="744"
          preserveAspectRatio="xMidYMid meet"
        />
        <image
          className="paygate-workspace-shell-image is-light"
          href="/brand/paygate-workspace-shell-light-v1.svg"
          x="0"
          y="0"
          width="1070"
          height="744"
          preserveAspectRatio="xMidYMid meet"
        />

        <g clipPath="url(#paygate-workspace-face-clip)">
          <path
            className="paygate-workspace-glass"
            d="M166 45 Q157 46 153 61 L26 591 Q20 616 43 623 L811 634 Q833 634 840 610 L944 50 Q949 20 925 14 Z"
            fill="url(#paygate-workspace-face-glass)"
          />
          <ellipse className="paygate-workspace-shine" cx="465" cy="248" rx="360" ry="280" fill="url(#paygate-workspace-hover-light)" />

          <g className="paygate-workspace-heading">
            <text className="paygate-workspace-kicker" x="194" y="104">Revenue</text>
            <text className="paygate-workspace-revenue" x="190" y="154">{data.revenue}</text>
            <text className="paygate-workspace-caption" x="192" y="181">settled from paid API calls</text>
          </g>

          <g
            className="paygate-workspace-status"
            role="button"
            tabIndex="0"
            aria-label={`${data.label}. Activate to show the next range.`}
            onClick={cycleRange}
            onKeyDown={(event) => handleKeyboardAction(event, cycleRange)}
          >
            <path d="M747 83 Q747 72 758 71 L885 66 Q898 65 896 78 L891 111 Q889 121 878 121 L750 125 Q739 125 741 114 Z" />
            <text x="757" y="101">{data.label}</text>
            <path className="paygate-workspace-chevron" d="m869 90 6 6 7-7" />
          </g>

          <g className="paygate-workspace-chart-shell">
            <g className="paygate-workspace-y-axis" aria-hidden="true">
              {data.axis.map((label, index) => (
                <text key={label} x={155 - index * 4} y={215 + index * 57}>{label}</text>
              ))}
            </g>
            <g className="paygate-workspace-chart" aria-label={`Illustrative cumulative revenue for ${data.label}`}>
              {[214, 271, 328, 385].map((y, index) => (
                <path key={y} className="paygate-workspace-grid-line" d={`M 184 ${y} L ${805 - index * 8} ${y - 25}`} />
              ))}
              {[202, 344, 492, 642, 776].map((x) => (
                <path key={x} className="paygate-workspace-grid-line is-vertical" d={`M ${x} 195 L ${x - 36} 392`} />
              ))}
              <path className="paygate-workspace-chart-area" d={areaPath} />
              <path key={range} className="paygate-workspace-chart-line" d={chartPath} pathLength="1" />
              {data.points.map((point, index) => (
                <circle
                  key={point.label}
                  className={activePoint === index ? 'paygate-workspace-point is-active' : 'paygate-workspace-point'}
                  cx={point.x}
                  cy={point.y}
                  r={activePoint === index ? 6 : 4}
                  role="button"
                  tabIndex="0"
                  aria-label={`${point.label}: ${point.value} USDC`}
                  onPointerEnter={() => setActivePoint(index)}
                  onFocus={() => setActivePoint(index)}
                  onBlur={() => setActivePoint(null)}
                  onClick={() => setActivePoint(index)}
                  onKeyDown={(event) => handleKeyboardAction(event, () => setActivePoint(index))}
                />
              ))}
              {activePoint !== null ? (
                <g
                  className="paygate-workspace-tooltip"
                  transform={`translate(${data.points[activePoint].x > 680 ? data.points[activePoint].x - 150 : clamp(data.points[activePoint].x - 54, 184, 716)} ${data.points[activePoint].y < 210 ? data.points[activePoint].y + 18 : data.points[activePoint].y - 62})`}
                  aria-live="polite"
                >
                  <rect width="112" height="45" rx="8" />
                  <text x="12" y="19">{data.points[activePoint].value} USDC</text>
                  <text className="is-date" x="12" y="35">{data.points[activePoint].label}</text>
                </g>
              ) : null}
            </g>
            <g className="paygate-workspace-x-axis" aria-hidden="true">
              {data.dates.map((date, index) => (
                <text key={date.label} x={date.x - 18} y={421 - index * 2}>{date.label}</text>
              ))}
            </g>
          </g>

          <g className="paygate-workspace-metrics">
            {METRICS.map((metric) => (
              <g
                key={metric.key}
                className={activeMetric === metric.key ? 'paygate-workspace-metric is-active' : 'paygate-workspace-metric'}
                role="button"
                tabIndex="0"
                aria-label={`${metric.label}: ${data.metrics[metric.key]}`}
                onPointerEnter={() => setActiveMetric(metric.key)}
                onPointerLeave={() => setActiveMetric(null)}
                onFocus={() => setActiveMetric(metric.key)}
                onBlur={() => setActiveMetric(null)}
              >
                <path className="paygate-workspace-metric-card" d={metric.path} />
                <g className="paygate-workspace-metric-content" transform={`translate(0 ${metric.contentY})`}>
                  <text className="paygate-workspace-metric-label" x={metric.textX} y="486">{metric.label}</text>
                  <text className="paygate-workspace-metric-value" x={metric.textX} y="522">{data.metrics[metric.key]}</text>
                  <text className="paygate-workspace-metric-note" x={metric.textX} y="543">{metric.note}</text>
                  {metricIcon(metric.key, metric.iconX)}
                </g>
              </g>
            ))}
          </g>

          <text className="paygate-workspace-testnet-note" x="394" y="597">TESTNET REVENUE PREVIEW</text>
          <circle className="paygate-workspace-live-dot" cx="570" cy="591" r="3" />
        </g>

        <g className="paygate-workspace-topbar" display="none" aria-hidden="true" />
        <g className="paygate-workspace-footer" display="none" aria-hidden="true" />
        <g className="paygate-workspace-rail is-back" display="none" aria-hidden="true" />
        <g className="paygate-workspace-rail is-middle" display="none" aria-hidden="true" />
        <g className="paygate-workspace-rail is-front" display="none" aria-hidden="true" />
      </svg>
    </div>
  );
}
