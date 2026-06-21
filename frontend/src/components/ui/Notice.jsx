import { cx } from './utils.js';

export default function Notice({ tone = 'neutral', icon, className, children, ...props }) {
  return (
    <div className={cx('pg-notice', className)} data-tone={tone} {...props}>
      {icon}
      <div>{children}</div>
    </div>
  );
}
