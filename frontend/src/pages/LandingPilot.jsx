import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Code2, Pause, Play, RotateCcw, Terminal } from 'lucide-react';
import HeroMedia from '../components/landing-pilot/HeroMedia.jsx';
import { createLandingPilotSimulation, INITIAL_SAMPLE } from '../lib/landingPilotSimulation.js';
import '../styles/landing-pilot.css';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/PAYGATE_V1_DEMO_GUIDE.md';
const STATUS = {
  idle: ['Ready for a request', 'Send a sample call to this paid endpoint.'],
  requesting: ['Request sent', 'Checking access to the example endpoint.'],
  required: ['402 · Payment required', 'The client needs to pay 0.010 testnet USDC.'],
  verifying: ['Verifying payment', 'Checking the simulated payment. No funds are sent.'],
  credited: ['Payment verified', 'Escrow credited: 0.009 to the provider, 0.001 platform fee.'],
  forwarding: ['Calling your API', 'Payment is credited. Forwarding the request upstream.'],
  complete: ['200 · Response received', 'The API returned the requested weather data.'],
};

function useMotion() {
  const [systemReduce, setSystemReduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [override, setOverride] = useState(null);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduce(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const motion = override ?? !systemReduce;
  return [motion, () => setOverride(!motion)];
}

function SampleConsole({ sample, simulation, consoleRef }) {
  const step = sample.step;
  const busy = ['requesting', 'verifying', 'credited', 'forwarding'].includes(step);
  const [status, explanation] = STATUS[step];
  const complete = step === 'complete';
  const active = step === 'idle' || step === 'requesting' ? 0 : complete ? 2 : 1;
  const label = step === 'idle' ? 'Send sample request' : step === 'required' ? 'Simulate payment' : complete ? 'Run again' : 'Processing…';

  function advance() {
    if (step === 'idle') simulation.current?.request();
    else if (step === 'required') simulation.current?.pay();
    else if (complete) simulation.current?.reset();
  }

  return <div className="lp-console" id="sample-request" ref={consoleRef} tabIndex={-1} aria-label="Interactive paid request example" data-step={step}>
    <div className="lp-console-header">
      <div className="lp-console-name"><Terminal size={17} /><span>One request. See what happens.</span></div>
      <span className="lp-demo-tag"><span /> Interactive demo</span>
    </div>
    <div className="lp-flow" aria-hidden="true">
      <span className={active >= 0 ? 'is-active' : ''}><Code2 size={15} /> Request</span>
      <span className={`lp-flow-line ${active >= 1 ? 'is-active' : ''}`}><i /></span>
      <span className={active >= 1 ? 'is-active' : ''}><img src="/brand/paygate-mark.svg" width="23" height="23" alt="" /> Payment</span>
      <span className={`lp-flow-line ${active >= 2 ? 'is-active' : ''}`}><i /></span>
      <span className={active >= 2 ? 'is-active' : ''}><Check size={15} /> Response</span>
    </div>
    <div className="lp-console-body">
      <div className="lp-request-pane">
        <div className="lp-pane-label"><span>Weather API</span><span>0.010 <small>testnet USDC / call</small></span></div>
        <div className="lp-endpoint"><span>GET</span><code>/weather?city=Jakarta</code><ArrowUpRight size={16} /></div>
        <div className="lp-request-code"><span className="lp-code-muted">{'// Your API. One paid endpoint.'}</span><br /><span className="lp-code-violet">Accept</span>: application/json<br /><span className="lp-code-violet">Network</span>: Stellar Testnet</div>
      </div>
      <div className="lp-response-pane">
        <div className="lp-status" role="status" aria-live="polite" aria-atomic="true">
          <span className={`lp-status-dot ${busy ? 'is-busy' : ''}`} />
          <div><strong>{status}</strong><p>{explanation}</p></div>
        </div>
        {complete ? <pre className="lp-response-json"><code>{'{ '}<span>"temperature_c"</span>{': 29,\n  '}<span>"condition"</span>{': "partly_cloudy" }'}</code></pre>
          : <div className="lp-receipt"><div><span>Provider receives</span><strong>{sample.credited ? '0.009' : '—'} <small>USDC</small></strong></div><div><span>PayGate fee</span><strong>{sample.credited ? '0.001' : '—'} <small>USDC</small></strong></div></div>}
      </div>
    </div>
    <div className="lp-console-footer">
      <p>Simulation only. No payment is sent.</p>
      <div>{step !== 'idle' && <button type="button" className="lp-reset" onClick={() => simulation.current?.reset()} aria-label="Reset sample request"><RotateCcw size={16} /></button>}<button type="button" className="lp-run" onClick={advance} disabled={busy}>{label}{busy ? <span className="lp-spinner" /> : <ArrowRight size={16} />}</button></div>
    </div>
  </div>;
}

export default function LandingPilot() {
  const [sample, setSample] = useState(INITIAL_SAMPLE);
  const simulation = useRef(null);
  const consoleRef = useRef(null);
  const stageRef = useRef(null);
  const [motion, toggleMotion] = useMotion();

  useEffect(() => {
    const instance = createLandingPilotSimulation(setSample);
    simulation.current = instance;
    const previous = document.title;
    document.title = 'PayGate — Hero preview';
    return () => { instance.dispose(); document.title = previous; };
  }, []);

  function explore() {
    consoleRef.current?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'center' });
    consoleRef.current?.focus({ preventScroll: true });
    simulation.current?.request();
  }

  return <div className="lp" data-motion={motion ? 'on' : 'off'}>
    <a className="lp-skip" href="#pilot-main">Skip to content</a>
    <section className="lp-stage" ref={stageRef} aria-labelledby="pilot-title" data-credited={sample.credited}>
      <HeroMedia motion={motion} stageRef={stageRef} />
      <header className="lp-nav">
        <Link to="/" className="lp-brand" aria-label="PayGate home"><img src="/brand/paygate-mark.svg" alt="" width="35" height="35" /><span>PayGate</span></Link>
        <nav aria-label="Main navigation"><button type="button" onClick={explore}>How it works</button><a href={GUIDE} target="_blank" rel="noreferrer">Docs <ArrowUpRight size={13} /></a></nav>
        <Link to="/dashboard" className="lp-dashboard">Dashboard <ArrowUpRight size={15} /></Link>
      </header>
      <main id="pilot-main" className="lp-main">
        <div className="lp-hero-copy">
          <p className="lp-category"><span className="lp-category-symbol" aria-hidden="true"><i /><i /><i /></span>Payments for API builders</p>
          <h1 id="pilot-title">Your API.<br /><span>Paid per request.</span></h1>
          <p className="lp-lead">Set a price. Share your endpoint.<br className="lp-mobile-break" /> Let agents and apps<br className="lp-desktop-break" /> pay for every call.</p>
          <div className="lp-actions">
            <Link to="/apis/new" className="lp-primary"><span>Create paid endpoint</span><span className="lp-primary-arrow"><ArrowUpRight size={21} /></span></Link>
            <button type="button" className="lp-secondary" onClick={explore}><Play size={14} fill="currentColor" /> Try a request</button>
          </div>
          <p className="lp-beta"><span /> Public Stellar Testnet beta</p>
        </div>
        <div className="lp-product-preview">
          <div className="lp-preview-intro"><span>Follow a paid API request</span><ArrowDown size={15} /></div>
          <SampleConsole sample={sample} simulation={simulation} consoleRef={consoleRef} />
        </div>
      </main>
      <div className="lp-stage-footer"><span>Built on Stellar MPP</span><button type="button" onClick={toggleMotion} aria-pressed={motion} aria-label={motion ? 'Pause background motion' : 'Resume background motion'}>{motion ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}<span>Motion {motion ? 'on' : 'off'}</span></button></div>
    </section>
    <footer className="lp-preview-footer"><span>Hero design preview</span><Link to="/">View current site <ArrowUpRight size={13} /></Link></footer>
  </div>;
}
