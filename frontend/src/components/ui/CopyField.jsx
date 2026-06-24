import CopyButton from '../CopyButton.jsx';
import { cx } from './utils.js';

export default function CopyField({
  label,
  value,
  meta,
  tone = 'neutral',
  className,
  copyLabel = 'Copy',
}) {
  return (
    <div className={cx('pg-copy-field', className)} data-tone={tone}>
      {(label || meta) && (
        <div className="pg-copy-field-header">
          {label && <span>{label}</span>}
          {meta && <small>{meta}</small>}
        </div>
      )}
      <div className="pg-copy-field-body">
        <code>{value || '-'}</code>
        <CopyButton value={value} label={copyLabel} compact ariaLabel={`${copyLabel} ${label || 'value'}`} />
      </div>
    </div>
  );
}
