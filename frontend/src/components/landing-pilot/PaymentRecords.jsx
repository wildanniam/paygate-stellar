import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCheck, CloudSun, Copy, CornerDownLeft, MapPin, Pause, Play, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import StoryMedia from './StoryMedia.jsx';
import '../../styles/payment-records.css';

// Illustrative records only. Payment credit and API delivery are separate facts.
const RECORDS = [
  { id: 'weather', name: 'Weather API', detail: 'Jakarta forecast', icon: CloudSun, gross: '0.010', net: '0.009', fee: '0.001', request: 'req_demo_weather_01', payment: 'pay_demo_weather_01', endpoint: '/weather?city=Jakarta', result: '29°C · Partly cloudy', sequence: '01' },
  { id: 'market', name: 'Market API', detail: 'Latest market quote', icon: TrendingUp, gross: '0.050', net: '0.045', fee: '0.005', request: 'req_demo_market_02', payment: 'pay_demo_market_02', endpoint: '/market?symbol=XLM', result: 'Quote delivered · JSON', sequence: '02' },
  { id: 'location', name: 'Location API', detail: 'Place lookup', icon: MapPin, gross: '0.100', net: '0.090', fee: '0.010', request: 'req_demo_location_03', payment: 'pay_demo_location_03', endpoint: '/places?query=Bandung', result: 'Bandung, ID · JSON', sequence: '03' },
];

export default function PaymentRecords({ motion, toggleMotion }) {
  const [selected, setSelected] = useState(0);
  const [details, setDetails] = useState(false);
  const [copyState, setCopyState] = useState('idle');
  const tabs = useRef([]);
  const copyVersion = useRef(0);
  const copyTimer = useRef(null);
  const record = RECORDS[selected];
  const Icon = record.icon;

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
        <p className="pr-eyebrow"><span /> The proof is in the payment</p>
        <h2 id="records-title">Every paid call.<br /><span>A clear record.</span></h2>
        <p className="pr-intro">The payment, your share, and the API response.<br className="pr-wide-break" /> Connected in one receipt.</p>

        <div className="pr-selector" role="tablist" aria-label="Sample API payments" aria-orientation="vertical">
          {RECORDS.map((item, index) => {
            const ItemIcon = item.icon;
            return <button key={item.id} ref={el => { tabs.current[index] = el; }} type="button" role="tab" id={`record-tab-${item.id}`} aria-controls="record-panel" aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => keySelect(event, index)}>
              <span className="pr-tab-icon"><ItemIcon size={21} strokeWidth={1.6} /></span>
              <span className="pr-tab-label"><strong>{item.name}</strong><small>{item.detail}</small></span>
              <span className="pr-tab-price">{item.gross}<small>USDC</small></span>
              <ArrowRight className="pr-tab-arrow" size={17} aria-hidden="true" />
            </button>;
          })}
        </div>
        <p className="pr-example-note">Example payments · Stellar Testnet</p>
      </div>

      <div className="pr-art">
        <StoryMedia name="receipt-field" basePath="/brand/payment-records" motion={motion} video flow="receipt" />
        <div className="pr-receipt-area" role="tabpanel" id="record-panel" aria-labelledby={`record-tab-${record.id}`} tabIndex={0}>
          <div className="pr-receipt-turn" data-details={details}>
            <div className="pr-receipt-face pr-receipt-front" aria-hidden={details} {...(details ? { inert: '' } : {})}>
              <div className="pr-receipt-brand"><span><img src="/brand/paygate-mark.svg" alt="" width="23" height="23" />PayGate</span><small>PAYMENT RECEIPT</small></div>
              <div className="pr-receipt-content" key={record.id}>
                <div className="pr-receipt-service"><span><Icon size={20} strokeWidth={1.7} /></span><div><strong>{record.name}</strong><small>{record.detail}</small></div><span className="pr-verified" aria-label="Payment verified"><CheckCheck size={18} /></span></div>
                <div className="pr-receipt-amount"><span>You receive</span><strong>{record.net}<small>USDC</small></strong><span className="pr-credit-label"><Check size={12} /> Payment credited</span></div>
                <div className="pr-receipt-tear" aria-hidden="true" />
                <dl className="pr-breakdown"><div><dt>Client paid</dt><dd>{record.gross} <small>USDC</small></dd></div><div><dt>PayGate fee</dt><dd>{record.fee} <small>USDC</small></dd></div></dl>
                <div className="pr-response"><span><Check size={13} /> API response</span><strong>200 OK</strong><small>{record.result}</small></div>
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
              <div className="pr-evidence-result"><span><CheckCheck size={16} /> Payment credited</span><span><CornerDownLeft size={16} /> Response: 200 OK</span></div>
              <p className="pr-copy-status" role="status">{copyState === 'copied' ? 'Request ID copied.' : copyState === 'failed' ? 'Copy unavailable. Select the request ID above.' : 'Illustrative IDs. No transaction was sent.'}</p>
            </div>
          </div>
          <button type="button" className="pr-turn-control" onClick={() => setDetails(value => !value)} aria-expanded={details} aria-label={details ? 'Back to receipt' : 'View receipt details'}><span>{details ? 'Back to receipt' : 'View details'}</span><CornerDownLeft size={16} /></button>
        </div>
        <button type="button" className="pr-motion-control" onClick={toggleMotion} aria-pressed={motion} aria-label={motion ? 'Pause artwork motion' : 'Resume artwork motion'} title={motion ? 'Pause artwork motion' : 'Resume artwork motion'}>{motion ? <Pause size={13} /> : <Play size={13} />}</button>
      </div>
    </div>
    <Link className="pr-dashboard-link" to="/dashboard">Explore your dashboard <ArrowRight size={16} /></Link>
    <span className="pr-sr-only" aria-live="polite" aria-atomic="true">{record.name}: {record.gross} testnet USDC paid. You receive {record.net}. Fee {record.fee}. API response 200 OK.</span>
  </section>;
}
