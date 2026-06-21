import { cx } from './utils.js';

export function Field({ label, hint, htmlFor, className, children }) {
  return (
    <label className={cx('pg-field', className)} htmlFor={htmlFor}>
      {label && <span className="pg-field-label">{label}</span>}
      {children}
      {hint && <span className="pg-field-hint">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }) {
  return <input className={cx('pg-input', className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cx('pg-input', className)} {...props} />;
}
