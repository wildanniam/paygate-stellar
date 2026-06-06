import { C, MONO } from '../colors.js';

export default function ValueRow({ label, value, children }) {
  return (
    <div style={{ minWidth: 0 }}>
      <strong style={{ color: C.text1 }}>{label}:</strong>{' '}
      <span
        style={{
          ...MONO,
          color: C.text2,
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
        }}
      >
        {value}
      </span>
      {children}
    </div>
  );
}
