import { AlertCircle, CheckCircle2, Loader2, Power, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import CopyButton from '../components/CopyButton.jsx';
import ValueRow from '../components/ValueRow.jsx';
import WalletLoginPanel from '../components/WalletLoginPanel.jsx';
import { C, MONO } from '../colors.js';
import { readJsonResponse } from '../lib/walletAuth.js';

function setupSnippet(api) {
  return `const PAYGATE_SECRET = process.env.PAYGATE_SECRET;

app.get('${api.path}', (req, res) => {
  if (req.get('X-PayGate-Secret') !== PAYGATE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({ ok: true });
});`;
}

export default function ApiDetail() {
  const { apiId } = useParams();
  const [session, setSession] = useState({ authenticated: false });
  const [sessionStatus, setSessionStatus] = useState('loading');
  const [api, setApi] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const loadApi = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`/api/apis/${apiId}`, { credentials: 'include' });
      const data = await readJsonResponse(res);
      if (res.status === 401) {
        setSession({ authenticated: false });
        setApi(null);
        setStatus('idle');
        return;
      }
      if (res.status === 404) {
        setApi(null);
        setStatus('not-found');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to load API.');
      setApi(data.api);
      setStatus('loaded');
    } catch (err) {
      setError(err.message || 'Failed to load API.');
      setStatus('error');
    }
  }, [apiId]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setSessionStatus('loading');
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await readJsonResponse(res);
        if (!active) return;
        setSession(data);
        if (data.authenticated) await loadApi();
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
  }, [loadApi]);

  const toggleActive = async () => {
    if (!api) return;
    setStatus('saving');
    setError('');
    try {
      const res = await fetch(`/api/apis/${api.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !api.active }),
      });
      const data = await readJsonResponse(res);
      if (res.status === 401) {
        setSession({ authenticated: false });
        setApi(null);
        setStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to update API.');
      setApi((current) => ({ ...current, ...data.api }));
      setStatus('loaded');
    } catch (err) {
      setError(err.message || 'Failed to update API.');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif" }}>
      <AppNavbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 96px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <p style={{ ...MONO, color: C.cyan, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              API Detail
            </p>
            <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.05, fontWeight: 800, margin: 0 }}>
              {api?.name || 'Registered API'}
            </h1>
          </div>
          <Link to="/apis/new" style={{ color: C.cyan, textDecoration: 'none', fontWeight: 700 }}>Register another API</Link>
        </header>

        {(sessionStatus === 'loading' || status === 'loading') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.text2, padding: '28px 0' }}>
            <Loader2 size={18} className="spin" />
            Loading...
          </div>
        )}

        {sessionStatus !== 'loading' && !session.authenticated && (
          <WalletLoginPanel
            title="Connect wallet to view this API"
            body="API detail is scoped to the owner wallet. Connect Freighter and sign the challenge before PayGate shows proxy URLs, secrets, and active controls."
            onConnected={(nextSession) => {
              setSession(nextSession);
              loadApi();
            }}
          />
        )}

        {error && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.red, background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.18)', borderRadius: 8, padding: 14, fontSize: 14, marginBottom: 24 }}>
            <AlertCircle size={17} style={{ flex: '0 0 auto', marginTop: 1 }} />
            {error}
          </div>
        )}

        {session.authenticated && api && (
          <section className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20, alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: api.active ? C.green : C.amber, fontWeight: 800, marginBottom: 14 }}>
                  <CheckCircle2 size={18} />
                  {api.active ? 'Active' : 'Inactive'}
                </div>
                <div style={{ display: 'grid', gap: 10, color: C.text2, fontSize: 14, minWidth: 0 }}>
                  <ValueRow label="Proxy URL" value={api.proxyUrl} />
                  <ValueRow label="Upstream" value={`${api.upstreamBaseUrl}${api.path}`} />
                  <div><strong style={{ color: C.text1 }}>Price:</strong> {api.priceUsdc} USDC per call</div>
                  <ValueRow label="Secret" value={api.secret} />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                  <CopyButton value={api.proxyUrl} label="Copy proxy" />
                  <CopyButton value={api.secret} label="Copy secret" />
                  <button type="button" onClick={toggleActive} disabled={status === 'saving'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
                    <Power size={15} />
                    {api.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" onClick={loadApi} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <CodeBlock code={setupSnippet(api)} filename="upstream-api.js" maxHeight={420} />
          </section>
        )}

        {session.authenticated && status === 'not-found' && (
          <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.amber, fontWeight: 800, marginBottom: 10 }}>
              <AlertCircle size={18} style={{ flex: '0 0 auto', marginTop: 1 }} />
              API not found for this wallet
            </div>
            <p style={{ color: C.text2, lineHeight: 1.7, margin: 0, maxWidth: 680 }}>
              This API either does not exist or belongs to a different developer wallet. Connect the owner wallet or register a new API.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <Link to="/dashboard" style={{ color: C.cyan, textDecoration: 'none', fontWeight: 800 }}>Back to dashboard</Link>
              <Link to="/apis/new" style={{ color: C.cyan, textDecoration: 'none', fontWeight: 800 }}>Register API</Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
