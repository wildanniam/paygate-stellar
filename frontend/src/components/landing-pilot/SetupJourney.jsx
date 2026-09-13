import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronRight, CloudSun, Code2, Fingerprint, Link2, Loader2, RotateCcw } from 'lucide-react';
import '../../styles/setup-journey.css';

const GUIDE = 'https://github.com/wildanniam/paygate-stellar/blob/main/docs/demo-upstream-api.md';
const STEPS = [
  { title: 'Register your API', description: 'Connect Freighter, add your API URL and set a price.', label: 'Register', icon: Link2 },
  { title: 'Add the guard', description: 'Keep the generated secret on your server. Check it on every request.', label: 'Protect', icon: Fingerprint },
  { title: 'Verify & share', description: 'Verify the guard, then share your paid endpoint with clients.', label: 'Publish', icon: CheckCheck },
];

function RegistrationPreview() {
  return <div className="sj-register">
    <div className="sj-api-identity"><span><CloudSun size={25} strokeWidth={1.5} /></span><div><strong>Weather API</strong><p>Your existing API, connected to PayGate.</p></div></div>
    <div className="sj-config">
      <dl><dt>Upstream URL</dt><dd><span className="sj-get">GET</span><code>api.example.com/weather</code></dd></dl>
      <dl className="sj-config-bottom"><div><dt>Response format</dt><dd><Code2 size={15} /> JSON</dd></div><div><dt>Price per request</dt><dd>0.010 <small>testnet USDC</small></dd></div></dl>
    </div>
    <div className="sj-pending"><span className="sj-status-dot" /><div><strong>Pending setup</strong><p>Your proxy activates after you add and verify the guard.</p></div></div>
  </div>;
}

function GuardPreview() {
  const lines = [
    <><b>const</b> expected =</>,
    <>  process.env.<em>PAYGATE_SECRET</em>;</>,
    <><b>const</b> provided =</>,
    <>  req.get(<em>'X-PayGate-Secret'</em>);</>,
    '',
    <><b>if</b> (!expected ||</>,
    <>    provided !== expected) {'{'}</>,
    <>  <b>return</b> res.sendStatus(<i>401</i>);</>,
    '}',
    '',
    <>next();</>,
  ];
  return <div className="sj-guard">
    <div className="sj-file-heading"><span><Code2 size={14} /> guard.js</span><span>Express · excerpt</span></div>
    <pre className="sj-code" aria-label="Example Express secret-header guard"><code>{lines.map((line, index) => <span className="sj-code-line" key={index}><span aria-hidden="true">{index + 1}</span><span>{line || '\u00a0'}</span>{index < lines.length - 1 ? '\n' : ''}</span>)}</code></pre>
    <p className="sj-guard-note"><Fingerprint size={15} /><span>Use the secret from your API setup. Keep it server-side.</span></p>
  </div>;
}

function VerificationPreview({ check }) {
  const firstDone = check === 'rejected' || check === 'complete';
  const complete = check === 'complete';
  return <div className="sj-verification" data-check={check}>
    <div className="sj-check-intro"><span className="sj-check-emblem"><CheckCheck size={29} strokeWidth={1.5} /></span><div><strong>{complete ? 'Your guard passes both checks.' : 'Two checks. One protected API.'}</strong><p>{complete ? 'The example endpoint is ready to share.' : 'Invalid secrets stay out. Your secret gets through.'}</p></div></div>
    <div className="sj-probes">
      <div className={firstDone ? 'is-checked' : ''}><span className="sj-probe-icon">{firstDone ? <Check size={16} /> : check === 'running' ? <Loader2 size={16} className="sj-spinning" /> : '1'}</span><span>Invalid secret</span><span>{firstDone ? <><i>401</i> Rejected</> : check === 'running' ? 'Checking…' : 'Not checked'}</span></div>
      <div className={complete ? 'is-checked' : ''}><span className="sj-probe-icon">{complete ? <Check size={16} /> : check === 'rejected' ? <Loader2 size={16} className="sj-spinning" /> : '2'}</span><span>Your secret</span><span>{complete ? <><i>200</i> Accepted</> : check === 'rejected' ? 'Checking…' : 'Not checked'}</span></div>
    </div>
    <div className="sj-share-endpoint"><div><span><Link2 size={13} /> Paid endpoint</span><span className={complete ? 'is-ready' : ''}>{complete ? <><Check size={11} /> Example active</> : 'Awaiting checks'}</span></div><code>/api/pay/api_demo</code></div>
  </div>;
}

