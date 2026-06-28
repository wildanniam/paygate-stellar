# Audit Keamanan PayGate

Tanggal audit: 2026-06-28

Konteks: audit keamanan defensif untuk repository PayGate milik sendiri. Fokus audit adalah backend, API, auth, payment flow, escrow/wallet, agent-to-API payment flow, dependency, database, deployment, dan threat model untuk AI agent yang memakai API berbayar.

## Ringkasan Cepat

PayGate adalah gateway API berbayar berbasis Stellar MPP. Developer login dengan wallet, mendaftarkan upstream API, PayGate membuat proxy berbayar `/api/pay/:apiId`, buyer/agent membayar, PayGate memverifikasi pembayaran, meng-credit escrow, lalu meneruskan request ke upstream API dengan header rahasia `X-PayGate-Secret`.

Temuan paling penting:

1. High - SSRF lewat upstream URL yang didaftarkan developer. Sudah diperbaiki.
2. High - Setup verification bisa meloloskan upstream yang sebenarnya tidak punya secret guard. Sudah diperbaiki.
3. High - Dependency vulnerable di payment/frontend tooling. Sudah diperbaiki.
4. High - Payment bisa tercatat/escrow credited sebelum upstream sukses. Belum diperbaiki karena perlu keputusan produk.
5. Medium - Rate limiting produksi belum ada di Vercel route. Sudah diperbaiki dengan Upstash-backed limiter.
6. Medium - Body/request/response size belum dibatasi. Sudah diperbaiki.
7. Medium - Withdrawal submit hanya cek source wallet, belum cek full intent transaksi. Sudah diperbaiki.

Tidak ada temuan Critical yang terkonfirmasi.

## Arsitektur Singkat

Stack utama:

- Backend: Node.js ESM, Vercel serverless-style route di folder `api/`.
- Local backend wrapper: Express di `backend/src/index.js`.
- Frontend: React + Vite di `frontend/`.
- Database: Supabase Postgres, diakses dari server memakai service role key.
- Auth: Freighter wallet signed-message challenge, lalu session cookie HTTP-only.
- Payment: `@stellar/mpp`, `mppx`, Stellar testnet USDC.
- Escrow: Soroban contract di `contracts/contracts/paygate-escrow`.
- Deployment: `vercel.json`.

Entry point penting:

- `POST /api/auth/challenge`
- `POST /api/auth/verify`
- `GET/POST /api/apis`
- `POST /api/apis/:apiId/verify`
- `GET /api/pay/:apiId`
- `GET /api/dashboard/summary`
- `POST /api/withdraw/prepare`
- `POST /api/withdraw/submit`

Trust boundary penting:

- Browser/frontend ke API route.
- Public buyer/AI agent ke `/api/pay/:apiId`.
- PayGate server ke upstream API milik developer.
- PayGate server ke Supabase service role.
- PayGate server ke Stellar/Soroban RPC.
- Secret operator PayGate ke escrow contract.

## Flow Kritis

### Flow registrasi developer API

1. Developer connect wallet dan sign challenge.
2. PayGate membuat signed session cookie.
3. Developer register upstream base URL, path, dan harga.
4. PayGate generate secret `pgsec_*`, lalu encrypt di database.
5. API masuk status `pending_setup`.
6. Developer memasang guard `X-PayGate-Secret` di upstream API.
7. PayGate verify setup.
8. Jika guard valid, API menjadi `active`.

### Flow paid proxy

1. Agent/buyer call `/api/pay/:apiId` tanpa payment.
2. PayGate membuat payment challenge dan row `proxy_requests`.
3. Agent membayar, lalu retry dengan payment credential.
4. PayGate verify credential.
5. PayGate simpan payment row.
6. PayGate credit escrow.
7. PayGate forward ke upstream API dengan `X-PayGate-Secret`.
8. PayGate return upstream response dan `Payment-Receipt`.

### Flow withdrawal

1. Developer request prepare withdrawal.
2. PayGate membuat transaksi XDR untuk withdrawal escrow.
3. Developer sign transaksi.
4. PayGate submit signed XDR dan mencatat withdrawal.

