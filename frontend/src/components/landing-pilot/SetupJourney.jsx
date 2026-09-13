import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bot, Braces, Check, Fingerprint, Globe2, Link2, RotateCcw, ShieldCheck } from 'lucide-react';
import StoryMedia from './StoryMedia.jsx';
import '../../styles/setup-journey.css';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/demo-upstream-api.md';
const STEPS = [
  { label: 'Connect', title: 'Bring your API.', description: 'Connect Freighter, add your API URL, and choose a price.' },
  { label: 'Protect', title: 'Add your guard.', description: 'Keep the generated secret on your server. Check it on every request.' },
  { label: 'Publish', title: 'Ready to share.', description: 'Verify the guard, then share your paid endpoint with agents and apps.' },
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
      <StoryMedia name="path" motion={motion} video />
      <div className="sj-atmosphere" aria-hidden="true" />
      <header className="sj-heading"><p>From your URL to your first paid call</p><h2 id="setup-title">Keep your API.<br /><span>Open it for business.</span></h2></header>
      <div className="sj-tabs" role="tablist" aria-label="API setup steps">
        {STEPS.map(({ label }, index) => <button key={label} ref={el => { tabs.current[index] = el; }} type="button" role="tab" id={`setup-step-${index}`} aria-selected={step === index} aria-controls="setup-scene" tabIndex={step === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => onTabKey(event, index)}><span>0{index + 1}</span>{label}<Check size={13} aria-hidden="true" /></button>)}
      </div>

      <div className="sj-scene" id="setup-scene" role="tabpanel" tabIndex={0} aria-labelledby={`setup-step-${step}`} aria-describedby="setup-caption">
        <div className="sj-rail sj-rail-first" aria-hidden="true"><i /><b /></div><div className="sj-rail sj-rail-last" aria-hidden="true"><i /><b /></div>
        <div className={`sj-object sj-source ${step === 0 ? 'is-focused' : 'is-complete'}`}>
          <div className="sj-api-stack" aria-hidden="true"><div className="sj-api-sheet sj-sheet-back" /><div className="sj-api-sheet sj-sheet-mid" /><div className="sj-api-sheet sj-sheet-front"><span className="sj-sheet-dots"><i /><i /><i /></span><Braces size={64} strokeWidth={1.2} /><div className="sj-data-lines"><i /><i /><i /></div><span className="sj-sheet-format">JSON</span></div><span className="sj-object-badge"><Check size={12} /> Connected</span></div>
          <div className="sj-object-caption"><strong>Your existing API</strong><code>api.example.com/weather</code></div>
        </div>
        <div className={`sj-object sj-guard ${step === 1 ? 'is-focused' : step > 1 ? 'is-complete' : 'is-pending'}`}>
          <div className="sj-guard-art" aria-hidden="true"><span className="sj-guard-orbit" /><span className="sj-guard-orbit sj-guard-orbit-two" /><div className="sj-guard-core"><img src="/brand/paygate-mark.svg" alt="" width="57" height="57" /><span className="sj-guard-scan" /></div><span className="sj-guard-fingerprint"><Fingerprint size={22} strokeWidth={1.4} /></span><span className="sj-object-badge"><ShieldCheck size={12} /> {step > 0 ? 'Guard added' : 'Add a guard'}</span></div>
          <div className="sj-object-caption"><strong>Your access rules</strong><code>{step > 0 ? 'Secret stays on your server' : 'Server-side secret check'}</code></div>
        </div>
        <div className={`sj-object sj-publish ${step === 2 ? 'is-focused' : 'is-pending'}`}>
          <div className="sj-publish-art" aria-hidden="true"><span className="sj-client sj-agent"><Bot size={20} strokeWidth={1.5} /></span><span className="sj-client sj-app"><Globe2 size={20} strokeWidth={1.5} /></span><div className="sj-link-tile"><Link2 size={45} strokeWidth={1.3} /><span>paygate</span><i><ArrowUpRight size={13} /></i></div><span className="sj-object-badge"><Check size={12} /> {step === 2 ? 'Verified · Ready' : 'Verify to publish'}</span></div>
          <div className="sj-object-caption"><strong>Your paid endpoint</strong><code>/api/pay/api_demo</code></div>
        </div>
      </div>

      <div className="sj-story-footer">
        <div id="setup-caption" className="sj-caption" key={step}><h3>{STEPS[step].title}</h3><p>{STEPS[step].description}</p></div>
        <div className="sj-controls"><button type="button" className="sj-back" disabled={step === 0} onClick={() => select(step - 1)} aria-label="Previous setup step"><ArrowLeft size={17} /></button><button className="sj-next" type="button" onClick={() => select((step + 1) % 3)}>{step === 2 ? 'Replay' : `Next: ${STEPS[step + 1].label.toLowerCase()}`}{step === 2 ? <RotateCcw size={15} /> : <ArrowRight size={16} />}</button></div>
      </div>
      <div className="sj-bottom"><span>Interactive illustration · No API is created</span><a href={GUIDE} target="_blank" rel="noreferrer">Setup guide <ArrowUpRight size={13} /></a></div>
      <p className="sj-live" role="status">Step {step + 1} of 3. {STEPS[step].title} {STEPS[step].description}</p>
    </div>
  </section>;
}
