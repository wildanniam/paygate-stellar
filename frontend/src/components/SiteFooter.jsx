import { ArrowRight, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteBrand from './SiteBrand.jsx';

const footerLinks = [
  { label: 'Product', href: '#workspace' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Security', href: '#protected-calls' },
  {
    label: 'Docs',
    href: 'https://github.com/wildanniam/paygate-stellar',
    external: true,
  },
  { label: 'Dashboard', to: '/dashboard' },
];

export default function SiteFooter() {
  return (
    <footer className="paygate-footer">
      <div className="paygate-footer-inner">
        <div className="paygate-footer-primary">
          <div className="paygate-footer-identity">
            <SiteBrand className="paygate-footer-brand-link" markClassName="paygate-footer-brand-mark" />
            <p>Turn API URLs into paid endpoints with payment checks, request receipts, and revenue tracking.</p>
          </div>

          <nav className="paygate-footer-nav" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              link.to ? (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          <div className="paygate-footer-actions">
            <Link className="paygate-footer-cta" to="/apis/new">
              Create endpoint
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <a
              className="paygate-footer-github"
              href="https://github.com/wildanniam/paygate-stellar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View PayGate on GitHub"
            >
              <Github size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="paygate-footer-bottom">
          <span>© 2026 PayGate</span>
          <span>Built on Stellar MPP</span>
          <span>Pay-per-call API gateway</span>
        </div>
      </div>
    </footer>
  );
}