## Temuan Terkonfirmasi

## PG-001 - SSRF lewat upstream URL

Severity: High

Status: sudah diperbaiki.

File terdampak:

- `server/lib/apiRegistry.js`
- `api/apis/[apiId]/verify.js`
- `api/pay/[apiId].js`
- `server/lib/upstreamSecurity.js`

Masalah:

Sebelumnya developer bisa mendaftarkan upstream URL apa saja. Lalu PayGate akan melakukan server-side fetch ke URL itu saat setup verification atau paid proxy forwarding.

Contoh target berbahaya:

- `http://127.0.0.1`
- `http://localhost`
- `http://169.254.169.254`
- IP private seperti `10.0.0.0/8`, `192.168.0.0/16`
- hostname yang resolve ke private IP
- metadata host cloud

Skenario serangan:

Attacker login sebagai developer, register upstream URL ke internal service atau metadata endpoint. Saat attacker menekan verify setup atau memicu paid proxy, server PayGate ikut melakukan request ke target internal itu.

Dampak:

- PayGate bisa dipakai sebagai proxy ke jaringan internal.
- Metadata cloud atau service internal bisa terekspos.
- Secret header PayGate bisa terkirim ke host yang salah.
- Bisa dipakai untuk DoS lewat upstream lambat atau redirect berantai.

Patch yang diterapkan:

- Menambahkan `server/lib/upstreamSecurity.js`.
- Validasi URL saat API dibuat.
- Validasi ulang saat setup verification dan paid proxy forwarding.
- Production wajib HTTPS.
- Block localhost, metadata host, private IP, reserved IP, link-local, dan DNS yang resolve ke private IP.
- Fetch upstream memakai timeout 10 detik.
- Redirect upstream tidak otomatis diikuti.
- Local/private upstream tetap boleh untuk smoke test memory-mode non-production.

Cara tes:

- `npm run test:security`
- `npm run test:verify-setup`
- `npm run test:proxy-paid`

Mapping OWASP:

- OWASP Top 10: SSRF.
- OWASP API Top 10: Server Side Request Forgery.

## PG-002 - Setup verification bisa meloloskan API tanpa secret guard

Severity: High

Status: sudah diperbaiki.

File terdampak:

- `api/apis/[apiId]/verify.js`
- `scripts/phase3-verify-setup-smoke.mjs`

Masalah:

Sebelumnya PayGate hanya mengecek apakah upstream berhasil saat dikirim header secret asli. Kalau upstream selalu return `200` walaupun tidak cek secret, API tetap bisa dianggap verified dan menjadi `active`.

Skenario serangan:

Developer salah konfigurasi upstream dan tidak memasang guard `X-PayGate-Secret`. PayGate tetap menganggap endpoint protected. Buyer/agent bisa bypass PayGate dan call upstream langsung tanpa bayar.

Dampak:

- Payment bypass.
- Developer kehilangan revenue.
- Dashboard memberi rasa aman palsu.
- Agent bisa menemukan bahwa endpoint asli tidak terlindungi.

Patch yang diterapkan:

Setup verification sekarang melakukan dua probe:

1. Kirim secret palsu `pgsec_invalid_setup_probe`. Ini harus gagal.
2. Kirim secret asli. Ini harus sukses.

Jika secret palsu diterima, PayGate mengembalikan:

```json
{
  "code": "setup_guard_missing"
}
```

Cara tes:

- `npm run test:verify-setup`

Mapping OWASP:

- OWASP API Top 10: Broken authorization/business flow.
- Business logic: payment bypass.

## PG-003 - Dependency vulnerable

Severity: High

Status: sudah diperbaiki.

File terdampak:

- `package.json`
- `package-lock.json`
- `.github/workflows/paygate-security.yml`
- `examples/express-paid-api/package.json`
- `examples/express-paid-api/package-lock.json`
- `frontend/package.json`
- `frontend/package-lock.json`

Masalah:

Audit awal menemukan vulnerability di:

- `form-data`
- `ws`
- Vite dev tooling
- Babel dev tooling

