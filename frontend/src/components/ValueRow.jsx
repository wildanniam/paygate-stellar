export default function ValueRow({ label, value, children }) {
  return (
    <div className="pg-value-row">
      <strong>{label}:</strong>{' '}
      <span className="pg-value-row-value">
        {value}
      </span>
      {children}
    </div>
  );
}
