import { AlertCircle, Archive, CheckCircle2, Loader2, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import ApiStatusBadge, { getApiStatusMeta } from '../components/ApiStatusBadge.jsx';
import UpstreamGuardGuide from '../components/UpstreamGuardGuide.jsx';
import WalletLoginPanel from '../components/WalletLoginPanel.jsx';
import Button from '../components/ui/Button.jsx';
import CopyField from '../components/ui/CopyField.jsx';
import Notice from '../components/ui/Notice.jsx';
import { C } from '../colors.js';
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
          <Notice tone="danger" className="pg-detail-notice" icon={<AlertCircle size={17} aria-hidden="true" />}>
            {error}
          </Notice>
        )}

        {notice && (
          <Notice tone="success" className="pg-detail-notice" icon={<CheckCircle2 size={17} aria-hidden="true" />}>
            {notice}
          </Notice>
        )}

        {session.authenticated && api && (
          <section className="pg-detail-layout">
            <div className="pg-detail-main">
              <section className="pg-detail-control" data-status={api.status}>
                <div className="pg-detail-status-row">
                  <div>
                    <div className="pg-detail-status-label" style={{ color: statusMeta.color }}>
                      <statusMeta.Icon size={18} aria-hidden="true" />
                      {statusMeta.label}
                    </div>
                    <p>{statusMeta.description}</p>
                  </div>
                  <ApiStatusBadge status={api.status} />
                </div>

                <div className="pg-detail-copy-grid">
                  <CopyField label="Paid endpoint" value={api.proxyUrl} tone="brand" copyLabel="Copy proxy" />
                  <CopyField label="Upstream target" value={`${api.upstreamBaseUrl}${api.path}`} copyLabel="Copy upstream" />
                  <CopyField label="Upstream secret" value={api.secret} copyLabel="Copy secret" />
                  <div className="pg-detail-price">
                    <span>Price per call</span>
                    <strong>{api.priceUsdc} USDC</strong>
                  </div>
                </div>

                {api.status === 'pending_setup' && (
                  <Notice tone="warning" icon={<AlertCircle size={17} aria-hidden="true" />}>
                    The proxy URL is not active yet. Add the secret guard to your upstream API, then verify setup here.
                  </Notice>
                )}
                {api.status === 'archived' && (
                  <Notice icon={<Archive size={17} aria-hidden="true" />}>
                    This API is archived, so its proxy no longer accepts paid calls. You can create a fresh paid endpoint for the same upstream API.
                  </Notice>
                )}

                <div className="pg-detail-actions">
                  {api.status === 'pending_setup' && (
                    <Button
                      type="button"
                      onClick={verifySetup}
                      disabled={isBusy}
                      icon={status === 'verifying' ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <ShieldCheck size={15} aria-hidden="true" />}
                    >
                      Verify setup
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={loadApi}
                    disabled={isBusy}
                    icon={<RefreshCw size={15} aria-hidden="true" />}
                  >
                    Refresh
                  </Button>
                </div>
              </section>

              <section className="pg-detail-danger">
                <div>
                  <h2>{api.status === 'archived' ? 'Remove archived endpoint' : 'Archive endpoint'}</h2>
                  <p>
                    APIs with request or payment history are archived to preserve audit records.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  onClick={removeApi}
                  disabled={isBusy}
                  icon={status === 'removing' ? <Loader2 size={15} className="spin" aria-hidden="true" /> : api.status === 'archived' ? <Archive size={15} aria-hidden="true" /> : <Trash2 size={15} aria-hidden="true" />}
                >
                  {api.status === 'archived' ? 'Remove archived API' : 'Delete / Archive'}
                </Button>
              </section>
            </div>

            <aside className="pg-detail-guide">
              <UpstreamGuardGuide api={api} />
            </aside>
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
