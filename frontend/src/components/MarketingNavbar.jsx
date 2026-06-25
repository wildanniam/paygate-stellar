import { Github } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button.jsx';
import SiteBrand from './SiteBrand.jsx';

const MARKETING_NAV_LINKS = [
  { label: 'Product', href: '#workspace', sectionId: 'workspace' },
  { label: 'How it works', href: '#how-it-works', sectionId: 'how-it-works' },
  { label: 'Security', href: '#protected-calls', sectionId: 'protected-calls' },
  {
    label: 'Docs',
    href: 'https://github.com/wildanniam/paygate-stellar',
    external: true,
  },
];

export default function MarketingNavbar() {
  const [githubActive, setGithubActive] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sectionIds = MARKETING_NAV_LINKS
      .map((item) => item.sectionId)
      .filter(Boolean);

    const updateActiveSection = () => {
      let nextSection = '';

      for (let index = sectionIds.length - 1; index >= 0; index -= 1) {
        const id = sectionIds[index];
        const element = document.getElementById(id);

        if (element && element.getBoundingClientRect().top <= 140) {
          nextSection = id;
          break;
        }
      }

      setActiveSection(nextSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  return (
    <nav className="paygate-nav">
      <div className="paygate-nav-inner">
        <SiteBrand />

        <div className="paygate-nav-center" aria-label="Primary navigation">
          {MARKETING_NAV_LINKS.map((item) => {
            const isActive = item.sectionId && activeSection === item.sectionId;

            return (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                aria-label={item.external ? 'Open PayGate docs on GitHub' : undefined}
                data-active={isActive ? 'true' : 'false'}
                aria-current={isActive ? 'location' : undefined}
              >
                {item.label}
              </a>
            );
          })}
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
