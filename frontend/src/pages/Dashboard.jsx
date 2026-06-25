import { signTransaction } from '@stellar/freighter-api';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Code2,
  Database,
  DollarSign,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Upload,
  Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import ApiStatusBadge from '../components/ApiStatusBadge.jsx';
import CopyButton from '../components/CopyButton.jsx';
import Button from '../components/ui/Button.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Notice from '../components/ui/Notice.jsx';
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

function formatRangeLabel(referenceDate = new Date()) {
  const end = referenceDate;
  const start = new Date(end);
  start.setDate(start.getDate() - 30);

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const yearFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
  });

  return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}, ${yearFormatter.format(end)}`;
}

function formatUsdc(value) {
  const number = Number(value || 0);
  return `${number.toFixed(4).replace(/\.?0+$/, '') || '0'} USDC`;
}

function formatCompactUsdc(value) {
  const number = Number(value || 0);
  return `${number.toFixed(3).replace(/\.?0+$/, '') || '0'} USDC`;
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatCompactNumber(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${number}`;
}

function requestTone(status) {
  if (status === 'forwarded' || status === 'succeeded') return 'success';
  if (status === 'credited' || status === 'payment_verified') return 'blue';
  if (status === 'challenge_sent' || status === 'pending') return 'warning';
  if (status?.includes('failed') || status === 'duplicate_payment') return 'danger';
  return 'muted';
}

function resultTone(status, upstreamStatus) {
  if (status === 'challenge_sent') return 'danger';
  if (status?.includes('failed') || status === 'duplicate_payment') return 'danger';
  if (Number(upstreamStatus) >= 200 && Number(upstreamStatus) < 300) return 'success';
  if (status === 'forwarded') return 'success';
  return 'muted';
}

function activityMeta(request, payment) {
  if (request.status === 'challenge_sent') {
    return {
      event: '402 required',
      eventTone: 'warning',
      result: 'blocked',
      resultTone: 'danger',
      revenue: '$0.000',
      revenueTone: 'muted',
    };
  }

  if (request.status === 'forwarded') {
    const upstream = request.upstreamStatus ? `${request.upstreamStatus} OK` : '200 OK';
    return {
      event: payment ? 'MPP verified' : 'forwarded',
      eventTone: payment ? 'purple' : 'blue',
      result: upstream,
      resultTone: resultTone(request.status, request.upstreamStatus),
      revenue: payment ? `+${formatCompactUsdc(payment.developerAmountUsdc ?? payment.grossAmountUsdc)}` : '$0.000',
      revenueTone: payment ? 'positive' : 'muted',
    };
  }

  if (request.status === 'payment_failed' || request.status === 'duplicate_payment') {
    return {
      event: request.status.replace(/_/g, ' '),
      eventTone: 'danger',
      result: 'failed',
      resultTone: 'danger',
      revenue: '$0.000',
      revenueTone: 'muted',
    };
  }

  return {
    event: request.status?.replace(/_/g, ' ') || 'request',
    eventTone: requestTone(request.status),
    result: request.upstreamStatus || '-',
    resultTone: resultTone(request.status, request.upstreamStatus),
    revenue: payment ? `+${formatCompactUsdc(payment.developerAmountUsdc ?? payment.grossAmountUsdc)}` : '$0.000',
    revenueTone: payment ? 'positive' : 'muted',
  };
}

