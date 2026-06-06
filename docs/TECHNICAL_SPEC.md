# PayGate — Technical Specification
> Panduan development untuk AI agent. Baca seluruh dokumen ini sebelum menulis satu baris kode pun.

> Current V1 note, 2026-06-06: this document describes the original V0/SOW stateless generator architecture. It is preserved for historical context. The active V1 beta architecture now includes Freighter auth, Supabase persistence, Vercel Functions, paid proxy routes, and Soroban escrow; use `docs/README.md`, `docs/PAYGATE_V1_DEMO_GUIDE.md`, and `docs/evidence/PAYGATE_V1_BETA_READINESS.md` as the current source of truth.

---

## 0. Konteks Proyek

PayGate adalah web tool yang memungkinkan developer memonetisasi Node.js API dengan micropayment menggunakan MPP (Machine Payments Protocol) di Stellar — tanpa harus memahami blockchain. Developer isi 3 field form, klik Generate, dapat middleware siap pakai, paste ke server mereka.

**3 deliverable utama (sesuai SOW Instawards):**
1. MPP Code Generator — backend terima 3 input, hasilkan 2 code block
2. Website Frontend — form + halaman hasil kode
3. Monitoring Dashboard — real-time USDC earnings dari Stellar wallet

**Constraint:**
- Tidak ada database
- Tidak ada auth system
- Fully stateless
- Target: Stellar testnet
- Timeline: 30 hari (Sprint mulai 1 Mei 2026)

---

## 1. Arsitektur

```
Browser
  ↓ HTTPS (domain → VPS IP)
Nginx (port 80/443)
  ├── / → serve /var/www/paygate/frontend/dist (React SPA, static)
  └── /api/* → proxy ke localhost:3001 (Express, PM2)

localhost:3001 — Backend Node.js/Express
  └── POST /api/generate → terima { endpointUrl, path, price } → return { middleware, integration }

Stellar Horizon Testnet API (eksternal, publik)
  └── https://horizon-testnet.stellar.org
      Dipanggil langsung dari browser (CORS enabled di Horizon)
      Endpoint: GET /accounts/{address}/operations
```

**Tidak ada database. Tidak ada session. Backend adalah pure function: input → output.**

---

## 2. Tech Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Frontend | React | 18 |
| Frontend routing | React Router | v6 |
| Frontend styling | Tailwind CSS | v3 |
| Frontend build | Vite | 5 |
| Frontend icons | lucide-react | latest |
| Backend runtime | Node.js (ES modules) | v20 LTS |
| Backend framework | Express | 4 |
| Backend validation | Zod | 3 |
| MPP integration | @stellar/mpp | 0.5.1 |
| MPP framework | mppx | latest |
| Stellar SDK | @stellar/stellar-sdk | 15+ |
| Process manager | PM2 | latest |
| Reverse proxy | Nginx | latest |
| SSL | Certbot + Let's Encrypt | - |

---

## 3. Struktur Project (Final)

```
paygate/
├── docs/
│   ├── TECHNICAL_SPEC.md          # dokumen ini
│   └── README.md
├── ecosystem.config.cjs           # PM2 config
├── .gitignore
│
├── frontend/                      # React SPA — semua halaman
│   ├── src/
│   │   ├── main.jsx               # entry point — tidak perlu diubah
│   │   ├── App.jsx                # BARU: React Router root (gantikan App.jsx lama)
│   │   ├── colors.js              # BARU: const C = {...} shared color system
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # DIPINDAH dari App.jsx lama
│   │   │   ├── Generate.jsx       # BARU: /generate — form 3 field
│   │   │   ├── Result.jsx         # BARU: /result — tampilkan generated code
│   │   │   └── Dashboard.jsx      # BARU: /dashboard — earnings monitor
│   │   └── components/
│   │       ├── AppNavbar.jsx      # BARU: navbar shared untuk /generate, /result, /dashboard
│   │       └── CodeBlock.jsx      # BARU: reusable syntax-highlighted code display
│   ├── index.html                 # tidak perlu diubah
│   ├── package.json               # tambah react-router-dom
│   ├── vite.config.js             # tambah proxy /api/* → localhost:3001
│   ├── tailwind.config.js         # tidak perlu diubah
│   └── postcss.config.js          # tidak perlu diubah
│
└── backend/
    ├── src/
    │   ├── index.js               # Express entry point
    │   ├── routes/
    │   │   └── generate.js        # POST /api/generate
    │   ├── templates/
    │   │   ├── middleware.js      # fungsi generateMiddleware({ endpointUrl, path, price })
    │   │   └── integration.js     # fungsi generateIntegration({ path })
    │   └── validators/
    │       └── generate.js        # Zod schema validasi input
    └── package.json
```

