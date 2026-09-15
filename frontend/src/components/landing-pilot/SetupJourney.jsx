import { useRef, useState } from 'react';
import { ArrowUpRight, Bot, Braces, Check, Fingerprint, Globe2, Link2, ShieldCheck } from 'lucide-react';
import StoryMedia from './StoryMedia.jsx';
import '../../styles/setup-journey.css';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/demo-upstream-api.md';
const STEPS = [
  { label: 'Register', title: 'Your existing API', detail: 'api.example.com', description: 'Connect Freighter. Add your API URL and price.' },
  { label: 'Protect', title: 'Your API. With a guard.', detail: 'Server-side secret check', description: 'Add the generated secret check to your API.' },
  { label: 'Verify & share', title: 'A paid endpoint to share', detail: '/api/pay/api_demo', description: 'Verify your guard, then share the paid endpoint.' },
];

function ApiBundle({ ghost = false }) {
  return <div className={`sj-bundle ${ghost ? 'sj-bundle-ghost' : ''}`}>
    <i className="sj-sheet sj-sheet-back" /><i className="sj-sheet sj-sheet-mid" />
    <div className="sj-sheet sj-sheet-front"><span className="sj-sheet-dots"><i /><i /><i /></span><Braces size={54} strokeWidth={1.2} /><span className="sj-sheet-lines"><i /><i /><i /></span><span className="sj-format">GET / JSON</span></div>
  </div>;
}

function StepArtwork({ index }) {
  if (index === 0) return <><ApiBundle /><span className="sj-art-tag"><Link2 size={12} /> Your URL</span></>;
  if (index === 1) return <><ApiBundle ghost /><div className="sj-guard-layer"><ShieldCheck size={53} strokeWidth={1.1} /><span className="sj-guard-scan" /></div><span className="sj-secret"><Fingerprint size={15} /><span>secret</span><i /></span></>;
  return <><span className="sj-client sj-agent"><Bot size={20} /></span><span className="sj-client sj-app"><Globe2 size={20} /></span><span className="sj-client-wire sj-agent-wire" /><span className="sj-client-wire sj-app-wire" /><div className="sj-endpoint"><img src="/brand/paygate-mark.svg" alt="" width="24" height="24" /><Link2 size={46} strokeWidth={1.2} /><span>Paid endpoint</span><i><ArrowUpRight size={14} /></i></div><span className="sj-art-tag sj-verify-tag"><Check size={12} /> Example check</span></>;
}

export default function SetupJourney({ motion }) {
  const [step, setStep] = useState(0);
  const tabs = useRef([]);
  function select(index, focus = false) {
    setStep(index);
    if (focus) tabs.current[index]?.focus();
  }
  function onTabKey(event, index) {
    const next = { ArrowRight: (index + 1) % 3, ArrowLeft: (index + 2) % 3, Home: 0, End: 2 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  }

  return <section className="sj" aria-labelledby="setup-title" data-step={step}>
    <div className="sj-shell">
      <StoryMedia name="path" motion={motion} video flow="path" playbackRate={.75} />
      <div className="sj-atmosphere" aria-hidden="true" />
      <header className="sj-heading"><p>Three steps to get started</p><h2 id="setup-title">From your URL<br /><span>to a paid endpoint.</span></h2></header>
      <div className="sj-tabs" role="tablist" aria-label="API setup steps" style={{ '--step': step }}>
        <span className="sj-tab-plate" aria-hidden="true" />
        {STEPS.map(({ label }, index) => <button key={label} ref={el => { tabs.current[index] = el; }} type="button" role="tab" id={`setup-step-${index}`} aria-selected={step === index} aria-controls="setup-scene" tabIndex={step === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => onTabKey(event, index)}><span>0{index + 1}</span>{label}</button>)}
      </div>
      <div className="sj-scene" id="setup-scene" role="tabpanel" tabIndex={0} aria-labelledby={`setup-step-${step}`} aria-describedby="setup-caption">
        <div className="sj-rails" aria-hidden="true"><span className="sj-rail sj-rail-first"><i /></span><span className="sj-rail sj-rail-last"><i /></span></div>
        {STEPS.map(({ label, title, detail }, index) => <button type="button" key={label} className={`sj-object sj-object-${index}`} data-active={step === index} aria-label={`Explore ${label} step`} aria-pressed={step === index} onClick={() => select(index)}>
          <span className="sj-selection" aria-hidden="true"><i /> Viewing</span>
          <div className="sj-artwork" aria-hidden="true"><StepArtwork index={index} /></div>
          <span className="sj-object-caption"><strong>{title}</strong><code>{detail}</code></span>
        </button>)}
      </div>
      <div className="sj-story-footer" id="setup-caption">{STEPS.map(({ label, description }, index) => <div className="sj-caption" key={label} data-active={step === index} aria-hidden={step !== index}><span aria-hidden="true">0{index + 1} / 03</span><p>{description}</p></div>)}</div>
      <div className="sj-bottom"><span>Interactive illustration · No API is created</span><a href={GUIDE} target="_blank" rel="noreferrer">Setup guide <ArrowUpRight size={13} /></a></div>
      <p className="sj-live" role="status">Step {step + 1} of 3. {STEPS[step].description}</p>
    </div>
  </section>;
}
