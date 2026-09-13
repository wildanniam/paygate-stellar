import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, CloudSun, Code2, LockKeyhole, Play, RotateCcw, Terminal, Wallet } from 'lucide-react';
import '../../styles/transaction-journey.css';

const STATUS = {
  idle: ['Your next request starts here.', 'Send a sample call and follow its path.'],
  requesting: ['A request reaches PayGate.', 'The client asks for the weather in Jakarta.'],
  required: ['Access has a price.', 'PayGate returns 402. Simulate a payment to continue.'],
  verifying: ['Checking the payment.', 'PayGate verifies the sample payment credential.'],
  credited: ['Payment verified. Revenue credited.', '0.009 to you. 0.001 to PayGate. Now the request can pass.'],
  forwarding: ['Your API gets the request.', 'PayGate forwards it with your protected access header.'],
  returning: ['The response is on its way.', 'Your API sends the weather data back to the client.'],
  complete: ['Data delivered. You got paid.', 'One request, one payment, one response.'],
};

function Connection({ side, step }) {
  const incoming = side === 'in';
  const forward = incoming ? ['requesting', 'verifying'].includes(step) : step === 'forwarding';
  const backward = incoming ? ['required', 'returning'].includes(step) : step === 'returning';
  const token = step === 'verifying' ? 'USDC' : 'GET';
  return <div className={`tx-connection tx-connection-${side}`} aria-hidden="true">
    <span className="tx-wire tx-wire-out"><i />{forward && <b key={step} className="tx-packet">{token}<ArrowRight size={10} /></b>}</span>
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
  const phase = ['idle', 'requesting', 'required'].includes(step) ? 1 : ['verifying', 'credited'].includes(step) ? 2 : 3;
  const action = step === 'required' ? 'Simulate payment' : complete ? 'Try again' : busy ? 'In progress' : 'Send request';
  const gateLabel = step === 'required' ? 'Payment required' : step === 'verifying' ? 'Verifying payment' : sample.credited ? 'Payment verified' : 'Payment gateway';

  function advance() {
    if (step === 'idle') simulation.current?.request();
    else if (step === 'required') simulation.current?.pay();
    else if (complete) { simulation.current?.reset(); simulation.current?.request(); }
  }

  return <section className="tx" id="sample-request" ref={consoleRef} tabIndex={-1} aria-label="Interactive paid request example" data-step={step} data-credited={sample.credited}>
    <header className="tx-header">
      <div><p className="tx-eyebrow"><span /> Interactive walkthrough</p><h2>Watch a paid API call.</h2></div>
      <div className="tx-controls">
        <button type="button" className="tx-reset" onClick={() => simulation.current?.reset()} disabled={step === 'idle'} aria-label="Reset sample request"><RotateCcw size={16} /></button>
        <button type="button" className="tx-action" onClick={advance} aria-disabled={busy}>{busy ? <span className="tx-spinner" /> : complete ? <RotateCcw size={14} /> : <Play size={11} fill="currentColor" />}<span>{action}</span></button>
      </div>
    </header>

    <div className="tx-scene">
      <div className="tx-diagram">
        <div className="tx-client tx-node">
          <div className="tx-node-label"><Terminal size={15} /><span>Your client</span></div>
          <div className="tx-client-window">
            <div className="tx-window-bar"><span><i /><i /><i /></span><span>agent.js</span></div>
            <div className="tx-request"><span>GET</span><code>/weather</code><ArrowRight size={13} /></div>
            <div className="tx-client-bottom"><span>city <b>Jakarta</b></span><span className={`tx-client-state ${complete ? 'is-received' : ''}`}>{complete ? <><Check size={11} /> Received</> : step === 'required' ? '402 returned' : step === 'idle' ? 'Ready' : 'Requesting'}</span></div>
          </div>
        </div>

        <Connection side="in" step={step} />

        <div className="tx-gateway">
          <div className="tx-core"><div className="tx-core-inner"><img src="/brand/paygate-mark.svg" width="56" height="56" alt="" /></div><span className="tx-core-check">{sample.credited ? <Check size={14} /> : <LockKeyhole size={12} />}</span></div>
          <div className="tx-gateway-copy"><strong>PayGate</strong><span>{gateLabel}</span></div>
        </div>

        <Connection side="out" step={step} />

        <div className={`tx-api tx-node ${delivered ? 'is-delivered' : ''}`}>
          <div className="tx-node-label"><Code2 size={15} /><span>Your API</span></div>
          <div className="tx-weather">
            <div className="tx-weather-location"><span>Jakarta, ID</span>{delivered ? <span className="tx-ok"><Check size={10} />200 OK</span> : <LockKeyhole size={12} />}</div>
            <div className="tx-weather-main"><span className="tx-temperature">{delivered ? '29' : '—'}<small>°</small></span><CloudSun size={47} strokeWidth={1.1} /></div>
            <div className="tx-weather-caption"><span>{delivered ? 'Partly cloudy' : 'Awaiting paid request'}</span><span>{'{ JSON }'}</span></div>
          </div>
        </div>
      </div>

      <div className="tx-narrative" role="status" aria-live="polite" aria-atomic="true">
        <span className="tx-phase" aria-hidden="true">0{phase}<span> / 03</span></span>
        <div key={step} className="tx-narrative-copy"><h3>{title}</h3><p>{description}</p></div>
        {step === 'required' && <span className="tx-price">0.010 <small>testnet USDC</small></span>}
        {complete && <span className="tx-completed"><Check size={14} /> Complete</span>}
      </div>
    </div>

    <div className="tx-settlement">
      <div className="tx-settlement-label"><Wallet size={19} /><div><strong>{sample.credited ? 'Revenue credited' : 'Payment breakdown'}</strong><span>{sample.credited ? 'Illustrative escrow balance' : 'Example price · 0.010 testnet USDC'}</span></div></div>
      <div className="tx-money"><span>You receive</span><strong>{sample.credited ? '+0.009' : '0.009'}<small> USDC</small></strong></div>
      <div className="tx-money tx-fee"><span>PayGate fee</span><strong>0.001<small> USDC</small></strong></div>
      <span className="tx-credit-state">{sample.credited ? <><Check size={12} />Credited</> : 'On payment'}</span>
    </div>
    <footer className="tx-footer"><p>Simulation only. No funds are sent.</p><button type="button" onClick={() => setInspect(!inspect)} aria-expanded={inspect} aria-controls="sample-payload"><Code2 size={14} />{inspect ? 'Hide payload' : 'Inspect payload'}<ChevronDown size={13} className={inspect ? 'is-open' : ''} /></button></footer>
    <div className="tx-payload" id="sample-payload" hidden={!inspect}>
      <div><span>Example request</span><pre><code>{'GET /weather?city=Jakarta\nAccept: application/json'}</code></pre></div>
      <div><span>{complete ? 'Response received · 200 OK' : 'Example response · not yet received'}</span><pre><code>{'{\n  "temperature_c": 29,\n  "condition": "partly_cloudy"\n}'}</code></pre></div>
    </div>
  </section>;
}
