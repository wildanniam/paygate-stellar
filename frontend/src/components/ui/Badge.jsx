import { cx } from './utils.js';

export default function Badge({ tone = 'muted', size = 'md', icon, className, children, ...props }) {
  return (
    <span className={cx('pg-badge', className)} data-tone={tone} data-size={size} {...props}>
      {icon}
      {children}
    </span>
  );
}
