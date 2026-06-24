import { signTransaction } from '@stellar/freighter-api';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Database,
  DollarSign,
  ExternalLink,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import ApiStatusBadge from '../components/ApiStatusBadge.jsx';
import CopyButton from '../components/CopyButton.jsx';
import Button from '../components/ui/Button.jsx';
import Metric from '../components/ui/Metric.jsx';
import { C, MONO } from '../colors.js';
import { connectFreighterWallet, readJsonResponse, TESTNET_PASSPHRASE } from '../lib/walletAuth.js';

function short(value, head = 7, tail = 5) {
  if (!value) return '-';
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatUsdc(value) {
  const number = Number(value || 0);
  return `${number.toFixed(4).replace(/\.?0+$/, '') || '0'} USDC`;
}

function statusColor(status) {
  if (status === 'forwarded' || status === 'succeeded') return C.green;
  if (status === 'credited' || status === 'payment_verified') return C.blue;
  if (status === 'challenge_sent' || status === 'pending') return C.amber;
  if (status?.includes('failed') || status === 'duplicate_payment') return C.red;
  return C.text2;
}

function SummaryCard({ icon: Icon, label, value, hint, tone = 'neutral' }) {
  return (
    <article className="pg-app-card pg-metric-card" data-tone={tone === 'warning' ? 'warning' : tone === 'success' ? 'success' : 'flat'}>
      <Metric
        label={label}
        value={value}
        delta={hint}
        tone={tone}
        icon={<Icon size={17} aria-hidden="true" />}
      />
    </article>
  );
}

function EmptyState({ title, body, action }) {
  return (
    <div className="pg-empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

function GhostDashboardPreview() {
  return (
    <section className="pg-dashboard-preview" aria-label="Dashboard preview">
      <div className="pg-dashboard-preview-header">
        <span className="pg-status-dot" data-tone="warning">Preview locked until wallet connect</span>
        <span>Paid endpoint workspace</span>
      </div>
      <div className="pg-dashboard-metrics">
        <SummaryCard icon={Database} label="APIs" value="2" hint="1 active · 1 setup" tone="brand" />
        <SummaryCard icon={Activity} label="Paid Calls" value="12.4k" hint="Live proxy traffic" tone="neutral" />
        <SummaryCard icon={DollarSign} label="Gross Revenue" value="$124.00" hint="USDC testnet" tone="success" />
        <SummaryCard icon={Wallet} label="Withdrawable" value="$84.20" hint="Escrow balance" tone="success" />
      </div>
      <div className="pg-dashboard-preview-table">
        <div>
          <strong>Market Signal API</strong>
          <span>https://paygate.app/api/pay/api_123</span>
        </div>
        <span className="pg-badge" data-tone="success">Active</span>
      </div>
    </section>
  );
}

function TxLink({ hash }) {
  if (!hash) return <span style={{ color: C.text3 }}>-</span>;
  return (
    <a
      href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.cyan, textDecoration: 'none', ...MONO, fontSize: 12 }}
    >
      {short(hash, 8, 0)}
      <ExternalLink size={13} />
    </a>
  );
}

export default function Dashboard() {
  const [session, setSession] = useState({ authenticated: false });
  const [authStatus, setAuthStatus] = useState('loading');
  const [authError, setAuthError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [dashboardStatus, setDashboardStatus] = useState('idle');
  const [dashboardError, setDashboardError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [withdrawStatus, setWithdrawStatus] = useState('idle');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawResult, setWithdrawResult] = useState(null);

  const loadDashboard = useCallback(async () => {
    setDashboardStatus((prev) => (prev === 'loaded' ? 'refreshing' : 'loading'));
    setDashboardError('');
    try {
      const res = await fetch('/api/dashboard/summary', { credentials: 'include' });
      const data = await readJsonResponse(res);
      if (res.status === 401) {
        setSession({ authenticated: false });
        setDashboard(null);
        setDashboardStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to load dashboard.');
      setDashboard(data);
      setLastUpdated(new Date());
      setDashboardStatus('loaded');
    } catch (err) {
      setDashboardError(err.message || 'Failed to load dashboard.');
      setDashboardStatus('error');
    }
  }, []);

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
        if (data.authenticated) loadDashboard();
      } catch {
        if (!active) return;
        setAuthStatus('idle');
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const handleConnectWallet = async () => {
    setAuthStatus('connecting');
    setAuthError('');

    try {
      const nextSession = await connectFreighterWallet();
      setSession(nextSession);
      setAuthStatus('idle');
      await loadDashboard();
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
      setDashboard(null);
      setDashboardStatus('idle');
      setAuthStatus('idle');
    }
  };

  const handleWithdraw = async () => {
    setWithdrawStatus('preparing');
    setWithdrawError('');
    setWithdrawResult(null);

    try {
      const prepareRes = await fetch('/api/withdraw/prepare', {
        method: 'POST',
        credentials: 'include',
      });
      const prepared = await readJsonResponse(prepareRes);
      if (prepareRes.status === 401) {
        setSession({ authenticated: false });
        setDashboard(null);
        setDashboardStatus('idle');
        throw new Error('Wallet session expired. Connect Freighter again.');
      }
      if (!prepareRes.ok) throw new Error(prepared.error || 'Failed to prepare withdrawal.');

      setWithdrawStatus('signing');
      const signed = await signTransaction(prepared.transactionXdr, {
        address: session.walletAddress,
        networkPassphrase: prepared.networkPassphrase || TESTNET_PASSPHRASE,
      });
      if (signed.error) throw new Error(signed.error.message || 'Withdrawal signature rejected.');

      const signedTransactionXdr = signed.signedTxXdr;
      if (!signedTransactionXdr) throw new Error('Freighter did not return a signed transaction.');

      setWithdrawStatus('submitting');
      const submitRes = await fetch('/api/withdraw/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedTransactionXdr }),
      });
      const submitted = await readJsonResponse(submitRes);
      if (submitRes.status === 401) {
        setSession({ authenticated: false });
        setDashboard(null);
        setDashboardStatus('idle');
        throw new Error('Wallet session expired. Connect Freighter again.');
      }
      if (!submitRes.ok) throw new Error(submitted.error || 'Failed to submit withdrawal.');

      setWithdrawResult(submitted);
      setWithdrawStatus('done');
      await loadDashboard();
    } catch (err) {
      setWithdrawError(err.message || 'Withdrawal failed.');
      setWithdrawStatus('error');
    }
  };

  const summary = dashboard?.summary;
  const escrowError = dashboard?.escrow?.error;
  const isLoading = dashboardStatus === 'loading' || authStatus === 'loading';
  const isRefreshing = dashboardStatus === 'refreshing';
  const isWithdrawing = ['preparing', 'signing', 'submitting'].includes(withdrawStatus);
  const withdrawableUsdc = Number(dashboard?.escrow?.developerBalance?.usdc || 0);
  const canWithdraw = session.authenticated && dashboard?.escrow?.configured && withdrawableUsdc > 0 && !escrowError && !isWithdrawing;

  const topApis = useMemo(() => {
    return [...(dashboard?.apis || [])].sort((a, b) => b.calls - a.calls).slice(0, 6);
  }, [dashboard]);
  const apiLifecycleCounts = useMemo(() => {
    const apis = dashboard?.apis || [];
    return {
      active: apis.filter((api) => api.status === 'active').length,
      pending: apis.filter((api) => api.status === 'pending_setup').length,
      archived: apis.filter((api) => api.status === 'archived').length,
    };
  }, [dashboard]);

  return (
    <div className="pg-app">
      <AppNavbar />
      <main className="pg-app-main">
        <header className="pg-dashboard-header">
          <div>
            <p className="pg-app-eyebrow">
              PayGate workspace
            </p>
            <h1>
              API revenue command center.
            </h1>
            <p>
              Monitor paid endpoints, call traffic, escrow settlement, and withdrawable revenue from one developer wallet.
            </p>
          </div>

          <div className="pg-app-actions">
            {session.authenticated && (
              <Button type="button" variant="secondary" onClick={loadDashboard} disabled={isRefreshing} icon={isRefreshing ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />}>
                Refresh
              </Button>
            )}
            <Button as={Link} to="/apis/new" icon={<Database size={16} aria-hidden="true" />}>
              Create paid endpoint
            </Button>
          </div>
        </header>

        <section className="pg-dashboard-wallet">
          <div>
            <div className="pg-dashboard-wallet-title">
              <ShieldCheck size={18} aria-hidden="true" />
              Developer Wallet
            </div>
            <div className="pg-dashboard-wallet-address">
              {session.authenticated ? short(session.walletAddress, 12, 8) : 'Connect Freighter to load your APIs and revenue.'}
            </div>
            {lastUpdated && <div className="pg-dashboard-wallet-meta">Updated {lastUpdated.toLocaleTimeString()}</div>}
            {authError && <div style={{ color: C.red, fontSize: 13, marginTop: 8 }}>{authError}</div>}
          </div>
          {session.authenticated ? (
            <Button type="button" variant="secondary" onClick={handleLogout} disabled={authStatus === 'loading'} icon={<LogOut size={15} aria-hidden="true" />}>
              Logout
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConnectWallet}
              disabled={authStatus === 'connecting' || authStatus === 'loading'}
              icon={authStatus === 'connecting' ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <Wallet size={16} aria-hidden="true" />}
            >
              Connect Freighter
            </Button>
          )}
        </section>

        {dashboard && (
          <section className="pg-dashboard-metrics" aria-label="Dashboard metrics">
            <SummaryCard icon={Database} label="APIs" value={`${summary.totalApis}`} hint={`${apiLifecycleCounts.active} active · ${apiLifecycleCounts.pending} setup · ${apiLifecycleCounts.archived} archived`} tone="brand" />
            <SummaryCard icon={Activity} label="Paid Calls" value={`${summary.successfulCalls}/${summary.totalCalls}`} hint={`${summary.failedCalls} failed`} tone="neutral" />
            <SummaryCard icon={DollarSign} label="Gross Revenue" value={formatUsdc(summary.grossRevenueUsdc)} hint={`Fee ${formatUsdc(summary.platformFeeUsdc)}`} tone="success" />
            <SummaryCard icon={Wallet} label="Withdrawable" value={formatUsdc(dashboard.escrow?.developerBalance?.usdc)} hint={dashboard.escrow?.configured ? 'From escrow contract' : 'Contract not configured'} tone="success" />
          </section>
        )}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.text2, padding: '28px 0' }}>
            <Loader2 size={18} className="spin" />
            Loading dashboard...
          </div>
        )}

        {!session.authenticated && authStatus !== 'loading' && (
          <GhostDashboardPreview />
        )}

        {dashboardStatus === 'error' && dashboardError && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.red, background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.18)', borderRadius: 8, padding: 14, fontSize: 14, marginBottom: 24 }}>
            <AlertCircle size={17} style={{ flex: '0 0 auto', marginTop: 1 }} />
            {dashboardError}
          </div>
        )}

        {dashboard && (
          <div style={{ display: 'grid', gap: 22 }}>
            {escrowError && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.amber, background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.18)', borderRadius: 8, padding: 14, fontSize: 14 }}>
                <AlertCircle size={17} style={{ flex: '0 0 auto', marginTop: 1 }} />
                {escrowError}
              </div>
            )}

            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Registered APIs</h2>
                  <div style={{ color: C.text3, fontSize: 13, marginTop: 5 }}>Proxy URLs and per-API revenue.</div>
                </div>
                <Link to="/apis/new" style={{ color: C.cyan, textDecoration: 'none', fontWeight: 800 }}>Create endpoint</Link>
              </div>

              {topApis.length === 0 ? (
                <EmptyState
                  title="No APIs registered yet"
                  body="Register the demo upstream API or your own secret-protected GET endpoint. PayGate will create a paid proxy URL for agent calls."
                  action={<Link to="/apis/new" style={{ color: C.cyan, fontWeight: 800, textDecoration: 'none' }}>Create your first paid endpoint</Link>}
                />
              ) : (
                <>
                  <div className="mobile-api-list" style={{ gap: 12, padding: 14 }}>
                    {topApis.map((api) => (
                      <div key={api.id} style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, display: 'grid', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ minWidth: 0 }}>
                            <Link to={`/apis/${api.id}`} style={{ color: C.text1, textDecoration: 'none', fontWeight: 800 }}>{api.name}</Link>
                            <div style={{ color: C.text3, fontSize: 12, marginTop: 5, ...MONO, overflowWrap: 'anywhere' }}>{api.method} {api.path}</div>
                          </div>
                          <ApiStatusBadge status={api.status} compact />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <div style={{ color: C.text3, fontSize: 11, ...MONO }}>Calls</div>
                            <div style={{ color: C.text2, fontWeight: 800, marginTop: 4 }}>{api.successfulCalls}/{api.calls}</div>
                          </div>
                          <div>
                            <div style={{ color: C.text3, fontSize: 11, ...MONO }}>Revenue</div>
                            <div style={{ color: C.green, fontWeight: 800, marginTop: 4 }}>{formatUsdc(api.grossRevenueUsdc)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{ color: C.text2, fontSize: 12, ...MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{short(api.proxyUrl, 28, 8)}</span>
                          <CopyButton value={api.proxyUrl} compact ariaLabel="Copy proxy URL" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="desktop-api-table" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
                      <thead>
                        <tr style={{ color: C.text3, fontSize: 12, ...MONO, textAlign: 'left' }}>
                          {['API', 'Proxy URL', 'Calls', 'Revenue', 'Status'].map((heading) => (
                            <th key={heading} style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {topApis.map((api) => (
                          <tr key={api.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: '15px 16px' }}>
                              <Link to={`/apis/${api.id}`} style={{ color: C.text1, textDecoration: 'none', fontWeight: 800 }}>{api.name}</Link>
                              <div style={{ color: C.text3, fontSize: 12, marginTop: 5, ...MONO }}>{api.method} {api.path}</div>
                            </td>
                            <td style={{ padding: '15px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: C.text2, fontSize: 12, ...MONO }}>{short(api.proxyUrl, 30, 12)}</span>
                                <CopyButton value={api.proxyUrl} compact ariaLabel="Copy proxy URL" />
                              </div>
                            </td>
                            <td style={{ padding: '15px 16px', color: C.text2 }}>{api.successfulCalls}/{api.calls}</td>
                            <td style={{ padding: '15px 16px', color: C.green, fontWeight: 800 }}>{formatUsdc(api.grossRevenueUsdc)}</td>
                            <td style={{ padding: '15px 16px' }}>
                              <ApiStatusBadge status={api.status} compact />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2" style={{ gap: 22, alignItems: 'start' }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}` }}>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Payment History</h2>
                  <div style={{ color: C.text3, fontSize: 13, marginTop: 5 }}>Verified payment and credit transactions.</div>
                </div>
                {dashboard.payments.length === 0 ? (
                  <EmptyState title="No payments yet" body="Run the agent/client against a paid proxy. Verified payments will appear here with Stellar Expert links." />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                      <thead>
                        <tr style={{ color: C.text3, fontSize: 12, ...MONO, textAlign: 'left' }}>
                          {['Time', 'API', 'Gross', 'Payment Tx', 'Credit Tx'].map((heading) => (
                            <th key={heading} style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.payments.slice(0, 8).map((payment) => (
                          <tr key={payment.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: '15px 16px', color: C.text2 }}>{formatDate(payment.createdAt)}</td>
                            <td style={{ padding: '15px 16px', color: C.text1, fontWeight: 700 }}>{payment.apiName}</td>
                            <td style={{ padding: '15px 16px', color: C.green, fontWeight: 800 }}>{formatUsdc(payment.grossAmountUsdc)}</td>
                            <td style={{ padding: '15px 16px' }}><TxLink hash={payment.txHash} /></td>
                            <td style={{ padding: '15px 16px' }}><TxLink hash={payment.creditTxHash} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}` }}>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Request Log</h2>
                  <div style={{ color: C.text3, fontSize: 13, marginTop: 5 }}>Recent proxy request states.</div>
                </div>
                {dashboard.requests.length === 0 ? (
                  <EmptyState title="No requests yet" body="Unpaid challenges and paid forwards will be logged after an agent calls a proxy URL." />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                      <thead>
                        <tr style={{ color: C.text3, fontSize: 12, ...MONO, textAlign: 'left' }}>
                          {['Time', 'API', 'Status', 'Upstream', 'Tx'].map((heading) => (
                            <th key={heading} style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.requests.slice(0, 8).map((request) => (
                          <tr key={request.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: '15px 16px', color: C.text2 }}>{formatDate(request.createdAt)}</td>
                            <td style={{ padding: '15px 16px', color: C.text1, fontWeight: 700 }}>{request.apiName}</td>
                            <td style={{ padding: '15px 16px', color: statusColor(request.status), fontWeight: 800 }}>{request.status}</td>
                            <td style={{ padding: '15px 16px', color: C.text2 }}>{request.upstreamStatus || '-'}</td>
                            <td style={{ padding: '15px 16px' }}><TxLink hash={request.txHash} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: C.text3, fontSize: 12, ...MONO }}>Escrow Contract</div>
                <div style={{ color: C.text1, fontWeight: 800, marginTop: 8 }}>{dashboard.escrow?.configured ? 'Connected' : 'Not configured'}</div>
              </div>
              <div>
                <div style={{ color: C.text3, fontSize: 12, ...MONO }}>Developer Balance</div>
                <div style={{ color: C.green, fontWeight: 800, marginTop: 8 }}>{formatUsdc(dashboard.escrow?.developerBalance?.usdc)}</div>
              </div>
              <div>
                <div style={{ color: C.text3, fontSize: 12, ...MONO }}>PayGate Fee Balance</div>
                <div style={{ color: C.amber, fontWeight: 800, marginTop: 8 }}>{formatUsdc(dashboard.escrow?.platformFeeBalance?.usdc)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={!canWithdraw}
                  variant={canWithdraw ? 'primary' : 'secondary'}
                  icon={isWithdrawing ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <Wallet size={15} aria-hidden="true" />}
                >
                  {withdrawStatus === 'signing' ? 'Sign in Freighter' : withdrawStatus === 'submitting' ? 'Submitting' : 'Withdraw'}
                </Button>
                <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.cyan, textDecoration: 'none', fontWeight: 800 }}>
                  Open Explorer
                  <ArrowUpRight size={16} />
                </a>
              </div>
              {(withdrawError || withdrawResult) && (
                <div style={{ flexBasis: '100%', color: withdrawError ? C.red : C.green, fontSize: 13, ...MONO }}>
                  {withdrawError || `Withdrawal submitted: ${short(withdrawResult.txHash, 10, 8)}`}
                </div>
              )}
            </section>

            <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}` }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>Withdrawal History</h2>
                <div style={{ color: C.text3, fontSize: 13, marginTop: 5 }}>Developer payout contract invocations.</div>
              </div>
              {(dashboard.withdrawals || []).length === 0 ? (
                <EmptyState title="No withdrawals yet" body="Withdrawable balance will move to the connected developer wallet after a Freighter-signed withdrawal." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                    <thead>
                      <tr style={{ color: C.text3, fontSize: 12, ...MONO, textAlign: 'left' }}>
                        {['Time', 'Amount', 'Status', 'Tx'].map((heading) => (
                          <th key={heading} style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.withdrawals.slice(0, 8).map((withdrawal) => (
                        <tr key={withdrawal.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '15px 16px', color: C.text2 }}>{formatDate(withdrawal.createdAt)}</td>
                          <td style={{ padding: '15px 16px', color: C.green, fontWeight: 800 }}>{formatUsdc(withdrawal.amountUsdc)}</td>
                          <td style={{ padding: '15px 16px', color: statusColor(withdrawal.status), fontWeight: 800 }}>{withdrawal.status}</td>
                          <td style={{ padding: '15px 16px' }}><TxLink hash={withdrawal.txHash} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
