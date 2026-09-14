import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, Code2, LockKeyhole, Play, RotateCcw, Terminal } from 'lucide-react';
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
    <span className="tx-wire tx-wire-out"><i />{forward && <b key={step} className="tx-packet">{step === 'verifying' ? 'USDC' : 'GET'}<ArrowRight size={10} /></b>}</span>
    <span className="tx-wire tx-wire-back"><i />{backward && <b key={step} className={`tx-packet tx-packet-back ${step === 'required' ? 'tx-packet-unpaid' : ''}`}>{step === 'required' ? '402' : '200'}<ArrowRight size={10} /></b>}</span>
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
  const gateLabel = step === 'required' ? 'Payment required' : step === 'verifying' ? 'Verifying payment' : sample.credited ? 'Payment verified' : 'Pay per call';

  function advance() {
    if (step === 'idle') simulation.current?.request();
    else if (step === 'required') simulation.current?.pay();
    else if (complete) { simulation.current?.reset(); simulation.current?.request(); }
  }

  return <section className="tx" id="sample-request" ref={consoleRef} tabIndex={-1} aria-label="Interactive paid request example" data-step={step} data-credited={sample.credited}>
    <p className="tx-eyebrow"><span /> A paid call, from end to end</p>
    <div className="tx-diagram">
      <div className="tx-client tx-node">
        <div className="tx-node-label"><span>01</span> Your client</div>
        <div className="tx-request-object">
          <div className="tx-request-icon"><Terminal size={26} strokeWidth={1.5} /><span>GET</span></div>
          <code>/weather<span>?city=Jakarta</span></code>
          <span className="tx-client-state">{complete ? <><Check size={12} /> Response received</> : step === 'required' ? 'Waiting for payment' : step === 'idle' ? 'Ready to call' : 'Request in progress'}</span>
        </div>
      </div>

      <Connection side="in" step={step} credited={sample.credited} />

      <div className="tx-gateway">
        <div className="tx-orbit" aria-hidden="true"><i /><i /></div>
        <div className="tx-core"><img src="/brand/paygate-mark.svg" width="64" height="64" alt="" /><span className="tx-core-check">{sample.credited ? <Check size={13} /> : <LockKeyhole size={11} />}</span></div>
        <strong>PayGate</strong><span className="tx-gate-state">{gateLabel}</span>
      </div>

      <Connection side="out" step={step} credited={sample.credited} />

      <div className={`tx-api tx-node ${delivered ? 'is-delivered' : ''}`}>
        <div className="tx-node-label"><span>02</span> Your API</div>
        <div className="tx-response-object">
          <img className="tx-weather-art" src="/brand/visual-story/weather-small.webp" alt="" width="800" height="597" loading="lazy" />
          <div className="tx-response-top"><span>Jakarta, ID</span>{delivered ? <span className="tx-ok"><Check size={10} /> 200 OK</span> : <LockKeyhole size={12} />}</div>
          <div className="tx-temperature">{delivered ? '29' : '—'}<small>°</small></div>
          <span className="tx-weather-caption">{delivered ? 'Partly cloudy · JSON' : 'Access after payment'}</span>
        </div>
      </div>
    </div>

    <div className="tx-playback">
      <div className="tx-status" role="status" aria-live="polite" aria-atomic="true"><span className="tx-status-dot" /><div><h2>{title}</h2><p className="tx-sr-only">{description}</p><span className="tx-status-detail">{step === 'required' ? '0.010 testnet USDC / call' : sample.credited ? 'Payment credited · 0.010 testnet USDC' : 'Weather API · 0.010 testnet USDC / call'}</span></div></div>
      <div className="tx-controls"><button type="button" className="tx-reset" onClick={() => simulation.current?.reset()} disabled={step === 'idle'} aria-label="Reset sample request"><RotateCcw size={15} /></button><button type="button" className="tx-action" onClick={advance} aria-disabled={busy}>{busy ? <span className="tx-spinner" /> : complete ? <RotateCcw size={13} /> : step === 'required' ? <LockKeyhole size={12} /> : <Play size={11} fill="currentColor" />}<span>{action}</span></button></div>
    </div>

    <footer className="tx-footer"><p>Interactive example. No funds are sent.</p><button type="button" onClick={() => setInspect(!inspect)} aria-expanded={inspect} aria-controls="sample-payload"><Code2 size={13} />{inspect ? 'Hide payload' : 'View payload'}<ChevronDown size={12} className={inspect ? 'is-open' : ''} /></button></footer>
    <div className="tx-payload" id="sample-payload" hidden={!inspect}>
      <div><span>Example request</span><pre><code>{'GET /weather?city=Jakarta\nAccept: application/json'}</code></pre></div>
      <div><span>{complete ? 'Response received · 200 OK' : 'Example response · not yet received'}</span><pre><code>{'{\n  "temperature_c": 29,\n  "condition": "partly_cloudy"\n}'}</code></pre></div>
    </div>
  </section>;
}
