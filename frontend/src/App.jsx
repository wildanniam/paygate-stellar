import { Github, Code2, BarChart3, Zap, Globe, Copy } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

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

const KW   = t => <span style={{ color: C.purple }}>{t}</span>;
const STR  = t => <span style={{ color: C.green }}>{t}</span>;
const PROP = t => <span style={{ color: C.blue }}>{t}</span>;
const FN   = t => <span style={{ color: C.amber }}>{t}</span>;
const CMT  = t => <span style={{ color: C.text3 }}>{t}</span>;

function useCountUp(target, duration, active, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const tid = setTimeout(() => {
      let startTime = null;
      const step = ts => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        setValue((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(tid);
  }, [active, target, duration, delay]);
  return value;
}

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

const CODE_LINE_COUNT = 12;

export default function App() {
  const [h, setH] = useState({
    navCta: false, heroPrimary: false, heroSecondary: false,
    ctaBtn: false, card: null, feat: null,
  });
  const hov = (key, val) => setH(prev => ({ ...prev, [key]: val }));

  const [heroGlow, setHeroGlow]       = useState({ x: 50, y: 40 });
  const [scrollPct, setScrollPct]     = useState(0);
  const [statsActive, setStatsActive] = useState(false);
  const [activeSteps, setActiveSteps] = useState([false, false, false]);
  const [visibleLines, setVisibleLines] = useState(0);
  const [magnetHero, setMagnetHero]   = useState({ x: 0, y: 0 });
  const [magnetCta, setMagnetCta]     = useState({ x: 0, y: 0 });

  // Card stagger states
  const [problemVis, setProblemVis] = useState([false, false, false]);
  const [featVis, setFeatVis]       = useState([false, false, false, false]);

  const heroRef        = useRef(null);
  const problemRef     = useRef(null);
  const howItWorksRef  = useRef(null);
  const heroPrimaryRef = useRef(null);
  const ctaBottomRef   = useRef(null);
  const problemCardsRef = useRef(null);
  const featCardsRef    = useRef(null);

  // ── Fade-in: JS-driven so SSR/no-JS sees content; IO with rootMargin + 800ms fallback ──
  useEffect(() => {
    const els = [...document.querySelectorAll('.fs')];
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.65s ease-out, transform 0.65s ease-out';
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 120px 0px' });
    els.forEach(el => obs.observe(el));
    const fallback = setTimeout(() => {
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    }, 800);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  // ── Scroll progress ──
  useEffect(() => {
    const onScroll = () => {
      const d = document.documentElement;
      setScrollPct(d.scrollTop / (d.scrollHeight - d.clientHeight) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Stats count-up ──
  useEffect(() => {
    const el = problemRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsActive(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── How It Works step activation ──
  useEffect(() => {
    const el = howItWorksRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        [0, 1, 2].forEach(i =>
          setTimeout(() => {
            setActiveSteps(prev => { const n = [...prev]; n[i] = true; return n; });
          }, 400 + i * 480)
        );
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Code typewriter ──
  useEffect(() => {
    let count = 0;
    const id = setInterval(() => {
      count++;
      setVisibleLines(count);
      if (count >= CODE_LINE_COUNT) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, []);

  // ── Problem cards stagger ──
  useEffect(() => {
    const el = problemCardsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        [0, 1, 2].forEach(i =>
          setTimeout(() => setProblemVis(p => { const n = [...p]; n[i] = true; return n; }), i * 130)
        );
        obs.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 80px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Features cards stagger ──
  useEffect(() => {
    const el = featCardsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        [0, 1, 2, 3].forEach(i =>
          setTimeout(() => setFeatVis(p => { const n = [...p]; n[i] = true; return n; }), i * 110)
        );
        obs.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 80px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Hero mouse glow ──
  const handleHeroMouseMove = useCallback(e => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHeroGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  }, []);

  // ── Magnetic CTA ──
  const applyMagnet = useCallback((e, ref, setter) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
    setter({
      x: clamp((e.clientX - cx) * 0.14, -3, 3),
      y: clamp((e.clientY - cy) * 0.14, -3, 3),
    });
  }, []);

  // ── Count-up values ──
  const cents     = useCountUp(30, 1500, statsActive, 300);
  const wks       = useCountUp(4,  1200, statsActive, 400);
  const trillions = useCountUp(5,  1800, statsActive, 500);

  const statDisplays = [
    `$0.${Math.round(cents).toString().padStart(2, '0')} + 2.9%`,
    `2–${Math.ceil(wks) || 0} weeks`,
    `$3–${Math.ceil(trillions) || 0}T`,
  ];

  const stepsCount = activeSteps.filter(Boolean).length;

  const codeLines = [
    <>{KW('import')}{' { mppCharge } '}{KW('from')}{' '}{STR("'@stellar/mpp'")}{';\n'}</>,
    <>{'\n'}</>,
    <>{KW('export')}{' '}{KW('const')}{' paywall = '}{FN('mppCharge')}{'({\n'}</>,
    <>{'  '}{PROP('asset:')}{'       '}{STR("'USDC'")}{',\n'}</>,
    <>{'  '}{PROP('amount:')}{'      '}{STR("'0.01'")}{',\n'}</>,
    <>{'  '}{PROP('destination:')}{' process.env.STELLAR_ADDRESS,\n'}</>,
    <>{'});\n'}</>,
    <>{'\n'}</>,
    <>{CMT("// Drop into any Express route. That's it.")}{'\n'}</>,
    <>{'app.'}{FN('get')}{'('}{STR("'/api/data'")}{', paywall, (req, res) => {\n'}</>,
    <>{'  res.'}{FN('json')}{'({ '}{PROP('data:')}{' '}{STR("'...'")} {' });\n'}</>,
    <>{'});'}</>,
  ];

  // Shared card transition (covers both stagger reveal + hover)
  const cardTransition = 'opacity 0.5s ease-out, transform 0.5s ease-out, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease';

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: C.bg,
      color: C.text1,
      minHeight: '100vh',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>

      {/* SVG noise filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" />
          </filter>
        </defs>
      </svg>
      <div className="noise-grain" />

      {/* Scroll progress */}
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 100,
        height: 2, pointerEvents: 'none',
        width: `${scrollPct}%`,
        background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
        boxShadow: `0 0 10px ${C.accent}`,
        transition: 'width 0.08s linear',
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(12px)',
        background: 'rgba(8,8,8,0.85)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div className="flex items-center justify-between"
          style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56 }}>
          <span style={{ ...M, fontWeight: 700, fontSize: 16 }}>
            <span style={{ color: C.accent }}>{'{ '}</span>PayGate<span style={{ color: C.accent }}>{' }'}</span>
          </span>
          <a
            href="https://github.com/wildanniam/paygate-stellar"
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
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', textAlign: 'center',
          padding: '120px 24px 80px', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Primary violet mouse-tracking glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 65% 45% at ${heroGlow.x}% ${heroGlow.y}%, rgba(124,58,237,0.22) 0%, transparent 70%)`,
          transition: 'background 0.1s ease',
        }} />
        {/* Secondary static cyan ambient glow (bottom-right) */}
        <div style={{
          position: 'absolute', right: '10%', bottom: '15%',
          width: 440, height: 280,
          background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Badge */}
          <div className="badge-pulse" style={{
            display: 'inline-flex', alignItems: 'center',
            border: '1px solid rgba(34,211,238,0.28)', background: C.accentDim,
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
            <span className="gradient-headline" style={{
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
              ref={heroPrimaryRef}
              href="https://github.com/wildanniam/paygate-stellar"
              target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => hov('heroPrimary', true)}
              onMouseLeave={() => { hov('heroPrimary', false); setMagnetHero({ x: 0, y: 0 }); }}
              onMouseMove={e => applyMagnet(e, heroPrimaryRef, setMagnetHero)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: h.heroPrimary ? '#6D28D9' : C.accent,
                color: C.text1, textDecoration: 'none',
                padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600,
                boxShadow: h.heroPrimary ? '0 0 28px rgba(124,58,237,0.55)' : '0 0 0 rgba(0,0,0,0)',
                transition: 'background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
                transform: `translate(${magnetHero.x}px, ${magnetHero.y}px)`,
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

          {/* Code block — shimmer border + typewriter */}
          <div className="shimmer-border" style={{ marginTop: 64, maxWidth: 680, width: '100%' }}>
            <div style={{
              background: C.codeBg, borderRadius: 12, overflow: 'hidden',
              boxShadow: 'inset 0 0 60px rgba(124,58,237,0.06)',
            }}>
              <div className="flex items-center" style={{ background: '#111111', borderBottom: `1px solid ${C.border}`, padding: '10px 16px' }}>
                <TerminalDots />
                <span style={{ ...M, fontSize: 12, color: C.text3, flex: 1, textAlign: 'center' }}>paywall.js</span>
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', ...M, fontSize: 12, color: C.text3 }}>
                  <Copy size={12} /> Copy
                </button>
              </div>
              <pre style={{ ...M, fontSize: 13, lineHeight: 1.8, padding: '20px 24px', margin: 0, overflowX: 'auto', textAlign: 'left' }}>
                <code>
                  {codeLines.map((line, i) => (
                    <span
                      key={i}
                      className={i < visibleLines ? 'code-line' : ''}
                      style={{ opacity: i < visibleLines ? undefined : 0 }}
                    >
                      {line}
                    </span>
                  ))}
                  {visibleLines >= CODE_LINE_COUNT && (
                    <span className="cursor-blink" style={{ color: C.text2, marginLeft: 1 }}>|</span>
                  )}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" ref={problemRef} className="fs">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
          <SectionLabel>The Problem</SectionLabel>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 600, margin: '12px auto 0', lineHeight: 1.1 }}>
            Micropayment monetization<br />is fundamentally broken.
          </h2>
          <p style={{ color: C.text2, fontSize: 17, marginTop: 16, marginBottom: 56 }}>
            The protocol that fixes this launched in March 2026.<br />
            Most developers still can't access it.
          </p>

          <div ref={problemCardsRef} className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            {[
              {
                stat: statDisplays[0],
                sub: 'per Stripe transaction',
                body: "Charging $0.01 per API call? Traditional payment rails eat the entire margin before you see a cent.",
              },
              {
                stat: statDisplays[1],
                sub: 'to integrate MPP manually',
                body: "The protocol exists. The SDK exists. But wiring it into a real API requires deep knowledge of Stellar internals, HTTP 402 flows, and USDC — knowledge most developers don't have time to acquire.",
              },
              {
                stat: statDisplays[2],
                sub: 'projected agentic commerce by 2030',
                body: "Galaxy Research estimates $3–5 trillion in agentic commerce by 2030. MPP is the protocol that enables it. PayGate is the tool that makes it accessible.",
              },
            ].map((card, i) => (
              <div
                key={i}
                onMouseEnter={() => hov('card', i)}
                onMouseLeave={() => hov('card', null)}
                style={{
                  opacity: problemVis[i] ? 1 : 0,
                  transform: problemVis[i] ? 'translateY(0)' : 'translateY(24px)',
                  background: h.card === i ? C.surfaceHover : C.surface,
                  border: `1px solid ${h.card === i ? C.borderHover : C.border}`,
                  borderTopColor: h.card === i ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: 32, textAlign: 'left',
                  boxShadow: h.card === i ? `0 0 0 1px rgba(124,58,237,0.1), 0 8px 32px rgba(0,0,0,0.3)` : 'none',
                  transition: cardTransition,
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
      <section id="how-it-works" ref={howItWorksRef} className="fs">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 480, lineHeight: 1.1, marginBottom: 64 }}>
            Three inputs.<br />One file. Done.
          </h2>

          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Connector track */}
            <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 1, background: C.border }} />
            {/* Connector fill */}
            <div style={{
              position: 'absolute', left: 4, top: 0, width: 1,
              height: `${(stepsCount / 3) * 100}%`,
              background: `linear-gradient(to bottom, ${C.accent}, rgba(124,58,237,0.35))`,
              boxShadow: `0 0 8px ${C.accent}`,
              transition: 'height 0.65s ease-out',
            }} />

            {[
              {
                num: '01', title: 'Fill the form',
                body: 'Enter your API endpoint URL, the path you want to gate, and your price per request in USDC. Nothing else.',
                visual: (
                  <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}>
                    {[
                      { label: 'API Endpoint URL', val: 'https://api.yourservice.com', active: false },
                      { label: 'Path to gate', val: '/v1/data', active: false },
                      { label: 'Price per request (USDC)', val: '0.01', active: true },
                    ].map((f, fi) => (
                      <div key={fi} style={{
                        padding: '12px 16px',
                        background: f.active ? '#161616' : C.surfaceHover,
                        borderBottom: fi < 2 ? `1px solid ${C.border}` : 'none',
                        borderLeft: f.active ? `2px solid ${C.accent}` : '2px solid transparent',
                        transition: 'all 0.2s ease',
                      }}>
                        <div style={{ ...M, fontSize: 10, color: f.active ? 'rgba(124,58,237,0.7)' : C.text3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                        <div style={{ ...M, fontSize: 13, color: f.active ? C.text1 : C.text2 }}>{f.val}</div>
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
                  <div style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: '32px 24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'rgba(134,239,172,0.12)',
                        border: '1px solid rgba(134,239,172,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, color: C.green,
                        boxShadow: '0 0 20px rgba(134,239,172,0.12)',
                      }}>✓</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(134,239,172,0.08)',
                        border: '1px solid rgba(134,239,172,0.2)',
                        color: C.green, borderRadius: 8,
                        padding: '10px 20px', fontSize: 14, ...M,
                      }}>
                        Code Ready
                      </div>
                      <p style={{ ...M, fontSize: 11, color: C.text3, textAlign: 'center', margin: 0 }}>
                        paywall.js generated — 847 bytes
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                num: '03', title: 'Copy. Paste. Ship.',
                body: 'One file. Drop it into your Express server. Every request to that endpoint now triggers an automatic USDC payment via Stellar before your handler runs.',
                visual: (
                  <div style={{
                    background: C.codeBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}>
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
              <div key={i} style={{ position: 'relative', marginBottom: i < 2 ? 72 : 0 }}>
                {/* Step dot */}
                <div style={{
                  position: 'absolute', left: -37, top: 6,
                  width: 10, height: 10, borderRadius: '50%',
                  background: activeSteps[i] ? C.accent : C.border,
                  boxShadow: activeSteps[i] ? `0 0 12px rgba(124,58,237,0.9), 0 0 24px rgba(124,58,237,0.35)` : 'none',
                  transition: 'background 0.35s ease, box-shadow 0.35s ease',
                }} />
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 56, alignItems: 'center' }}>
                  <div style={{ opacity: activeSteps[i] ? 1 : 0.4, transition: 'opacity 0.5s ease' }}>
                    <div style={{
                      ...M, fontSize: 11, marginBottom: 10,
                      color: activeSteps[i] ? C.accent : 'rgba(124,58,237,0.35)',
                      transition: 'color 0.35s ease',
                    }}>
                      {step.num}
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: C.text1, marginBottom: 12 }}>{step.title}</h3>
                    <p style={{ color: C.text2, lineHeight: 1.6 }}>{step.body}</p>
                  </div>
                  <div className="hidden md:block" style={{
                    opacity: activeSteps[i] ? 1 : 0.25,
                    transform: activeSteps[i] ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s',
                  }}>
                    {step.visual}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="fs">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px' }}>
          <SectionLabel>What You Get</SectionLabel>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, maxWidth: 480, lineHeight: 1.1, marginBottom: 48 }}>
            Built for developers<br />who want to ship.
          </h2>

          <div ref={featCardsRef} className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            {[
              {
                icon: <Code2 size={20} color={C.accent} />,
                title: 'MPP Code Generator',
                body: (<>Generates fully compliant <code style={{ ...M, fontSize: 13, color: C.green }}>@stellar/mpp</code> middleware from a 3-field form. Node.js/Express ready. Zero additional configuration. One copy-paste away from a live paywall.</>),
              },
              {
                icon: <BarChart3 size={20} color={C.accent} />,
                title: 'Real-Time Earnings Dashboard',
                body: 'Monitor USDC earnings and API request counts live, pulled directly from Stellar. Every transaction is a verifiable on-chain hash you can inspect in Stellar Explorer.',
              },
              {
                icon: <Zap size={20} color={C.accent} />,
                title: 'Zero Stellar Knowledge Required',
                body: 'No wallets to configure manually. No keypairs to manage. No USDC onboarding. PayGate abstracts the entire protocol — you bring the API, we handle the rest.',
              },
              {
                icon: <Globe size={20} color={C.accent} />,
                title: 'Built on Open Standards',
                body: 'MPP is co-authored by Stripe and Tempo Labs, adopted by Cloudflare, and already live across 50+ services including OpenAI and Google Gemini. PayGate puts you on that stack in minutes.',
              },
            ].map((feat, i) => (
              <div
                key={i}
                onMouseEnter={() => hov('feat', i)}
                onMouseLeave={() => hov('feat', null)}
                style={{
                  opacity: featVis[i] ? 1 : 0,
                  transform: featVis[i] ? 'translateY(0)' : 'translateY(24px)',
                  background: h.feat === i ? C.surfaceHover : C.surface,
                  border: `1px solid ${h.feat === i ? C.borderHover : C.border}`,
                  borderTopColor: h.feat === i ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: 32,
                  boxShadow: h.feat === i ? '0 0 0 1px rgba(124,58,237,0.08), 0 8px 32px rgba(0,0,0,0.25)' : 'none',
                  transition: cardTransition,
                }}
              >
                <div style={{
                  width: 48, height: 48,
                  background: h.feat === i
                    ? 'rgba(124,58,237,0.18)'
                    : C.accentDim,
                  border: `1px solid ${h.feat === i ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.2)'}`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                  boxShadow: h.feat === i ? '0 0 20px rgba(124,58,237,0.25), inset 0 0 12px rgba(124,58,237,0.08)' : 'none',
                  transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
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
        width: '100%', padding: '120px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(to bottom, #080808, #0D0816)',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900, height: 550,
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', right: '20%', top: '30%',
          width: 300, height: 300,
          background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
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
            <span className="gradient-headline" style={{
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
              ref={ctaBottomRef}
              href="https://github.com/wildanniam/paygate-stellar"
              target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => hov('ctaBtn', true)}
              onMouseLeave={() => { hov('ctaBtn', false); setMagnetCta({ x: 0, y: 0 }); }}
              onMouseMove={e => applyMagnet(e, ctaBottomRef, setMagnetCta)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: h.ctaBtn ? '#6D28D9' : C.accent,
                color: C.text1, textDecoration: 'none',
                padding: '16px 32px', borderRadius: 8, fontSize: 16, fontWeight: 600,
                boxShadow: h.ctaBtn ? '0 0 32px rgba(124,58,237,0.55)' : '0 0 0 rgba(0,0,0,0)',
                transition: 'background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
                transform: `translate(${magnetCta.x}px, ${magnetCta.y}px)`,
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
            href="https://github.com/wildanniam/paygate-stellar"
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
