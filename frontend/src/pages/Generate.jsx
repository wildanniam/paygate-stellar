import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar.jsx';
import Notice from '../components/ui/Notice.jsx';
import Button from '../components/ui/Button.jsx';
import { Field, Input } from '../components/ui/Field.jsx';
import { toSafeErrorMessage } from '../lib/walletAuth.js';

const initialForm = { endpointUrl: '', path: '', price: '' };

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
        setGeneralError(toSafeErrorMessage(data.error, 'Failed to generate code. Please try again.'));
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
    <div className="pg-app pg-legacy-page">
      <AppNavbar />
      <main className="pg-app-main pg-legacy-main">
        <Notice
          tone="warning"
          className="pg-legacy-notice"
          icon={<AlertCircle size={18} aria-hidden="true" />}
        >
          <div>
            <strong>Legacy generator.</strong> This page is kept for V0/SOW middleware evidence. For the current PayGate V1 gateway flow, use{' '}
            <Link to="/apis/new">Create paid endpoint</Link>.
          </div>
        </Notice>

        <header className="pg-app-header pg-legacy-header">
          <div>
            <p className="pg-app-eyebrow">
            Legacy MPP Code Generator
          </p>
            <h1>
            Generate Express middleware for V0 testing.
          </h1>
            <p>
            Use this only when you need the old copy-paste middleware flow. The V1 product creates paid proxy URLs from registered APIs.
          </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="pg-app-card pg-legacy-form"
        >
          {generalError && (
            <Notice tone="danger" icon={<AlertCircle size={16} aria-hidden="true" />}>
              {generalError}
            </Notice>
          )}

          <Field
            label="API Endpoint URL"
            hint={errors.endpointUrl || 'Base URL server kamu - tanpa path'}
            className={errors.endpointUrl ? 'pg-field-error' : undefined}
          >
            <Input
              value={form.endpointUrl}
              onChange={(event) => updateField('endpointUrl', event.target.value)}
              placeholder="https://api.yourservice.com"
              spellCheck={false}
              aria-invalid={errors.endpointUrl ? 'true' : undefined}
              className="pg-legacy-input"
            />
          </Field>
          <Field
            label="Path to monetize"
            hint={errors.path || 'Gunakan :param untuk path params, contoh: /users/:id'}
            className={errors.path ? 'pg-field-error' : undefined}
          >
            <Input
              value={form.path}
              onChange={(event) => updateField('path', event.target.value)}
              placeholder="/v1/data"
              spellCheck={false}
              aria-invalid={errors.path ? 'true' : undefined}
              className="pg-legacy-input"
            />
          </Field>
          <Field
            label="Price per request (USDC)"
            hint={errors.price || 'Minimum 0.0001 USDC'}
            className={errors.price ? 'pg-field-error' : undefined}
          >
            <Input
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              placeholder="0.01"
              spellCheck={false}
              aria-invalid={errors.price ? 'true' : undefined}
              className="pg-legacy-input"
            />
          </Field>

          <Button
            type="submit"
            size="lg"
            disabled={loading || allEmpty}
            className="pg-legacy-submit"
            icon={loading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
          >
            {loading ? 'Generating...' : 'Generate legacy code'}
          </Button>
        </form>
      </main>
    </div>
  );
}