Dampak:

- Potensi DoS pada WebSocket dependency.
- Potensi file read/path traversal pada dev server tooling.
- Risiko supply chain dan dependency hygiene buruk.

Patch yang diterapkan:

- Override `form-data` ke versi aman.
- Override `ws` ke versi aman.
- Upgrade frontend tooling ke:
  - `vite` 7.3.6
  - `@vitejs/plugin-react` 5.2.0
- Refresh lockfile.
- Tambahkan GitHub Actions `dependency-audit` untuk menjalankan `npm run audit:prod` di PR dan push ke `main`.

Cara tes:

- `npm run audit:prod`
- `npm --prefix frontend audit`
- `npm run build`

Hasil:

- Root audit: 0 vulnerability.
- Backend audit: 0 vulnerability.
- Frontend audit: 0 vulnerability.
- Example app audit: 0 vulnerability.

Mapping OWASP:

- OWASP Top 10: Vulnerable and Outdated Components.

## PG-004 - Rate limiting produksi belum ada

Severity: Medium

Status: belum diperbaiki.

File terdampak:

- `backend/src/index.js`
- `vercel.json`
- `api/auth/[action].js`
- `api/pay/[apiId].js`

Masalah:

Local Express punya rate limiter:

```js
app.use('/api/', limiter);
```

Tapi production Vercel route tidak punya limiter setara.

Skenario serangan:

Attacker bisa flood:

- `/api/auth/challenge`
- `/api/pay/:apiId`
- `/api/apis/:apiId/verify`

Dampak:

- Supabase row membengkak.
- Biaya naik.
- Upstream developer bisa kena traffic tidak perlu.
- Dashboard dipenuhi noise.

Rekomendasi:

Tambahkan rate limit berbasis:

- IP address
- wallet address
- API ID
- payment ID
- route risk level

Implementasi bisa lewat:

- Vercel Firewall/WAF
- Upstash Redis
- Vercel KV
- Supabase RPC untuk counter

Cara tes:

- Kirim request melebihi limit.
- Pastikan response `429`.
- Pastikan tidak ada row baru setelah limit tercapai.

## PG-005 - Body dan upstream response belum dibatasi ukurannya

Severity: Medium

Status: belum diperbaiki.

File terdampak:

- `server/lib/body.js`
- `api/generate.js`
- `api/apis/[apiId]/verify.js`
- `api/pay/[apiId].js`

Masalah:

Request body dan upstream response dibaca penuh ke memory.

Skenario serangan:

Attacker mengirim JSON sangat besar, atau upstream malicious mengirim response sangat besar setelah payment.

Dampak:

- Memory pressure.
- Serverless function crash.
- Biaya meningkat.
- Paid call gagal atau lambat.

Rekomendasi:

Tambahkan:

- batas `Content-Length`
- max body size
- max upstream preview size
- max proxy response size atau streaming dengan limit

Contoh arah patch:

```js
export async function readJsonBody(req, { maxBytes = 64 * 1024 } = {}) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > maxBytes) {
      const error = new Error('Request body too large');
      error.statusCode = 413;
      throw error;
    }
  }
  return raw ? JSON.parse(raw) : {};
}
```

Cara tes:

- Kirim body di bawah limit. Harus sukses.
- Kirim body di atas limit. Harus `413`.
- Buat upstream response sangat besar. Harus gagal secara terkontrol.

## PG-006 - Payment dicatat dan escrow credited sebelum upstream sukses

Severity: High

Status: belum diperbaiki karena perlu keputusan produk.

File terdampak:

- `api/pay/[apiId].js`

Masalah:

Flow sekarang:

1. Payment diverifikasi.
2. Payment row dibuat.
3. Escrow di-credit.
4. Baru request diteruskan ke upstream.

Kalau upstream gagal setelah escrow credited, buyer sudah bayar tapi tidak mendapat service yang berguna.

Skenario serangan / failure:

- Upstream developer intermittent error.
- Upstream timeout.
- Upstream return 500.
- Escrow RPC error setelah payment verified.

Dampak:

