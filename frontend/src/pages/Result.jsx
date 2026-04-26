import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock.jsx';
import AppNavbar from '../components/AppNavbar.jsx';
import { C, MONO } from '../colors.js';

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
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif", backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <AppNavbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 96px' }}>
        <header style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.green, background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.18)', borderRadius: 999, padding: '7px 12px', fontSize: 13, ...MONO }}>
            <CheckCircle2 size={15} />
            Code Generated
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.02em', margin: '18px 0 16px' }}>
            Your paywall is ready.
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, color: C.text2, fontSize: 13, ...MONO }}>
            <span>Path: <strong style={{ color: C.text1 }}>{meta.path}</strong></span>
            <span>|</span>
            <span>Price: <strong style={{ color: C.text1 }}>{meta.price} USDC</strong></span>
            <span>|</span>
            <span>Endpoint: <strong style={{ color: C.text1 }}>{meta.endpointUrl}</strong></span>
          </div>
        </header>

        <section style={{ display: 'grid', gap: 34 }}>
          <div>
            <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>1. Simpan sebagai mpp-middleware.js</h2>
            <p style={{ color: C.text2, margin: '0 0 16px' }}>Buat file baru di root project kamu, paste konten ini.</p>
            <CodeBlock code={middleware} filename="mpp-middleware.js" />
          </div>

          <div>
            <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>2. Tambahkan ke server.js kamu</h2>
            <p style={{ color: C.text2, margin: '0 0 16px' }}>Copy snippet ini ke file server Express kamu yang sudah ada.</p>
            <CodeBlock code={integration} filename="server.js (snippet)" maxHeight={240} />
          </div>
        </section>

        <section style={{ marginTop: 34, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '24px 0' }}>
          <h2 style={{ fontSize: 18, margin: '0 0 14px' }}>Sebelum menjalankan server kamu</h2>
          <div style={{ display: 'grid', gap: 10, color: C.text2, fontSize: 14 }}>
            {[
              'npm install @stellar/mpp mppx @stellar/stellar-sdk',
              'Set STELLAR_RECIPIENT=G... di environment',
              'Set MPP_SECRET_KEY=<random-string-kuat> di environment',
              'Stellar testnet account kamu butuh USDC trustline',
            ].map((item) => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" style={{ accentColor: C.accent }} />
                {item}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
            <a href="https://lab.stellar.org/account/fund" target="_blank" rel="noopener noreferrer" style={{ color: C.cyan }}>
              Fund testnet account
            </a>
            <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" style={{ color: C.cyan }}>
              Circle USDC faucet
            </a>
          </div>
        </section>

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/generate" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.text2, textDecoration: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
            <ArrowLeft size={16} />
            Generate ulang
          </Link>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.text1, textDecoration: 'none', background: C.accent, borderRadius: 8, padding: '10px 14px', fontWeight: 700 }}>
            Monitor earnings di Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}

