import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import HeroMedia from '../components/landing-pilot/HeroMedia.jsx';
import TransactionJourney from '../components/landing-pilot/TransactionJourney.jsx';
import ApiCapabilities from '../components/landing-pilot/ApiCapabilities.jsx';
import SetupJourney from '../components/landing-pilot/SetupJourney.jsx';
import { createLandingPilotSimulation, INITIAL_SAMPLE } from '../lib/landingPilotSimulation.js';
import '../styles/landing-pilot.css';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/PAYGATE_V1_DEMO_GUIDE.md';
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
  const consoleRef = useRef(null);
  const stageRef = useRef(null);
  const [motion, toggleMotion] = useMotion();

  useEffect(() => {
    const instance = createLandingPilotSimulation(setSample);
    simulation.current = instance;
    const previous = document.title;
    document.title = 'PayGate — Design preview';
    return () => { instance.dispose(); document.title = previous; };
  }, []);

  function explore() {
    consoleRef.current?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'center' });
    consoleRef.current?.focus({ preventScroll: true });
    simulation.current?.request();
  }

  return <div className="lp" data-motion={motion ? 'on' : 'off'}>
    <a className="lp-skip" href="#pilot-main">Skip to content</a>
    <main id="pilot-main">
    <section className="lp-stage" ref={stageRef} aria-labelledby="pilot-title" data-credited={sample.credited}>
      <HeroMedia motion={motion} stageRef={stageRef} />
      <header className="lp-nav">
        <Link to="/" className="lp-brand" aria-label="PayGate home"><img src="/brand/paygate-mark.svg" alt="" width="35" height="35" /><span>PayGate</span></Link>
        <nav aria-label="Main navigation"><button type="button" onClick={explore}>How it works</button><a href={GUIDE} target="_blank" rel="noreferrer">Docs <ArrowUpRight size={13} /></a></nav>
        <Link to="/dashboard" className="lp-dashboard">Dashboard <ArrowUpRight size={15} /></Link>
      </header>
      <div className="lp-main">
        <div className="lp-hero-copy">
          <p className="lp-category"><span className="lp-category-symbol" aria-hidden="true"><i /><i /><i /></span>Payments for API builders</p>
          <h1 id="pilot-title">Your API.<br /><span>Paid per request.</span></h1>
          <p className="lp-lead">Set a price. Share your endpoint.<br className="lp-mobile-break" /> Let agents and apps<br className="lp-desktop-break" /> pay for every call.</p>
          <div className="lp-actions">
            <Link to="/apis/new" className="lp-primary"><span>Create paid endpoint</span><ArrowRight size={18} /></Link>
            <button type="button" className="lp-secondary" onClick={explore}><span className="lp-play-icon"><Play size={12} fill="currentColor" /></span> Try a request</button>
          </div>
          <p className="lp-beta"><span /> Public Stellar Testnet beta</p>
        </div>
        <div className="lp-product-preview">
          <TransactionJourney sample={sample} simulation={simulation} consoleRef={consoleRef} />
        </div>
      </div>
      <div className="lp-stage-footer"><span>Built on Stellar MPP</span><button type="button" onClick={toggleMotion} aria-pressed={motion} aria-label={motion ? 'Pause background motion' : 'Resume background motion'}>{motion ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}<span>Motion {motion ? 'on' : 'off'}</span></button></div>
    </section>
    <ApiCapabilities />
    <SetupJourney />
    </main>
    <footer className="lp-preview-footer"><span>Landing design preview</span><Link to="/">View current site <ArrowUpRight size={13} /></Link></footer>
  </div>;
}
