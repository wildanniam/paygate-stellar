import { useState } from 'react';
import { Check, ArrowUpRight, Code2 } from 'lucide-react';
import StoryMedia from './StoryMedia.jsx';
import '../../styles/api-capabilities.css';

const PRICES = [1, 5, 10];

export default function ApiCapabilities({ motion }) {
  const [cents, setCents] = useState(1);
  const gross = (cents / 100).toFixed(3);
  const provider = (cents * 9 / 1000).toFixed(3);
  const fee = (cents / 1000).toFixed(3);

  return <section className="ac" aria-labelledby="capabilities-title">
    <header className="ac-heading">
      <h2 id="capabilities-title">You build it.<br /><span>Make every call count.</span></h2>
      <p>Your price. Your API.<br />A new way to get paid.</p>
    </header>
    <div className="ac-grid">
      <article className="ac-price-panel" aria-labelledby="ac-price-title">
        <StoryMedia name="weather" motion={motion} video />
        <div className="ac-panel-top"><span className="ac-chapter">01 / PRICE</span><span className="ac-api-label"><Code2 size={14} /> Weather API</span></div>
        <div className="ac-weather-reading" aria-hidden="true"><span>Jakarta</span><strong>29°</strong></div>
        <div className="ac-value-tag" key={cents} aria-hidden="true"><span>Per call</span><strong>{gross}<small> USDC</small></strong></div>
        <div className="ac-price-bottom">
          <h3 id="ac-price-title">Set your price.</h3>
          <div className="ac-price-options" role="group" aria-label="Example price per request">
            {PRICES.map(value => <button key={value} type="button" aria-pressed={value === cents} onClick={() => setCents(value)} aria-label={`${(value / 100).toFixed(2)} testnet USDC per request`}><span>{(value / 100).toFixed(2)}</span>{value === cents && <Check size={13} />}</button>)}
            <span>USDC / call</span>
          </div>
          <p className="ac-mobile-split">You keep <strong>{provider}</strong><span> · Fee {fee} USDC</span></p>
        </div>
      </article>

      <article className="ac-access-panel" aria-labelledby="ac-access-title">
        <StoryMedia name="access" motion={motion} />
        <div className="ac-panel-top"><span className="ac-chapter">02 / PROTECT</span><span className="ac-protected"><Check size={12} /> Verified access</span></div>
        <div className="ac-access-caption"><h3 id="ac-access-title">Paid requests.<br />Through your guard.</h3><p>Your server checks the secret.</p></div>
        <div className="ac-access-pulse" aria-hidden="true"><i /><i /><i /></div>
      </article>

      <article className="ac-earn-panel" aria-labelledby="ac-earn-title">
        <div className="ac-panel-top"><span className="ac-chapter">03 / EARN</span><ArrowUpRight size={20} /></div>
        <div className="ac-earn-body"><div><h3 id="ac-earn-title">You keep <span>90%.</span></h3><p>Every payment, accounted for.</p></div><div className="ac-share-value" key={cents}><strong>{provider}</strong><span>USDC / call</span></div></div>
        <div className="ac-split-graphic" key={cents} aria-label="90 percent to you, 10 percent PayGate fee"><div className="ac-split-you">{Array.from({ length: 27 }, (_, i) => <i key={i} style={{ '--bar': i }} />)}</div><div className="ac-split-fee"><i /><i /><i /></div></div>
        <div className="ac-split-labels"><span><i /> Your share</span><span>PayGate fee <b>{fee}</b> USDC</span></div>
      </article>
    </div>
    <p className="ac-example-note">Interactive illustration · Stellar Testnet amounts</p>
    <p className="ac-sr-only" aria-live="polite" aria-atomic="true">Example: {gross} testnet USDC per request. Your share is {provider}; PayGate fee is {fee}. No payment is sent.</p>
  </section>;
}
