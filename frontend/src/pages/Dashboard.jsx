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
  Search,
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
import {
  buildDashboardModel,
  DASHBOARD_RANGES,
  formatCompactNumber as formatDashboardCompactNumber,
  formatPricePerCall,
  formatRangeLabel as formatDashboardRangeLabel,
  formatUsdc as formatDashboardUsdc,
} from '../lib/dashboardViewModel.js';
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

function requestTone(status) {
  if (status === 'forwarded' || status === 'succeeded') return 'success';
  if (status === 'credited' || status === 'payment_verified') return 'blue';
  if (status === 'challenge_sent' || status === 'pending') return 'warning';
  if (status?.includes('failed') || status === 'duplicate_payment') return 'danger';
  return 'muted';
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

const WORKSPACE_VIEW_META = {
  overview: {
    eyebrow: 'PayGate workspace',
    title: 'Overview',
    subtitle: 'Your API revenue, endpoint health, and payout readiness.',
  },
  endpoints: {
    eyebrow: 'PayGate workspace',
    title: 'Endpoints',
    subtitle: 'Manage paid proxy URLs, setup state, price, and per-endpoint revenue.',
  },
  activity: {
    eyebrow: 'PayGate workspace',
    title: 'Activity',
    subtitle: 'Trace requests from payment challenge to upstream response and revenue credit.',
  },
  payouts: {
    eyebrow: 'PayGate workspace',
    title: 'Payouts',
    subtitle: 'Withdraw developer revenue and verify escrow settlement.',
  },
};

function getWorkspaceView(pathname) {
  if (pathname.includes('/dashboard/endpoints')) return 'endpoints';
  if (pathname.includes('/dashboard/activity')) return 'activity';
  if (pathname.includes('/dashboard/payouts')) return 'payouts';
  return 'overview';
}

function RangeToggle({ value, onChange }) {
  return (
    <span className="pg-workspace-range" aria-label="Dashboard range">
      {DASHBOARD_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          className={value === range ? 'is-selected' : undefined}
          onClick={() => onChange(range)}
        >
          {range}D
        </button>
      ))}
    </span>
  );
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
        <span>Price <strong>{formatPricePerCall(api.priceUsdc)}</strong></span>
        <span>Calls <strong>{formatDashboardCompactNumber(api.rangeSuccessfulCalls ?? api.successfulCalls)}</strong></span>
        <span>Revenue <strong>{formatDashboardUsdc(api.rangeDeveloperRevenueUsdc ?? api.developerRevenueUsdc)}</strong></span>
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
    <div className="pg-workspace-logged-out" aria-live="polite">
      <section className="pg-workspace-connect-card pg-workspace-locked-card">
        <span className="pg-workspace-lock-icon" aria-hidden="true">
          <ShieldCheck size={24} />
        </span>
        <div>
          <p className="pg-workspace-lock-eyebrow">Wallet required</p>
          <h2>Wallet not connected.</h2>
          <p>Connect Freighter first to load your registered endpoints, activity, revenue, and payout workspace.</p>
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
    </div>
  );
}