function buildActivityRows(requests = [], payments = []) {
  const paymentByRequestId = new Map(payments.filter((payment) => payment.requestId).map((payment) => [payment.requestId, payment]));
  const paymentByPaymentId = new Map(payments.filter((payment) => payment.paymentId).map((payment) => [payment.paymentId, payment]));
  const requestIds = new Set(requests.map((request) => request.id));

  const requestRows = requests.map((request) => {
    const payment = paymentByRequestId.get(request.id) || paymentByPaymentId.get(request.paymentId);
    const meta = activityMeta(request, payment);

    return {
      id: request.id,
      requestId: request.id,
      apiName: request.apiName,
      createdAt: request.forwardedAt || request.paidAt || request.createdAt,
      txHash: request.txHash || payment?.txHash,
      ...meta,
    };
  });

  const orphanPaymentRows = payments
    .filter((payment) => payment.requestId && !requestIds.has(payment.requestId))
    .map((payment) => ({
      id: `payment-${payment.id}`,
      requestId: payment.requestId,
      apiName: payment.apiName,
      createdAt: payment.creditedAt || payment.verifiedAt || payment.createdAt,
      txHash: payment.creditTxHash || payment.txHash,
      event: 'MPP verified',
      eventTone: 'purple',
      result: 'credited',
      resultTone: 'success',
      revenue: `+${formatCompactUsdc(payment.developerAmountUsdc ?? payment.grossAmountUsdc)}`,
      revenueTone: 'positive',
    }));

  return [...requestRows, ...orphanPaymentRows]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);
}

function EmptyState({ title, body, action }) {
  return (
    <div className="pg-empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {action && <div className="pg-empty-state-action">{action}</div>}
    </div>
  );
}

function TxLink({ hash }) {
  if (!hash) return <span className="pg-muted-token">-</span>;
  return (
    <a
      href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="pg-tx-link"
    >
      {short(hash, 8, 8)}
      <ExternalLink size={13} />
    </a>
  );
}

function StatusText({ status }) {
  return (
    <span className="pg-dashboard-status-text" data-tone={requestTone(status)}>
      {status || '-'}
    </span>
  );
}

function WorkspaceBadge({ children, tone = 'muted' }) {
  return (
    <span className={`pg-workspace-badge is-${tone}`}>
      {children}
    </span>
  );
}

const WORKSPACE_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { id: 'endpoints', label: 'Endpoints', to: '/dashboard/endpoints', icon: Code2 },
  { id: 'activity', label: 'Activity', to: '/dashboard/activity', icon: Activity },
  { id: 'payouts', label: 'Payouts', to: '/dashboard/payouts', icon: Upload },
];

function getWorkspaceView(pathname) {
  if (pathname.includes('/dashboard/endpoints')) return 'endpoints';
  if (pathname.includes('/dashboard/activity')) return 'activity';
  if (pathname.includes('/dashboard/payouts')) return 'payouts';
  return 'overview';
}

function WorkspaceMetric({ icon: Icon, label, value, delta, tone = 'neutral' }) {
  return (
    <article className="pg-workspace-metric" data-tone={tone}>
      <div className="pg-workspace-metric-top">
        <span>{label}</span>
        <i aria-hidden="true"><Icon size={18} /></i>
      </div>
      <strong>{value}</strong>
      {delta && <small>{delta}</small>}
    </article>
  );
}

