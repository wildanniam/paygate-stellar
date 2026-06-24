import { AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';
import Button from './ui/Button.jsx';

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
  const text = state === 'copied' ? copiedLabel : state === 'error' ? 'Copy failed' : label;

  return (
    <Button
      type="button"
      onClick={copy}
      disabled={!canCopy}
      aria-label={ariaLabel || label}
      title={text}
      variant={compact ? 'ghost' : 'secondary'}
      size="sm"
      iconOnly={compact}
      className="pg-copy-button"
      data-state={state}
      data-copy-state={state}
      icon={<Icon size={compact ? 15 : 14} aria-hidden="true" />}
    >
      {text}
    </Button>
  );
}
