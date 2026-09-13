import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, Copy, Pause, Play, RotateCcw } from 'lucide-react';
import HeroMedia from '../components/landing-pilot/HeroMedia.jsx';
import { createLandingPilotSimulation, INITIAL_SAMPLE } from '../lib/landingPilotSimulation.js';
import '../styles/landing-pilot.css';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/PAYGATE_V1_DEMO_GUIDE.md';
const FORECAST = { location: 'Jakarta', temperature_c: 29, condition: 'partly_cloudy', humidity_pct: 74 };
const STATUS = {
  idle: ['Ready when you are.', 'Run a sample call to see paid access in action.'],
  requesting: ['Request sent', 'Checking access to the example endpoint.'],
  required: ['402 · Payment required', 'This request costs 0.010 testnet USDC.'],
  verifying: ['Verifying example payment…', 'This is a simulation. No funds are sent.'],
  credited: ['Payment verified · Escrow credited', '0.009 to the provider · 0.001 platform fee'],
  forwarding: ['Forwarding to the API', 'Payment is credited before the request is forwarded.'],
  complete: ['200 · Response received', 'The API returned the requested data.'],
};

function JsonView({ data }) {
  const entries = Object.entries(data);
  return <pre className="lp-json"><code>{'{\n'}{entries.map(([key, value], i) => <span key={key}>{'  '}<span className="lp-json-key">"{key}"</span>{': '}<span className={typeof value === 'number' ? 'lp-json-number' : 'lp-json-string'}>{JSON.stringify(value)}</span>{i < entries.length - 1 ? ',' : ''}{'\n'}</span>)}{'}'}</code></pre>;
}

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