---

## 4. Langkah Migrasi Frontend (Lakukan Ini Dulu Sebelum Build Fitur Baru)

File `frontend/src/App.jsx` saat ini adalah landing page monolitik. Langkah migrasi:

### Step 4.1 — Buat `src/colors.js`

Ekstrak color system dari `App.jsx` lama ke file terpisah. Semua halaman baru akan import dari sini.

```js
// frontend/src/colors.js
export const C = {
  bg:           '#080808',
  surface:      '#0F0F0F',
  surfaceHover: '#141414',
  border:       '#1A1A1A',
  borderHover:  '#2A2A2A',
  accent:       '#7C3AED',
  accentDim:    'rgba(124,58,237,0.12)',
  accentGlow:   'rgba(124,58,237,0.20)',
  cyan:         '#22D3EE',
  text1:        '#F8FAFC',
  text2:        '#94A3B8',
  text3:        '#475569',
  codeBg:       '#0D0D0D',
  green:        '#86EFAC',
  blue:         '#93C5FD',
  purple:       '#C084FC',
  amber:        '#FCD34D',
};

export const MONO = { fontFamily: "'JetBrains Mono', monospace" };
```

### Step 4.2 — Pindah `App.jsx` → `pages/Landing.jsx`

1. Buat folder `src/pages/`
2. Copy seluruh isi `App.jsx` ke `src/pages/Landing.jsx`
3. Di `Landing.jsx`, ganti `const C = {...}` dan `const M = {...}` dengan:
   ```js
   import { C, MONO as M } from '../colors.js';
   ```
4. Export default tetap: `export default function App()` → ganti jadi `export default function Landing()`

### Step 4.3 — Buat `App.jsx` baru sebagai Router root

```jsx
// frontend/src/App.jsx — BARU (gantikan seluruh isi file lama)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Generate from './pages/Generate';
import Result from './pages/Result';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/result" element={<Result />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 4.4 — Update `frontend/package.json`

Tambahkan dependency:
```json
{
  "dependencies": {
    "react-router-dom": "^6.22.0"
  }
}
```

### Step 4.5 — Update `frontend/vite.config.js`

Tambahkan proxy untuk development local:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Step 4.6 — Buat folder `src/components/`

Buat folder `src/components/` untuk komponen shared.

**Verifikasi migrasi berhasil:** Jalankan `npm run dev`, buka `http://localhost:5173` — landing page harus tampil persis sama seperti sebelumnya.

---

## 5. Backend — Code Generator API

### 5.1 Setup `backend/package.json`

```json
{
  "name": "paygate-backend",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "zod": "^3.22.0",
    "express-rate-limit": "^7.0.0"
  }
}
```

### 5.2 `backend/src/index.js`

```js
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import generateRoute from './routes/generate.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 menit
  max: 20,              // 20 request per IP per menit
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.use('/api', generateRoute);

app.listen(PORT, () => {
  console.log(`PayGate backend running on port ${PORT}`);
});
```

### 5.3 `backend/src/validators/generate.js`

```js
import { z } from 'zod';

export const generateSchema = z.object({
  endpointUrl: z
    .string()
    .min(1, 'Required')
    .url('Must be a valid URL')
    .startsWith('https://', 'Must use HTTPS')
    .max(200, 'URL too long')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        // Harus base URL saja, tidak boleh ada path (selain trailing slash)
        return parsed.pathname === '/' || parsed.pathname === '';
      } catch {
        return false;
      }
    }, 'Must be a base URL without path, e.g. https://api.yourservice.com'),

  path: z
    .string()
    .min(1, 'Required')
    .startsWith('/', 'Must start with /')
    // Express path params menggunakan :param, bukan {param}
    .regex(/^[a-zA-Z0-9/_\-:]+$/, 'Only letters, numbers, /, -, _, : allowed. Use :param for path params.')
    .max(100, 'Path too long'),

  price: z
    .string()
    .min(1, 'Required')
    .regex(/^\d+(\.\d{1,7})?$/, 'Must be a number with max 7 decimal places')
    .refine((v) => parseFloat(v) >= 0.0001, 'Minimum price is 0.0001 USDC')
    .refine((v) => parseFloat(v) <= 1000, 'Maximum price is 1000 USDC'),
});
```

### 5.4 `backend/src/routes/generate.js`

