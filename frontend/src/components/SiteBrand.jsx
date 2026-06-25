import { Link } from 'react-router-dom';

export default function SiteBrand({
  className = 'paygate-brand-link',
  markClassName = 'paygate-brand-mark',
  label = 'PayGate home',
}) {
  return (
    <Link to="/" className={className} aria-label={label}>
      <span className={markClassName} aria-hidden="true">
        <img src="/brand/paygate-mark.svg" alt="" />
      </span>
      <span>PayGate</span>
    </Link>
  );
}
