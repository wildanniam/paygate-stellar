import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import '../../styles/landing-closing.css';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/developer-guide.md';
const QUESTIONS = [
  {
    id: 'existing-api',
    question: 'Can I use my existing API?',
    answer: 'Start with a GET endpoint that returns JSON. You’ll need access to its server to add the PayGate guard.',
  },
  {
    id: 'client',
    question: 'What does my client need?',
    answer: 'An MPP-compatible client and a wallet funded with testnet USDC. The client handles the payment request, then retries your endpoint with payment proof.',
  },
  {
    id: 'network',
    question: 'Is PayGate on mainnet?',
    answer: 'PayGate is currently a public Stellar Testnet beta. Try the complete flow using testnet funds.',
  },
  {
    id: 'upstream-error',
    question: 'What if my API returns an error?',
    answer: 'A payment can be credited before your API fails. Payment and response are recorded separately; V1 does not automatically refund the payment.',
  },
];

function ClosingWordmark({ motion }) {
  const zone = useRef(null);

  useEffect(() => {
    const node = zone.current;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let current = 45;
    let target = 45;
    let previousTime = 0;
    let visible = false;
    let listening = false;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      current = target = 45;
      node.style.removeProperty('--lc-light');
    }

    function draw(time) {
      const elapsed = previousTime ? Math.min(64, time - previousTime) : 16;
      previousTime = time;
      current += (target - current) * (1 - Math.exp(-elapsed / 105));
      node.style.setProperty('--lc-light', `${current.toFixed(2)}%`);
      if (Math.abs(target - current) > .05) frame = requestAnimationFrame(draw);
      else { frame = 0; previousTime = 0; }
    }

    function moveTo(value) {
      target = value;
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function onMove(event) {
      if (event.pointerType === 'touch') return;
      const rect = node.getBoundingClientRect();
      moveTo(Math.max(10, Math.min(90, (event.clientX - rect.left) / rect.width * 100)));
    }

    function onLeave() { moveTo(45); }

    function sync() {
      const active = motion && fine.matches && !reduced.matches && visible && !document.hidden;
      if (active === listening) return;
      listening = active;
      if (active) {
        node.addEventListener('pointermove', onMove, { passive: true });
        node.addEventListener('pointerleave', onLeave);
      } else {
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerleave', onLeave);
        reset();
      }
    }

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(node);
    fine.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      fine.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      reset();
    };
  }, [motion]);

  return <div className="lc-wordzone" ref={zone} aria-hidden="true">
    <div className="lc-wordmark" data-word="PayGate">PayGate</div>
  </div>;
}

export default function LandingClosing({ motion }) {
  const [open, setOpen] = useState(null);

  return <footer className="lc" id="get-started" aria-labelledby="closing-title">
    <section className="lc-top">
      <div className="lc-cta">
        <p className="lc-kicker"><span aria-hidden="true" />Your next build starts here</p>
        <h2 id="closing-title">Ready for your<br />first <span>paid call?</span></h2>
        <Link className="lp-primary lc-button" to="/apis/new">Create paid endpoint <ArrowRight size={19} aria-hidden="true" /></Link>
        <a className="lc-guide" href={GUIDE} target="_blank" rel="noopener noreferrer">Read the setup guide <ArrowUpRight size={15} aria-hidden="true" /></a>
        <p className="lc-beta">Public Stellar Testnet beta</p>
      </div>
      <div className="lc-faq" aria-labelledby="closing-faq-title">
        <h3 id="closing-faq-title">Before you start</h3>
        {QUESTIONS.map(({ id, question, answer }) => <div className="lc-row" key={id}>
          <h4><button className="lc-question" type="button" id={`closing-question-${id}`} aria-expanded={open === id} aria-controls={`closing-answer-${id}`} onClick={() => setOpen(open === id ? null : id)}>
            {question}<span className="lc-plus" aria-hidden="true" />
          </button></h4>
          <div className="lc-answer" id={`closing-answer-${id}`} role="region" aria-labelledby={`closing-question-${id}`} aria-hidden={open !== id} {...(open !== id ? { inert: '' } : {})}>
            <div><p>{answer}</p></div>
          </div>
        </div>)}
      </div>
    </section>
    <ClosingWordmark motion={motion} />
    <div className="lc-bottom">
      <span>© {new Date().getFullYear()} PayGate</span>
      <nav aria-label="Footer links">
        <a href={GUIDE} target="_blank" rel="noopener noreferrer">Docs <ArrowUpRight size={13} aria-hidden="true" /></a>
        <a href="https://github.com/wildanniam/paygate-stellar" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={13} aria-hidden="true" /></a>
      </nav>
    </div>
  </footer>;
}
