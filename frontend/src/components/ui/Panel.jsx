import { cx } from './utils.js';

export function Panel({ tone = 'raised', className, children, ...props }) {
  return (
    <section className={cx('pg-panel', className)} data-tone={tone} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({ className, children, ...props }) {
  return (
    <div className={cx('pg-panel-header', className)} {...props}>
      {children}
    </div>
  );
}

export function PanelBody({ className, children, ...props }) {
  return (
    <div className={cx('pg-panel-body', className)} {...props}>
      {children}
    </div>
  );
}
