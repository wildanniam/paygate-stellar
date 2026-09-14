import { useRef, useState } from 'react';
import { ArrowUpRight, Bot, Braces, Check, Fingerprint, Globe2, Link2, ShieldCheck } from 'lucide-react';
import StoryMedia from './StoryMedia.jsx';
import '../../styles/setup-journey.css';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/demo-upstream-api.md';
const STEPS = [
  { label: 'Register', description: 'Connect Freighter and register your API URL and price.' },
  { label: 'Protect', description: 'Add the generated secret check to your API.' },
  { label: 'Verify & share', description: 'Verify your guard, then share the paid endpoint.' },
];

export default function SetupJourney({ motion }) {
  const [step, setStep] = useState(0);
  const tabs = useRef([]);

  function select(index, focus = false) {
    setStep(index);
    if (focus) tabs.current[index]?.focus();
  }
  function onTabKey(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % 3;
    else if (event.key === 'ArrowLeft') next = (index + 2) % 3;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 2;
    else return;
    event.preventDefault();
    select(next, true);
  }

  return <section className="sj" aria-labelledby="setup-title" data-step={step}>
    <div className="sj-shell">
      <StoryMedia name="path" motion={motion} video flow="path" />
      <div className="sj-atmosphere" aria-hidden="true" />
      <header className="sj-heading"><p>Three steps to get started</p><h2 id="setup-title">From your URL<br /><span>to a paid endpoint.</span></h2></header>
      <div className="sj-tabs" role="tablist" aria-label="API setup steps">
        {STEPS.map(({ label }, index) => <button key={label} ref={el => { tabs.current[index] = el; }} type="button" role="tab" id={`setup-step-${index}`} aria-selected={step === index} aria-controls="setup-scene" tabIndex={step === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => onTabKey(event, index)}><span>0{index + 1}</span>{label}</button>)}
      </div>

      <div className="sj-scene" id="setup-scene" role="tabpanel" tabIndex={0} aria-labelledby={`setup-step-${step}`} aria-describedby="setup-caption">
        <div className="sj-rail sj-rail-first" aria-hidden="true"><i /><b /></div><div className="sj-rail sj-rail-last" aria-hidden="true"><i /><b /></div>
        <div className={`sj-object sj-source ${step === 0 ? 'is-focused' : 'is-complete'}`}>
          <div className="sj-api-stack" aria-hidden="true"><div className="sj-api-sheet sj-sheet-back" /><div className="sj-api-sheet sj-sheet-mid" /><div className="sj-api-sheet sj-sheet-front"><span className="sj-sheet-dots"><i /><i /><i /></span><Braces size={64} strokeWidth={1.2} /><div className="sj-data-lines"><i /><i /><i /></div><span className="sj-sheet-format">JSON</span></div><span className="sj-object-badge"><Link2 size={12} /> Register API</span></div>
          <div className="sj-object-caption"><strong>Your existing API</strong><code>api.example.com</code></div>
        </div>
        <div className={`sj-object sj-guard ${step === 1 ? 'is-focused' : step > 1 ? 'is-complete' : 'is-pending'}`}>
          <div className="sj-guard-art" aria-hidden="true"><span className="sj-guard-orbit" /><span className="sj-guard-orbit sj-guard-orbit-two" /><div className="sj-guard-core"><img src="/brand/paygate-mark.svg" alt="" width="57" height="57" /><span className="sj-guard-scan" /></div><span className="sj-guard-fingerprint"><Fingerprint size={22} strokeWidth={1.4} /></span><span className="sj-object-badge"><ShieldCheck size={12} /> Add your guard</span></div>
          <div className="sj-object-caption"><strong>Your access rules</strong><code>Server-side secret check</code></div>
        </div>
        <div className={`sj-object sj-publish ${step === 2 ? 'is-focused' : 'is-pending'}`}>
          <div className="sj-publish-art" aria-hidden="true"><span className="sj-client sj-agent"><Bot size={20} strokeWidth={1.5} /></span><span className="sj-client sj-app"><Globe2 size={20} strokeWidth={1.5} /></span><div className="sj-link-tile"><Link2 size={45} strokeWidth={1.3} /><span>paygate</span><i><ArrowUpRight size={13} /></i></div><span className="sj-object-badge"><Check size={12} /> Verify & share</span></div>
          <div className="sj-object-caption"><strong>Your paid endpoint</strong><code>/api/pay/api_demo</code></div>
        </div>
      </div>

      <div className="sj-story-footer">
        <div id="setup-caption" className="sj-caption" key={step}><span className="sj-caption-index" aria-hidden="true">0{step + 1} / 03</span><p>{STEPS[step].description}</p></div>
      </div>
      <div className="sj-bottom"><span>Interactive illustration · No API is created</span><a href={GUIDE} target="_blank" rel="noreferrer">Setup guide <ArrowUpRight size={13} /></a></div>
      <p className="sj-live" role="status">Step {step + 1} of 3. {STEPS[step].description}</p>
    </div>
  </section>;
}
