import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { C, MONO } from '../colors.js';

function highlight(code) {
  return code.split('\n').map((line, i) => (
    <div key={i} style={{ minHeight: '1.8em' }}>
      {highlightLine(line)}
    </div>
  ));
}

function highlightLine(line) {
  if (line.trim().startsWith('//')) {
    return <span style={{ color: C.text3 }}>{line}</span>;
  }

  const parts = [];
  const regex = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\b(?:import|export|from|const|let|var|if|throw|new|return|async|await)\b|\b(?:Mppx|stellar|mppx|express|Request|Response|Error|Store)\b(?=\s*[.(])|[a-zA-Z_$][\w$]*(?=\s*[(:]))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={lastIndex} style={{ color: '#E2E8F0' }}>
          {line.slice(lastIndex, match.index)}
        </span>
      );
    }

    const token = match[0];
    let color = '#E2E8F0';

    if (/^['"`]/.test(token)) {
      color = C.green;
    } else if (/^(import|export|from|const|let|var|if|throw|new|return|async|await)$/.test(token)) {
      color = C.purple;
    } else {
      color = C.amber;
    }

    parts.push(
      <span key={match.index} style={{ color }}>
        {token}
      </span>
    );
    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(
      <span key={lastIndex} style={{ color: '#E2E8F0' }}>
        {line.slice(lastIndex)}
      </span>
    );
  }

  return parts;
}

export default function CodeBlock({ code, filename, maxHeight = 500 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: C.codeBg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: `inset 0 0 40px rgba(124,58,237,0.04), 0 0 0 1px ${C.border}`,
      }}
    >
      <div
        style={{
          background: '#111111',
          borderBottom: `1px solid ${C.border}`,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((color) => (
            <div key={color} style={{ width: 10, height: 10, borderRadius: '50%', background: color, flex: '0 0 auto' }} />
          ))}
          <span style={{ ...MONO, fontSize: 12, color: C.text3, marginLeft: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {filename}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: copied ? C.green : C.text3,
            fontSize: 12,
            ...MONO,
            transition: 'color 0.15s ease',
            flex: '0 0 auto',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div
        style={{
          padding: '20px 24px',
          ...MONO,
          fontSize: 13,
          lineHeight: 1.8,
          overflowY: 'auto',
          maxHeight,
          overflowX: 'auto',
        }}
      >
        {highlight(code)}
      </div>
    </div>
  );
}