export default function LandingPilot() {
  const [sample, setSample] = useState(INITIAL_SAMPLE);
  const simulation = useRef(null);
  const [motion, toggleMotion] = useMotion();
  const [skip, setSkip] = useState(false);
  const [tab, setTab] = useState('response');
  const [copyStatus, setCopyStatus] = useState('idle');
  const copyTimer = useRef(null);
  const copyRun = useRef(0);
  const tabRefs = useRef([]);

  useEffect(() => {
    const instance = createLandingPilotSimulation(setSample);
    simulation.current = instance;
    const previous = document.title;
    document.title = 'PayGate — Design preview';
    return () => {
      instance.dispose();
      document.title = previous;
      copyRun.current += 1;
      clearTimeout(copyTimer.current);
    };
  }, []);

  const started = sample.step !== 'idle';
  const busy = ['requesting', 'verifying', 'credited', 'forwarding'].includes(sample.step);
  const [status, explanation] = STATUS[sample.step];

  function reset() {
    setSkip(false);
    simulation.current.reset();
  }

  async function copyExample() {
    const run = ++copyRun.current;
    clearTimeout(copyTimer.current);
    const text = tab === 'response' ? JSON.stringify(FORECAST, null, 2) : 'GET /weather?city=Jakarta\nAccept: application/json';
    try {
      await navigator.clipboard.writeText(text);
      if (run !== copyRun.current) return;
      setCopyStatus('copied');
    } catch {
      if (run !== copyRun.current) return;
      setCopyStatus('error');
    }
    copyTimer.current = setTimeout(() => setCopyStatus('idle'), 2000);
  }

  function selectTab(value) {
    copyRun.current += 1;
    clearTimeout(copyTimer.current);
    setCopyStatus('idle');
    setTab(value);
  }

  function tabKey(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
    selectTab(next === 0 ? 'response' : 'request');
    tabRefs.current[next]?.focus();
  }

  return <div className="lp" data-motion={motion ? 'on' : 'off'}>
    <a className="lp-skip" href="#pilot-main">Skip to content</a>
    <header className="lp-nav">
      <Link to="/" className="lp-brand" aria-label="PayGate home"><img src="/brand/paygate-mark.svg" alt="" width="26" height="26" /><span>PayGate</span></Link>
      <nav aria-label="Main navigation"><a href="#api-example">API examples</a><a href={GUIDE} target="_blank" rel="noreferrer">Docs <span>↗</span></a></nav>
      <Link to="/dashboard" className="lp-dashboard">Dashboard <ArrowRight size={15} /></Link>
    </header>

    <main id="pilot-main">
      <section className="lp-hero" aria-labelledby="pilot-title">
        <HeroMedia run={sample.run} credited={sample.credited} started={started} motion={motion} skip={skip} />
        <div className="lp-hero-content">
          <p className="lp-category"><span /> Payments for API builders</p>
          <h1 id="pilot-title">Your API.<br /><span>Paid per request.</span></h1>
          <p className="lp-lead">Set a price for your API. Let agents and machine clients pay for access through PayGate.</p>
          <div className="lp-hero-actions"><Link to="/apis/new" className="lp-button lp-button--primary">Register an API <ArrowRight size={17} /></Link><a href={GUIDE} className="lp-text-link" target="_blank" rel="noreferrer">Read the quickstart <ArrowRight size={15} /></a></div>
          <p className="lp-beta">Public Stellar Testnet beta <span>·</span> GET / JSON APIs</p>
        </div>

        <div className="lp-demo" id="sample-request" data-step={sample.step}>
          <div className="lp-demo-top"><span className="lp-demo-label">Try one request</span><span className="lp-simulation-label">Simulation · No payment is sent</span></div>
          <div className="lp-demo-endpoint"><span>GET</span><code>/weather?city=Jakarta</code><span className="lp-price">0.010 <small>testnet USDC</small></span></div>
          <div className="lp-demo-status" role="status" aria-live="polite" aria-atomic="true"><strong>{status}</strong><p>{explanation}</p></div>
          {sample.step === 'complete' && <div className="lp-inline-response"><code>{'{ "temperature_c": 29, "condition": "partly_cloudy" }'}</code></div>}
          <div className="lp-demo-controls">
            {sample.step === 'idle' && <button type="button" className="lp-run" onClick={() => simulation.current.request()}>Send sample request <ArrowRight size={16} /></button>}
            {sample.step === 'required' && <button type="button" className="lp-run" onClick={() => simulation.current.pay()}>Simulate payment + retry <ArrowRight size={16} /></button>}
            {busy && <button type="button" className="lp-run" disabled><span className="lp-busy" />{sample.step === 'requesting' ? 'Sending request…' : 'Processing example…'}</button>}
            {sample.step === 'complete' && <a className="lp-run" href="#api-example">Explore the response <ArrowDown size={16} /></a>}
            {started && <button type="button" className="lp-icon-control" onClick={reset} aria-label="Reset example"><RotateCcw size={15} /><span>Reset</span></button>}
            {sample.credited && sample.step !== 'complete' && !skip && motion && <button type="button" className="lp-skip-film" onClick={() => setSkip(true)}>Skip animation</button>}
          </div>
        </div>

        <div className="lp-hero-foot"><span>One price. One request. Paid access.</span><button type="button" onClick={toggleMotion} className="lp-motion" aria-pressed={motion} aria-label={motion ? 'Turn motion off' : 'Turn motion on'}>{motion ? <Pause size={13} /> : <Play size={13} />} Motion {motion ? 'on' : 'off'}</button></div>
      </section>

      <section className="lp-examples" id="api-example" aria-labelledby="example-title">
        <div className="lp-section-heading"><p className="lp-section-index">01 / A useful API</p><h2 id="example-title">Put a price on<br />what you’ve built.</h2><p>Weather forecasts. Market data. Location lookups.<br className="lp-desktop-break" /> Your data can become someone else’s next request.</p></div>
        <div className="lp-example-layout">
          <figure className="lp-weather-art"><img src="/brand/pilot/weather-relief.webp" alt="Layered graphite contours representing weather data" loading="lazy" width="1200" height="805" /><figcaption><span>Weather data</span><span>Example use case <ArrowRight size={14} /></span></figcaption></figure>
          <div className="lp-example-detail">
            <div className="lp-example-title"><div><span className="lp-small-label">Example endpoint</span><h3>One forecast.<br />One paid call.</h3></div><span className="lp-method">GET</span></div>
            <p>A client pays for the request, then receives your JSON response. You keep your API and set the price.</p>
            <div className="lp-code-surface">
              <div className="lp-code-toolbar"><div role="tablist" aria-label="Weather API example">{['response', 'request'].map((value, i) => <button type="button" key={value} ref={(node) => { tabRefs.current[i] = node; }} id={`example-tab-${value}`} role="tab" aria-selected={tab === value} aria-controls={`example-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => selectTab(value)} onKeyDown={(event) => tabKey(event, i)}>{value === 'response' ? 'Response' : 'Request'}</button>)}</div><button type="button" onClick={copyExample} className="lp-copy" aria-label={copyStatus === 'copied' ? 'Copied example' : 'Copy example'}>{copyStatus === 'copied' ? <Check size={15} /> : <Copy size={15} />}</button></div>
              <div role="tabpanel" id={`example-panel-${tab}`} aria-labelledby={`example-tab-${tab}`} tabIndex={0}>{tab === 'response' ? <JsonView data={FORECAST} /> : <pre className="lp-json"><code><span className="lp-json-number">GET</span>{' /weather?city=Jakarta\n'}<span className="lp-json-key">Accept</span>{': application/json\n\n'}<span className="lp-code-comment">{'// Illustrative endpoint.\n// No request is sent from this page.'}</span></code></pre>}</div>
              <div className="lp-code-bottom"><span>Illustrative data</span><span role="status">{copyStatus === 'error' ? 'Copy unavailable — select the text' : copyStatus === 'copied' ? 'Copied' : 'application/json'}</span></div>
            </div>
            <div className="lp-example-economics"><span>Per request <strong>0.010</strong></span><span>Provider <strong>0.009</strong></span><span>PayGate fee <strong>0.001</strong></span></div>
            <p className="lp-example-note">Amounts in testnet USDC. Payment is credited before API delivery.</p>
          </div>
        </div>
        <div className="lp-example-bottom"><p>Your endpoint. Your price.<br /><span>PayGate handles the payment gate.</span></p><Link className="lp-text-link" to="/apis/new">Register your first API <ArrowRight size={17} /></Link></div>
      </section>
    </main>
    <footer className="lp-pilot-footer"><span>PayGate · Design preview</span><span>Two-section pilot / September 2026</span><Link to="/">View current site <ArrowRight size={14} /></Link></footer>
  </div>;
}
