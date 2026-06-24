import { cx } from './utils.js';

export default function Metric({ label, value, delta, icon, tone = 'neutral', className }) {
  return (
    <div className={cx('pg-metric', className)} data-tone={tone}>
      <div className="pg-metric-topline">
        <div className="pg-metric-label">{label}</div>
        {icon && <div className="pg-metric-icon">{icon}</div>}
      </div>
      <div className="pg-metric-value">{value}</div>
      {delta && <div className="pg-metric-delta">{delta}</div>}
    </div>
  );
}
