import { AlertCircle, Archive, CheckCircle2, Loader2, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import ApiStatusBadge, { getApiStatusMeta } from '../components/ApiStatusBadge.jsx';
import CopyButton from '../components/CopyButton.jsx';
import UpstreamGuardGuide from '../components/UpstreamGuardGuide.jsx';
import ValueRow from '../components/ValueRow.jsx';
import WalletLoginPanel from '../components/WalletLoginPanel.jsx';
import Button from '../components/ui/Button.jsx';
import { C, MONO } from '../colors.js';
import { readJsonResponse } from '../lib/walletAuth.js';

export default function ApiDetail() {
  const { apiId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState({ authenticated: false });
  const [sessionStatus, setSessionStatus] = useState('loading');
  const [api, setApi] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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

  const verifySetup = async () => {
    if (!api) return;
    setStatus('verifying');
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/apis/${api.id}/verify`, {
        method: 'POST',
        credentials: 'include',
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
      setNotice('Setup verified. This API is now active for paid proxy calls.');
      setStatus('loaded');
    } catch (err) {
      setError(err.message || 'Failed to verify setup.');
      setStatus('error');
    }
  };

  const removeApi = async () => {
    if (!api) return;
    const confirmed = window.confirm(
      'Remove this API from PayGate? APIs with request/payment history will be archived instead of permanently deleted.',
    );
    if (!confirmed) return;

    setStatus('removing');
    setError('');
    setNotice('');

    try {
      const res = await fetch(`/api/apis/${api.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await readJsonResponse(res);
      if (res.status === 401) {
        setSession({ authenticated: false });
        setApi(null);
        setStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to remove API.');
      if (data.deleted) {
        navigate('/dashboard');
        return;
      }
      setApi((current) => ({ ...current, ...data.api }));
      setNotice('API archived. Its history is preserved, and the endpoint can be registered again for a fresh demo.');
      setStatus('loaded');
    } catch (err) {
      setError(err.message || 'Failed to remove API.');
      setStatus('error');
    }
  };

  const statusMeta = api ? getApiStatusMeta(api.status) : null;
  const isBusy = ['loading', 'saving', 'verifying', 'removing'].includes(status);

  return (
    <div className="pg-app">
      <AppNavbar />
      <main className="pg-app-main">
        <header className="pg-app-header">
          <div>
            <p className="pg-app-eyebrow">
              Endpoint control
            </p>
            <h1>
              {api?.name || 'Registered API'}
            </h1>
            <p>
              Inspect the paid proxy URL, upstream guard, setup status, and operating controls for this endpoint.
            </p>
          </div>
          <div className="pg-app-actions">
            <Button as={Link} to="/apis/new" size="sm" icon={<ShieldCheck size={15} aria-hidden="true" />}>
              Create paid endpoint
            </Button>
          </div>
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

        {notice && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.green, background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.18)', borderRadius: 8, padding: 14, fontSize: 14, marginBottom: 24 }}>
            <CheckCircle2 size={17} style={{ flex: '0 0 auto', marginTop: 1 }} />
            {notice}
          </div>
        )}

        {session.authenticated && api && (
          <section className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20, alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: statusMeta.color, fontWeight: 800, marginBottom: 7 }}>
                      <statusMeta.Icon size={18} />
                      {statusMeta.label}
                    </div>
                    <p style={{ color: C.text2, lineHeight: 1.6, margin: 0, fontSize: 14 }}>
                      {statusMeta.description}
                    </p>
                  </div>
                  <ApiStatusBadge status={api.status} />
                </div>
                <div style={{ display: 'grid', gap: 10, color: C.text2, fontSize: 14, minWidth: 0 }}>
                  <ValueRow label="Proxy URL" value={api.proxyUrl} />
                  <ValueRow label="Upstream" value={`${api.upstreamBaseUrl}${api.path}`} />
                  <div><strong style={{ color: C.text1 }}>Price:</strong> {api.priceUsdc} USDC per call</div>
                  <ValueRow label="Secret" value={api.secret} />
                </div>
                {api.status === 'pending_setup' && (
                  <div style={{ marginTop: 14, color: C.amber, background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.18)', borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.6 }}>
                    The proxy URL is not active yet. Add the secret guard to your upstream API, then verify setup here.
                  </div>
                )}
                {api.status === 'archived' && (
                  <div style={{ marginTop: 14, color: C.text2, background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.6 }}>
                    This API is archived, so its proxy no longer accepts paid calls. You can register the same endpoint again for a fresh demo.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                  <CopyButton value={api.proxyUrl} label="Copy proxy" />
                  <CopyButton value={api.secret} label="Copy secret" />
                  {api.status === 'pending_setup' && (
                    <button type="button" onClick={verifySetup} disabled={isBusy} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: C.text1, border: 'none', borderRadius: 8, padding: '10px 14px', cursor: isBusy ? 'not-allowed' : 'pointer', fontWeight: 800 }}>
                      {status === 'verifying' ? <Loader2 size={15} className="spin" /> : <ShieldCheck size={15} />}
                      Verify setup
                    </button>
                  )}
                  <button type="button" onClick={removeApi} disabled={isBusy} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: api.status === 'archived' ? C.text3 : C.red, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', cursor: isBusy ? 'not-allowed' : 'pointer' }}>
                    {status === 'removing' ? <Loader2 size={15} className="spin" /> : api.status === 'archived' ? <Archive size={15} /> : <Trash2 size={15} />}
                    {api.status === 'archived' ? 'Remove archived API' : 'Delete / Archive'}
                  </button>
                  <button type="button" onClick={loadApi} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: C.text2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <UpstreamGuardGuide api={api} />
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
              <Link to="/apis/new" style={{ color: C.cyan, textDecoration: 'none', fontWeight: 800 }}>Create paid endpoint</Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
