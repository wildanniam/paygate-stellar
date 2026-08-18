import { Github, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button.jsx';
import SiteBrand from './SiteBrand.jsx';

const MARKETING_NAV_LINKS = [
  { label: 'Product', href: '#workspace', activeSections: ['workspace', 'proof', 'features'] },
  { label: 'How it works', href: '#how-it-works', activeSections: ['how-it-works'] },
  { label: 'Security', href: '#protected-calls', activeSections: ['protected-calls'] },
  {
    label: 'Docs',
    href: 'https://github.com/wildanniam/paygate-stellar',
    external: true,
  },
];

const MOBILE_NAV_LINKS = [
  { label: 'Product', href: '#workspace', activeSections: ['workspace', 'features'] },
  { label: 'Flow', href: '#how-it-works', activeSections: ['how-it-works'] },
  { label: 'Security', href: '#protected-calls', activeSections: ['protected-calls'] },
  { label: 'Proof', href: '#proof', activeSections: ['proof'] },
];

const LANDING_SECTION_IDS = ['how-it-works', 'protected-calls', 'proof', 'workspace', 'features'];

function isLinkActive(item, activeSection) {
  return item.activeSections?.includes(activeSection);
}

export default function MarketingNavbar() {
  const [githubActive, setGithubActive] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const updateActiveSection = () => {
      let nextSection = '';

      for (let index = LANDING_SECTION_IDS.length - 1; index >= 0; index -= 1) {
        const sectionId = LANDING_SECTION_IDS[index];
        const element = document.getElementById(sectionId);

        if (element && element.getBoundingClientRect().top <= 140) {
          nextSection = sectionId;
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

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth > 640) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', closeOnDesktop);

    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav ref={navRef} className="paygate-nav" aria-label="PayGate navigation">
      <div className="paygate-nav-inner">
        <SiteBrand />

        <div className="paygate-nav-center" aria-label="Primary navigation">
          {MARKETING_NAV_LINKS.map((item) => {
            const isActive = isLinkActive(item, activeSection);

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
          <Button as={Link} className="paygate-nav-cta" to="/apis/new" aria-label="Create paid endpoint">
            <span className="paygate-nav-cta-full">Create paid endpoint</span>
            <span className="paygate-nav-cta-short">Create</span>
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
          <button
            type="button"
            className="paygate-mobile-menu-trigger"
            aria-controls="paygate-mobile-menu"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            data-open={mobileMenuOpen ? 'true' : 'false'}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id="paygate-mobile-menu" className="paygate-mobile-menu" hidden={!mobileMenuOpen}>
        <div className="paygate-mobile-menu-links" aria-label="Mobile section navigation">
          {MOBILE_NAV_LINKS.map((item) => {
            const isActive = isLinkActive(item, activeSection);

            return (
              <a
                key={item.label}
                className="paygate-mobile-menu-link"
                href={item.href}
                data-active={isActive ? 'true' : 'false'}
                aria-current={isActive ? 'location' : undefined}
                onClick={closeMobileMenu}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="paygate-mobile-menu-actions">
          <Link className="paygate-mobile-menu-secondary" to="/dashboard" onClick={closeMobileMenu}>
            Dashboard
          </Link>
          <a
            className="paygate-mobile-menu-secondary"
            href="https://github.com/wildanniam/paygate-stellar"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobileMenu}
          >
            Docs
          </a>
          <Link className="paygate-mobile-menu-secondary" to="/apis/new" aria-label="Create paid endpoint" onClick={closeMobileMenu}>
            Create
          </Link>
        </div>
      </div>
    </nav>
  );
}
