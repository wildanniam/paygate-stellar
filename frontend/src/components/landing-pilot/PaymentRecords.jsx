import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCheck, CloudSun, Copy, CornerDownLeft, CircleAlert, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import StoryMedia from './StoryMedia.jsx';
import { RECEIPT_EXAMPLES as RECORDS } from '../../lib/landingReceiptExamples.js';
import '../../styles/payment-records.css';

export default function PaymentRecords({ motion, toggleMotion }) {
  const [selected, setSelected] = useState(0);
  const [details, setDetails] = useState(false);
  const [copyState, setCopyState] = useState('idle');
  const tabs = useRef([]);
  const copyVersion = useRef(0);
  const copyTimer = useRef(null);
  const record = RECORDS[selected];
  const failed = record.responseStatus >= 400;

  useEffect(() => () => { copyVersion.current += 1; clearTimeout(copyTimer.current); }, []);

  function select(index) {
    setSelected(index);
    setDetails(false);
    setCopyState('idle');
    copyVersion.current += 1;
    clearTimeout(copyTimer.current);
  }

  function keySelect(event, index) {
    const next = { ArrowDown: (index + 1) % RECORDS.length, ArrowUp: (index + RECORDS.length - 1) % RECORDS.length, Home: 0, End: RECORDS.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  async function copyId() {
    const version = ++copyVersion.current;
    clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(record.request);
      if (version !== copyVersion.current) return;
      setCopyState('copied');
      copyTimer.current = setTimeout(() => setCopyState('idle'), 2400);
    } catch {
      if (version === copyVersion.current) setCopyState('failed');
    }
  }

  return <section className="pr" id="payment-records" aria-labelledby="records-title">
    <div className="pr-layout">
      <div className="pr-copy">
        <p className="pr-eyebrow"><span /> Payment and response, connected</p>
        <h2 id="records-title">Every paid call.<br /><span>A clear record.</span></h2>
        <p className="pr-intro">Trace the payment and the API response<br className="pr-wide-break" /> in one record.</p>

        <div className="pr-selector" role="tablist" aria-label="Sample request outcomes" aria-orientation="vertical">
          {RECORDS.map((item, index) => {
            const ItemIcon = item.responseStatus < 400 ? CheckCheck : CircleAlert;
            return <button key={item.id} ref={el => { tabs.current[index] = el; }} type="button" role="tab" id={`record-tab-${item.id}`} aria-controls="record-panel" aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => keySelect(event, index)}>
              <span className="pr-tab-icon"><ItemIcon size={21} strokeWidth={1.6} /></span>
              <span className="pr-tab-label"><strong>{item.label}</strong><small>{item.detail}</small></span>
              <span className="pr-tab-code">{item.responseStatus}</span>
              <ArrowRight className="pr-tab-arrow" size={17} aria-hidden="true" />
            </button>;
          })}
        </div>
        <p className="pr-example-note">Two sample records · Weather API · Testnet</p>
        <p className="pr-outcome-caption" key={record.id}>{record.caption}</p>
      </div>

      <div className="pr-art">
        <StoryMedia name="receipt-field" basePath="/brand/payment-records" motion={motion} video flow="receipt" />
        <div className="pr-receipt-area" role="tabpanel" id="record-panel" aria-labelledby={`record-tab-${record.id}`} tabIndex={0}>
          <div className="pr-receipt-turn" data-details={details}>
            <div className="pr-receipt-face pr-receipt-front" aria-hidden={details} {...(details ? { inert: '' } : {})}>
              <div className="pr-receipt-brand"><span><img src="/brand/paygate-mark.svg" alt="" width="23" height="23" />PayGate</span><small>REQUEST RECORD</small></div>
              <div className="pr-receipt-content" key={record.id}>
                <div className="pr-receipt-service"><span><CloudSun size={23} strokeWidth={1.6} /></span><div><strong>{record.name}</strong><small>Jakarta forecast</small></div><span className="pr-service-method">GET</span></div>
                <div className="pr-request-identity"><span>Request ID</span><code>…{record.shortRequest}</code></div>
                <div className="pr-record-events" data-outcome={record.id}>
                  <div className="pr-record-event pr-payment-event"><span className="pr-event-icon"><Check size={18} /></span><div><span>Payment</span><strong>Credited</strong><small>{record.gross} testnet USDC</small></div><CheckCheck className="pr-event-stamp" size={24} aria-hidden="true" /></div>
                  <div className="pr-record-event pr-delivery-event"><span className="pr-event-icon">{failed ? <CircleAlert size={18} /> : <CornerDownLeft size={18} />}</span><div><span>API response · {record.responseStatus}</span><strong>{record.outcome}</strong><small>{record.result}</small></div></div>
                </div>
                <div className="pr-receipt-tear" aria-hidden="true" />
                <dl className="pr-breakdown"><div><dt>Client paid</dt><dd>{record.gross} <small>USDC</small></dd></div><div><dt>Your share</dt><dd>{record.net} <small>USDC</small></dd></div><div><dt>PayGate fee</dt><dd>{record.fee} <small>USDC</small></dd></div></dl>
                <div className="pr-receipt-bottom"><span>SAMPLE / {record.sequence}</span><span>Testnet USDC</span></div>
              </div>
            </div>
            <div className="pr-receipt-face pr-receipt-back" aria-hidden={!details} {...(!details ? { inert: '' } : {})}>
              <div className="pr-receipt-brand"><span><img src="/brand/paygate-mark.svg" alt="" width="23" height="23" />PayGate</span><small>CALL DETAILS</small></div>
              <div className="pr-details-title"><span>Every part, connected.</span><h3>{record.name}</h3></div>
              <dl className="pr-evidence">
                <div><dt>Request ID <button type="button" onClick={copyId} aria-label="Copy sample request ID">{copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}</button></dt><dd>{record.request}</dd></div>
                <div><dt>Payment ID</dt><dd>{record.payment}</dd></div>
                <div><dt>Endpoint <span>GET</span></dt><dd>{record.endpoint}</dd></div>
              </dl>
              <div className="pr-evidence-result"><span><CheckCheck size={16} /> Payment credited</span><span><CornerDownLeft size={16} /> {record.responseLabel}</span></div>
              <p className="pr-copy-status" role="status">{copyState === 'copied' ? 'Request ID copied.' : copyState === 'failed' ? 'Copy unavailable. Select the request ID above.' : 'Illustrative IDs. No transaction was sent.'}</p>
            </div>
          </div>
          <button type="button" className="pr-turn-control" onClick={() => setDetails(value => !value)} aria-expanded={details} aria-label={details ? 'Back to receipt' : 'View receipt details'}><span>{details ? 'Back to receipt' : 'View details'}</span><CornerDownLeft size={16} /></button>
        </div>
        <button type="button" className="pr-motion-control" onClick={toggleMotion} aria-pressed={motion} aria-label={motion ? 'Pause artwork motion' : 'Resume artwork motion'} title={motion ? 'Pause artwork motion' : 'Resume artwork motion'}>{motion ? <Pause size={13} /> : <Play size={13} />}</button>
      </div>
    </div>
    <Link className="pr-dashboard-link" to="/dashboard">Explore your dashboard <ArrowRight size={16} /></Link>
    <span className="pr-sr-only" aria-live="polite" aria-atomic="true">{record.name}: {record.gross} testnet USDC paid. You receive {record.net}. Fee {record.fee}. Payment {record.paymentStatus}. API response {record.responseLabel}. {record.result}.</span>
  </section>;
}