function RevenueTrendCard({ model }) {
  const payments = model.rangePayments || [];
  const buckets = Array.from({ length: 8 }, (_, index) => {
    const bucketPayments = payments.filter((_, paymentIndex) => paymentIndex % 8 === index);
    return bucketPayments.reduce((sum, payment) => sum + Number(payment.developerAmountUsdc || 0), 0);
  });
  const max = Math.max(...buckets, 0.0001);

  return (
    <article className="pg-workspace-panel pg-overview-trend">
      <div className="pg-workspace-panel-head">
        <div>
          <h2>Revenue trend</h2>
          <p>Developer revenue credited during the selected range.</p>
        </div>
        <Link to="/dashboard/activity" className="pg-workspace-panel-link">View activity <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      <div className="pg-overview-chart" aria-label="Developer revenue trend">
        <div className="pg-overview-chart-total">
          <small>Developer revenue</small>
          <strong>{formatDashboardUsdc(model.summary.developerRevenueUsdc)}</strong>
        </div>
        <div className="pg-overview-bars" aria-hidden="true">
          {buckets.map((value, index) => (
            <span
              key={`${index}-${value}`}
              style={{ '--bar-height': `${Math.max(8, Math.round((value / max) * 100))}%` }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function NeedsAttentionCard({ model }) {
  const items = [];

  if (model.needsAttention.setupRequiredApis > 0) {
    items.push({
      id: 'setup',
      tone: 'warning',
      title: `${model.needsAttention.setupRequiredApis} endpoint${model.needsAttention.setupRequiredApis > 1 ? 's' : ''} need setup`,
      body: 'Verify the upstream guard before earning from paid calls.',
      to: '/dashboard/endpoints',
      action: 'Continue setup',
    });
  }

  if (model.needsAttention.paymentRequiredCalls > 0) {
    items.push({
      id: 'payment-required',
      tone: 'warning',
      title: `${model.needsAttention.paymentRequiredCalls} payment-required call${model.needsAttention.paymentRequiredCalls > 1 ? 's' : ''}`,
      body: 'These requests received 402 and were not forwarded upstream.',
      to: '/dashboard/activity',
      action: 'Review calls',
    });
  }

  if (model.needsAttention.failedCalls > 0) {
    items.push({
      id: 'failed',
      tone: 'danger',
      title: `${model.needsAttention.failedCalls} failed request${model.needsAttention.failedCalls > 1 ? 's' : ''}`,
      body: 'Check payment or upstream errors before they affect conversion.',
      to: '/dashboard/activity',
      action: 'Inspect errors',
    });
  }

  if (model.needsAttention.withdrawableUsdc > 0) {
    items.push({
      id: 'withdrawable',
      tone: 'success',
      title: `${formatDashboardUsdc(model.needsAttention.withdrawableUsdc)} ready`,
      body: 'Developer revenue is available in escrow.',
      to: '/dashboard/payouts',
      action: 'Open payouts',
    });
  }

  return (
    <article className="pg-workspace-panel pg-overview-attention">
      <div className="pg-workspace-panel-head">
        <div>
          <h2>Needs attention</h2>
          <p>The short list of things worth acting on now.</p>
        </div>
      </div>
      <div className="pg-overview-attention-list">
        {items.length === 0 ? (
          <div className="pg-overview-attention-empty">
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <strong>Everything looks healthy</strong>
              <span>No setup, payment, or payout action needs your attention.</span>
            </div>
          </div>
        ) : (
          items.slice(0, 3).map((item) => (
            <Link key={item.id} to={item.to} className="pg-overview-attention-item" data-tone={item.tone}>
              <span aria-hidden="true" />
              <div>
                <strong>{item.title}</strong>
                <small>{item.body}</small>
              </div>
              <em>{item.action}</em>
            </Link>
          ))
        )}
      </div>
    </article>
  );
}

function TopEndpointsCard({ endpoints }) {
  return (
    <article className="pg-workspace-panel">
      <div className="pg-workspace-panel-head">
        <div>
          <h2>Top endpoints</h2>
          <p>Best performers in the selected range.</p>
        </div>
        <Link to="/dashboard/endpoints" className="pg-workspace-panel-link">View all <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      {endpoints.length === 0 ? (
        <EmptyState
          title="No paid endpoints yet"
          body="Create a paid endpoint to start tracking calls and revenue."
          action={<Link to="/apis/new" className="pg-inline-link">Create your first endpoint</Link>}
        />
      ) : (
        <div className="pg-workspace-table is-overview-endpoints">
          <div className="pg-workspace-table-head" aria-hidden="true">
            <span>Endpoint</span>
            <span>Status</span>
            <span>Price</span>
            <span>Calls</span>
            <span>Revenue</span>
          </div>
          {endpoints.slice(0, 3).map((api) => (
            <div key={api.id} className="pg-workspace-table-row">
              <div className="pg-workspace-api-cell">
                <Link to={`/apis/${api.id}`}><Database size={17} aria-hidden="true" /> {api.name}</Link>
                <span>{api.path}</span>
              </div>
              <ApiStatusBadge status={api.status} compact />
              <span>{formatPricePerCall(api.priceUsdc)}</span>
              <span>{formatDashboardCompactNumber(api.rangeSuccessfulCalls ?? api.successfulCalls)}</span>
              <strong>{formatDashboardUsdc(api.rangeDeveloperRevenueUsdc ?? api.developerRevenueUsdc)}</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function RecentActivityCard({ rows }) {
  return (
    <article className="pg-workspace-panel">
      <div className="pg-workspace-panel-head">
        <div>
          <h2>Recent activity</h2>
          <p>Latest request states and credited revenue.</p>
        </div>
        <Link to="/dashboard/activity" className="pg-workspace-panel-link">View all <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No activity yet" body="402 challenges, verified payments, and forwarded requests will appear here." />
      ) : (
        <div className="pg-workspace-table is-overview-activity">
          <div className="pg-workspace-table-head" aria-hidden="true">
            <span>Time</span>
            <span>Event</span>
            <span>Endpoint</span>
            <span>Result</span>
            <span>Revenue</span>
          </div>
          {rows.slice(0, 4).map((row) => (
            <div key={row.id} className="pg-workspace-table-row">
              <span>{formatDate(row.createdAt)}</span>
              <WorkspaceBadge tone={row.eventTone}>{row.event}</WorkspaceBadge>
              <span>{row.apiName}</span>
              <WorkspaceBadge tone={row.resultTone}>{row.result}</WorkspaceBadge>
              <strong className={row.revenueTone === 'positive' ? 'is-positive' : undefined}>{row.revenue}</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function OverviewPayoutStrip({ model, escrowConfigured }) {
  return (
    <section className="pg-workspace-withdraw pg-overview-payout" aria-label="Payout summary">
      <span className="pg-workspace-withdraw-icon"><Wallet size={27} aria-hidden="true" /></span>
      <div>
        <small>Ready to withdraw</small>
        <strong>{formatDashboardUsdc(model.summary.withdrawableUsdc)}</strong>
        <span>{escrowConfigured ? 'Available from escrow' : 'Escrow contract unavailable'}</span>
      </div>
      <i aria-hidden="true" />
      <div>
        <small>PayGate fee balance</small>
        <strong>{formatDashboardUsdc(model.summary.platformFeeBalanceUsdc)}</strong>
        <span>Platform share from paid calls</span>
      </div>
      <div className="pg-workspace-withdraw-actions">
        <Button as={Link} to="/dashboard/payouts" variant="secondary" icon={<ArrowRight size={15} aria-hidden="true" />}>
          Manage payouts
        </Button>
      </div>
    </section>
  );
}

function OverviewView({ model, dashboard }) {
  if (!model) return null;

  return (
    <>
      <section className="pg-workspace-metrics" aria-label="Overview metrics">
        <WorkspaceMetric
          icon={Database}
          label="Active endpoints"
          value={`${model.summary.activeApis}`}
          delta={`${model.summary.setupRequiredApis} setup · ${model.summary.archivedApis} archived`}
          tone="brand"
        />
        <WorkspaceMetric
          icon={Activity}
          label="Paid calls"
          value={formatDashboardCompactNumber(model.summary.paidCalls)}
          delta={`${formatDashboardCompactNumber(model.summary.totalCalls)} total · ${model.summary.paymentRequiredCalls} payment-required`}
        />
        <WorkspaceMetric
          icon={DollarSign}
          label="Developer revenue"
          value={formatDashboardUsdc(model.summary.developerRevenueUsdc)}
          delta={`PayGate fee ${formatDashboardUsdc(model.summary.platformFeeUsdc)}`}
          tone="success"
        />
        <WorkspaceMetric
          icon={Wallet}
          label="Withdrawable"
          value={formatDashboardUsdc(model.summary.withdrawableUsdc)}
          delta={dashboard.escrow?.configured ? 'Ready from escrow' : 'Contract not configured'}
          tone="success"
        />
      </section>

      <section className="pg-overview-grid">
        <RevenueTrendCard model={model} />
        <NeedsAttentionCard model={model} />
      </section>

      <section className="pg-workspace-panels pg-overview-panels">
        <TopEndpointsCard endpoints={model.topEndpoints} />
        <RecentActivityCard rows={model.activityRows} />
      </section>

      <OverviewPayoutStrip model={model} escrowConfigured={dashboard.escrow?.configured} />
    </>
  );
}

const ENDPOINT_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending_setup', label: 'Setup required' },
  { value: 'archived', label: 'Archived' },
];

function EndpointDetailPanel({ api }) {
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    let active = true;
    if (!api?.id) {
      setDetail(null);
      return undefined;
    }

    async function loadDetail() {
      setStatus('loading');
      try {
        const res = await fetch(`/api/apis/${api.id}`, { credentials: 'include' });
        const data = await readJsonResponse(res);
        if (!active) return;
        if (!res.ok) throw new Error(data.error || 'Failed to load endpoint details.');
        setDetail(data.api);
        setStatus('loaded');
      } catch {
        if (!active) return;
        setDetail(null);
        setStatus('error');
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [api?.id]);

  if (!api) {
    return (
      <article className="pg-workspace-panel pg-endpoint-detail">
        <EmptyState title="Select an endpoint" body="Choose an endpoint row to inspect proxy URL, setup status, and revenue." />
      </article>
    );
  }

  const successRate = api.rangeCalls > 0
    ? `${Math.round(((api.rangeSuccessfulCalls || 0) / api.rangeCalls) * 100)}%`
    : '-';
  const endpointDetail = detail || api;

  return (
    <article className="pg-workspace-panel pg-endpoint-detail">
      <div className="pg-endpoint-detail-head">
        <div>
          <span className="pg-endpoint-icon"><Database size={19} aria-hidden="true" /></span>
          <div>
            <h2>{api.name}</h2>
            <p>{api.method} {api.path}</p>
          </div>
        </div>
        <ApiStatusBadge status={api.status} />
      </div>

      <div className="pg-endpoint-copy-stack">
        <label>
          <span>Proxy URL</span>
          <code>{endpointDetail.proxyUrl || api.proxyUrl}</code>
          <CopyButton value={endpointDetail.proxyUrl || api.proxyUrl} compact ariaLabel="Copy proxy URL" />
        </label>
        <label>
          <span>Required header</span>
          <code>
            {status === 'loading'
              ? 'Loading secret...'
              : endpointDetail.secret
                ? `X-PayGate-Secret: ${endpointDetail.secret}`
                : 'Open endpoint detail to reveal secret'}
          </code>
          {endpointDetail.secret && <CopyButton value={`X-PayGate-Secret: ${endpointDetail.secret}`} compact ariaLabel="Copy upstream secret header" />}
        </label>
      </div>

      <div className="pg-endpoint-detail-grid">
        <div>
          <small>Price / call</small>
          <strong>{formatPricePerCall(api.priceUsdc)}</strong>
        </div>
        <div>
          <small>Paid calls</small>
          <strong>{formatDashboardCompactNumber(api.rangeSuccessfulCalls ?? api.successfulCalls)}</strong>
        </div>
        <div>
          <small>Success rate</small>
          <strong>{successRate}</strong>
        </div>
        <div>
          <small>Revenue</small>
          <strong className="is-positive">{formatDashboardUsdc(api.rangeDeveloperRevenueUsdc ?? api.developerRevenueUsdc)}</strong>
        </div>
      </div>

      <div className="pg-endpoint-checklist">
        <h3>Setup checklist</h3>
        <span data-state={api.status === 'active' ? 'done' : 'pending'}>Upstream guard configured</span>
        <span data-state={api.status === 'active' ? 'done' : 'pending'}>PayGate secret verified</span>
        <span data-state={api.status === 'active' ? 'done' : 'pending'}>{api.status === 'active' ? 'Live and earning' : 'Verify setup to go live'}</span>
      </div>

      <div className="pg-endpoint-actions">
        <Button as={Link} to={`/apis/${api.id}`} variant="secondary" icon={<ExternalLink size={15} aria-hidden="true" />}>
          Open detail
        </Button>
        {api.status === 'pending_setup' && (
          <Button as={Link} to={`/apis/${api.id}`} variant="primary" icon={<ShieldCheck size={15} aria-hidden="true" />}>
            Verify setup
          </Button>
        )}
      </div>
    </article>
  );
}

function EndpointsView({ model }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  const [selectedEndpointId, setSelectedEndpointId] = useState(null);

  const endpoints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...(model?.apiStats || [])]
      .filter((api) => statusFilter === 'all' || api.status === statusFilter)
      .filter((api) => {
        if (!normalizedQuery) return true;
        return [api.name, api.path, api.proxyUrl, api.upstreamBaseUrl]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sortBy === 'calls') return (b.rangeSuccessfulCalls || 0) - (a.rangeSuccessfulCalls || 0);
        if (sortBy === 'last_activity') return new Date(b.rangeLastActivityAt || 0) - new Date(a.rangeLastActivityAt || 0);
        return (b.rangeDeveloperRevenueUsdc || 0) - (a.rangeDeveloperRevenueUsdc || 0);
      });
  }, [model, query, sortBy, statusFilter]);

  const selectedEndpoint = endpoints.find((api) => api.id === selectedEndpointId) || endpoints[0] || null;

  return (
    <>
      <section className="pg-workspace-toolbar" aria-label="Endpoint filters">
        <label className="pg-workspace-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search endpoints..."
          />
        </label>

        <div className="pg-workspace-segment" aria-label="Endpoint status filter">
          {ENDPOINT_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={statusFilter === option.value ? 'is-selected' : undefined}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="pg-workspace-select">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="revenue">Revenue</option>
            <option value="calls">Paid calls</option>
            <option value="last_activity">Last activity</option>
          </select>
        </label>
      </section>

      <section className="pg-workspace-metrics" aria-label="Endpoint metrics">
        <WorkspaceMetric icon={Database} label="Total endpoints" value={`${model.summary.totalApis}`} delta="All registered endpoints" tone="brand" />
        <WorkspaceMetric icon={ShieldCheck} label="Active" value={`${model.summary.activeApis}`} delta="Live and serving traffic" tone="success" />
        <WorkspaceMetric icon={AlertCircle} label="Setup required" value={`${model.summary.setupRequiredApis}`} delta="Pending upstream verification" />
        <WorkspaceMetric icon={Upload} label="Archived" value={`${model.summary.archivedApis}`} delta="Inactive but preserved" />
      </section>

      <section className="pg-endpoints-layout">
        <article className="pg-workspace-panel pg-endpoints-table-panel">
          <div className="pg-workspace-panel-head">
            <div>
              <h2>Paid endpoints</h2>
              <p>Proxy URLs, setup states, calls, and per-endpoint revenue.</p>
            </div>
            <Button as={Link} to="/apis/new" size="sm" icon={<Plus size={15} aria-hidden="true" />}>
              Add endpoint
            </Button>
          </div>

          {endpoints.length === 0 ? (
            <EmptyState
              title="No endpoints match this filter"
              body="Try clearing search or create a new paid endpoint."
              action={<Link to="/apis/new" className="pg-inline-link">Create endpoint</Link>}
            />
          ) : (
            <>
              <div className="pg-workspace-mobile-list">
                {endpoints.map((api) => <ApiMobileCard key={api.id} api={api} />)}
              </div>
              <div className="pg-workspace-table is-endpoints">
                <div className="pg-workspace-table-head" aria-hidden="true">
                  <span>Endpoint</span>
                  <span>Status</span>
                  <span>Price</span>
                  <span>Calls</span>
                  <span>Success</span>
                  <span>Revenue</span>
                </div>
                {endpoints.map((api) => {
                  const isSelected = selectedEndpoint?.id === api.id;
                  const successRate = api.rangeCalls > 0
                    ? `${Math.round(((api.rangeSuccessfulCalls || 0) / api.rangeCalls) * 100)}%`
                    : '-';

                  return (
                    <button
                      key={api.id}
                      type="button"
                      className={`pg-workspace-table-row ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedEndpointId(api.id)}
                    >
                      <span className="pg-workspace-api-cell">
                        <strong>{api.name}</strong>
                        <small>{api.method} {api.path}</small>
                      </span>
                      <ApiStatusBadge status={api.status} compact />
                      <span>{formatPricePerCall(api.priceUsdc)}</span>
                      <span>{formatDashboardCompactNumber(api.rangeSuccessfulCalls ?? api.successfulCalls)}</span>
                      <span>{successRate}</span>
                      <strong>{formatDashboardUsdc(api.rangeDeveloperRevenueUsdc ?? api.developerRevenueUsdc)}</strong>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </article>

        <EndpointDetailPanel api={selectedEndpoint} />
      </section>
    </>
  );
}

const ACTIVITY_STATUS_OPTIONS = [
  { value: 'all', label: 'All events' },
  { value: 'mpp_verified', label: 'Paid' },
  { value: '402', label: '402' },
  { value: 'forwarded', label: 'Forwarded' },
  { value: 'failed', label: 'Failed' },
];

function ActivityDetailPanel({ row }) {
  if (!row) {
    return (
      <article className="pg-workspace-panel pg-activity-detail">
        <EmptyState title="Select a request" body="Choose a ledger row to inspect payment, upstream, and revenue details." />
      </article>
    );
  }

  const timeline = [
    {
      label: 'Request received',
      value: row.requestId,
      tone: 'blue',
    },
    {
      label: row.group === '402' ? 'Payment required' : 'Payment checked',
      value: row.group === '402' ? '402 challenge returned' : row.paymentId || 'No payment ID',
      tone: row.group === '402' ? 'warning' : 'purple',
    },
    {
      label: 'Upstream result',
      value: row.result,
      tone: row.resultTone,
    },
    {
      label: 'Revenue',
      value: row.revenue,
      tone: row.revenueTone === 'positive' ? 'success' : 'muted',
    },
  ];

  return (
    <article className="pg-workspace-panel pg-activity-detail">
      <div className="pg-activity-detail-head">
        <div>
          <small>{formatDate(row.createdAt)}</small>
          <h2>{row.event}</h2>
          <p>{row.apiName || 'Unknown endpoint'}</p>
        </div>
        <WorkspaceBadge tone={row.resultTone}>{row.result}</WorkspaceBadge>
      </div>

      <div className="pg-activity-request-box">
        <span>Request ID</span>
        <code>{row.requestId}</code>
        <CopyButton value={row.requestId} compact ariaLabel="Copy request ID" />
      </div>

      <div className="pg-activity-timeline">
        {timeline.map((item) => (
          <div key={item.label} data-tone={item.tone}>
            <i aria-hidden="true" />
            <span>{item.label}</span>
            <strong>{item.value || '-'}</strong>
          </div>
        ))}
      </div>

      <dl className="pg-activity-detail-list">
        <div>
          <dt>Payment ID</dt>
          <dd>{row.paymentId || '-'}</dd>
        </div>
        <div>
          <dt>Payer wallet</dt>
          <dd>{row.payerWallet ? short(row.payerWallet, 10, 6) : '-'}</dd>
        </div>
        <div>
          <dt>Payment tx</dt>
          <dd><TxLink hash={row.txHash} /></dd>
        </div>
        <div>
          <dt>Credit tx</dt>
          <dd><TxLink hash={row.creditTxHash} /></dd>
        </div>
      </dl>

      {row.errorMessage && (
        <Notice tone="danger" icon={<AlertCircle size={16} aria-hidden="true" />}>
          {row.errorMessage}
        </Notice>
      )}
    </article>
  );
}

function ActivityView({ model }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [apiFilter, setApiFilter] = useState('all');
  const [revenueOnly, setRevenueOnly] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return (model?.activityRows || [])
      .filter((row) => statusFilter === 'all' || row.group === statusFilter)
      .filter((row) => apiFilter === 'all' || row.apiId === apiFilter)
      .filter((row) => !revenueOnly || row.revenueTone === 'positive')
      .filter((row) => {
        if (!normalizedQuery) return true;
        return [row.requestId, row.apiName, row.paymentId, row.payerWallet, row.txHash, row.creditTxHash]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      });
  }, [apiFilter, model, query, revenueOnly, statusFilter]);

  const selectedRow = rows.find((row) => row.id === selectedActivityId) || rows[0] || null;
  const apiOptions = model?.apiStats || [];

  return (
    <>
      <section className="pg-workspace-toolbar pg-activity-toolbar" aria-label="Activity filters">
        <label className="pg-workspace-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search requests, payments, wallets..."
          />
        </label>

        <div className="pg-workspace-segment" aria-label="Activity status filter">
          {ACTIVITY_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={statusFilter === option.value ? 'is-selected' : undefined}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="pg-workspace-select">
          <span>API</span>
          <select value={apiFilter} onChange={(event) => setApiFilter(event.target.value)}>
            <option value="all">All endpoints</option>
            {apiOptions.map((api) => (
              <option key={api.id} value={api.id}>{api.name}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="pg-workspace-metrics" aria-label="Activity metrics">
        <WorkspaceMetric icon={Activity} label="Requests" value={formatDashboardCompactNumber(model.summary.totalCalls)} delta={`${formatDashboardCompactNumber(rows.length)} shown by filter`} />
        <WorkspaceMetric icon={ShieldCheck} label="Paid calls" value={formatDashboardCompactNumber(model.summary.successfulCalls)} delta="MPP verified and forwarded" tone="brand" />
        <WorkspaceMetric icon={AlertCircle} label="402 challenges" value={formatDashboardCompactNumber(model.summary.paymentRequiredCalls)} delta="Blocked until paid" />
        <WorkspaceMetric icon={DollarSign} label="Revenue events" value={formatDashboardUsdc(model.summary.developerRevenueUsdc)} delta="Developer share in range" tone="success" />
      </section>

      <section className="pg-activity-layout">
        <article className="pg-workspace-panel pg-activity-ledger-panel">
          <div className="pg-workspace-panel-head">
            <div>
              <h2>Activity ledger</h2>
              <p>Request, payment check, upstream result, and revenue in one stream.</p>
            </div>
            <button
              type="button"
              className={revenueOnly ? 'is-selected' : undefined}
              onClick={() => setRevenueOnly((value) => !value)}
            >
              Revenue only
            </button>
          </div>

          {rows.length === 0 ? (
            <EmptyState title="No activity matches this filter" body="Clear a filter or run a paid endpoint request to populate the ledger." />
          ) : (
            <>
              <div className="pg-workspace-mobile-list">
                {rows.map((row) => <ActivityMobileCard key={row.id} row={row} />)}
              </div>
              <div className="pg-workspace-table is-activity">
                <div className="pg-workspace-table-head" aria-hidden="true">
                  <span>Time</span>
                  <span>Endpoint</span>
                  <span>Event</span>
                  <span>Result</span>
                  <span>Revenue</span>
                </div>
                {rows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className={`pg-workspace-table-row ${selectedRow?.id === row.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedActivityId(row.id)}
                    >
                      <span>{formatDate(row.createdAt)}</span>
                      <span className="pg-workspace-request-cell">
                        <strong>{row.apiName || 'Unknown'}</strong>
                        <small>{short(row.requestId, 11, 4)}</small>
                      </span>
                      <WorkspaceBadge tone={row.eventTone}>{row.event}</WorkspaceBadge>
                      <WorkspaceBadge tone={row.resultTone}>{row.result}</WorkspaceBadge>
                      <strong className={row.revenueTone === 'positive' ? 'is-positive' : undefined}>{row.revenue}</strong>
                  </button>
                ))}
              </div>
            </>
          )}
        </article>

        <ActivityDetailPanel row={selectedRow} />
      </section>
    </>
  );
}

function PayoutsView({
  dashboard,
  model,
  session,
  canWithdraw,
  handleWithdraw,
  isWithdrawing,
  withdrawStatus,
  withdrawError,
  withdrawResult,
}) {
  const developerBalance = dashboard.escrow?.developerBalance?.usdc;
  const platformBalance = dashboard.escrow?.platformFeeBalance?.usdc;
  const withdrawals = dashboard.withdrawals || [];
  const latestWithdrawal = withdrawals[0];

  return (
    <>
      <section className="pg-payout-hero">
        <article className="pg-workspace-panel pg-payout-balance-card">
          <div>
            <span className="pg-payout-icon"><Wallet size={24} aria-hidden="true" /></span>
            <small>Ready to withdraw</small>
            <strong>{formatDashboardUsdc(developerBalance)}</strong>
            <p>{dashboard.escrow?.configured ? 'Funds available from the PayGate escrow contract.' : 'Escrow contract is not configured yet.'}</p>
          </div>
          <div className="pg-payout-actions">
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
        </article>

        <article className="pg-workspace-panel pg-payout-split-card">
          <div className="pg-workspace-panel-head">
            <div>
              <h2>Revenue split</h2>
              <p>Developer revenue and PayGate fee posted after successful calls.</p>
            </div>
          </div>
          <div className="pg-payout-split-grid">
            <div>
              <small>Developer balance</small>
              <strong>{formatDashboardUsdc(developerBalance)}</strong>
              <span>Withdrawable</span>
            </div>
            <div>
              <small>PayGate fee balance</small>
              <strong>{formatDashboardUsdc(platformBalance)}</strong>
              <span>Platform share</span>
            </div>
            <div>
              <small>Range revenue</small>
              <strong>{formatDashboardUsdc(model.summary.developerRevenueUsdc)}</strong>
              <span>Developer share in selected window</span>
            </div>
          </div>
        </article>
      </section>

      <section className="pg-workspace-panels pg-payout-panels">
        <article className="pg-workspace-panel">
          <div className="pg-workspace-panel-head">
            <div>
              <h2>Escrow contract</h2>
              <p>Current contract health and latest payout state.</p>
            </div>
            <WorkspaceBadge tone={dashboard.escrow?.configured ? 'success' : 'warning'}>
              {dashboard.escrow?.configured ? 'Connected' : 'Not configured'}
            </WorkspaceBadge>
          </div>
          <dl className="pg-payout-info-list">
            <div>
              <dt>Contract</dt>
              <dd>{dashboard.escrow?.configured ? 'PayGate escrow active' : 'Missing escrow env'}</dd>
            </div>
            <div>
              <dt>Developer wallet</dt>
              <dd>{short(session.walletAddress, 10, 6)}</dd>
            </div>
            <div>
              <dt>Latest withdrawal</dt>
              <dd>{latestWithdrawal ? `${formatDashboardUsdc(latestWithdrawal.amountUsdc)} · ${formatDate(latestWithdrawal.createdAt)}` : 'No withdrawals yet'}</dd>
            </div>
          </dl>
        </article>

        <article className="pg-workspace-panel">
          <div className="pg-workspace-panel-head">
            <div>
              <h2>Credit sources</h2>
              <p>Recent paid requests that increased withdrawable balance.</p>
            </div>
          </div>
          <div className="pg-payout-credit-list">
            {model.activityRows.filter((row) => row.revenueTone === 'positive').slice(0, 4).map((row) => (
              <div key={row.id}>
                <span>
                  <strong>{row.apiName}</strong>
                  <small>{short(row.requestId, 10, 4)}</small>
                </span>
                <em>{row.revenue}</em>
              </div>
            ))}
            {model.activityRows.filter((row) => row.revenueTone === 'positive').length === 0 && (
              <EmptyState title="No revenue credits yet" body="Successful paid requests will appear here before withdrawal." />
            )}
          </div>
        </article>
      </section>

      <section className="pg-workspace-secondary-panel pg-payout-history">
        <div className="pg-workspace-panel-head">
          <div>
            <h2>Withdrawal history</h2>
            <p>Developer payout contract invocations.</p>
          </div>
        </div>
        {withdrawals.length === 0 ? (
          <EmptyState title="No withdrawals yet" body="Withdrawable balance will move to the connected developer wallet after a Freighter-signed withdrawal." />
        ) : (
          <DataTable
            rows={withdrawals.slice(0, 10)}
            columns={[
              { key: 'time', label: 'Time', render: (withdrawal) => formatDate(withdrawal.createdAt) },
              { key: 'amount', label: 'Amount', render: (withdrawal) => <span className="pg-dashboard-money">{formatDashboardUsdc(withdrawal.amountUsdc)}</span> },
              { key: 'status', label: 'Status', render: (withdrawal) => <StatusText status={withdrawal.status} /> },
              { key: 'tx', label: 'Tx', render: (withdrawal) => <TxLink hash={withdrawal.txHash} /> },
            ]}
            getRowKey={(withdrawal) => withdrawal.id}
          />
        )}
      </section>
    </>
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
  const [selectedRange, setSelectedRange] = useState(30);

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

  const escrowError = dashboard?.escrow?.error;
  const isLoading = dashboardStatus === 'loading' || authStatus === 'loading';
  const isRefreshing = dashboardStatus === 'refreshing';
  const isWithdrawing = ['preparing', 'signing', 'submitting'].includes(withdrawStatus);
  const withdrawableUsdc = Number(dashboard?.escrow?.developerBalance?.usdc || 0);
  const canWithdraw = session.authenticated && dashboard?.escrow?.configured && withdrawableUsdc > 0 && !escrowError && !isWithdrawing;
  const rangeLabel = useMemo(() => formatDashboardRangeLabel(selectedRange, lastUpdated || new Date()), [lastUpdated, selectedRange]);
  const dashboardModel = useMemo(
    () => buildDashboardModel(dashboard, selectedRange, lastUpdated || new Date()),
    [dashboard, selectedRange, lastUpdated],
  );
  const viewMeta = WORKSPACE_VIEW_META[currentView] || WORKSPACE_VIEW_META.overview;

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
                <p>{viewMeta.eyebrow}</p>
                <h1>{viewMeta.title}</h1>
                <span className="pg-workspace-subtitle">{viewMeta.subtitle}</span>
              </div>

              {session.authenticated && (
                <div className="pg-workspace-controls">
                  {currentView !== 'endpoints' && (
                    <>
                      <span className="pg-workspace-date"><CalendarDays size={17} aria-hidden="true" /> {rangeLabel}</span>
                      <RangeToggle value={selectedRange} onChange={setSelectedRange} />
                    </>
                  )}
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
                  <Button as={Link} to="/apis/new" size="sm" icon={<Plus size={16} aria-hidden="true" />} className="pg-workspace-create">
                    Create paid endpoint
                  </Button>
                </div>
              )}
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
              currentView === 'overview' ? (
                <OverviewView model={dashboardModel} dashboard={dashboard} />
              ) : currentView === 'endpoints' ? (
                <EndpointsView model={dashboardModel} />
              ) : currentView === 'activity' ? (
                <ActivityView model={dashboardModel} />
              ) : currentView === 'payouts' ? (
                <PayoutsView
                  dashboard={dashboard}
                  model={dashboardModel}
                  session={session}
                  canWithdraw={canWithdraw}
                  handleWithdraw={handleWithdraw}
                  isWithdrawing={isWithdrawing}
                  withdrawStatus={withdrawStatus}
                  withdrawError={withdrawError}
                  withdrawResult={withdrawResult}
                />
              ) : null
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
