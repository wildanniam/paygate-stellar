import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, Code2, LockKeyhole, Play, RotateCcw } from 'lucide-react';
import '../../styles/transaction-journey.css';

const STATUS = {
  idle: ['Follow one paid call.', 'Send a sample request to begin.'],
  requesting: ['Request sent.', 'The client asks for the weather in Jakarta.'],
  required: ['402 · Payment required.', 'Simulate a 0.010 testnet USDC payment to continue.'],
  verifying: ['Verifying payment…', 'PayGate checks the sample payment.'],
  credited: ['Payment credited.', 'Revenue is credited before the request is forwarded.'],
  forwarding: ['Your API gets the call.', 'The verified request carries your secret header.'],
  returning: ['Weather data returns.', 'Your API sends the response back to the client.'],
  complete: ['Response delivered.', 'The client received the JSON response.'],
};

function Connection({ side, step, credited }) {
  const incoming = side === 'in';
  const forward = incoming ? ['requesting', 'verifying'].includes(step) : step === 'forwarding';
  const backward = incoming ? ['required', 'returning'].includes(step) : step === 'returning';
  return <div className={`tx-connection tx-connection-${side}`} aria-hidden="true" data-lit={credited}>
    <span className="tx-wire tx-wire-out"><i />{forward && <b key={step} className="tx-packet" />}</span>
    <span className="tx-wire tx-wire-back"><i />{backward && <b key={step} className={`tx-packet tx-packet-back ${step === 'required' ? 'tx-packet-unpaid' : ''}`} />}</span>
  </div>;
}

export default function TransactionJourney({ sample, simulation, consoleRef }) {
  const [inspect, setInspect] = useState(false);
  const step = sample.step;
  const busy = ['requesting', 'verifying', 'credited', 'forwarding', 'returning'].includes(step);
  const complete = step === 'complete';
  const delivered = complete || step === 'returning';
  const [title, description] = STATUS[step];
  const action = step === 'required' ? 'Simulate payment' : complete ? 'Replay' : busy ? 'In progress' : 'Send request';
  const gateLabel = step === 'required' ? '402 · Payment required' : step === 'verifying' ? 'Verifying payment' : sample.credited ? 'Payment credited' : 'Payment gateway';
  const responseLabel = delivered ? 'Partly cloudy' : step === 'forwarding' ? 'Request received…' : 'Awaiting paid request';

  function advance() {
    if (busy) return;
    if (step === 'idle') simulation.current?.request();
    else if (step === 'required') simulation.current?.pay();
    else if (complete) { simulation.current?.reset(); simulation.current?.request(); }
  }

  return <section className="tx" id="sample-request" ref={consoleRef} tabIndex={-1} aria-label="Interactive paid request example" data-step={step} data-credited={sample.credited}>
    <header className="tx-heading"><h2>One call. See the result.</h2><p><span /> Interactive example</p></header>
    <div className="tx-sr-only" role="status" aria-live="polite" aria-atomic="true">{title} {description}</div>
    <div className="tx-diagram">
      <div className="tx-client tx-node">
        <div className="tx-node-label">Your client</div>
        <div className="tx-request-object">
          <span className="tx-method">GET</span>
          <code>/weather<span>?city=Jakarta</span></code>
        </div>
        <p className="tx-price"><strong>0.010</strong> testnet USDC / call</p>
        <button type="button" className="tx-action" onClick={advance} aria-disabled={busy}>{busy ? <span className="tx-spinner" /> : complete ? <RotateCcw size={14} /> : step === 'required' ? <LockKeyhole size={14} /> : <Play size={12} fill="currentColor" />}<span>{action}</span><ArrowRight className="tx-action-arrow" size={15} /></button>
      </div>

      <Connection side="in" step={step} credited={sample.credited} />

      <div className="tx-gateway">
        <div className="tx-core"><svg className="tx-verify-ring" viewBox="0 0 112 112" aria-hidden="true"><rect x="2" y="2" width="108" height="108" rx="30" pathLength="1" /></svg><img src="/brand/paygate-mark.svg" width="52" height="52" alt="PayGate" /><span className="tx-core-check" aria-hidden="true">{sample.credited ? <Check size={11} /> : <LockKeyhole size={10} />}</span></div>
        <span className="tx-gate-state">{gateLabel}</span>
      </div>

      <Connection side="out" step={step} credited={sample.credited} />

      <div className={`tx-api tx-node ${delivered ? 'is-delivered' : ''}`} aria-label="Your API response">
        <div className="tx-response-object">
          <img className="tx-weather-art" src="/brand/visual-story/weather-volume-small.webp" alt="" width="600" height="450" loading="lazy" />
          <div className="tx-response-top"><span>Jakarta, ID</span><span className="tx-http">{delivered ? <><Check size={11} /> 200 OK</> : step === 'forwarding' ? 'Receiving' : 'Your API'}</span></div>
          <div className="tx-temperature"><span className="tx-value-pending" aria-hidden={delivered}>—</span><span className="tx-value-delivered" aria-hidden={!delivered}>29<small>°</small></span></div>
          <div className="tx-response-bottom"><span className="tx-weather-caption">{responseLabel}</span><span className="tx-format">{'{ JSON }'}</span></div>
        </div>
      </div>
    </div>

    <footer className="tx-footer"><p>Simulation only. No funds are sent.</p><button type="button" onClick={() => setInspect(!inspect)} aria-expanded={inspect} aria-controls="sample-payload"><Code2 size={13} />{inspect ? 'Hide payload' : 'View payload'}<ChevronDown size={12} className={inspect ? 'is-open' : ''} /></button></footer>
    <div className="tx-payload" id="sample-payload" hidden={!inspect}>
      <div><span>Example request</span><pre><code>{'GET /weather?city=Jakarta\nAccept: application/json'}</code></pre></div>
      <div><span>{complete ? 'Response received · 200 OK' : 'Example response · not yet received'}</span><pre><code>{'{\n  "temperature_c": 29,\n  "condition": "partly_cloudy"\n}'}</code></pre></div>
    </div>
  </section>;
}