```js
import { Router } from 'express';
import { generateSchema } from '../validators/generate.js';
import { generateMiddleware } from '../templates/middleware.js';
import { generateIntegration } from '../templates/integration.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const parsed = generateSchema.safeParse(req.body);

    if (!parsed.success) {
      const details = {};
      for (const issue of parsed.error.issues) {
        details[issue.path[0]] = issue.message;
      }
      return res.status(400).json({ error: 'Validation failed', details });
    }

    const { endpointUrl, path, price } = parsed.data;

    const middleware = generateMiddleware({ endpointUrl, path, price });
    const integration = generateIntegration({ path });

    return res.status(200).json({ middleware, integration });
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### 5.5 `backend/src/templates/middleware.js`

> **PENTING:** Generated code menggunakan `mppx/express` — package Express-specific yang menghandle semua boilerplate secara internal. Jangan gunakan `mppx/server` untuk generated code.

```js
export function generateMiddleware({ endpointUrl, path, price }) {
  // Hilangkan trailing slash dari endpointUrl untuk konsistensi
  const baseUrl = endpointUrl.replace(/\/$/, '');

  return `// mpp-middleware.js — Generated by PayGate
// Service  : ${baseUrl}
// Endpoint : ${path}
// Price    : ${price} USDC per request
//
// ─── SETUP (lakukan sebelum menjalankan server) ──────────────────────────────
//
//  1. Install dependencies:
//       npm install @stellar/mpp mppx @stellar/stellar-sdk
//
//  2. Set environment variables di server kamu:
//       STELLAR_RECIPIENT=G...   ← Stellar public key kamu (penerima USDC)
//       MPP_SECRET_KEY=...       ← String random yang kuat (min 32 karakter)
//
//  3. Pastikan Stellar testnet account kamu punya USDC trustline:
//       → Buat keypair    : https://lab.stellar.org/account/create
//       → Fund XLM        : https://lab.stellar.org/account/fund
//       → Dapat USDC      : https://faucet.circle.com (pilih Stellar Testnet)
//
// ─────────────────────────────────────────────────────────────────────────────

import { Mppx } from 'mppx/express';
import { stellar } from '@stellar/mpp/charge/server';
import { USDC_SAC_TESTNET } from '@stellar/mpp';

// Guard: server akan crash saat startup jika env vars tidak diset.
// Ini disengaja — lebih baik gagal cepat daripada diam-diam tidak menerima payment.
if (!process.env.STELLAR_RECIPIENT) {
  throw new Error('[PayGate] STELLAR_RECIPIENT env var is not set. Set it to your Stellar public key (G...).');
}
if (!process.env.MPP_SECRET_KEY) {
  throw new Error('[PayGate] MPP_SECRET_KEY env var is not set. Set it to a strong random secret.');
}

const mppx = Mppx.create({
  // realm: identifier service kamu di MPP challenge (ditampilkan ke payer)
  realm: '${baseUrl}',
  secretKey: process.env.MPP_SECRET_KEY,
  methods: [
    stellar.charge({
      recipient: process.env.STELLAR_RECIPIENT,
      currency: USDC_SAC_TESTNET,
      network: 'stellar:testnet',
    }),
  ],
});

// paywall adalah Express middleware.
// Cara kerja:
//   - Request tanpa payment → kirim 402 challenge ke client
//   - Request dengan payment valid → lanjut ke handler kamu (next())
//   - Payment-Receipt header otomatis ditambahkan ke response res.json()
//
// ⚠️  Handler kamu HARUS menggunakan res.json() agar Payment-Receipt header
//     dikirim dengan benar. res.send() dan res.end() tidak di-patch.
export const paywall = mppx.charge({ amount: '${price}' });
`;
}
```

### 5.6 `backend/src/templates/integration.js`

```js
export function generateIntegration({ path }) {
  return `// ─── Tambahkan ke server.js kamu ──────────────────────────────────────────────

import { paywall } from './mpp-middleware.js';

// Tambahkan 'paywall' sebagai middleware di route yang ingin kamu monetisasi.
//
// SEBELUM (route kamu yang sudah ada):
// app.get('${path}', (req, res) => {
//   res.json({ data: '...' });
// });
//
// SESUDAH (dengan paywall):
app.get('${path}', paywall, (req, res) => {
  // Handler kamu tidak perlu diubah — gunakan res.json() seperti biasa.
  res.json({ data: '...' });
});
`;
}
```

### 5.7 API Contract

```
POST /api/generate
Content-Type: application/json

Request body:
{
  "endpointUrl": "https://api.yourservice.com",   // base URL, wajib HTTPS
  "path": "/v1/data",                              // path dengan leading slash
  "price": "0.01"                                  // USDC, string numerik
}

