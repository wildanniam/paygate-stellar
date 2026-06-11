import { Github } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { C, MONO } from '../colors.js';

export default function AppNavbar() {
  const { pathname } = useLocation();

  const navLink = (to, label, variant = 'plain') => {
    const active = pathname === to;
    const isPrimary = variant === 'primary';
    return (
    <Link
      to={to}
      style={{
        color: active || isPrimary ? C.text1 : C.text2,
        fontSize: 13,
        textDecoration: 'none',
        padding: isPrimary ? '8px 13px' : '6px 12px',
        borderRadius: 6,
        background: active ? C.accent : isPrimary ? C.accentDim : 'transparent',
        border: isPrimary && !active ? `1px solid ${C.borderHover}` : '1px solid transparent',
        fontWeight: isPrimary ? 800 : 500,
        transition: 'all 0.15s ease',
        ...MONO,
      }}
    >
      {label}
    </Link>
    );
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ ...MONO, fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>
            <span style={{ color: C.accent }}>{'{ '}</span>
            <span style={{ color: C.text1 }}>PayGate</span>
            <span style={{ color: C.accent }}>{' }'}</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/apis/new', 'Register API', 'primary')}
          <a
            className="desktop-nav-link"
            href="https://github.com/wildanniam/paygate-stellar"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              alignItems: 'center',
              gap: 6,
              color: C.text2,
              fontSize: 13,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              marginLeft: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <Github size={14} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
