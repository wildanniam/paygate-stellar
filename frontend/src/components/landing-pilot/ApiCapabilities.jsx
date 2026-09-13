import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, CloudSun, Code2, Fingerprint, Link2, ShieldCheck } from 'lucide-react';
import '../../styles/api-capabilities.css';

const PRICES = [1, 5, 10];

export default function ApiCapabilities() {
  const [cents, setCents] = useState(1);
  const gross = (cents / 100).toFixed(3);
  const provider = (cents * 9 / 1000).toFixed(3);
  const fee = (cents / 1000).toFixed(3);

  return <section className="ac" aria-labelledby="capabilities-title">
    <header className="ac-heading">
      <div>
        <p className="ac-eyebrow"><span /> Built around your API</p>
        <h2 id="capabilities-title">Your API.<br /><span>Ready for business.</span></h2>
      </div>
      <div className="ac-intro">
        <p>You build the API. PayGate handles<br className="ac-wide-break" /> paid access and payment records.</p>
        <Link to="/apis/new">Register your API <ArrowRight size={17} /></Link>
      </div>
    </header>

    <div className="ac-grid">
      <article className="ac-price-panel" aria-labelledby="ac-price-title">
        <img className="ac-art" src="/brand/hero-violet/field.webp" alt="" loading="lazy" width="1920" height="1072" />
        <div className="ac-panel-copy">
          <span className="ac-number">01 / SET YOUR PRICE</span>
          <h3 id="ac-price-title">A price for every call.</h3>
          <p>Choose what access is worth.<br />Turn your API into a paid endpoint.</p>
        </div>

        <div className="ac-endpoint-preview">
          <div className="ac-endpoint-heading">
            <span className="ac-weather-icon"><CloudSun size={22} strokeWidth={1.6} /></span>
            <div><strong>Weather API</strong><span>Example configuration</span></div>
            <span className="ac-method">GET</span>
          </div>
          <div className="ac-origin"><span>YOUR API</span><code>api.example.com/weather</code></div>
          <fieldset className="ac-price-control">
            <legend>Price per request</legend>
            <div className="ac-amount"><span>{gross}</span><span>testnet<br />USDC</span></div>
            <div className="ac-price-options" role="group" aria-label="Example price per request">
              {PRICES.map(value => <button key={value} type="button" aria-pressed={value === cents} onClick={() => setCents(value)} aria-label={`${(value / 100).toFixed(2)} testnet USDC per request`}>{(value / 100).toFixed(2)}<Check size={13} aria-hidden="true" /></button>)}
            </div>
            <p className="ac-mobile-split">Your share <strong>{provider} USDC</strong><span>Fee {fee} USDC</span></p>
          </fieldset>
          <div className="ac-publish-path" aria-hidden="true"><span /><ArrowDown size={14} /><span /></div>
          <div className="ac-paid-endpoint"><span><Link2 size={15} /> YOUR PAID ENDPOINT</span><code>/api/pay/api_demo</code></div>
          <p className="ac-setup-note">Register. Add your guard. Verify setup.</p>
        </div>
      </article>

      <article className="ac-access-panel" aria-labelledby="ac-access-title">
        <div className="ac-panel-copy">
          <span className="ac-number">02 / CONTROL ACCESS</span>
          <h3 id="ac-access-title">Your API.<br />Your access rules.</h3>
          <p>Add a secret-header check to your API.<br className="ac-wide-break" /> PayGate attaches it to verified paid requests.</p>
        </div>
        <div className="ac-guard-seal" aria-hidden="true"><i /><i /><span><ShieldCheck size={37} strokeWidth={1.4} /></span></div>
        <div className="ac-guard-path" aria-label="Verified payment, then secret header attached">
          <span className="ac-guard-check"><Check size={13} /> Payment verified</span><ArrowRight size={15} aria-hidden="true" /><span className="ac-secret"><Fingerprint size={16} /><code>X-PayGate-Secret</code></span>
        </div>
      </article>

      <article className="ac-receipt-panel" aria-labelledby="ac-receipt-title">
        <div className="ac-panel-copy">
          <span className="ac-number">03 / SEE WHAT YOU EARN</span>
          <h3 id="ac-receipt-title">Every payment. On record.</h3>
          <p>See your share and the fee, down to the call.</p>
        </div>
        <div className="ac-receipt">
          <div className="ac-receipt-heading"><span><Code2 size={15} /> Weather API</span><span>Sample receipt</span></div>
          <div className="ac-receipt-total"><span>Payment amount</span><span>{gross} <small>USDC</small></span></div>
          <div className="ac-receipt-split">
            <div><span><i /> Your share <small>90%</small></span><strong>{provider}<small>USDC</small></strong></div>
            <div><span><i /> PayGate fee <small>10%</small></span><strong>{fee}<small>USDC</small></strong></div>
          </div>
          <div className="ac-receipt-rule" aria-hidden="true"><i /><i /></div>
          <div className="ac-receipt-foot"><span>Stellar Testnet</span><span>Payment &amp; delivery tracked separately</span></div>
        </div>
      </article>
    </div>
    <p className="ac-example-note">Try a price above to see the split. Illustrative testnet amounts; no API is created or payment sent.</p>
    <p className="ac-sr-only" aria-live="polite" aria-atomic="true">Example: {gross} testnet USDC per request. Your share is {provider}; PayGate fee is {fee}.</p>
  </section>;
}