Response 200 OK:
{
  "middleware": "// mpp-middleware.js...(string panjang)",
  "integration": "// Add to your server.js...(string pendek)"
}

Response 400 Bad Request:
{
  "error": "Validation failed",
  "details": {
    "endpointUrl": "Must be a base URL without path",
    "path": "Must start with /",
    "price": "Minimum price is 0.0001 USDC"
  }
}

Response 429 Too Many Requests:
{
  "error": "Too many requests, please try again later."
}

Response 500 Internal Server Error:
{
  "error": "Internal server error"
}
```

---

## 6. Frontend — Komponen Shared

### 6.1 `src/components/AppNavbar.jsx`

Navbar ini dipakai di `/generate`, `/result`, `/dashboard`. **Berbeda dari navbar Landing page** yang merupakan bagian dari hero section.

```jsx
import { Github } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { C, MONO } from '../colors.js';

export default function AppNavbar() {
  const { pathname } = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        color: pathname === to ? C.text1 : C.text2,
        fontSize: 13,
        textDecoration: 'none',
        padding: '6px 12px',
        borderRadius: 6,
        background: pathname === to ? C.accentDim : 'transparent',
        transition: 'all 0.15s ease',
        ...MONO,
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8,8,8,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ ...MONO, fontWeight: 700, fontSize: 15 }}>
            <span style={{ color: C.accent }}>{'{ '}</span>
            <span style={{ color: C.text1 }}>PayGate</span>
            <span style={{ color: C.accent }}>{' }'}</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLink('/generate', 'Generator')}
          {navLink('/dashboard', 'Dashboard')}
          <a
            href="https://github.com/wildanniam/paygate-stellar"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: C.text2, fontSize: 13, textDecoration: 'none',
              padding: '6px 12px', borderRadius: 6,
              border: `1px solid ${C.border}`,
              marginLeft: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <Github size={14} />
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
```

### 6.2 `src/components/CodeBlock.jsx`

Reusable component untuk tampilkan kode dengan syntax highlighting. Dipakai di `/result`.

```jsx
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { C, MONO } from '../colors.js';

// Syntax highlighting sederhana via regex — konsisten dengan landing page
function highlight(code) {
  // Tokenize baris per baris, return array of JSX
  return code.split('\n').map((line, i) => (
    <div key={i} style={{ minHeight: '1.8em' }}>
      {highlightLine(line)}
    </div>
  ));
}

function highlightLine(line) {
  // Pattern: comments
  if (line.trim().startsWith('//')) {
    return <span style={{ color: C.text3 }}>{line}</span>;
  }

  // Tokenize dengan regex — urutan penting
  const parts = [];
  const regex = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\b(?:import|export|from|const|let|var|if|throw|new|return|async|await)\b|\b(?:Mppx|stellar|mppx|express|Request|Response|Error)\b(?=\s*[.(])|[a-zA-Z_$][\w$]*(?=\s*[(:]))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    // Teks sebelum match
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex} style={{ color: '#E2E8F0' }}>{line.slice(lastIndex, match.index)}</span>);
    }

    const token = match[0];
    let color = '#E2E8F0';

    if (/^['"`]/.test(token)) {
      color = C.green; // strings
    } else if (/^(import|export|from|const|let|var|if|throw|new|return|async|await)$/.test(token)) {
      color = C.purple; // keywords
    } else {
      color = C.amber; // function names / identifiers before ( or :
    }

    parts.push(<span key={match.index} style={{ color }}>{token}</span>);
    lastIndex = match.index + token.length;
  }

  // Sisa teks
  if (lastIndex < line.length) {
    parts.push(<span key={lastIndex} style={{ color: '#E2E8F0' }}>{line.slice(lastIndex)}</span>);
  }

  return parts;
}

