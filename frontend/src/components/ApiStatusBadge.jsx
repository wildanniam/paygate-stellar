import { AlertTriangle, Archive, CheckCircle2, Clock3 } from 'lucide-react';
import { C } from '../colors.js';
import Badge from './ui/Badge.jsx';

export function getApiStatusMeta(status) {
  if (status === 'active') {
    return {
      label: 'Active',
      description: 'Ready for paid proxy calls',
      color: C.green,
      bg: 'rgba(134,239,172,0.08)',
      border: 'rgba(134,239,172,0.22)',
      tone: 'success',
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
      tone: 'muted',
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
      tone: 'warning',
      Icon: Clock3,
    };
  }
  return {
    label: 'Unknown',
    description: 'Status unavailable',
    color: C.red,
    bg: 'rgba(252,165,165,0.08)',
    border: 'rgba(252,165,165,0.22)',
    tone: 'danger',
    Icon: AlertTriangle,
  };
}

export default function ApiStatusBadge({ status, compact = false }) {
  const meta = getApiStatusMeta(status);
  const Icon = meta.Icon;

  return (
    <Badge
      tone={meta.tone}
      size={compact ? 'sm' : 'md'}
      title={meta.description}
      icon={<Icon size={compact ? 12 : 14} aria-hidden="true" />}
    >
      {meta.label}
    </Badge>
  );
}
