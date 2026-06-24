import { AlertCircle, CheckCircle2, Loader2, Plus, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import ApiStatusBadge from '../components/ApiStatusBadge.jsx';
import CopyButton from '../components/CopyButton.jsx';
import UpstreamGuardGuide from '../components/UpstreamGuardGuide.jsx';
import ValueRow from '../components/ValueRow.jsx';
import WalletLoginPanel from '../components/WalletLoginPanel.jsx';
import { C, MONO } from '../colors.js';
import { readJsonResponse } from '../lib/walletAuth.js';

const initialForm = {
  name: '',
  upstreamBaseUrl: '',
  path: '',
  priceUsdc: '',
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

function helperStyle() {
  return {
    display: 'block',
    color: C.text3,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 1.5,
  };
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

  const fillDemoApi = () => {
    const origin = window.location.origin;
    setForm({
      name: 'Market Signal API',
      upstreamBaseUrl: origin,
      path: '/api/upstream/market-signal',
      priceUsdc: '0.01',
    });
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
    <div className="pg-app">
      <AppNavbar />
      <main className="pg-app-main">
        <header className="pg-app-header">
          <div>
            <p className="pg-app-eyebrow">
              Create paid endpoint
            </p>
            <h1>
              Paste your API URL. Charge per call.
            </h1>
            <p>
              PayGate creates a paid proxy endpoint, gives you an upstream secret, and tracks revenue from successful calls.
            </p>
          </div>
        </header>

        {sessionStatus === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.text2, padding: '24px 0' }}>
            <Loader2 size={18} className="spin" />
            Checking wallet session...
          </div>
        )}

        {sessionStatus !== 'loading' && !session.authenticated && (
          <WalletLoginPanel
            title="Connect wallet to create paid endpoints"
            body="API ownership and payout wallet come from your Freighter session. Sign the PayGate challenge before creating a paid proxy."
            onConnected={setSession}
          />
        )}

        {sessionStatus !== 'loading' && session.authenticated && (
        <section className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20, alignItems: 'start' }}>
          <form onSubmit={handleSubmit} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>API details</div>
                <p style={{ color: C.text2, lineHeight: 1.6, margin: 0, fontSize: 14 }}>
                  Use your own upstream API, or fill the hosted demo values to try the flow.
                </p>
              </div>
              <button type="button" onClick={fillDemoApi} style={{ background: 'transparent', color: C.cyan, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontWeight: 800 }}>
                Fill demo API
              </button>
            </div>

            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>API Name</span>
              <input value={form.name} onChange={update('name')} placeholder="e.g. Market Signal API" required style={inputStyle()} />
              <span style={helperStyle()}>A readable name for your dashboard.</span>
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Upstream Base URL</span>
              <input value={form.upstreamBaseUrl} onChange={update('upstreamBaseUrl')} placeholder="https://api.yourservice.com" required style={{ ...inputStyle(), ...MONO }} />
              <span style={helperStyle()}>Base URL only. Do not include the endpoint path here.</span>
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>GET Path</span>
              <input value={form.path} onChange={update('path')} placeholder="/v1/data" required style={{ ...inputStyle(), ...MONO }} />
              <span style={helperStyle()}>The GET endpoint path that PayGate should monetize.</span>
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Price Per Call, USDC</span>
              <input value={form.priceUsdc} onChange={update('priceUsdc')} placeholder="0.01" inputMode="decimal" required style={{ ...inputStyle(), ...MONO }} />
              <span style={helperStyle()}>Testnet USDC amount charged for each successful API call.</span>
            </label>

            {error && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.red, background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.18)', borderRadius: 8, padding: 14, fontSize: 14 }}>
                <AlertCircle size={17} style={{ flex: '0 0 auto', marginTop: 1 }} />
                {error}
              </div>
            )}

            <button type="submit" disabled={status === 'submitting'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: C.accent, color: C.text1, border: 'none', borderRadius: 8, padding: '12px 16px', fontWeight: 800, cursor: 'pointer' }}>
              {status === 'submitting' ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
              Create paid endpoint
            </button>
          </form>

          <div style={{ display: 'grid', gap: 16 }}>
            {createdApi ? (
              <>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.amber, fontWeight: 800 }}>
                    <CheckCircle2 size={18} />
                      Paid endpoint created
                    </div>
                    <ApiStatusBadge status={createdApi.status} />
                  </div>
                  <p style={{ color: C.text2, lineHeight: 1.6, margin: '0 0 14px', fontSize: 14 }}>
                    This proxy is created but not active yet. Add the secret guard to your upstream API, then open the API detail page and verify setup.
                  </p>
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
                <UpstreamGuardGuide api={createdApi} />
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