export default function CodeBlock({ code, filename, maxHeight = 500 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: C.codeBg,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: `inset 0 0 40px rgba(124,58,237,0.04), 0 0 0 1px ${C.border}`,
    }}>
      {/* Header bar */}
      <div style={{
        background: '#111111',
        borderBottom: `1px solid ${C.border}`,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((color) => (
            <div key={color} style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          ))}
          <span style={{ ...MONO, fontSize: 12, color: C.text3, marginLeft: 8 }}>{filename}</span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: copied ? C.green : C.text3,
            fontSize: 12, ...MONO,
            transition: 'color 0.15s ease',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code area */}
      <div style={{
        padding: '20px 24px',
        ...MONO, fontSize: 13, lineHeight: 1.8,
        overflowY: 'auto', maxHeight,
        overflowX: 'auto',
      }}>
        {highlight(code)}
      </div>
    </div>
  );
}
```

---

## 7. Frontend — Halaman

### 7.1 `/generate` — `src/pages/Generate.jsx`

**State:**
```js
const [form, setForm] = useState({ endpointUrl: '', path: '', price: '' });
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
```

**Fields:**

| Field | Label | Placeholder | Hint |
|---|---|---|---|
| `endpointUrl` | API Endpoint URL | `https://api.yourservice.com` | "Base URL server kamu — tanpa path" |
| `path` | Path to monetize | `/v1/data` | "Gunakan :param untuk path params, contoh: /users/:id" |
| `price` | Price per request (USDC) | `0.01` | "Minimum 0.0001 USDC" |

**Submit flow:**
1. Basic client-side validation (field kosong)
2. `setLoading(true)`
3. `POST /api/generate` dengan body JSON
4. Sukses (200):
   - Simpan ke `sessionStorage` dengan key `paygate_result`:
     ```js
     sessionStorage.setItem('paygate_result', JSON.stringify({ middleware, integration, meta: form }));
     ```
   - `navigate('/result', { state: { middleware, integration, meta: form } })`
5. Error validasi (400): set `errors` dari `details` response, tampilkan per field
6. Error lain: tampilkan pesan error umum di atas form
7. `setLoading(false)` di finally

**Visual:** Dark aesthetic, konsisten dengan landing page. Card `#0F0F0F`, input background `#141414`, border `#1A1A1A`. Error text merah kecil di bawah field.

**Tombol Generate:** disabled saat loading atau semua field kosong. Saat loading, tampilkan spinner atau teks "Generating...".

---

### 7.2 `/result` — `src/pages/Result.jsx`

**Mount logic:**
```js
const location = useLocation();
const navigate = useNavigate();

// Primary: dari navigate state. Fallback: sessionStorage (tahan refresh)
const state = location.state
  ?? JSON.parse(sessionStorage.getItem('paygate_result') ?? 'null');

// Kalau tidak ada data sama sekali, redirect ke form
if (!state) return <Navigate to="/generate" replace />;

const { middleware, integration, meta } = state;
```

**Layout:**

```
AppNavbar

Header section:
  ✓ Code Generated
  Path: /v1/data  |  Price: 0.01 USDC  |  Endpoint: https://api.yourservice.com

Block 1:
  Label: "1. Simpan sebagai mpp-middleware.js"
  Sub:   "Buat file baru di root project kamu, paste konten ini"
  <CodeBlock code={middleware} filename="mpp-middleware.js" />

Block 2:
  Label: "2. Tambahkan ke server.js kamu"
  Sub:   "Copy snippet ini ke file server Express kamu yang sudah ada"
  <CodeBlock code={integration} filename="server.js (snippet)" maxHeight={200} />

Setup checklist (static):
  ────────────────────────────────────────────────
  Sebelum menjalankan server kamu:
  ☐  npm install @stellar/mpp mppx @stellar/stellar-sdk
  ☐  Set STELLAR_RECIPIENT=G... di environment
  ☐  Set MPP_SECRET_KEY=<random-string-kuat> di environment
  ☐  Stellar testnet account kamu butuh USDC trustline
     → https://lab.stellar.org/account/fund
     → https://faucet.circle.com (pilih Stellar Testnet)
  ────────────────────────────────────────────────

CTA bawah:
  "← Generate ulang" (link ke /generate)
  "Monitor earnings di Dashboard →" (link ke /dashboard)
```

---

### 7.3 `/dashboard` — `src/pages/Dashboard.jsx`

#### State machine

```
'idle'     → user belum input wallet address
'loading'  → sedang fetch dari Horizon
'loaded'   → data berhasil diambil (bisa kosong)
'error'    → Horizon API error atau address tidak valid
```

#### Wallet input & persistence

```js
// Load dari localStorage saat mount
const [walletAddress, setWalletAddress] = useState(
  () => localStorage.getItem('paygate_wallet_address') ?? ''
);

// Simpan ke localStorage saat submit
const handleSubmit = () => {
  if (!isValidStellarAddress(walletAddress)) {
    setError('Alamat Stellar tidak valid. Harus dimulai dengan G dan 56 karakter.');
    return;
  }
  localStorage.setItem('paygate_wallet_address', walletAddress);
  fetchData(walletAddress);
};

// Validasi Stellar address: dimulai G, tepat 56 karakter
const isValidStellarAddress = (addr) => /^G[A-Z2-7]{55}$/.test(addr);
```

