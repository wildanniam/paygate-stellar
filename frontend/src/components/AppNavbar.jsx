import { Github, LayoutDashboard, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from './ui/Button.jsx';

export default function AppNavbar() {
  const { pathname } = useLocation();
  const isCreate = pathname === '/apis/new';

  const navLink = (to, label, icon) => {
    const active = to === '/dashboard'
      ? pathname === to || pathname.startsWith(`${to}/`)
      : pathname === to;

    return (
      <Link
        to={to}
        className="pg-app-nav-link"
        data-active={active ? 'true' : 'false'}
        aria-current={active ? 'page' : undefined}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <nav className="pg-app-navbar">
      <div className="pg-app-navbar-inner">
        <Link to="/" className="pg-app-brand" aria-label="PayGate home">
          <span className="pg-app-brand-mark">
            <img src="/brand/paygate-mark.svg" alt="" />
          </span>
          <span>PayGate</span>
        </Link>

        <div className="pg-app-navbar-actions">
          {navLink('/dashboard', 'Dashboard', <LayoutDashboard size={14} aria-hidden="true" />)}
          <Button
            as={Link}
            to="/apis/new"
            size="sm"
            className="pg-app-nav-primary"
            aria-current={isCreate ? 'page' : undefined}
            icon={<Plus size={14} aria-hidden="true" />}
          >
            Create paid endpoint
          </Button>
          <a
            className="pg-app-nav-github desktop-nav-link"
            href="https://github.com/wildanniam/paygate-stellar"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={14} aria-hidden="true" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