- Buyer/agent bisa ter-charge tanpa hasil.
- Developer balance bisa bertambah walaupun service gagal.
- Retry dengan credential sama bisa dianggap duplicate.
- Butuh manual reconciliation.

Rekomendasi:

Harus pilih model produk:

1. Pay-for-success:
   - Credit escrow hanya setelah upstream sukses.
   - Kalau upstream gagal, refund atau pending settlement.

2. Pay-for-attempt:
   - Upstream gagal tetap billable.
   - Harus jelas di docs dan receipt.

3. Retry/reconciliation:
   - Simpan state paid-but-not-forwarded.
   - Ada worker/admin tool untuk retry.

Minimal state yang disarankan:

- `payment_verified`
- `service_pending`
- `service_failed`
- `credit_pending`
- `credited`
- `forwarded`
- `refund_pending`
- `refunded`

Cara tes:

- Payment sukses, upstream return 500.
- Payment sukses, escrow RPC gagal.
- Retry credential yang sama.
- Pastikan dashboard dan receipt menjelaskan status sebenarnya.

## PG-007 - Withdrawal submit belum validasi full transaction intent

Severity: Medium

Status: sudah diperbaiki pada Phase 5.

File terdampak:

- `api/withdraw/[action].js`
- `server/lib/escrowContract.js`
- `server/lib/registryStore.js`
- `supabase/migrations/20260628050000_paygate_withdrawal_preparations.sql`
- `frontend/src/pages/Dashboard.jsx`

Masalah:

Saat submit withdrawal, PayGate hanya cek:

```js
tx.source === expectedDeveloperWallet
```

Belum memastikan transaksi yang disubmit sama dengan transaksi yang disiapkan PayGate, atau benar-benar memanggil contract/method withdrawal yang diharapkan.

Skenario serangan:

Developer submit signed transaction lain dari wallet yang sama. PayGate bisa mengirim transaksi itu dan mencatat withdrawal, walaupun intent-nya bukan withdrawal yang disiapkan.

Dampak:

- Log withdrawal bisa salah.
- Accounting/dashboard bisa misleading.
- Reconciliation jadi sulit.

Rekomendasi:

Patch yang diterapkan:

- `prepare` membuat record `withdrawal_preparations` berisi wallet, expected transaction hash, amount, status, dan expiry.
- `submit` wajib mengirim `preparationId`.
- Server memvalidasi signed XDR terhadap wallet dan expected transaction hash sebelum klaim preparation.
- Klaim preparation bersifat conditional: hanya status `prepared` dan belum expired yang bisa lanjut.
- Submit tetap memvalidasi ulang hash sebelum mengirim transaksi ke Stellar.

Potongan patch utama:

```js
validateEscrowWithdrawalTransaction(signedTransactionXdr, walletAddress, {
  expectedTxHash: preparation.tx_hash,
});
```

Cara tes:

- Prepare withdrawal, lalu submit transaksi berbeda dari source wallet yang sama. Harus ditolak.
- Submit transaksi yang benar. Harus sukses.

## PG-008 - CSRF/origin check belum eksplisit

Severity: Medium

Status: belum diperbaiki.

File terdampak:

- `server/lib/auth.js`
- `api/auth/[action].js`
- `api/apis/index.js`
- `api/apis/[apiId].js`
- `api/apis/[apiId]/verify.js`
- `api/withdraw/[action].js`

Masalah:

Session memakai HTTP-only cookie dengan `SameSite=Lax`, ini membantu. Tapi server belum validasi `Origin` atau CSRF token untuk method state-changing seperti `POST`, `PATCH`, `DELETE`.

Skenario serangan:

Jika ada browser quirk, subdomain compromise, atau konfigurasi berubah, request state-changing bisa dipicu dari situs lain.

Dampak:

- Logout paksa.
- API bisa dihapus/archive.
- Verify setup bisa dipicu.
- Withdrawal prepare bisa dipicu.

Rekomendasi:

Tambahkan same-origin check untuk semua unsafe methods.

Contoh:

