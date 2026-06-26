import { AlertCircle, Loader2, ShieldCheck, Wallet } from 'lucide-react';
import { useState } from 'react';
import { connectFreighterWallet, toSafeErrorMessage } from '../lib/walletAuth.js';
import Button from './ui/Button.jsx';
import Notice from './ui/Notice.jsx';

export default function WalletLoginPanel({
  title = 'Wallet login required',
  body = 'Connect Freighter and sign the challenge so PayGate can load the developer console for your wallet.',
  onConnected,
  compact = false,
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
      setError(toSafeErrorMessage(err.message, 'PayGate could not connect your wallet.'));
      setStatus('error');
    }
  };

  return (
    <section className="pg-wallet-panel" data-compact={compact ? 'true' : 'false'}>
      <div className="pg-wallet-panel-header">
        <span className="pg-wallet-panel-icon">
          <ShieldCheck size={18} aria-hidden="true" />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
      </div>
      {error && (
        <Notice tone="danger" icon={<AlertCircle size={16} aria-hidden="true" />}>
          {error}
        </Notice>
      )}
      <div className="pg-wallet-panel-action">
        <Button
          type="button"
          size="lg"
          onClick={connect}
          disabled={status === 'connecting'}
          icon={status === 'connecting' ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <Wallet size={16} aria-hidden="true" />}
        >
          Connect Freighter
        </Button>
      </div>
    </section>
  );
}
