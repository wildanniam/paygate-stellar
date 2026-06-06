import { AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';
import { C } from '../colors.js';

async function writeClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand('copy');
    if (!copied) throw new Error('Copy command failed');
  } finally {
    document.body.removeChild(textarea);
  }
}

export default function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  compact = false,
  ariaLabel,
}) {
  const [state, setState] = useState('idle');
  const canCopy = Boolean(value);

  const copy = async () => {
    if (!canCopy) return;
    try {
      await writeClipboard(value);
      setState('copied');
      setTimeout(() => setState('idle'), 1200);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 1800);
    }
  };

  const Icon = state === 'copied' ? CheckCircle2 : state === 'error' ? AlertCircle : Copy;
  const color = state === 'copied' ? C.green : state === 'error' ? C.red : compact ? C.text2 : C.cyan;
  const text = state === 'copied' ? copiedLabel : state === 'error' ? 'Copy failed' : label;

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!canCopy}
      aria-label={ariaLabel || label}
      title={text}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 0 : 6,
        width: compact ? 32 : 'auto',
        height: compact ? 32 : 'auto',
        minWidth: compact ? 32 : 0,
        background: 'transparent',
        color,
        border: `1px solid ${C.border}`,
        borderRadius: 7,
        padding: compact ? 0 : '7px 10px',
        fontWeight: 800,
        cursor: canCopy ? 'pointer' : 'not-allowed',
        opacity: canCopy ? 1 : 0.55,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={compact ? 15 : 14} />
      {!compact && text}
    </button>
  );
}