#### Data fetching — Horizon API

> **CATATAN PENTING untuk implementor:** Filter USDC menggunakan `code === 'USDC'` tanpa cek `issuer`. Alasannya: `USDC_SAC_TESTNET` dari `@stellar/mpp` adalah contract address (bukan classic issuer account), dan issuer yang muncul di `asset_balance_changes` adalah classic issuer Circle yang perlu diverifikasi secara langsung di Week 1. Untuk keamanan filter, `code === 'USDC'` sudah cukup untuk testnet POC.

```js
import { HORIZON_URLS, STELLAR_TESTNET } from '@stellar/mpp';

const HORIZON = HORIZON_URLS[STELLAR_TESTNET]; // 'https://horizon-testnet.stellar.org'

async function fetchMppPayments(walletAddress) {
  const url = `${HORIZON}/accounts/${walletAddress}/operations?order=desc&limit=200`;
  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error('Wallet address tidak ditemukan di Stellar testnet. Pastikan account sudah difund.');
  }
  if (!res.ok) {
    throw new Error(`Horizon API error: ${res.status}`);
  }

  const data = await res.json();
  const records = data._embedded?.records ?? [];

  // Filter: hanya Soroban SAC transfers (invoke_host_function = type_i 24)
  // yang merupakan USDC transfer masuk ke wallet ini
  return records
    .filter((op) =>
      op.type_i === 24 && // invoke_host_function (Soroban)
      Array.isArray(op.asset_balance_changes) &&
      op.asset_balance_changes.some(
        (c) => c.type === 'transfer' && c.to === walletAddress && c.code === 'USDC'
      )
    )
    .map((op) => {
      const change = op.asset_balance_changes.find(
        (c) => c.type === 'transfer' && c.to === walletAddress && c.code === 'USDC'
      );
      return {
        timestamp: op.created_at,         // ISO 8601 string
        from: change.from,                // sender Stellar address
        amount: parseFloat(change.amount), // USDC amount dalam unit standar (0.01, bukan stroops)
        txHash: op.transaction_hash,      // 64-char hex string
      };
    });
}
```

#### Auto-refresh

```js
useEffect(() => {
  if (!walletAddress || status === 'idle') return;

  fetchAndSet(); // fetch langsung

  const interval = setInterval(fetchAndSet, 30_000); // refresh tiap 30 detik
  return () => clearInterval(interval);
}, [walletAddress]);
```

#### Layout & data display

```
AppNavbar

Section 1 — Input:
  Label: "Stellar Wallet Address"
  Input: G...(56 chars), placeholder "GABC...XYZ"
  Button: "Load Dashboard"
  Error: tampil jika address invalid

Section 2 — Summary cards (muncul jika status === 'loaded'):
  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │ Total USDC       │  │ Total Requests   │  │ Last Payment     │
  │ 0.15 USDC        │  │ 15               │  │ Apr 26, 14:22    │
  └──────────────────┘  └──────────────────┘  └──────────────────┘

Section 3 — Transaction table (muncul jika status === 'loaded'):
  | Timestamp          | From           | Amount    | Tx Hash          |
  |--------------------|----------------|-----------|------------------|
  | Apr 26, 2026 14:22 | GCLIE...WXYZ   | 0.01 USDC | f4e8... [↗ link] |

  Format "From": 6 char pertama + "..." + 4 char terakhir
  Format "Tx Hash": 8 char pertama + "..." + link ke:
    https://stellar.expert/explorer/testnet/tx/{txHash}

  Empty state (loaded tapi data kosong):
    "Belum ada MPP payment diterima. Generate paywall dan mulai menerima requests."

Loading state:
  Spinner atau teks "Loading..."

Error state:
  Tampilkan pesan error yang informatif
```

---

## 8. Deployment — VPS Setup

### 8.1 Urutan: Server Setup (sekali) vs Deploy (setiap update)

Dokumen ini memisahkan dua proses yang berbeda:
- **Server Setup** — dilakukan sekali saat pertama kali setup VPS
- **Deploy** — dilakukan setiap kali ada update kode

---

### 8.2 Server Setup (Sekali)

