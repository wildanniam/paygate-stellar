import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { C, MONO } from '../colors.js';
import Button from './ui/Button.jsx';

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
      className="pg-code-block"
    >
      <div
        className="pg-code-block-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span className="pg-code-title">
            {filename}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="pg-copy-button"
          data-state={copied ? 'copied' : 'idle'}
          icon={copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <div
        className="pg-code-content"
        style={{
          ...MONO,
          maxHeight,
        }}
      >
        {highlight(code)}
      </div>
    </div>
  );
}
