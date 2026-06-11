import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { C, MONO } from '../colors.js';
import CodeBlock from './CodeBlock.jsx';

function guardSnippet(api) {
  return `const PAYGATE_SECRET = process.env.PAYGATE_SECRET;

function requirePayGate(req, res, next) {
  if (req.get('X-PayGate-Secret') !== PAYGATE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

app.get('${api.path}', requirePayGate, (req, res) => {
  res.json({ ok: true });
});`;
}

function envSnippet(api) {
  return `PAYGATE_SECRET=${api.secret || 'copy_secret_from_paygate'}`;
}

function testSnippet(api) {
  return `# Direct upstream should reject unpaid bypass attempts.
curl -i ${api.upstreamBaseUrl}${api.path}

# PayGate proxy should request payment before access.
curl -i ${api.proxyUrl}`;
}

function Step({ children, number }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, background: C.accentDim, color: C.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flex: '0 0 auto', ...MONO }}>
        {number}
      </div>
      <div style={{ color: C.text2, lineHeight: 1.6, fontSize: 14 }}>{children}</div>
    </div>
  );
}

export default function UpstreamGuardGuide({ api }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, marginBottom: 10 }}>
          <ShieldCheck size={18} color={C.green} />
          Protect your upstream API
        </div>
        <p style={{ color: C.text2, lineHeight: 1.7, margin: 0 }}>
          Your proxy is created, but your original API must reject direct requests that do not come from PayGate.
        </p>
      </div>

      <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.24)', borderRadius: 12, padding: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertTriangle size={18} color={C.amber} style={{ flex: '0 0 auto', marginTop: 2 }} />
        <div style={{ color: C.text2, lineHeight: 1.6, fontSize: 14 }}>
          <strong style={{ color: C.text1 }}>Important:</strong> if your upstream API stays public without this guard, buyers can bypass PayGate and call your API without paying.
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
          <CheckCircle2 size={18} color={C.green} />
          Setup checklist
        </div>
        <Step number="1">Copy the API secret and save it in your upstream API server environment.</Step>
        <Step number="2">Add the guard code to the route you registered in PayGate.</Step>
        <Step number="3">Make sure direct upstream calls return <code style={{ ...MONO, color: C.amber }}>401 Unauthorized</code>.</Step>
        <Step number="4">Use the PayGate proxy URL for buyers and agent clients.</Step>
        <Step number="5">Unpaid proxy calls should return <code style={{ ...MONO, color: C.amber }}>402 Payment Required</code>; paid calls should return <code style={{ ...MONO, color: C.green }}>200 OK</code>.</Step>
      </div>

      <CodeBlock code={envSnippet(api)} filename=".env" maxHeight={120} />
      <CodeBlock code={guardSnippet(api)} filename="upstream-api.js" maxHeight={380} />
      <CodeBlock code={testSnippet(api)} filename="test-paygate.sh" maxHeight={220} />
    </div>
  );
}
