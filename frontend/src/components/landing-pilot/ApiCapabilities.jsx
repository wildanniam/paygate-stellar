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
      <h2 id="capabilities-title">Your price.<br /><span>Clear fees.</span></h2>
      <p>Choose a price per call.<br />See your share.</p>
    </header>
    <div className="ac-grid" data-price={cents}>
      <div className="ac-price-bridge" key={cents} aria-hidden="true"><svg viewBox="0 0 120 130" preserveAspectRatio="none"><path d="M0 8H32Q44 8 44 20V110Q44 122 56 122H120" pathLength="1" /></svg></div>
      <article className="ac-price-panel" aria-labelledby="ac-price-title">
        <StoryMedia name="weather-clear" motion={motion} flow="weather" />
        <div className="ac-panel-top"><span className="ac-chapter">PRICING</span><span className="ac-api-label"><Code2 size={14} /> Weather API</span></div>
        <div className="ac-weather-reading" aria-hidden="true"><span>Jakarta</span><strong>29°</strong></div>
        <div className="ac-value-tag" key={cents} aria-hidden="true"><span>Per call</span><strong>{gross}<small> USDC</small></strong></div>
        <div className="ac-price-bottom">
          <h3 id="ac-price-title">Price per request.</h3>
          <div className="ac-price-options" role="group" aria-label="Example price per request">
            <div className="ac-price-segments" style={{ '--selected': PRICES.indexOf(cents) }}><i className="ac-price-plate" aria-hidden="true" />{PRICES.map(value => <button key={value} type="button" aria-pressed={value === cents} onClick={() => setCents(value)} aria-label={`${(value / 100).toFixed(2)} testnet USDC per request`}><span>{(value / 100).toFixed(2)}</span>{value === cents && <Check size={13} />}</button>)}</div>
            <span>USDC / call</span>
          </div>
        </div>
      </article>

      <article className="ac-earn-panel" aria-labelledby="ac-earn-title">
        <div className="ac-panel-top"><span className="ac-chapter">YOUR SHARE</span></div>
        <div className="ac-earn-body"><div><h3 id="ac-earn-title">You keep <span>90%.</span></h3><p>PayGate fee: 10%.</p></div><div className="ac-share-value" key={cents}><strong>{provider}</strong><span>USDC / call</span></div></div>
        <div className="ac-split-graphic" key={cents} aria-label="90 percent to you, 10 percent PayGate fee"><div className="ac-split-you">{Array.from({ length: 27 }, (_, i) => <i key={i} style={{ '--bar': i }} />)}</div><div className="ac-split-fee"><i /><i /><i /></div></div>
        <div className="ac-split-labels"><span><i /> Your share</span><span>PayGate fee <b>{fee}</b> USDC</span></div>
      </article>

      <article className="ac-access-panel" aria-labelledby="ac-access-title">
        <StoryMedia name="access" motion={motion} flow="access" />
        <div className="ac-panel-top"><span className="ac-chapter">ACCESS</span><span className="ac-protected"><Check size={12} /> Verified access</span></div>
        <div className="ac-access-caption"><h3 id="ac-access-title">You control<br />access.</h3><a href="#setup-title">See setup <ArrowUpRight size={15} /></a></div>
        <div className="ac-access-pulse" aria-hidden="true"><i /><i /><i /></div>
      </article>

    </div>
    <p className="ac-example-note">Interactive illustration · Stellar Testnet amounts</p>
    <p className="ac-sr-only" aria-live="polite" aria-atomic="true">Example: {gross} testnet USDC per request. Your share is {provider}; PayGate fee is {fee}. No payment is sent.</p>
  </section>;
}