```js
export function requireSameOrigin(req, res) {
  if (!['POST', 'PATCH', 'DELETE'].includes(req.method)) return true;
  const origin = req.headers.origin;
  if (!origin || origin !== getOrigin(req)) {
    res.status(403).json({ error: 'Invalid request origin' });
    return false;
  }
  return true;
}
```

Cara tes:

- Cross-origin POST dengan session cookie valid harus `403`.
- Same-origin request dari frontend tetap sukses.

## PG-009 - Host / forwarded host terlalu dipercaya

Severity: Medium

Status: belum diperbaiki.

File terdampak:

- `server/lib/auth.js`
- `server/lib/apiRegistry.js`
- `api/pay/[apiId].js`

Masalah:

`getOrigin()` memakai:

- `x-forwarded-proto`
- `x-forwarded-host`
- `host`

Nilai ini mempengaruhi:

- domain dalam wallet challenge
- generated proxy URL
- MPP realm

Jika header bisa dipalsukan di deployment tertentu, attacker bisa mempengaruhi origin.

Dampak:

- Wallet prompt membingungkan.
- Generated proxy URL bisa salah.
- Potensi phishing atau realm mismatch.

Rekomendasi:

Tambahkan env wajib:

```env
PAYGATE_PUBLIC_ORIGIN=https://paygate.example.com
```

Di production, pakai origin ini saja. Tambahkan host allowlist.

Cara tes:

- Kirim request dengan forged `Host` dan `X-Forwarded-Host`.
- Pastikan response tetap memakai `PAYGATE_PUBLIC_ORIGIN`.

## PG-010 - Security headers belum dikonfigurasi

Severity: Low

Status: belum diperbaiki.

File terdampak:

- `vercel.json`

Masalah:

Belum ada header seperti:

- HSTS
- CSP
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- frame protection

Dampak:

- Defense-in-depth browser lebih lemah.
- Jika nanti ada XSS, dampaknya lebih besar.

Rekomendasi:

Tambahkan headers di `vercel.json`.

Contoh:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

Cara tes:

- Deploy preview.
- Cek response headers.
- Pastikan CSP tidak mematahkan Freighter atau frontend.

## PG-011 - File secret lokal ada di disk

Severity: Informational

Status: guardrail CI sudah ditambahkan pada Phase 6. File lokal tetap harus dijaga manual.

File:

- `.env.local`
- `.vercel/.env.production.local`
- `examples/express-paid-api/.env`
- `.github/workflows/paygate-security.yml`
- `scripts/secret-scan.mjs`
- `package.json`

Catatan:

Nilai secret tidak disalin ke laporan ini. File-file ini tidak tracked oleh Git, itu bagus. Tapi tetap high-value di workstation lokal.

Risiko jika bocor:

- Supabase service role bisa disalahgunakan.
- Session bisa dipalsukan jika `SESSION_SECRET` bocor.
- Upstream secret bisa didekripsi jika `API_SECRET_ENCRYPTION_KEY` bocor.
- Escrow operator bisa disalahgunakan jika `PAYGATE_OPERATOR_SECRET` bocor.

Rekomendasi:

- Pastikan tetap di `.gitignore`.
- Jangan kirim ke chat/ticket/log.
- Rotate secret jika pernah terekspos.
- Jalankan secret scanning di CI untuk setiap PR dan push ke `main`.

Patch yang diterapkan:

- Tambahkan `npm run scan:secrets`.
- Tambahkan scanner lokal untuk tracked files yang mendeteksi Stellar secret key, private key PEM, JWT/service token, dan assignment env secret literal.
- Tambahkan GitHub Actions `secret-scan`.
- Tambahkan GitHub Actions `beta-smoke` untuk smoke/build/contract test path.

Cara cek:

```sh
git ls-files .env.local .vercel/.env.production.local examples/express-paid-api/.env
npm run scan:secrets
```

Output harus kosong.

## Needs Verification

Hal-hal ini belum bisa dipastikan hanya dari static review. Perlu validasi manual/integrasi:

1. Real-mode MPP verification.
   - Pastikan library memverifikasi finality, amount, currency, recipient, external ID, dan replay protection.

