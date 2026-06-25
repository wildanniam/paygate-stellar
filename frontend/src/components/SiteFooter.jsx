import { Github } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="paygate-footer">
      <div className="paygate-footer-inner">
        <span className="paygate-footer-meta">© 2026 PayGate · Built on Stellar · MPP</span>
        <a
          href="https://github.com/wildanniam/paygate-stellar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View PayGate on GitHub"
        >
          <Github size={14} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
