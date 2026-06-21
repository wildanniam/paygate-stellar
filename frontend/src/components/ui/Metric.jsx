import { cx } from './utils.js';

export default function Metric({ label, value, delta, className }) {
  return (
    <div className={cx('pg-metric', className)}>
      <div className="pg-metric-label">{label}</div>
      <div className="pg-metric-value">{value}</div>
      {delta && <div className="pg-metric-delta">{delta}</div>}
    </div>
  );
}
