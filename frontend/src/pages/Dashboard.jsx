import { isConnected, requestAccess, signMessage } from '@stellar/freighter-api';
import { AlertCircle, ExternalLink, Loader2, LogOut, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AppNavbar from '../components/AppNavbar.jsx';
import { C, MONO } from '../colors.js';

const HORIZON = 'https://horizon-testnet.stellar.org';
const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

function isValidStellarAddress(addr) {
  return /^G[A-Z2-7]{55}$/.test(addr);
}

function short(value, head = 6, tail = 4) {
  if (!value) return '-';
  if (tail <= 0) return `${value.slice(0, head)}...`;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function normalizeSignedMessage(signedMessage) {
  if (typeof signedMessage === 'string') return signedMessage;
  if (signedMessage?.type === 'Buffer' && Array.isArray(signedMessage.data)) {
    return btoa(String.fromCharCode(...signedMessage.data));
  }
  if (signedMessage && typeof signedMessage.toString === 'function') {
    return signedMessage.toString('base64');
  }
  return '';
}

async function readJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function fetchMppPayments(walletAddress) {
  const url = `${HORIZON}/accounts/${walletAddress}/operations?order=desc&limit=200`;
  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error('Wallet address tidak ditemukan di Stellar testnet. Pastikan account sudah difund.');
  }
  if (!res.ok) {
    throw new Error(`Horizon API error: ${res.status}`);
  }

  const data = await res.json();
  const records = data._embedded?.records ?? [];

  return records
    .filter(
      (op) =>
        op.type_i === 24 &&
        Array.isArray(op.asset_balance_changes) &&
        op.asset_balance_changes.some((change) => change.type === 'transfer' && change.to === walletAddress && change.code === 'USDC')
    )
    .map((op) => {
      const change = op.asset_balance_changes.find((item) => item.type === 'transfer' && item.to === walletAddress && item.code === 'USDC');
      return {
        timestamp: op.created_at,
        from: change.from,
        amount: parseFloat(change.amount),
        txHash: op.transaction_hash,
      };
    });
}

function SummaryCard({ label, value }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
      <div style={{ color: C.text3, fontSize: 12, ...MONO }}>{label}</div>
      <div style={{ color: C.text1, fontSize: 24, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [walletAddress, setWalletAddress] = useState(() => localStorage.getItem('paygate_wallet_address') ?? '');
  const [activeWallet, setActiveWallet] = useState(() => localStorage.getItem('paygate_wallet_address') ?? '');
  const [status, setStatus] = useState(activeWallet ? 'loading' : 'idle');
  const [session, setSession] = useState({ authenticated: false });
  const [authStatus, setAuthStatus] = useState('idle');
  const [authError, setAuthError] = useState('');
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAndSet = useCallback(async () => {
    if (!activeWallet) return;
    setStatus((prev) => (prev === 'loaded' ? 'loaded' : 'loading'));
    setError('');
    try {
      const rows = await fetchMppPayments(activeWallet);
      setPayments(rows);
      setLastUpdated(new Date());
      setStatus('loaded');
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
      setStatus('error');
    }
  }, [activeWallet]);

  useEffect(() => {
    if (!activeWallet) return undefined;

    fetchAndSet();
    const interval = setInterval(fetchAndSet, 30_000);
    return () => clearInterval(interval);
  }, [activeWallet, fetchAndSet]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setAuthStatus('loading');
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await readJsonResponse(res);
        if (!active) return;
        setSession(data);
        setAuthStatus('idle');
        if (data.authenticated && data.walletAddress) {
          localStorage.setItem('paygate_wallet_address', data.walletAddress);
          setWalletAddress(data.walletAddress);
          setActiveWallet(data.walletAddress);
        }
      } catch {
        if (!active) return;
        setAuthStatus('idle');
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return {
      total: `${total.toFixed(4).replace(/\.?0+$/, '') || '0'} USDC`,
      count: payments.length,
      last: payments[0] ? formatDate(payments[0].timestamp) : '-',
    };
  }, [payments]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = walletAddress.trim();
    if (!isValidStellarAddress(trimmed)) {
      setError('Alamat Stellar tidak valid. Harus dimulai dengan G dan 56 karakter.');
      setStatus('error');
      return;
    }
    localStorage.setItem('paygate_wallet_address', trimmed);
    setActiveWallet(trimmed);
    setStatus('loading');
  };

  const handleConnectWallet = async () => {
    setAuthStatus('connecting');
    setAuthError('');

    try {
      const connected = await isConnected();
      if (connected.error) throw new Error(connected.error.message || 'Freighter connection failed.');
      if (!connected.isConnected) throw new Error('Freighter extension belum terhubung.');

      const access = await requestAccess();
      if (access.error) throw new Error(access.error.message || 'Wallet access ditolak.');
      const developerWallet = access.address;

      const challengeRes = await fetch('/api/auth/challenge', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: developerWallet }),
      });
      const challenge = await readJsonResponse(challengeRes);
      if (!challengeRes.ok) throw new Error(challenge.error || 'Gagal membuat login challenge.');

      const signed = await signMessage(challenge.message, {
        address: developerWallet,
        networkPassphrase: TESTNET_PASSPHRASE,
      });
      if (signed.error) throw new Error(signed.error.message || 'Signature ditolak.');

      const signature = normalizeSignedMessage(signed.signedMessage);
      if (!signature) throw new Error('Freighter tidak mengembalikan signature.');

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.challengeId,
          walletAddress: developerWallet,
          signerAddress: signed.signerAddress,
          signedMessage: signature,
        }),
      });
      const verified = await readJsonResponse(verifyRes);
      if (!verifyRes.ok) throw new Error(verified.error || 'Signature wallet tidak valid.');

      setSession({ authenticated: true, walletAddress: verified.walletAddress });
      setWalletAddress(verified.walletAddress);
      setActiveWallet(verified.walletAddress);
      localStorage.setItem('paygate_wallet_address', verified.walletAddress);
      setAuthStatus('idle');
    } catch (err) {
      setAuthError(err.message || 'Gagal connect wallet.');
      setAuthStatus('error');
    }
  };

  const handleLogout = async () => {
    setAuthStatus('loading');
    setAuthError('');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setSession({ authenticated: false });
      setAuthStatus('idle');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif", backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <AppNavbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 96px' }}>
        <header style={{ maxWidth: 720, marginBottom: 34 }}>
          <p style={{ ...MONO, color: C.cyan, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Stellar Testnet Monitor
          </p>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Watch API payments land on-chain.
          </h1>
          <p style={{ color: C.text2, fontSize: 17, lineHeight: 1.7, marginTop: 18 }}>
            Load a Stellar testnet wallet to monitor USDC transfers generated by your MPP paywall.
          </p>
        </header>

        <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text1, fontWeight: 800 }}>
              <ShieldCheck size={18} color={C.green} />
              Developer Wallet
            </div>
            <div style={{ color: C.text3, fontSize: 13, marginTop: 8, ...MONO }}>
              {session.authenticated ? short(session.walletAddress, 10, 6) : 'Not connected'}
            </div>
            {authError && <div style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{authError}</div>}
          </div>
          {session.authenticated ? (
            <button type="button" onClick={handleLogout} disabled={authStatus === 'loading'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
              <LogOut size={15} />
              Logout
            </button>
          ) : (
            <button type="button" onClick={handleConnectWallet} disabled={authStatus === 'connecting' || authStatus === 'loading'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: C.text1, border: 'none', borderRadius: 8, padding: '11px 16px', fontWeight: 700, cursor: 'pointer' }}>
              {authStatus === 'connecting' ? <Loader2 size={16} className="spin" /> : <Wallet size={16} />}
              Connect Freighter
            </button>
          )}
        </section>

        <form onSubmit={handleSubmit} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'grid', gap: 14, marginBottom: 24 }}>
          <label>
            <span style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Stellar Wallet Address</span>
            <input
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              placeholder="GABC...XYZ"
              spellCheck={false}
              style={{
                width: '100%',
                background: C.surfaceHover,
                border: `1px solid ${C.border}`,
                color: C.text1,
                borderRadius: 8,
                padding: '13px 14px',
                outline: 'none',
                fontSize: 14,
                ...MONO,
              }}
            />
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: C.text1, border: 'none', borderRadius: 8, padding: '11px 16px', fontWeight: 700, cursor: 'pointer' }}>
              <Wallet size={16} />
              Load Dashboard
            </button>
            {activeWallet && (
              <button type="button" onClick={fetchAndSet} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
                <RefreshCw size={15} />
                Refresh
              </button>
            )}
            {lastUpdated && <span style={{ color: C.text3, fontSize: 12, ...MONO }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </form>

        {status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.text2, padding: '28px 0' }}>
            <Loader2 size={18} className="spin" />
            Loading...
          </div>
        )}

        {status === 'error' && error && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.red, background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.18)', borderRadius: 8, padding: 14, fontSize: 14, marginBottom: 24 }}>
            <AlertCircle size={17} style={{ flex: '0 0 auto', marginTop: 1 }} />
            {error}
          </div>
        )}

        {status === 'loaded' && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14, marginBottom: 24 }}>
              <SummaryCard label="Total USDC" value={summary.total} />
              <SummaryCard label="Total Requests" value={summary.count} />
              <SummaryCard label="Last Payment" value={summary.last} />
            </section>

            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {payments.length === 0 ? (
                <div style={{ padding: 28, color: C.text2 }}>
                  Belum ada MPP payment diterima. Generate paywall dan mulai menerima requests.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                    <thead>
                      <tr style={{ color: C.text3, fontSize: 12, ...MONO, textAlign: 'left' }}>
                        {['Timestamp', 'From', 'Amount', 'Tx Hash'].map((heading) => (
                          <th key={heading} style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.txHash} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '15px 16px', color: C.text2 }}>{formatDate(payment.timestamp)}</td>
                          <td style={{ padding: '15px 16px', color: C.text2, ...MONO, fontSize: 13 }}>{short(payment.from)}</td>
                          <td style={{ padding: '15px 16px', color: C.green, fontWeight: 700 }}>{payment.amount} USDC</td>
                          <td style={{ padding: '15px 16px' }}>
                            <a href={`https://stellar.expert/explorer/testnet/tx/${payment.txHash}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.cyan, textDecoration: 'none', ...MONO, fontSize: 13 }}>
                              {short(payment.txHash, 8, 0)}
                              <ExternalLink size={13} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
