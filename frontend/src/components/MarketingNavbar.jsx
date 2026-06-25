import { Github } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button.jsx';
import SiteBrand from './SiteBrand.jsx';

export default function MarketingNavbar() {
  const [githubActive, setGithubActive] = useState(false);

  return (
    <nav className="paygate-nav">
      <div className="paygate-nav-inner">
        <SiteBrand />

        <div className="paygate-nav-center" aria-label="Primary navigation">
          <a href="#workspace">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="https://github.com/wildanniam/paygate-stellar" target="_blank" rel="noopener noreferrer">Docs</a>
        </div>

        <div className="paygate-nav-actions">
          <Link className="paygate-nav-secondary" to="/dashboard">
            Dashboard
          </Link>
          <Button as={Link} className="paygate-nav-cta" to="/apis/new">
            Create paid endpoint
          </Button>
          <a
            className="paygate-nav-icon desktop-nav-link"
            href="https://github.com/wildanniam/paygate-stellar"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View PayGate on GitHub"
            onMouseEnter={() => setGithubActive(true)}
            onMouseLeave={() => setGithubActive(false)}
            data-active={githubActive ? 'true' : 'false'}
          >
            <Github size={14} />
          </a>
        </div>
      </div>
    </nav>
  );
}
