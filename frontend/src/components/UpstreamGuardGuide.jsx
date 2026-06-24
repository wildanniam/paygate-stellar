import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    <div className="pg-guard-step">
      <div className="pg-guard-step-number">
        {number}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function UpstreamGuardGuide({ api }) {
  return (
    <div className="pg-guard-guide">
      <div className="pg-guard-card is-primary">
        <div className="pg-guard-title">
          <ShieldCheck size={18} aria-hidden="true" />
          Protect your upstream API
        </div>
        <p>
          Your proxy is created, but your original API must reject direct requests that do not come from PayGate.
        </p>
      </div>

      <div className="pg-guard-card is-warning">
        <AlertTriangle size={18} aria-hidden="true" />
        <div>
          <strong>Important:</strong> if your upstream API stays public without this guard, buyers can bypass PayGate and call your API without paying.
        </div>
      </div>

      <div className="pg-guard-card is-checklist">
        <div className="pg-guard-title">
          <CheckCircle2 size={18} aria-hidden="true" />
          Setup checklist
        </div>
        <Step number="1">Copy the API secret and save it in your upstream API server environment.</Step>
        <Step number="2">Add the guard code to the route you registered in PayGate.</Step>
        <Step number="3">Make sure direct upstream calls return <code>401 Unauthorized</code>.</Step>
        <Step number="4">Use the PayGate proxy URL for buyers and agent clients.</Step>
        <Step number="5">Unpaid proxy calls should return <code>402 Payment Required</code>; paid calls should return <code>200 OK</code>.</Step>
      </div>

      <CodeBlock code={envSnippet(api)} filename=".env" maxHeight={120} />
      <CodeBlock code={guardSnippet(api)} filename="upstream-api.js" maxHeight={380} />
      <CodeBlock code={testSnippet(api)} filename="test-paygate.sh" maxHeight={220} />
    </div>
  );
}
