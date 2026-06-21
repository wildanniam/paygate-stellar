import { cx } from './utils.js';

export function Container({ className, children, ...props }) {
  return (
    <div className={cx('pg-container', className)} {...props}>
      {children}
    </div>
  );
}

export default function Section({ className, children, ...props }) {
  return (
    <section className={cx('pg-section', className)} {...props}>
      {children}
    </section>
  );
}
