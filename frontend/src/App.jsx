import { Github, Code2, BarChart3, Zap, Globe, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

const C = {
  bg:           '#080808',
  surface:      '#0F0F0F',
  surfaceHover: '#141414',
  border:       '#1A1A1A',
  borderHover:  '#2A2A2A',
  accent:       '#7C3AED',
  accentDim:    'rgba(124,58,237,0.12)',
  cyan:         '#22D3EE',
  text1:        '#F8FAFC',
  text2:        '#94A3B8',
  text3:        '#475569',
  codeBg:       '#0D0D0D',
  green:        '#86EFAC',
  blue:         '#93C5FD',
  purple:       '#C084FC',
  amber:        '#FCD34D',
};

const M = { fontFamily: "'JetBrains Mono', monospace" };

// Syntax highlight helpers
const KW  = t => <span style={{ color: C.purple }}>{t}</span>;
const STR = t => <span style={{ color: C.green }}>{t}</span>;
const PROP = t => <span style={{ color: C.blue }}>{t}</span>;
const FN  = t => <span style={{ color: C.amber }}>{t}</span>;
const CMT = t => <span style={{ color: C.text3 }}>{t}</span>;

function SectionLabel({ children }) {
  return (
    <p style={{ ...M, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(34,211,238,0.7)', marginBottom: 12 }}>
      {children}
    </p>
  );
}

function TerminalDots() {
  return (
    <div className="flex" style={{ gap: 6 }}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((bg, i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: bg }} />
      ))}
    </div>
  );
}

