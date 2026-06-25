import { ArrowRight, ExternalLink, FileText, Github, ReceiptText, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './ui/Button.jsx';
import SiteBrand from './SiteBrand.jsx';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Product overview', href: '#workspace' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Security model', href: '#protected-calls' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Create endpoint', to: '/apis/new' },
      { label: 'API workspace', to: '/dashboard/endpoints' },
      { label: 'Activity receipts', to: '/dashboard/activity' },
      {
        label: 'GitHub docs',
        href: 'https://github.com/wildanniam/paygate-stellar',
        external: true,
      },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'Stellar MPP', href: '#proof' },
      { label: 'Escrow split', href: '#proof' },
      { label: 'Upstream guard', href: '#protected-calls' },
      { label: 'Request receipts', href: '#workspace' },
    ],
  },
];

const trustItems = [
  { label: 'Stellar MPP', icon: Zap },
  { label: 'Request receipts', icon: ReceiptText },
  { label: 'Upstream guard', icon: ShieldCheck },
];

export default function SiteFooter() {
  return (
    <footer className="paygate-footer">
      <div className="paygate-footer-inner">
        <div className="paygate-footer-main">
          <div className="paygate-footer-brand">
            <SiteBrand className="paygate-footer-brand-link" markClassName="paygate-footer-brand-mark" />
            <p>
              Pay-per-call API gateway for developers who want paid access without building billing,
              payment checks, and request metering from scratch.
            </p>
            <div className="paygate-footer-trust" aria-label="PayGate trust signals">
              {trustItems.map((item) => {
                const Icon = item.icon;

                return (
                  <span key={item.label}>
                    <Icon size={14} aria-hidden="true" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="paygate-footer-links" aria-label="Footer navigation">
            {footerColumns.map((column) => (
              <div className="paygate-footer-column" key={column.title}>
                <h2>{column.title}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to}>
                          {link.label}
                          <ArrowRight size={13} aria-hidden="true" />
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                        >
                          {link.label}
                          {link.external ? (
                            <ExternalLink size={13} aria-hidden="true" />
                          ) : (
                            <ArrowRight size={13} aria-hidden="true" />
                          )}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="paygate-footer-cta" aria-label="Create a PayGate endpoint">
            <span className="paygate-footer-cta-kicker">Ready endpoint</span>
            <h2>Create your first paid API.</h2>
            <p>Paste an API URL, set a per-call price, and share a proxy that verifies payment first.</p>
            <div className="paygate-footer-cta-actions">
              <Button as={Link} to="/apis/new" icon={<ArrowRight size={15} aria-hidden="true" />}>
                Create paid endpoint
              </Button>
              <Button
                as="a"
                href="https://github.com/wildanniam/paygate-stellar"
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                icon={<FileText size={15} aria-hidden="true" />}
              >
                View docs
              </Button>
            </div>
          </div>
        </div>

        <div className="paygate-footer-bottom">
          <span>© 2026 PayGate</span>
          <span>Built on Stellar MPP</span>
          <a
            href="https://github.com/wildanniam/paygate-stellar"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View PayGate on GitHub"
          >
            <Github size={14} aria-hidden="true" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
