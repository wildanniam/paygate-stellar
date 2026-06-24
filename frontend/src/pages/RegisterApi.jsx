import { AlertCircle, Database, DollarSign, Link2, Loader2, Plus, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import ApiStatusBadge from '../components/ApiStatusBadge.jsx';
import UpstreamGuardGuide from '../components/UpstreamGuardGuide.jsx';
import WalletLoginPanel from '../components/WalletLoginPanel.jsx';
import { C } from '../colors.js';
import { readJsonResponse } from '../lib/walletAuth.js';
import Button from '../components/ui/Button.jsx';
import CopyField from '../components/ui/CopyField.jsx';
import { Field, Input } from '../components/ui/Field.jsx';
import Notice from '../components/ui/Notice.jsx';

const initialForm = {
  name: '',
  upstreamBaseUrl: '',
  path: '',
  priceUsdc: '',
};

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
          <section className="pg-create-flow">
            <form onSubmit={handleSubmit} className="pg-create-form">
              <div className="pg-create-form-header">
                <div>
                  <h2>Source API</h2>
                  <p>Use your own upstream API, or load demo values to try the full paid-call flow.</p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={fillDemoApi} icon={<Database size={15} aria-hidden="true" />}>
                  Fill demo API
                </Button>
              </div>

              <div className="pg-create-step-list" aria-label="Paid endpoint creation steps">
                <div><span>1</span> Paste upstream URL</div>
                <div><span>2</span> Set per-call price</div>
                <div><span>3</span> Generate proxy</div>
              </div>

              <Field label="Endpoint name" hint="A readable name for your dashboard.">
                <Input value={form.name} onChange={update('name')} placeholder="e.g. Market Signal API" required />
              </Field>

              <div className="pg-create-url-grid">
                <Field label="Upstream base URL" hint="Base URL only. Do not include the endpoint path here.">
                  <Input className="pg-mono-input" value={form.upstreamBaseUrl} onChange={update('upstreamBaseUrl')} placeholder="https://api.yourservice.com" required />
                </Field>

                <Field label="GET path" hint="The endpoint path PayGate should monetize.">
                  <Input className="pg-mono-input" value={form.path} onChange={update('path')} placeholder="/v1/data" required />
                </Field>
              </div>

              <Field label="Price per call, USDC" hint="Testnet USDC amount charged for each successful API call.">
                <Input className="pg-mono-input" value={form.priceUsdc} onChange={update('priceUsdc')} placeholder="0.01" inputMode="decimal" required />
              </Field>

              {error && (
                <Notice tone="danger" icon={<AlertCircle size={17} aria-hidden="true" />}>
                  {error}
                </Notice>
              )}

              <Button
                type="submit"
                disabled={status === 'submitting'}
                size="lg"
                icon={status === 'submitting' ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
              >
                Create paid endpoint
              </Button>
            </form>

            <aside className="pg-create-side">
              {createdApi ? (
                <>
                  <section className="pg-create-result">
                    <div className="pg-create-result-header">
                      <div>
                        <span className="pg-status-dot" data-tone="warning">Pending setup</span>
                        <h2>Paid endpoint created</h2>
                      </div>
                      <ApiStatusBadge status={createdApi.status} />
                    </div>
                    <p>
                      Add the secret guard to your upstream API, then open the endpoint control page and verify setup.
                    </p>
                    <CopyField label="Paid endpoint" value={createdApi.proxyUrl} tone="brand" copyLabel="Copy endpoint" />
                    <CopyField label="Upstream secret" value={createdApi.secret} copyLabel="Copy secret" />
                    <div className="pg-create-result-actions">
                      <Button as={Link} to={`/apis/${createdApi.id}`} variant="secondary" size="sm">
                        Open endpoint control
                      </Button>
                    </div>
                  </section>
                  <UpstreamGuardGuide api={createdApi} />
                </>
              ) : (
                <section className="pg-create-preview-card">
                  <div className="pg-create-preview-node">
                    <Link2 size={17} aria-hidden="true" />
                    <div>
                      <span>Your API today</span>
                      <strong>{form.upstreamBaseUrl || 'https://api.yourservice.com'}{form.path || '/v1/data'}</strong>
                    </div>
                  </div>
                  <div className="pg-create-preview-arrow">creates</div>
                  <div className="pg-create-preview-node is-paid">
                    <ShieldCheck size={17} aria-hidden="true" />
                    <div>
                      <span>PayGate endpoint</span>
                      <strong>https://paygate.app/api/pay/api_123</strong>
                    </div>
                  </div>
                  <div className="pg-create-preview-price">
                    <DollarSign size={17} aria-hidden="true" />
                    <span>{form.priceUsdc || '0.01'} USDC / successful call</span>
                  </div>
                  <p>
                    Buyers call the PayGate URL. PayGate verifies payment, forwards with your secret header, and records revenue.
                  </p>
                </section>
              )}
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
