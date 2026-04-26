import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import { C, MONO } from '../colors.js';

const initialForm = { endpointUrl: '', path: '', price: '' };

function Field({ name, label, placeholder, hint, value, error, onChange }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', color: C.text1, fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          width: '100%',
          background: C.surfaceHover,
          border: `1px solid ${error ? C.red : C.border}`,
          color: C.text1,
          borderRadius: 8,
          padding: '13px 14px',
          outline: 'none',
          fontSize: 15,
          ...MONO,
          boxShadow: error ? '0 0 0 3px rgba(252,165,165,0.08)' : 'none',
        }}
      />
      <span style={{ display: 'block', color: error ? C.red : C.text3, fontSize: 12, marginTop: 7 }}>
        {error || hint}
      </span>
    </label>
  );
}

export default function Generate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setGeneralError('');
  };

  const validateEmptyFields = () => {
    const nextErrors = {};
    if (!form.endpointUrl.trim()) nextErrors.endpointUrl = 'Required';
    if (!form.path.trim()) nextErrors.path = 'Required';
    if (!form.price.trim()) nextErrors.price = 'Required';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const emptyErrors = validateEmptyFields();
    if (Object.keys(emptyErrors).length > 0) {
      setErrors(emptyErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      const payload = {
        endpointUrl: form.endpointUrl.trim(),
        path: form.path.trim(),
        price: form.price.trim(),
      };
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 400 && data.details) {
          setErrors(data.details);
          return;
        }
        setGeneralError(data.error || 'Failed to generate code. Please try again.');
        return;
      }

      const result = { middleware: data.middleware, integration: data.integration, meta: payload };
      sessionStorage.setItem('paygate_result', JSON.stringify(result));
      navigate('/result', { state: result });
    } catch {
      setGeneralError('Backend is unreachable. Make sure the PayGate API is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const allEmpty = !form.endpointUrl && !form.path && !form.price;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text1, fontFamily: "'Inter', sans-serif", backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <AppNavbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 96px' }}>
        <div style={{ maxWidth: 680 }}>
          <p style={{ ...MONO, color: C.cyan, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            MPP Code Generator
          </p>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 58px)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Generate an Express paywall in under five minutes.
          </h1>
          <p style={{ color: C.text2, fontSize: 17, lineHeight: 1.7, marginTop: 18 }}>
            Enter your API base URL, the route you want to monetize, and the USDC price per request.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 44,
            maxWidth: 680,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 24,
            display: 'grid',
            gap: 22,
            boxShadow: '0 18px 70px rgba(0,0,0,0.24)',
          }}
        >
          {generalError && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.red, background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.18)', borderRadius: 8, padding: 12, fontSize: 13 }}>
              <AlertCircle size={16} style={{ flex: '0 0 auto', marginTop: 1 }} />
              {generalError}
            </div>
          )}

          <Field
            name="endpointUrl"
            label="API Endpoint URL"
            placeholder="https://api.yourservice.com"
            hint="Base URL server kamu - tanpa path"
            value={form.endpointUrl}
            error={errors.endpointUrl}
            onChange={updateField}
          />
          <Field
            name="path"
            label="Path to monetize"
            placeholder="/v1/data"
            hint="Gunakan :param untuk path params, contoh: /users/:id"
            value={form.path}
            error={errors.path}
            onChange={updateField}
          />
          <Field
            name="price"
            label="Price per request (USDC)"
            placeholder="0.01"
            hint="Minimum 0.0001 USDC"
            value={form.price}
            error={errors.price}
            onChange={updateField}
          />

          <button
            type="submit"
            disabled={loading || allEmpty}
            style={{
              marginTop: 4,
              minHeight: 48,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: loading || allEmpty ? '#2A1F3E' : C.accent,
              color: C.text1,
              border: 'none',
              borderRadius: 8,
              cursor: loading || allEmpty ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: 15,
              transition: 'all 0.15s ease',
            }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <ArrowRight size={16} />}
            {loading ? 'Generating...' : 'Generate Code'}
          </button>
        </form>
      </main>
    </div>
  );
}