2. Supabase RLS.
   - RLS sudah enabled, server pakai service role.
   - Pastikan tidak ada policy permisif di dashboard Supabase yang tidak ada di repo.

3. Escrow token backing.
   - Contract `credit_payment` admin-authenticated.
   - Perlu pastikan operasionalnya selalu reconcile dengan payment/token transfer real.

4. Vercel forwarded headers.
   - Pastikan Vercel tidak membiarkan client spoof `x-forwarded-host`.

5. Mock mode production.
   - Pastikan deployment production benar-benar `NODE_ENV=production`.
   - Pastikan env memory/mock mode tidak aktif di production.

## Patch yang Sudah Diterapkan

1. Tambah `server/lib/upstreamSecurity.js`.
2. Validasi upstream URL saat register API.
3. Validasi ulang upstream URL saat verify setup dan paid proxy forwarding.
4. Upstream fetch diberi timeout dan tidak follow redirect otomatis.
5. Setup verification sekarang negative-probe dan positive-probe.
6. Tambah `scripts/security-upstream-url-smoke.mjs`.
7. Tambah script `npm run test:security`.
8. Override dependency `form-data` dan `ws`.
9. Upgrade frontend tooling ke Vite 7.3.6.
10. Refresh lockfiles.

## Test dan Check yang Sudah Berhasil

Semua command ini berhasil:

```sh
npm run test:security
npm run test:auth
npm run test:registry
npm run test:verify-setup
npm run test:api-reset
npm run test:upstream
npm run test:proxy-unpaid
npm run test:proxy-paid
npm run test:demo-flow
npm run test:dashboard
npm run test:withdrawal
npm run audit:prod
npm --prefix frontend audit
npm run build
cd contracts && cargo test
git diff --check
```

Hasil audit dependency:

- Root: 0 vulnerability.
- Backend: 0 vulnerability.
- Frontend: 0 vulnerability.
- Example app: 0 vulnerability.

Catatan:

Saat lockfile direfresh, npm sempat memberi warning engine karena shell lokal memakai Node 20.20.2 sementara root package minta Node >=22. Build dan test tetap pass.

## Backlog Prioritas

Urutan rekomendasi berikutnya:

1. Tambahkan rate limiting produksi.
2. Putuskan semantics payment saat upstream gagal.
3. Tambahkan reconciliation job/admin tool untuk state stuck.
4. Tambahkan limit body dan upstream response.
5. Tambahkan `PAYGATE_PUBLIC_ORIGIN` dan host allowlist.
6. Tambahkan CSRF/origin check.
7. Validasi full transaction intent untuk withdrawal.
8. Tambahkan security headers dan CSP di Vercel.
9. Tambahkan secret scanning dan audit security di CI.
10. Tambahkan structured audit log untuk payment ID, API ID, wallet, state transition, dan tx hash.

## Threat Model untuk AI Agent

AI agent sebagai buyer harus dianggap:

- high-volume
- sering retry
- bisa salah konfigurasi
- bisa adversarial
- butuh status machine-readable

Abuse case agent:

- Replay credential antar API.
- Flood unpaid challenge.
- Retry paid call setelah upstream gagal.
- Mencari upstream asli untuk bypass PayGate.
- Memakai PayGate sebagai SSRF proxy.
- Memanipulasi query string untuk membebani upstream.
- Menganggap `Payment-Receipt` sebagai bukti service padahal upstream gagal.

Yang sudah cukup kuat:

- Payment credential dipetakan ke PayGate `payment_id`.
- API ID dicek terhadap proxy request.
- Duplicate payment ID dan tx hash dikunci.
- MPP replay store persisted.
- Upstream secret terenkripsi.
- Setup verification sekarang membuktikan guard benar-benar aktif.

Hal paling penting berikutnya:

State machine paid call harus dibuat eksplisit dan agent-friendly. Agent perlu tahu dengan jelas status seperti:

- paid but not forwarded
- upstream failed
- credit pending
- forwarded
- duplicate
- refund pending
- reconciled