function WorkspaceSidebar({ session, lastUpdated, authStatus, onConnectWallet, onLogout }) {
  const isConnecting = authStatus === 'connecting' || authStatus === 'loading';

  return (
    <aside className="pg-workspace-sidebar" aria-label="Dashboard navigation">
      <div className="pg-workspace-brand">
        <img src="/brand/paygate-mark.svg" alt="" />
        <strong>PayGate</strong>
      </div>

      <nav className="pg-workspace-nav" aria-label="Dashboard sections">
        {WORKSPACE_NAV_ITEMS.map(({ id, label, to, icon: Icon }) => (
          <NavLink
            key={id}
            to={to}
            end={id === 'overview'}
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            <Icon size={21} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pg-workspace-live-card">
        <div>
          <span><i aria-hidden="true" /> {session.authenticated ? 'Live' : 'Wallet required'}</span>
          <small>{session.authenticated ? short(session.walletAddress, 9, 6) : 'Connect Freighter'}</small>
          {lastUpdated && <small>Updated {lastUpdated.toLocaleTimeString()}</small>}
        </div>
        {session.authenticated ? (
          <button type="button" onClick={onLogout} aria-label="Log out wallet">
            <LogOut size={16} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" onClick={onConnectWallet} disabled={isConnecting} aria-label="Connect wallet">
            {isConnecting ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
          </button>
        )}
      </div>
    </aside>
  );
}

function ApiMobileCard({ api }) {
  return (
    <article className="pg-workspace-mobile-card">
      <div className="pg-workspace-mobile-card-top">
        <div>
          <Link to={`/apis/${api.id}`}>{api.name}</Link>
          <span>{api.method} {api.path}</span>
        </div>
        <ApiStatusBadge status={api.status} compact />
      </div>
      <div className="pg-workspace-mobile-card-grid">
        <span>Price <strong>${api.priceUsdc}/call</strong></span>
        <span>Calls <strong>{formatCompactNumber(api.successfulCalls)}</strong></span>
        <span>Revenue <strong>{formatMoney(api.grossRevenueUsdc)}</strong></span>
      </div>
      <div className="pg-workspace-url-row">
        <span>{short(api.proxyUrl, 30, 8)}</span>
        <CopyButton value={api.proxyUrl} compact ariaLabel="Copy proxy URL" />
      </div>
    </article>
  );
}

function ActivityMobileCard({ row }) {
  return (
    <article className="pg-workspace-mobile-card">
      <div className="pg-workspace-mobile-card-top">
        <div>
          <span>{formatDate(row.createdAt)}</span>
          <strong>{row.apiName}</strong>
        </div>
        <WorkspaceBadge tone={row.eventTone}>{row.event}</WorkspaceBadge>
      </div>
      <div className="pg-workspace-mobile-card-grid">
        <span>Request <strong>{short(row.requestId, 10, 4)}</strong></span>
        <span>Result <strong><WorkspaceBadge tone={row.resultTone}>{row.result}</WorkspaceBadge></strong></span>
        <span>Revenue <strong className={row.revenueTone === 'positive' ? 'is-positive' : undefined}>{row.revenue}</strong></span>
      </div>
      <div className="pg-workspace-url-row">
        <span>Transaction</span>
        <TxLink hash={row.txHash} />
      </div>
    </article>
  );
}

function LoggedOutWorkspace({ authStatus, authError, onConnectWallet }) {
  const isConnecting = authStatus === 'connecting' || authStatus === 'loading';

  return (
    <div className="pg-workspace-logged-out">
      <section className="pg-workspace-connect-card">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <h2>Connect Freighter to open your revenue workspace.</h2>
          <p>PayGate scopes APIs, payments, request logs, escrow balance, and withdrawals to your developer wallet.</p>
          {authError && <div className="pg-inline-error">{authError}</div>}
        </div>
        <Button
          type="button"
          onClick={onConnectWallet}
          disabled={isConnecting}
          icon={isConnecting ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <Wallet size={16} aria-hidden="true" />}
        >
          Connect Freighter
        </Button>
      </section>

      <section className="pg-workspace-metrics is-preview" aria-label="Dashboard preview metrics">
        <WorkspaceMetric icon={Database} label="APIs" value="2" delta="1 active · 1 setup" tone="brand" />
        <WorkspaceMetric icon={Activity} label="Paid calls" value="12.4k" delta="Live proxy traffic" />
        <WorkspaceMetric icon={DollarSign} label="Gross revenue" value="$124.00" delta="USDC testnet" tone="success" />
        <WorkspaceMetric icon={Wallet} label="Withdrawable" value="$84.20" delta="Escrow balance" tone="success" />
      </section>

      <section className="pg-workspace-panels pg-workspace-preview-panels" aria-label="Dashboard preview panels">
        <article className="pg-workspace-panel">
          <div className="pg-workspace-panel-head">
            <div>
              <h2>API registry</h2>
              <p>Preview of paid endpoints after wallet connect.</p>
            </div>
          </div>
          <div className="pg-workspace-table is-registry">
            <div className="pg-workspace-table-head" aria-hidden="true">
              <span>API</span>
              <span>Status</span>
              <span>Price per call</span>
              <span>Calls</span>
              <span>Revenue</span>
            </div>
            <div className="pg-workspace-table-row">
              <div className="pg-workspace-api-cell">
                <span className="pg-workspace-preview-api"><Database size={17} aria-hidden="true" /> Weather signal</span>
                <span>https://paygate.app/api/pay/api_123</span>
              </div>
              <WorkspaceBadge tone="success">active</WorkspaceBadge>
              <span>$0.009/call</span>
              <span>8.2k</span>
              <strong>$73.80</strong>
            </div>
          </div>
        </article>

        <article className="pg-workspace-panel">
          <div className="pg-workspace-panel-head">
            <div>
              <h2>Activity ledger</h2>
              <p>Requests, payment checks, and revenue in one stream.</p>
            </div>
          </div>
          <div className="pg-workspace-table is-ledger">
            <div className="pg-workspace-table-head" aria-hidden="true">
              <span>Request ID</span>
              <span>Event</span>
              <span>Result</span>
              <span>Revenue</span>
            </div>
            <div className="pg-workspace-table-row">
              <span className="pg-workspace-request-cell">
                <span className="pg-workspace-mono">req_01HZ8XQ4</span>
                <small>Weather signal</small>
              </span>
              <WorkspaceBadge tone="purple">MPP verified</WorkspaceBadge>
              <WorkspaceBadge tone="success">200 OK</WorkspaceBadge>
              <strong className="is-positive">+0.009 USDC</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="pg-workspace-withdraw pg-workspace-preview-withdraw" aria-label="Dashboard preview withdrawal">
        <span className="pg-workspace-withdraw-icon"><ShieldCheck size={27} aria-hidden="true" /></span>
        <div>
          <small>Escrow balance</small>
          <strong>$84.20 USDC</strong>
          <span>Preview balance</span>
        </div>
        <i aria-hidden="true" />
        <div>
          <small>Ready to withdraw</small>
          <strong>$84.20 USDC</strong>
          <span>Connect wallet to manage payouts</span>
        </div>
        <div className="pg-workspace-withdraw-actions">
          <Button type="button" variant="secondary" disabled icon={<Wallet size={15} aria-hidden="true" />}>
            Withdraw
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const currentView = getWorkspaceView(location.pathname);
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
  const rangeLabel = useMemo(() => formatRangeLabel(lastUpdated || new Date()), [lastUpdated]);

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

  const activityRows = useMemo(() => buildActivityRows(dashboard?.requests, dashboard?.payments), [dashboard]);

  return (
    <div className="pg-app">
      <AppNavbar />
      <main className="pg-app-main pg-workspace-page">
        <section className="pg-workspace-shell" aria-label="PayGate API revenue workspace">
          <WorkspaceSidebar
            session={session}
            lastUpdated={lastUpdated}
            authStatus={authStatus}
            onConnectWallet={handleConnectWallet}
            onLogout={handleLogout}
          />

          <div className="pg-workspace-main" id="dashboard-overview" data-view={currentView}>
            <header className="pg-workspace-topbar">
              <div>
                <p>PayGate workspace</p>
                <h1>API revenue</h1>
              </div>

              <div className="pg-workspace-controls">
                <span className="pg-workspace-date"><CalendarDays size={17} aria-hidden="true" /> {rangeLabel}</span>
                <span className="pg-workspace-range" aria-label="Dashboard range">
                  <button type="button">7D</button>
                  <button type="button" className="is-selected">30D</button>
                  <button type="button">90D</button>
                </span>
                {session.authenticated && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={loadDashboard}
                    disabled={isRefreshing}
                    icon={isRefreshing ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />}
                    className="pg-workspace-refresh"
                  >
                    Refresh
                  </Button>
                )}
                <Button as={Link} to="/apis/new" size="sm" icon={<Plus size={16} aria-hidden="true" />} className="pg-workspace-create">
                  Create paid endpoint
                </Button>
              </div>
            </header>

            {dashboardStatus === 'error' && dashboardError && (
              <Notice tone="danger" className="pg-dashboard-notice" icon={<AlertCircle size={17} aria-hidden="true" />}>
                {dashboardError}
              </Notice>
            )}

            {escrowError && (
              <Notice tone="warning" className="pg-dashboard-notice" icon={<AlertCircle size={17} aria-hidden="true" />}>
                {escrowError}
              </Notice>
            )}

            {!session.authenticated && authStatus !== 'loading' && (
              <LoggedOutWorkspace authStatus={authStatus} authError={authError} onConnectWallet={handleConnectWallet} />
            )}

            {isLoading && !dashboard && (
              <div className="pg-loading-row pg-workspace-loading">
                <Loader2 size={18} className="spin" />
                Loading dashboard workspace...
              </div>
            )}

            {dashboard && (
              <>
                <section className="pg-workspace-metrics" aria-label="Dashboard metrics">
                  <WorkspaceMetric icon={Database} label="APIs" value={`${summary.totalApis}`} delta={`${apiLifecycleCounts.active} active · ${apiLifecycleCounts.pending} setup · ${apiLifecycleCounts.archived} archived`} tone="brand" />
                  <WorkspaceMetric icon={Activity} label="Paid calls" value={formatCompactNumber(summary.successfulCalls)} delta={`${formatCompactNumber(summary.totalCalls)} total · ${summary.failedCalls} failed`} />
                  <WorkspaceMetric icon={DollarSign} label="Gross revenue" value={formatUsdc(summary.grossRevenueUsdc)} delta={`Fee ${formatUsdc(summary.platformFeeUsdc)}`} tone="success" />
                  <WorkspaceMetric icon={Wallet} label="Withdrawable" value={formatUsdc(dashboard.escrow?.developerBalance?.usdc)} delta={dashboard.escrow?.configured ? 'From escrow contract' : 'Contract not configured'} tone="success" />
                </section>

                <section className="pg-workspace-panels">
                  <article className="pg-workspace-panel" id="api-registry">
                    <div className="pg-workspace-panel-head">
                      <div>
                        <h2>API registry</h2>
                        <p>Paid endpoints, setup states, calls, and revenue.</p>
                      </div>
                      <Link to="/apis/new" className="pg-workspace-panel-link">Add API <ArrowRight size={15} aria-hidden="true" /></Link>
                    </div>

                    {topApis.length === 0 ? (
                      <EmptyState
                        title="No paid endpoints yet"
                        body="Create a paid endpoint from the demo upstream API or your own secret-protected GET endpoint."
                        action={<Link to="/apis/new" className="pg-inline-link">Create your first paid endpoint</Link>}
                      />
                    ) : (
                      <>
                        <div className="pg-workspace-mobile-list">
                          {topApis.map((api) => <ApiMobileCard key={api.id} api={api} />)}
                        </div>
                        <div className="pg-workspace-table is-registry">
                          <div className="pg-workspace-table-head" aria-hidden="true">
                            <span>API</span>
                            <span>Status</span>
                            <span>Price per call</span>
                            <span>Calls</span>
                            <span>Revenue</span>
                          </div>
                          {topApis.map((api) => (
                            <div key={api.id} className="pg-workspace-table-row">
                              <div className="pg-workspace-api-cell">
                                <Link to={`/apis/${api.id}`}><Database size={17} aria-hidden="true" /> {api.name}</Link>
                                <span>
                                  {short(api.proxyUrl, 24, 8)}
                                  <CopyButton value={api.proxyUrl} compact ariaLabel="Copy proxy URL" />
                                </span>
                              </div>
                              <ApiStatusBadge status={api.status} compact />
                              <span>${api.priceUsdc}</span>
                              <span>{formatCompactNumber(api.successfulCalls)}</span>
                              <strong>{formatMoney(api.grossRevenueUsdc)}</strong>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </article>

                  <article className="pg-workspace-panel" id="activity-ledger">
                    <div className="pg-workspace-panel-head">
                      <div>
                        <h2>Activity ledger</h2>
                        <p>Request, payment, upstream result, and revenue in one timeline.</p>
                      </div>
                      <button type="button">View all</button>
                    </div>

                    {activityRows.length === 0 ? (
                      <EmptyState title="No activity yet" body="Unpaid challenges, verified payments, and forwarded requests will appear here after a proxy call." />
                    ) : (
                      <>
                        <div className="pg-workspace-mobile-list">
                          {activityRows.map((row) => <ActivityMobileCard key={row.id} row={row} />)}
                        </div>
                        <div className="pg-workspace-table is-ledger">
                          <div className="pg-workspace-table-head" aria-hidden="true">
                            <span>Request ID</span>
                            <span>Event</span>
                            <span>Result</span>
                            <span>Revenue</span>
                          </div>
                          {activityRows.map((row) => (
                            <div key={row.id} className="pg-workspace-table-row">
                              <span className="pg-workspace-request-cell">
                                <span className="pg-workspace-mono">{short(row.requestId, 10, 4)}</span>
                                <small>{row.apiName}</small>
                              </span>
                              <WorkspaceBadge tone={row.eventTone}>{row.event}</WorkspaceBadge>
                              <WorkspaceBadge tone={row.resultTone}>{row.result}</WorkspaceBadge>
                              <strong className={row.revenueTone === 'positive' ? 'is-positive' : undefined}>{row.revenue}</strong>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </article>
                </section>

                <section className="pg-workspace-withdraw" id="withdrawals">
                  <span className="pg-workspace-withdraw-icon"><ShieldCheck size={27} aria-hidden="true" /></span>
                  <div>
                    <small>Escrow balance</small>
                    <strong>{formatUsdc(dashboard.escrow?.developerBalance?.usdc)}</strong>
                    <span>{dashboard.escrow?.configured ? 'Connected contract' : 'Contract not configured'}</span>
                  </div>
                  <i aria-hidden="true" />
                  <div>
                    <small>Ready to withdraw</small>
                    <strong>{formatUsdc(dashboard.escrow?.developerBalance?.usdc)}</strong>
                    <span>PayGate fee balance {formatUsdc(dashboard.escrow?.platformFeeBalance?.usdc)}</span>
                  </div>
                  <div className="pg-workspace-withdraw-actions">
                    <Button
                      type="button"
                      onClick={handleWithdraw}
                      disabled={!canWithdraw}
                      variant={canWithdraw ? 'primary' : 'secondary'}
                      icon={isWithdrawing ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <Wallet size={15} aria-hidden="true" />}
                    >
                      {withdrawStatus === 'signing' ? 'Sign in Freighter' : withdrawStatus === 'submitting' ? 'Submitting' : 'Withdraw'}
                    </Button>
                    <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="pg-inline-link pg-external-link">
                      Open Explorer
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                  {(withdrawError || withdrawResult) && (
                    <div className="pg-dashboard-withdraw-status" data-tone={withdrawError ? 'danger' : 'success'}>
                      {withdrawError || `Withdrawal submitted: ${short(withdrawResult.txHash, 10, 8)}`}
                    </div>
                  )}
                </section>

                <section className="pg-workspace-secondary-panel">
                  <div className="pg-workspace-panel-head">
                    <div>
                      <h2>Withdrawal history</h2>
                      <p>Developer payout contract invocations.</p>
                    </div>
                  </div>
                  {(dashboard.withdrawals || []).length === 0 ? (
                    <EmptyState title="No withdrawals yet" body="Withdrawable balance will move to the connected developer wallet after a Freighter-signed withdrawal." />
                  ) : (
                    <DataTable
                      rows={dashboard.withdrawals.slice(0, 8)}
                      columns={[
                        { key: 'time', label: 'Time', render: (withdrawal) => formatDate(withdrawal.createdAt) },
                        { key: 'amount', label: 'Amount', render: (withdrawal) => <span className="pg-dashboard-money">{formatUsdc(withdrawal.amountUsdc)}</span> },
                        { key: 'status', label: 'Status', render: (withdrawal) => <StatusText status={withdrawal.status} /> },
                        { key: 'tx', label: 'Tx', render: (withdrawal) => <TxLink hash={withdrawal.txHash} /> },
                      ]}
                      getRowKey={(withdrawal) => withdrawal.id}
                    />
                  )}
                </section>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
