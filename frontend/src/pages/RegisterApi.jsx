import { AlertCircle, CheckCircle2, Loader2, Plus, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import CopyButton from '../components/CopyButton.jsx';
import ValueRow from '../components/ValueRow.jsx';
import WalletLoginPanel from '../components/WalletLoginPanel.jsx';
import { C, MONO } from '../colors.js';
import { readJsonResponse } from '../lib/walletAuth.js';

const initialForm = {
  name: 'Market Signal API',
  upstreamBaseUrl: 'https://example.com',
  path: '/v1/market-signal',
  priceUsdc: '0.01',
};

function inputStyle() {
  return {
    width: '100%',
    background: C.surfaceHover,
    border: `1px solid ${C.border}`,
    color: C.text1,
    borderRadius: 8,
    padding: '13px 14px',
    outline: 'none',
    fontSize: 14,
  };
}

function setupSnippet(api) {
  return `const PAYGATE_SECRET = process.env.PAYGATE_SECRET;

app.get('${api.path}', (req, res) => {
  if (req.get('X-PayGate-Secret') !== PAYGATE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({ ok: true });
});`;
}

export default function RegisterApi() {
  const [session, setSession] = useState({ authenticated: false });
  const [sessionStatus, setSessionStatus] = useState('loading');
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [createdApi, setCreatedApi] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setSessionStatus('loading');
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await readJsonResponse(res);
        if (!active) return;
        setSession(data);
      } catch {
        if (!active) return;
        setSession({ authenticated: false });
      } finally {
        if (active) setSessionStatus('idle');
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setError('');
    setCreatedApi(null);

    try {
      const res = await fetch('/api/apis', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          upstreamBaseUrl: form.upstreamBaseUrl,
          path: form.path,
          priceUsdc: form.priceUsdc,
        }),
      });
      const data = await readJsonResponse(res);
      if (res.status === 401) {
        setSession({ authenticated: false });
        throw new Error('Wallet session expired. Connect Freighter again.');
      }
      if (!res.ok) throw new Error(data.error || 'Failed to register API.');
      setCreatedApi(data.api);
      setStatus('created');
    } catch (err) {
      setError(err.message || 'Failed to register API.');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif" }}>
      <AppNavbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 96px' }}>
        <header style={{ maxWidth: 760, marginBottom: 28 }}>
          <p style={{ ...MONO, color: C.cyan, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            API Registry
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.05, fontWeight: 800, margin: 0 }}>
            Register an API for pay-per-call access.
          </h1>
        </header>

        {sessionStatus === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.text2, padding: '24px 0' }}>
            <Loader2 size={18} className="spin" />
            Checking wallet session...
          </div>
        )}

        {sessionStatus !== 'loading' && !session.authenticated && (
          <WalletLoginPanel
            title="Connect wallet to register APIs"
            body="API ownership and payout wallet come from your Freighter session. Sign the PayGate challenge before creating a paid proxy."
            onConnected={setSession}
          />
        )}

        {sessionStatus !== 'loading' && session.authenticated && (
        <section className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20, alignItems: 'start' }}>
          <form onSubmit={handleSubmit} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'grid', gap: 16 }}>
            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>API Name</span>
              <input value={form.name} onChange={update('name')} style={inputStyle()} />
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Upstream Base URL</span>
              <input value={form.upstreamBaseUrl} onChange={update('upstreamBaseUrl')} placeholder="https://api.example.com" style={{ ...inputStyle(), ...MONO }} />
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>GET Path</span>
              <input value={form.path} onChange={update('path')} placeholder="/v1/data" style={{ ...inputStyle(), ...MONO }} />
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Price Per Call, USDC</span>
              <input value={form.priceUsdc} onChange={update('priceUsdc')} inputMode="decimal" style={{ ...inputStyle(), ...MONO }} />
            </label>

            {error && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.red, background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.18)', borderRadius: 8, padding: 14, fontSize: 14 }}>
                <AlertCircle size={17} style={{ flex: '0 0 auto', marginTop: 1 }} />
                {error}
              </div>
            )}

            <button type="submit" disabled={status === 'submitting'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: C.accent, color: C.text1, border: 'none', borderRadius: 8, padding: '12px 16px', fontWeight: 800, cursor: 'pointer' }}>
              {status === 'submitting' ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
              Register API
            </button>
          </form>

          <div style={{ display: 'grid', gap: 16 }}>
            {createdApi ? (
              <>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.green, fontWeight: 800, marginBottom: 14 }}>
                    <CheckCircle2 size={18} />
                    API Registered
                  </div>
                  <div style={{ display: 'grid', gap: 10, color: C.text2, fontSize: 14, minWidth: 0 }}>
                    <ValueRow label="Proxy URL" value={createdApi.proxyUrl} />
                    <ValueRow label="Secret" value={createdApi.secret} />
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                    <CopyButton value={createdApi.proxyUrl} label="Copy proxy" />
                    <CopyButton value={createdApi.secret} label="Copy secret" />
                    <Link to={`/apis/${createdApi.id}`} style={{ display: 'inline-flex', alignItems: 'center', color: C.cyan, textDecoration: 'none', fontWeight: 700 }}>
                      Open API Detail
                    </Link>
                  </div>
                </div>
                <CodeBlock code={setupSnippet(createdApi)} filename="upstream-api.js" maxHeight={360} />
              </>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, marginBottom: 10 }}>
                  <ShieldCheck size={18} color={C.green} />
                  Protected Upstream
                </div>
                <p style={{ color: C.text2, lineHeight: 1.7, margin: 0 }}>
                  PayGate will generate a proxy URL and a unique secret header for this API.
                </p>
              </div>
            )}
          </div>
        </section>
        )}
      </main>
    </div>
  );
}
