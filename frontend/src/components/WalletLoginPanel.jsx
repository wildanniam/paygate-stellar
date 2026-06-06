import { AlertCircle, Loader2, ShieldCheck, Wallet } from 'lucide-react';
import { useState } from 'react';
import { C, MONO } from '../colors.js';
import { connectFreighterWallet } from '../lib/walletAuth.js';

export default function WalletLoginPanel({
  title = 'Wallet login required',
  body = 'Connect Freighter and sign the challenge so PayGate can load the developer console for your wallet.',
  onConnected,
}) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const connect = async () => {
    setStatus('connecting');
    setError('');
    try {
      const session = await connectFreighterWallet();
      setStatus('idle');
      onConnected?.(session);
    } catch (err) {
      setError(err.message || 'Gagal connect wallet.');
      setStatus('error');
    }
  };

  return (
    <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text1, fontWeight: 800, marginBottom: 10 }}>
        <ShieldCheck size={18} color={C.amber} />
        {title}
      </div>
      <p style={{ color: C.text2, lineHeight: 1.7, margin: 0, maxWidth: 680 }}>
        {body}
      </p>
      {error && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.red, background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.18)', borderRadius: 8, padding: 12, fontSize: 13, marginTop: 16 }}>
          <AlertCircle size={16} style={{ flex: '0 0 auto', marginTop: 1 }} />
          {error}
        </div>
      )}
      <button type="button" onClick={connect} disabled={status === 'connecting'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: C.text1, border: 'none', borderRadius: 8, padding: '11px 16px', fontWeight: 800, cursor: 'pointer', marginTop: 18, ...MONO }}>
        {status === 'connecting' ? <Loader2 size={16} className="spin" /> : <Wallet size={16} />}
        Connect Freighter
      </button>
    </section>
  );
}