export default function App() {
  const [h, setH] = useState({
    navCta: false, heroPrimary: false, heroSecondary: false,
    ctaBtn: false, card: null, feat: null,
  });
  const hov = (key, val) => setH(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.fs').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const fi = {
    opacity: 0,
    transform: 'translateY(16px)',
    transition: 'opacity 400ms ease-out, transform 400ms ease-out',
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: C.bg,
      color: C.text1,
      minHeight: '100vh',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(12px)',
        background: 'rgba(8,8,8,0.85)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56 }}
        >
          <span style={{ ...M, fontWeight: 700, fontSize: 16 }}>
            <span style={{ color: C.accent }}>{'{ '}</span>
            PayGate
            <span style={{ color: C.accent }}>{' }'}</span>
          </span>
          <a
            href="https://github.com/paygate-stellar"
            target="_blank" rel="noopener noreferrer"
            onMouseEnter={() => hov('navCta', true)}
            onMouseLeave={() => hov('navCta', false)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              border: `1px solid ${C.border}`,
              background: h.navCta ? C.accentDim : 'transparent',
              color: C.text1, textDecoration: 'none',
              padding: '6px 16px', borderRadius: 6, fontSize: 13,
              transition: 'all 0.15s ease',
            }}
          >
            <Github size={14} /> View on GitHub
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '120px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', zIndex: 0,
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
          width: 700, height: 400, filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            border: `1px solid ${C.border}`, background: C.accentDim,
            color: C.cyan, padding: '6px 16px', borderRadius: 9999,
            ...M, fontSize: 11, marginBottom: 32,
          }}>
            ⚡ MPP launched March 2026. The tooling gap is real.
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(42px, 6vw, 64px)', fontWeight: 800,
            letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 800, margin: 0,
          }}>
            Monetize Your API.
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #7C3AED, #22D3EE)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              No Protocol Knowledge Required.
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{ color: C.text2, fontSize: 18, lineHeight: 1.6, maxWidth: 520, marginTop: 20 }}>
            PayGate generates MPP-ready middleware for your Node.js API
            from a 3-field form. Paste it in. Start accepting USDC on Stellar.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center" style={{ gap: 12, marginTop: 36 }}>
            <a
              href="https://github.com/paygate-stellar"
              target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => hov('heroPrimary', true)}
              onMouseLeave={() => hov('heroPrimary', false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: h.heroPrimary ? '#6D28D9' : C.accent,
                color: C.text1, textDecoration: 'none',
                padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600,
                boxShadow: h.heroPrimary ? '0 0 24px rgba(124,58,237,0.45)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Github size={16} /> View on GitHub
            </a>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={() => hov('heroSecondary', true)}
              onMouseLeave={() => hov('heroSecondary', false)}
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'transparent',
                border: `1px solid ${h.heroSecondary ? C.borderHover : C.border}`,
                color: h.heroSecondary ? C.text1 : C.text2,
                padding: '12px 24px', borderRadius: 8, fontSize: 15,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              See How It Works ↓
            </button>
          </div>

          {/* Code block */}
          <div style={{
            marginTop: 64, maxWidth: 680, width: '100%',
            background: C.codeBg, borderRadius: 12, overflow: 'hidden',
            boxShadow: `inset 0 0 40px rgba(124,58,237,0.04), 0 0 0 1px ${C.border}`,
          }}>
            {/* Terminal header */}
            <div className="flex items-center" style={{ background: '#111111', borderBottom: `1px solid ${C.border}`, padding: '10px 16px' }}>
              <TerminalDots />
              <span style={{ ...M, fontSize: 12, color: C.text3, flex: 1, textAlign: 'center' }}>paywall.js</span>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', ...M, fontSize: 12, color: C.text3 }}>
                <Copy size={12} /> Copy
              </button>
            </div>
            {/* Code */}
            <pre style={{ ...M, fontSize: 13, lineHeight: 1.8, padding: '20px 24px', margin: 0, overflowX: 'auto', textAlign: 'left' }}>
              <code>
                {KW('import')}{' { mppCharge } '}{KW('from')}{' '}{STR("'@stellar/mpp'")}{';\n\n'}
                {KW('export')}{' '}{KW('const')}{' paywall = '}{FN('mppCharge')}{'({\n'}
                {'  '}{PROP('asset:')}{'       '}{STR("'USDC'")}{';\n'}
                {'  '}{PROP('amount:')}{'      '}{STR("'0.01'")}{';\n'}
                {'  '}{PROP('destination:')}{' process.env.STELLAR_ADDRESS,\n'}
                {'});\n\n'}
                {CMT("// Drop into any Express route. That's it.")}{'\n'}
                {'app.'}{FN('get')}{'('}{STR("'/api/data'")}{', paywall, (req, res) => {\n'}
                {'  res.'}{FN('json')}{'({ '}{PROP('data:')}{' '}{STR("'...'")} {' });\n'}
                {'});'}
                <span className="cursor-blink" style={{ color: C.text2, marginLeft: 1 }}>|</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="fs" style={fi}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
          <SectionLabel>The Problem</SectionLabel>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 600, margin: '12px auto 0', lineHeight: 1.1 }}>
            Micropayment monetization<br />is fundamentally broken.
          </h2>
          <p style={{ color: C.text2, fontSize: 17, marginTop: 16, marginBottom: 56 }}>
            The protocol that fixes this launched in March 2026.<br />
            Most developers still can't access it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            {[
              {
                stat: '$0.30 + 2.9%',
                sub: 'per Stripe transaction',
                body: "Charging $0.01 per API call? Traditional payment rails eat the entire margin before you see a cent.",
              },
              {
                stat: '2–4 weeks',
                sub: 'to integrate MPP manually',
                body: "The protocol exists. The SDK exists. But wiring it into a real API requires deep knowledge of Stellar internals, HTTP 402 flows, and USDC — knowledge most developers don't have time to acquire.",
              },
              {
                stat: '$3–5T',
                sub: 'projected agentic commerce by 2030',
                body: "Galaxy Research estimates $3–5 trillion in agentic commerce by 2030. MPP is the protocol that enables it. PayGate is the tool that makes it accessible.",
              },
            ].map((card, i) => (
              <div
                key={i}
                onMouseEnter={() => hov('card', i)}
                onMouseLeave={() => hov('card', null)}
                style={{
                  background: h.card === i ? C.surfaceHover : C.surface,
                  border: `1px solid ${h.card === i ? C.borderHover : C.border}`,
                  borderTopColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: 32, textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ ...M, fontSize: 28, fontWeight: 800, color: C.accent }}>{card.stat}</div>
                <div style={{ ...M, fontSize: 12, color: C.text3, marginTop: 4 }}>{card.sub}</div>
                <div style={{ borderTop: `1px solid ${C.border}`, margin: '20px 0' }} />
                <p style={{ color: C.text2, fontSize: 15, lineHeight: 1.6 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="fs" style={fi}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 480, lineHeight: 1.1, marginBottom: 64 }}>
            Three inputs.<br />One file. Done.
          </h2>

          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, borderLeft: `1px solid ${C.border}` }} />

            {[
              {
                num: '01', title: 'Fill the form',
                body: 'Enter your API endpoint URL, the path you want to gate, and your price per request in USDC. Nothing else.',
                visual: (
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
                    {[
                      { label: 'API Endpoint URL', val: 'https://api.yourservice.com' },
                      { label: 'Path to gate', val: '/v1/data' },
                      { label: 'Price per request (USDC)', val: '0.01' },
                    ].map((f, fi) => (
                      <div key={fi} style={{
                        padding: '10px 14px',
                        background: C.surfaceHover,
                        borderBottom: fi < 2 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <div style={{ ...M, fontSize: 11, color: C.text3, marginBottom: 4 }}>{f.label}</div>
                        <div style={{ ...M, fontSize: 13, color: C.text2 }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                num: '02', title: 'Generate',
                body: (
                  <>Click Generate. PayGate processes your inputs and produces a complete, drop-in MPP middleware using{' '}
                  <code style={{ ...M, fontSize: 13, color: C.green }}>@stellar/mpp</code>. No boilerplate. No configuration.</>
                ),
                visual: (
                  <div className="flex items-center justify-center" style={{ padding: '40px 0' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: 'rgba(134,239,172,0.1)',
                      border: '1px solid rgba(134,239,172,0.2)',
                      color: C.green, borderRadius: 8,
                      padding: '10px 20px', fontSize: 14,
                    }}>
                      ✓ Code Ready
                    </div>
                  </div>
                ),
              },
              {
                num: '03', title: 'Copy. Paste. Ship.',
                body: 'One file. Drop it into your Express server. Every request to that endpoint now triggers an automatic USDC payment via Stellar before your handler runs.',
                visual: (
                  <div style={{ background: C.codeBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
                    <div className="flex items-center justify-between" style={{ background: '#111111', borderBottom: `1px solid ${C.border}`, padding: '8px 14px' }}>
                      <TerminalDots />
                      <span style={{ ...M, fontSize: 11, color: C.text3 }}>server.js</span>
                    </div>
                    <pre style={{ ...M, fontSize: 13, lineHeight: 1.8, padding: '16px 20px', margin: 0, overflowX: 'auto' }}>
                      <code>
                        {CMT('// server.js')}{'\n'}
                        {KW('import')}{' { paywall } '}{KW('from')}{' '}{STR("'./paywall.js'")}{';\n'}
                        {'app.'}{FN('get')}{'('}{STR("'/api/data'")}{', paywall, handler);'}
                      </code>
                    </pre>
                  </div>
                ),
              },
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: i < 2 ? 64 : 0 }}>
                {/* Step dot */}
                <div style={{
                  position: 'absolute', left: -37, top: 6,
                  width: 10, height: 10, borderRadius: '50%', background: C.accent,
                }} />
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 48, alignItems: 'center' }}>
                  <div>
                    <div style={{ ...M, fontSize: 11, color: 'rgba(124,58,237,0.5)', marginBottom: 8 }}>{step.num}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: C.text1, marginBottom: 12 }}>{step.title}</h3>
                    <p style={{ color: C.text2, lineHeight: 1.6 }}>{step.body}</p>
                  </div>
                  <div className="hidden md:block">{step.visual}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="fs" style={fi}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}>
          <SectionLabel>What You Get</SectionLabel>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 480, lineHeight: 1.1, marginBottom: 48 }}>
            Built for developers<br />who want to ship.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            {[
              {
                icon: <Code2 size={18} color={C.accent} />,
                title: 'MPP Code Generator',
                body: (<>Generates fully compliant <code style={{ ...M, fontSize: 13, color: C.green }}>@stellar/mpp</code> middleware from a 3-field form. Node.js/Express ready. Zero additional configuration. One copy-paste away from a live paywall.</>),
              },
              {
                icon: <BarChart3 size={18} color={C.accent} />,
                title: 'Real-Time Earnings Dashboard',
                body: 'Monitor USDC earnings and API request counts live, pulled directly from Stellar. Every transaction is a verifiable on-chain hash you can inspect in Stellar Explorer.',
              },
              {
                icon: <Zap size={18} color={C.accent} />,
                title: 'Zero Stellar Knowledge Required',
                body: 'No wallets to configure manually. No keypairs to manage. No USDC onboarding. PayGate abstracts the entire protocol — you bring the API, we handle the rest.',
              },
              {
                icon: <Globe size={18} color={C.accent} />,
                title: 'Built on Open Standards',
                body: 'MPP is co-authored by Stripe and Tempo Labs, adopted by Cloudflare, and already live across 50+ services including OpenAI and Google Gemini. PayGate puts you on that stack in minutes.',
              },
            ].map((feat, i) => (
              <div
                key={i}
                onMouseEnter={() => hov('feat', i)}
                onMouseLeave={() => hov('feat', null)}
                style={{
                  background: h.feat === i ? C.surfaceHover : C.surface,
                  border: `1px solid ${h.feat === i ? C.borderHover : C.border}`,
                  borderTopColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: 32,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: 40, height: 40,
                  background: C.accentDim,
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text1, marginBottom: 10 }}>{feat.title}</h3>
                <p style={{ color: C.text2, fontSize: 15, lineHeight: 1.6 }}>{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="fs" style={{
        ...fi,
        width: '100%', padding: '120px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(to bottom, #080808, #0D0816)',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, height: 500,
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.20) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800,
            letterSpacing: '-0.02em', lineHeight: 1.1,
            maxWidth: 640, margin: '0 auto',
          }}>
            <span style={{ color: C.text1 }}>Your API is ready.</span>
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #7C3AED, #22D3EE)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              The paywall isn't. Yet.
            </span>
          </h2>
          <p style={{ color: C.text2, fontSize: 18, marginTop: 20 }}>
            Follow PayGate's progress on GitHub.
          </p>
          <div style={{ marginTop: 40 }}>
            <a
              href="https://github.com/paygate-stellar"
              target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => hov('ctaBtn', true)}
              onMouseLeave={() => hov('ctaBtn', false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: h.ctaBtn ? '#6D28D9' : C.accent,
                color: C.text1, textDecoration: 'none',
                padding: '16px 32px', borderRadius: 8, fontSize: 16, fontWeight: 600,
                boxShadow: h.ctaBtn ? '0 0 24px rgba(124,58,237,0.45)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Github size={18} /> View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px 24px', textAlign: 'center' }}>
        <div className="flex items-center justify-center" style={{ gap: 16, maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ ...M, fontSize: 13, color: C.text3 }}>
            © 2026 PayGate · Built on Stellar · MPP
          </span>
          <a
            href="https://github.com/paygate-stellar"
            target="_blank" rel="noopener noreferrer"
            style={{ color: C.text3, transition: 'color 0.15s ease', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = C.text1}
            onMouseLeave={e => e.currentTarget.style.color = C.text3}
          >
            <Github size={14} />
          </a>
        </div>
      </footer>
    </div>
  );
}
