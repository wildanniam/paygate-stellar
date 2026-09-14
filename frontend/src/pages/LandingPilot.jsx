import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pause, Play } from 'lucide-react';
import PilotNav from '../components/landing-pilot/PilotNav.jsx';
import HeroMedia from '../components/landing-pilot/HeroMedia.jsx';
import TransactionJourney from '../components/landing-pilot/TransactionJourney.jsx';
import ApiCapabilities from '../components/landing-pilot/ApiCapabilities.jsx';
import SetupJourney from '../components/landing-pilot/SetupJourney.jsx';
import PaymentRecords from '../components/landing-pilot/PaymentRecords.jsx';
import LandingClosing from '../components/landing-pilot/LandingClosing.jsx';
import { createLandingPilotSimulation, INITIAL_SAMPLE } from '../lib/landingPilotSimulation.js';
import { afterScrollSettles } from '../lib/afterScrollSettles.js';
import '../styles/landing-pilot.css';

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
  const cancelExplore = useRef(null);
  const [motion, toggleMotion] = useMotion();

  useEffect(() => {
    const instance = createLandingPilotSimulation(setSample);
    simulation.current = instance;
    const previous = document.title;
    document.title = 'PayGate — Design preview';
    return () => { cancelExplore.current?.(); instance.dispose(); document.title = previous; };
  }, []);

  function explore() {
    cancelExplore.current?.();
    const target = consoleRef.current;
    if (!target) return;
    target.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' });
    cancelExplore.current = afterScrollSettles({
      measure: () => consoleRef.current?.getBoundingClientRect(),
      viewportHeight: () => window.innerHeight,
      onReady: () => { target.focus({ preventScroll: true }); simulation.current?.request(); },
    });
  }

  return <div className="lp" data-motion={motion ? 'on' : 'off'}>
    <a className="lp-skip" href="#pilot-main">Skip to content</a>
    <PilotNav explore={explore} />
    <main id="pilot-main" tabIndex={-1}>
    <section className="lp-stage" ref={stageRef} aria-labelledby="pilot-title" data-credited={sample.credited} data-demo-active={sample.step !== 'idle'}>
      <HeroMedia motion={motion} stageRef={stageRef} engaged={sample.step !== 'idle'} />
      <div className="lp-main">
        <div className="lp-hero-copy">
          <p className="lp-category"><span className="lp-category-symbol" aria-hidden="true"><i /><i /><i /></span>Payments for API builders</p>
          <h1 id="pilot-title">Your API.<br /><span>Paid per request.</span></h1>
          <p className="lp-lead">Add paid access to your API.<br />Let agents and apps pay per request.</p>
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
    <ApiCapabilities motion={motion} />
    <SetupJourney motion={motion} />
    <PaymentRecords motion={motion} toggleMotion={toggleMotion} />
    </main>
    <LandingClosing motion={motion} />
  </div>;
}
