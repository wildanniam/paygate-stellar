import { AlertTriangle, Archive, CheckCircle2, Clock3 } from 'lucide-react';
import { C, MONO } from '../colors.js';

export function getApiStatusMeta(status) {
  if (status === 'active') {
    return {
      label: 'Active',
      description: 'Ready for paid proxy calls',
      color: C.green,
      bg: 'rgba(134,239,172,0.08)',
      border: 'rgba(134,239,172,0.22)',
      Icon: CheckCircle2,
    };
  }
  if (status === 'archived') {
    return {
      label: 'Archived',
      description: 'Hidden from paid proxy access',
      color: C.text3,
      bg: 'rgba(148,163,184,0.06)',
      border: 'rgba(148,163,184,0.14)',
      Icon: Archive,
    };
  }
  if (status === 'pending_setup') {
    return {
      label: 'Pending setup',
      description: 'Verify upstream guard to activate',
      color: C.amber,
      bg: 'rgba(252,211,77,0.08)',
      border: 'rgba(252,211,77,0.22)',
      Icon: Clock3,
    };
  }
  return {
    label: 'Unknown',
    description: 'Status unavailable',
    color: C.red,
    bg: 'rgba(252,165,165,0.08)',
    border: 'rgba(252,165,165,0.22)',
    Icon: AlertTriangle,
  };
}

export default function ApiStatusBadge({ status, compact = false }) {
  const meta = getApiStatusMeta(status);
  const Icon = meta.Icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        width: 'fit-content',
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: 999,
        padding: compact ? '5px 8px' : '7px 10px',
        fontSize: compact ? 11 : 12,
        fontWeight: 800,
        whiteSpace: 'nowrap',
        ...MONO,
      }}
      title={meta.description}
    >
      <Icon size={compact ? 12 : 14} />
      {meta.label}
    </span>
  );
}