```bash
# ── 1. Update system
sudo apt update && sudo apt upgrade -y

# ── 2. Firewall — buka port yang diperlukan
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# ── 3. Install nvm + Node.js 20 LTS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# ── 4. Install Nginx
sudo apt install nginx -y
sudo systemctl enable nginx

# ── 5. Install PM2
npm install -g pm2

# ── 6. Clone repository
sudo mkdir -p /var/www/paygate
sudo chown $USER:$USER /var/www/paygate
git clone https://github.com/wildanniam/paygate-stellar /var/www/paygate

# ── 7. Setup backend
cd /var/www/paygate/backend
npm install

# ── 8. Buat .env untuk backend
cat > /var/www/paygate/backend/.env << 'EOF'
NODE_ENV=production
PORT=3001
EOF

# ── 9. Start backend dengan PM2
cd /var/www/paygate
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # ← ikuti instruksi yang muncul untuk auto-start saat reboot

# ── 10. Setup Nginx
sudo nano /etc/nginx/sites-available/paygate
# (isi dengan konfigurasi di bawah)

sudo ln -s /etc/nginx/sites-available/paygate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 8.3 Nginx Configuration

File: `/etc/nginx/sites-available/paygate`

```nginx
server {
    listen 80;
    server_name yourdomain.com;  # ← ganti dengan domain kamu

    # Serve frontend (React SPA)
    root /var/www/paygate/frontend/dist;
    index index.html;

    # SPA fallback: semua route yang tidak ada file-nya dikembalikan ke index.html
    # Ini penting agar React Router bisa handle /generate, /result, /dashboard
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls ke backend Express (port 3001)
    # /api/ harus sebelum / di sini karena Nginx matching is first-match
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 8.4 Setup HTTPS (Setelah Domain Pointed ke VPS IP)

```bash
# Pastikan domain sudah pointing ke IP VPS sebelum langkah ini
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com

# Certbot otomatis update Nginx config untuk HTTPS + redirect HTTP → HTTPS
# Auto-renewal sudah disetup oleh certbot
```

---

### 8.5 `ecosystem.config.cjs` (di root project)

```js
module.exports = {
  apps: [
    {
      name: 'paygate-api',
      script: './backend/src/index.js',
      cwd: '/var/www/paygate',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
```

---

### 8.6 Deploy (Setiap Update Kode)

```bash
cd /var/www/paygate

# Pull latest code
git pull origin main

# Rebuild frontend
cd frontend && npm install && npm run build && cd ..

# Update backend dependencies (jika ada perubahan package.json)
cd backend && npm install && cd ..

# Restart backend
pm2 restart paygate-api

# Verifikasi backend jalan
pm2 status
pm2 logs paygate-api --lines 20
```

---

## 9. Development Local

### 9.1 Setup

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev
# Server jalan di http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# App jalan di http://localhost:5173
# /api/* di-proxy ke localhost:3001 via Vite config
```

### 9.2 Test endpoint generate secara langsung

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "endpointUrl": "https://api.yourservice.com",
    "path": "/v1/data",
    "price": "0.01"
  }'
```

Expected response: JSON dengan key `middleware` dan `integration`, masing-masing berisi string kode yang panjang.

---

## 10. Checklist Testing per Deliverable

### Deliverable 1 — Code Generator Backend

- [ ] `POST /api/generate` dengan input valid → 200, `middleware` dan `integration` ada
- [ ] `POST /api/generate` dengan `endpointUrl` tanpa https → 400, error di field `endpointUrl`
- [ ] `POST /api/generate` dengan `path` tanpa leading `/` → 400, error di field `path`
- [ ] `POST /api/generate` dengan `price` negatif → 400, error di field `price`
- [ ] `POST /api/generate` body kosong → 400
- [ ] 21 request dalam 1 menit dari IP sama → 429
- [ ] Generated `middleware` mengandung string `mppx/express` (bukan `mppx/server`)
- [ ] Generated `middleware` mengandung `STELLAR_RECIPIENT` dan `MPP_SECRET_KEY` sebagai env vars
- [ ] Generated `middleware` mengandung `USDC_SAC_TESTNET`
- [ ] Generated `integration` mengandung `path` yang diinput user

### Deliverable 2 — Website Frontend

- [ ] Buka `/` → landing page tampil normal, animasi berjalan
- [ ] Klik "See How It Works" → scroll ke section yang benar
- [ ] Buka `/generate` → form 3 field tampil dengan label dan placeholder
- [ ] Submit form kosong → error per field muncul
- [ ] Submit form valid → redirect ke `/result`
- [ ] Di `/result` → dua code block tampil dengan syntax highlighting
- [ ] Klik "Copy" di code block → clipboard terisi, tombol berubah jadi "Copied!"
- [ ] Refresh halaman `/result` → kode masih tampil (dari sessionStorage)
- [ ] Buka `/result` langsung tanpa data → redirect ke `/generate`
- [ ] AppNavbar tampil di `/generate`, `/result`, `/dashboard`
- [ ] AppNavbar tidak tampil di `/` (landing page punya navbar sendiri)
- [ ] Mobile: `/generate` tidak ada horizontal overflow

### Deliverable 3 — Dashboard

- [ ] Buka `/dashboard` → form wallet address tampil
- [ ] Input address tidak valid → error message
- [ ] Input address valid (testnet account) → summary cards dan tabel muncul
- [ ] Account tidak ada di testnet → error message informatif
- [ ] Account ada tapi belum ada MPP payment → empty state message
- [ ] Tx hash di tabel → link ke Stellar Expert testnet explorer
- [ ] Dashboard auto-refresh setiap 30 detik
- [ ] Wallet address persisted di localStorage (tidak hilang saat refresh)
- [ ] Setelah MPP transaction real terjadi → muncul di dashboard dalam 30 detik

---

## 11. Known Limitations (POC Scope)

- **Horizon limit=200:** Dashboard hanya tampilkan 200 operasi terbaru. Wallet dengan aktivitas sangat tinggi mungkin tidak tampilkan semua history.
- **`res.json()` only:** MPP Payment-Receipt header hanya otomatis ditambahkan kalau handler pakai `res.json()`. Handler yang pakai `res.send()` atau `res.end()` tidak akan include receipt header.
- **Testnet only:** Semua MPP integration menggunakan `stellar:testnet` dan `USDC_SAC_TESTNET`. Mainnet bukan scope POC ini.
- **Node.js/Express only:** Generator hanya support Express. Python, Fastify, Next.js API routes — out of scope per SOW.
- **Charge intent only:** Session/channel intent tidak diimplementasi. Ini explicitly out of scope per SOW.
- **No user accounts:** Dashboard hanya bisa diakses dengan manual input wallet address. Tidak ada save/login.

---

## 12. Environment Variables

### Backend (`backend/.env`)

```
NODE_ENV=production
PORT=3001
```

> PayGate backend sendiri tidak membutuhkan STELLAR_RECIPIENT atau MPP_SECRET_KEY. Dua env var itu adalah milik **developer yang menggunakan PayGate** — mereka set di server mereka setelah paste generated code.

### Frontend

Tidak ada env vars khusus. Frontend pakai relative URL `/api/generate` untuk call backend (bukan hardcode domain).

---

## 13. Urutan Development yang Disarankan

Ikuti urutan ini untuk meminimalkan blocker antar task:

```
Week 1:
  ✓ Setup backend project (package.json, index.js, cors, rate limit)
  ✓ Buat validator Zod (generate.js)
  ✓ Buat template engine (middleware.js, integration.js)
  ✓ Buat route POST /api/generate
  ✓ Test endpoint via curl
  → Verifikasi USDC issuer testnet dengan buat wallet + MPP transaction

Week 2:
  ✓ Jalankan migrasi frontend (Steps 4.1 – 4.6)
  ✓ Verifikasi landing page masih berjalan normal
  ✓ Buat AppNavbar.jsx
  ✓ Buat CodeBlock.jsx
  ✓ Buat Generate.jsx (form + submit)
  ✓ Buat Result.jsx (code display + sessionStorage fallback)
  ✓ Connect frontend ke backend

Week 3:
  ✓ Buat Dashboard.jsx
  ✓ Implementasi Horizon API fetching
  ✓ Test dengan wallet testnet yang sudah ada MPP transaction
  ✓ Verifikasi filter type_i === 24 + asset_balance_changes

Week 4:
  ✓ Setup VPS (server setup steps)
  ✓ Build dan deploy
  ✓ Setup domain + HTTPS
  ✓ End-to-end testing (semua checklist deliverable)
  ✓ Record demo video
```

---

## 14. Referensi

| Resource | URL |
|---|---|
| MPP Documentation | https://developers.stellar.org/docs/build/agentic-payments/mpp |
| MPP Charge Guide | https://developers.stellar.org/docs/build/agentic-payments/mpp/charge-guide |
| @stellar/mpp GitHub | https://github.com/stellar/stellar-mpp-sdk |
| Stellar Lab (create keypair, fund) | https://lab.stellar.org |
| Circle USDC Faucet (testnet) | https://faucet.circle.com |
| Stellar Expert Explorer (testnet) | https://stellar.expert/explorer/testnet |
| Horizon Testnet API | https://horizon-testnet.stellar.org |
| MPP Live Demo | https://mpp.stellar.buzz |
