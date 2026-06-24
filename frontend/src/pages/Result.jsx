import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock.jsx';
import AppNavbar from '../components/AppNavbar.jsx';
import Button from '../components/ui/Button.jsx';
import Notice from '../components/ui/Notice.jsx';

function readStoredResult() {
  try {
    return JSON.parse(sessionStorage.getItem('paygate_result') ?? 'null');
  } catch {
    return null;
  }
}

export default function Result() {
  const location = useLocation();
  const state = location.state ?? readStoredResult();

  if (!state) return <Navigate to="/generate" replace />;

  const { middleware, integration, meta } = state;

  return (
    <div className="pg-app pg-legacy-page">
      <AppNavbar />
      <main className="pg-app-main pg-legacy-main">
        <Notice
          tone="warning"
          className="pg-legacy-notice"
          icon={<AlertCircle size={18} aria-hidden="true" />}
        >
          <div>
            <strong>Legacy generator output.</strong> This code is useful for V0/SOW evidence. For the current PayGate V1 product, register your API and use the generated proxy URL.
          </div>
        </Notice>

        <header className="pg-legacy-result-header">
          <span className="pg-badge" data-tone="success">
            <CheckCircle2 size={15} aria-hidden="true" />
            Code Generated
          </span>
          <h1>
            Your paywall is ready.
          </h1>
          <div className="pg-legacy-meta">
            <span>Path: <strong>{meta.path}</strong></span>
            <span>Price: <strong>{meta.price} USDC</strong></span>
            <span>Endpoint: <strong>{meta.endpointUrl}</strong></span>
          </div>
        </header>

        <section className="pg-legacy-code-stack">
          <article className="pg-app-card pg-legacy-code-card">
            <div className="pg-app-card-header">
              <div>
                <h2 className="pg-app-card-title">1. Simpan sebagai mpp-middleware.js</h2>
                <p className="pg-app-card-copy">Buat file baru di root project kamu, paste konten ini.</p>
              </div>
            </div>
            <div className="pg-app-card-body">
            <CodeBlock code={middleware} filename="mpp-middleware.js" />
            </div>
          </article>

          <article className="pg-app-card pg-legacy-code-card">
            <div className="pg-app-card-header">
              <div>
                <h2 className="pg-app-card-title">2. Tambahkan ke server.js kamu</h2>
                <p className="pg-app-card-copy">Copy snippet ini ke file server Express kamu yang sudah ada.</p>
              </div>
            </div>
            <div className="pg-app-card-body">
            <CodeBlock code={integration} filename="server.js (snippet)" maxHeight={240} />
            </div>
          </article>
        </section>

        <section className="pg-app-card pg-legacy-checklist">
          <div className="pg-app-card-header">
            <h2 className="pg-app-card-title">Sebelum menjalankan server kamu</h2>
          </div>
          <div className="pg-app-card-body">
            <div className="pg-legacy-checklist-items">
            {[
              'npm install @stellar/mpp mppx @stellar/stellar-sdk',
              'Set STELLAR_RECIPIENT=G... di environment',
              'Set MPP_SECRET_KEY=<random-string-kuat> di environment',
              'Stellar testnet account kamu butuh USDC trustline',
            ].map((item) => (
              <label key={item}>
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </div>
            <div className="pg-legacy-resource-links">
            <a href="https://lab.stellar.org/account/fund" target="_blank" rel="noopener noreferrer">
              Fund testnet account
            </a>
            <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer">
              Circle USDC faucet
            </a>
            </div>
          </div>
        </section>

        <div className="pg-legacy-actions">
          <Button
            as={Link}
            to="/generate"
            variant="secondary"
            icon={<ArrowLeft size={16} aria-hidden="true" />}
          >
            Generate another legacy snippet
          </Button>
          <Button
            as={Link}
            to="/apis/new"
            icon={<ArrowRight size={16} aria-hidden="true" />}
          >
            Create paid endpoint in V1
          </Button>
        </div>
      </main>
    </div>
  );
}