export default function SetupJourney() {
  const [step, setStep] = useState(0);
  const [check, setCheck] = useState('idle');
  const tabs = useRef([]);
  const busy = check === 'running' || check === 'rejected';

  useEffect(() => {
    if (check !== 'running' && check !== 'rejected') return undefined;
    const timer = window.setTimeout(() => setCheck(check === 'running' ? 'rejected' : 'complete'), check === 'running' ? 700 : 900);
    return () => window.clearTimeout(timer);
  }, [check]);

  function selectStep(index, focus = false) {
    setStep(index);
    setCheck('idle');
    if (focus) tabs.current[index]?.focus();
  }

  function onTabKey(event, index) {
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % STEPS.length;
    else if (event.key === 'ArrowUp') next = (index + STEPS.length - 1) % STEPS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = STEPS.length - 1;
    else return;
    event.preventDefault();
    selectStep(next, true);
  }

  function advance() {
    if (busy) return;
    if (step < 2) selectStep(step + 1);
    else setCheck('running');
  }

  const panelTitles = ['Start with what you’ve built.', 'A small check. On your server.', 'Make sure your guard works.'];
  const buttonLabels = ['Next: add the guard', 'Next: verify setup', check === 'complete' ? 'Replay example checks' : busy ? 'Checking example…' : 'Run example checks'];

  return <section className="sj" aria-labelledby="setup-title">
    <div className="sj-inner">
      <div className="sj-story">
        <p className="sj-eyebrow"><span /> How to get started</p>
        <h2 id="setup-title">From URL<br />to <span>paid endpoint.</span></h2>
        <p className="sj-intro">Keep your API where it is.<br />Give it a new way to get paid.</p>
        <div className="sj-steps" role="tablist" aria-label="API setup steps" aria-orientation="vertical">
          {STEPS.map(({ title, description }, index) => <button key={title} ref={element => { tabs.current[index] = element; }} id={`setup-step-${index}`} className="sj-step" type="button" role="tab" aria-label={title} aria-describedby={`setup-description-${index}`} aria-selected={index === step} aria-controls={`setup-panel-${index}`} tabIndex={index === step ? 0 : -1} onClick={() => selectStep(index)} onKeyDown={event => onTabKey(event, index)}>
            <span className="sj-step-number" aria-hidden="true">0{index + 1}</span><span><strong>{title}</strong><span className="sj-step-description" id={`setup-description-${index}`}>{description}</span></span><ChevronRight className="sj-step-arrow" size={17} aria-hidden="true" />
          </button>)}
        </div>
        <a className="sj-guide" href={GUIDE} target="_blank" rel="noreferrer">Read the setup guide <ArrowUpRight size={15} /></a>
      </div>

      <div className="sj-workspace">
        <div className="sj-workspace-grid" aria-hidden="true" />
        <div className="sj-workbench">
          <header className="sj-workbench-header"><span><img src="/brand/paygate-mark.svg" width="21" height="21" alt="" /> PayGate <i>/</i> API setup</span><span className="sj-preview-label">Interactive preview</span></header>
          <div className="sj-preview-progress" aria-hidden="true">{STEPS.map(({ label, icon: Icon }, index) => <span key={label} className={index === step ? 'is-current' : ''}><Icon size={13} />{label}{index < 2 && <ChevronRight size={12} />}</span>)}</div>
          {STEPS.map((_, index) => <div key={index} id={`setup-panel-${index}`} className="sj-panel" role="tabpanel" aria-labelledby={`setup-step-${index}`} tabIndex={0} hidden={step !== index}>
            {step === index && <div className="sj-scene">
              <div className="sj-scene-heading"><span>0{step + 1} / 03</span><h3>{panelTitles[step]}</h3></div>
              {step === 0 ? <RegistrationPreview /> : step === 1 ? <GuardPreview /> : <VerificationPreview check={check} />}
            </div>}
          </div>)}
          <footer className="sj-workbench-footer"><button type="button" className="sj-back" aria-label="Previous setup step" disabled={step === 0} onClick={() => selectStep(step - 1)}><ArrowLeft size={16} /></button><button type="button" className="sj-next" onClick={advance} aria-disabled={busy}><span>{buttonLabels[step]}</span>{busy ? <Loader2 className="sj-spinning" size={15} /> : step === 2 && check === 'complete' ? <RotateCcw size={15} /> : <ArrowRight size={16} />}</button></footer>
          <p className="sj-local-note">Example only. No API is registered or contacted.</p>
        </div>
        <div className="sj-under-workspace"><span><span /> Built for GET / JSON APIs</span><span>Stellar Testnet beta</span></div>
      </div>
    </div>
    <p className="sj-live" role="status">{step === 2 ? check === 'running' ? 'Example: checking an invalid secret.' : check === 'rejected' ? 'Invalid secret rejected. Checking your secret.' : check === 'complete' ? 'Example complete. Invalid secret rejected, correct secret accepted. No API was contacted.' : 'Run example checks to preview setup verification.' : ''}</p>
  </section>;
}
