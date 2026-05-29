---
title: PayGate Next Plan - Product, SOW, and Testing Playbook
aliases:
  - PayGate Next Plan
  - PayGate Product Handoff
  - PayGate Testing Playbook
tags:
  - paygate
  - product
  - sow
  - testing
  - stellar
  - mpp
  - instawards
status: active
created: 2026-04-26
updated: 2026-05-20
owner: Wildan
grant_status: accepted
grant_amount: 5000 USD in XLM
grant_program: SCF Instawards
---

# PayGate Next Plan

> [!abstract] Tujuan Dokumen
> Dokumen ini adalah handoff Obsidian untuk kamu dan agent berikutnya. Isinya menjelaskan konteks bisnis PayGate berdasarkan SOW dan status grant SCF Instawards, status produk saat ini, gap terhadap target SOW, prioritas next session, dan skenario testing detail yang harus dilakukan untuk membuktikan produk benar-benar siap demo.

Related notes:

- [[PayGate]]
- [[PayGate SOW]]
- [[TECHNICAL_SPEC]]
- [[MPP Code Generator]]
- [[Stellar Testnet]]
- [[PayGate Testing]]

## 1. Executive Summary

PayGate saat ini sudah berada di fase **accepted grant / functional alpha / POC foundation**.

Update penting per 20 Mei 2026:

- PayGate **lolos review** dan diterima untuk **Instaward sebesar $5,000 dalam XLM** melalui Stellar Ambassador program.
- Email penerimaan dari Stellar Community Fund bertanggal **14 Mei 2026**.
- Tahap administratif berikutnya adalah submit KYC, tax, dan Promotional Due Diligence sesuai instruksi SCF.
- Fokus produk sekarang harus bergeser dari "membuktikan proposal layak" menjadi "menyelesaikan deliverables, menyiapkan evidence, dan siap review akhir sprint".

Produk sudah punya:

- Landing page.
- React SPA dengan route `/`, `/generate`, `/result`, `/dashboard`.
- Backend Express stateless untuk `POST /api/generate`.
- Generated middleware dan Express integration snippet.
- Dashboard yang membaca operasi Stellar Horizon testnet berdasarkan wallet address.

Namun, jika benchmark-nya adalah dokumen SOW Instawards, produk ini **belum bisa dianggap selesai sepenuhnya** sampai kita membuktikan satu flow end-to-end:

1. Developer generate middleware dari PayGate.
2. Middleware dipasang ke sample Express API.
3. Client melakukan request ke paid endpoint.
4. MPP payment terjadi di Stellar testnet.
5. API request berhasil setelah payment.
6. Dashboard PayGate membaca transaksi USDC tersebut dari Horizon.
7. Tx hash bisa dibuka di Stellar Expert testnet explorer.

> [!important] Verdict Produk
> PayGate sudah cukup kuat sebagai fondasi POC, kira-kira 65-75% menuju grant-delivery-ready. Gap terbesar bukan UI, tapi bukti pembayaran real MPP di Stellar testnet, dashboard update dari transaksi nyata, dan evidence package untuk review Instawards.

## 2. Konteks Bisnis Dari SOW

Sumber konteks: `PayGate_SOW_Proposal.docx`.

SOW ini dibuat untuk **Instawards 30-Day Scoped Engagement**. Instawards menekankan pekerjaan yang:

- Scope-nya jelas.
- Bisa dieksekusi dalam 30 hari atau kurang.
- Menghasilkan progress nyata untuk project yang membangun di Stellar.
- Bisa diverifikasi lewat evidence seperti live URL, GitHub repo, demo video, dan tx hash.

Per official Instawards rules, program ini mendukung builder Stellar yang aktif lewat local Ambassador Chapter, dengan scope yang jelas dan sprint pendek. Progress dinilai terhadap deliverables yang sudah disepakati, bukan terhadap roadmap panjang. Funding awal umumnya berada di range `$1,000-$5,000` USD dibayar dalam XLM, dan disbursement mensyaratkan proses KYC/compliance SDF selesai.

> [!success] Grant Status
> PayGate sudah accepted untuk Instaward `$5,000` in XLM. Ini berarti project sudah melewati review awal, tapi tetap perlu delivery sprint yang rapi, KYC/compliance follow-up, demo evidence, dan dokumentasi progres.

### 2.1 Project Identity

| Field | Value |
|---|---|
| Project | PayGate |
| Sprint type | Instawards 30-day scoped engagement |
| Suggested start date | 1 May 2026 |
| Acceptance email | 14 May 2026 |
| Grant status | Accepted |
| Award amount | $5,000 in XLM |
| Ecosystem | Stellar |
| Main protocol | Machine Payments Protocol, MPP |
| Main asset | USDC on Stellar testnet |
| Primary target user | Developer yang ingin monetize Node.js API |

### 2.2 Problem Statement

Masalah utama yang ingin diselesaikan PayGate:

- Banyak developer punya API yang ingin dimonetisasi, tapi payment infrastructure biasa tidak cocok untuk micropayment.
- Stripe dan payment rails tradisional membuat transaksi kecil seperti `$0.01` per API call tidak ekonomis.
- Subscription terlalu kaku untuk use case pay-per-call.
- Marketplace seperti RapidAPI punya onboarding dan commission yang berat.
- MPP di Stellar menyelesaikan masalah ini secara protokol, tapi onboarding developer masih susah.

SOW menekankan bahwa integrasi MPP saat ini masih terasa berat karena developer harus:

- Membaca dokumentasi yang masih relatif sparse.
- Menulis boilerplate MPP sendiri.
- Memahami Stellar, USDC, Soroban/SAC, dan HTTP 402 payment flow.
- Debug protokol yang masih baru.

### 2.3 Product Objective

Objective SOW:

> Dalam 30 hari, PayGate menjadi web app yang memungkinkan developer mengintegrasikan MPP ke Node.js API dalam kurang dari 5 menit lewat form sederhana dan copy-paste generated code, plus dashboard live untuk monitor API access dan USDC earnings dari Stellar wallet.

Terjemahan product goal:

- PayGate bukan hanya landing page.
- PayGate harus menjadi tool yang bisa dipakai.
- Bukti sukses bukan "kode ada", tapi "developer bisa generate, pasang, bayar, dan lihat earnings".

## 3. Deliverable SOW

### Deliverable 1 - MPP Code Generator

SOW requirement:

- Backend menerima 3 input:
  - API endpoint URL.
  - Endpoint path yang ingin dimonetisasi.
  - Price per request dalam USDC.
- Backend menghasilkan Node.js/Express middleware siap pakai.
- Generated code menggunakan MPP via `@stellar/mpp`.
- Output harus copy-paste ready.

Business value:

- Ini core value proposition PayGate.
- Mengurangi effort integrasi MPP dari 2-4 minggu menjadi beberapa menit.

### Deliverable 2 - Website Frontend

SOW requirement:

- Web interface no-install.
- Developer isi 3 field.
- Klik Generate.
- Menerima kode siap pakai.
- Result page punya syntax highlighting dan one-click copy.

Business value:

- Menghilangkan setup friction.
- Developer tanpa pengetahuan Stellar tetap bisa mulai dari browser.

### Deliverable 3 - Monitoring Dashboard

SOW requirement:

- Dashboard terkoneksi ke Stellar wallet address.
- Menampilkan:
  - Total API requests received per endpoint.
  - Total USDC earnings.
  - Transaction history.
  - Verifiable tx hashes linked to Stellar Explorer.
- Data ditarik live dari Stellar network.

Business value:

- Membuat aktivitas payment on-chain terasa nyata.
- Membantu trust karena setiap payment bisa diverifikasi.

## 4. Grant Execution Context

### 4.1 What Changed After Acceptance

Sebelum accepted, PayGate adalah proposal + POC implementation.

Setelah accepted, PayGate harus diperlakukan sebagai **grant delivery project**:

- Scope tidak boleh melebar sembarangan.
- Semua work harus mengarah ke deliverables SOW.
- Evidence harus dikumpulkan sejak awal, bukan di akhir.
- Agent harus memprioritaskan testable product proof daripada fitur tambahan.
- KYC/compliance follow-up adalah parallel admin track yang penting untuk disbursement.

### 4.2 Admin/Compliance Checklist

- [ ] Isi form SCF untuk KYC, tax, dan Promotional Due Diligence.
- [ ] Lengkapi Airtable form.
- [ ] Lengkapi Persona form.
- [ ] Simpan bukti submit atau confirmation email.
- [ ] Catat tanggal submit dan status follow-up.

> [!warning]
> Funding accepted tidak sama dengan funding sudah cair. Berdasarkan official rules, disbursement membutuhkan KYC/compliance yang berhasil dan mengikuti written communication/project plan dari SDF.

### 4.3 Delivery Evidence Checklist

- [ ] Live URL produk.
- [ ] GitHub repository final.
- [ ] Demo video end-to-end.
- [ ] Screenshot generator/result/dashboard.
- [ ] Real Stellar testnet tx hash.
- [ ] Dashboard menunjukkan payment real.
- [ ] README dan docs menjelaskan cara menjalankan demo.
- [ ] Known limitations terdokumentasi jujur.

## 5. Current Product State

As of 2026-05-20, repo sudah punya:

### 5.1 Frontend

Files utama:

- `frontend/src/App.jsx`
- `frontend/src/pages/Landing.jsx`
- `frontend/src/pages/Generate.jsx`
- `frontend/src/pages/Result.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/components/AppNavbar.jsx`
- `frontend/src/components/CodeBlock.jsx`
- `frontend/src/colors.js`

Route yang tersedia:

| Route | Status | Fungsi |
|---|---|---|
| `/` | Ada | Landing page |
| `/generate` | Ada | Form 3 field untuk generator |
| `/result` | Ada | Menampilkan generated code |
| `/dashboard` | Ada | Monitoring wallet testnet |

Yang sudah bekerja:

- React Router sudah terpasang.
- Landing page lama sudah dipindah ke `pages/Landing.jsx`.
- Form `/generate` memanggil `/api/generate`.
- Hasil generate disimpan di `sessionStorage`.
- `/result` bisa fallback dari `sessionStorage` setelah refresh.
- `CodeBlock` punya copy button.
- Dashboard menyimpan wallet address di `localStorage`.
- Dashboard auto-refresh setiap 30 detik.

### 5.2 Backend

Files utama:

- `backend/src/index.js`
- `backend/src/routes/generate.js`
- `backend/src/validators/generate.js`
- `backend/src/templates/middleware.js`
- `backend/src/templates/integration.js`

Endpoint:

```http
POST /api/generate
```

Input:

```json
{
  "endpointUrl": "https://api.yourservice.com",
  "path": "/v1/data",
  "price": "0.01"
}
```

Output:

```json
{
  "middleware": "...generated mpp middleware...",
  "integration": "...generated express snippet..."
}
```

Yang sudah bekerja:

- Express API ada.
- CORS aktif.
- Rate limit aktif.
- Validasi Zod aktif.
- Backend stateless.
- Generated middleware pakai `mppx/express`.
- Generated middleware pakai `@stellar/mpp/charge/server`.
- Generated middleware pakai `USDC_SAC_TESTNET`.
- Generated middleware sekarang menyertakan `Store.memory()` karena `@stellar/mpp@0.5.1` mewajibkan store untuk replay protection.

### 5.3 Verification Yang Sudah Pernah Dilakukan

Sudah lolos:

- `npm run build` di frontend.
- `node --check` backend files.
- `GET /health` backend.
- `POST /api/generate` valid payload.
- `POST /api/generate` invalid payload.
- Vite proxy `/api/generate`.
- Playwright smoke test:
  - `/generate`
  - submit form
  - redirect ke `/result`
  - dashboard route render.

Belum terbukti:

- Generated middleware dipasang ke sample Express API.
- MPP client melakukan payment real.
- Tx hash real muncul.
- Dashboard membaca payment real.
- Demo video full flow.

## 6. Product Fit Against SOW

### 6.1 Deliverable 1 Assessment - Code Generator

Status: **Mostly done, but needs real integration proof.**

Yang sudah sesuai:

- 3 input sudah sesuai SOW.
- Backend generator sudah ada.
- Response menghasilkan 2 code block.
- Validasi input cukup ketat.
- Generated code sudah Express-oriented.

Gap:

- Belum dites di sample Express server real.
- Belum dites request tanpa payment menghasilkan HTTP 402.
- Belum dites request dengan payment valid lanjut ke handler.
- Belum dites `Payment-Receipt` header muncul.
- Belum ada test otomatis untuk memastikan generated string selalu mengandung bagian penting.

Product implication:

- Secara demo UI sudah bisa meyakinkan.
- Secara technical proof belum cukup untuk judge atau reviewer SOW.

### 6.2 Deliverable 2 Assessment - Website Frontend

Status: **Strong alpha.**

Yang sudah sesuai:

- Web interface sudah ada.
- Form 3 field sudah ada.
- Result page sudah ada.
- Syntax-highlighted code block sudah ada.
- Copy button sudah ada.
- Refresh `/result` masih bisa karena `sessionStorage`.

Gap:

- Belum diuji visual manual di mobile.
- Belum ada polished loading/error UX untuk semua edge case.
- Landing CTA utama masih cenderung ke GitHub, bukan langsung ke generator. Untuk product conversion, CTA "Generate Paywall" harus lebih dominan.
- README belum sepenuhnya mencerminkan produk baru.

Product implication:

- User sudah bisa memahami dan mencoba core flow.
- Untuk demo bisnis, perlu CTA dan copy yang lebih direct ke product action.

### 6.3 Deliverable 3 Assessment - Dashboard

Status: **Functional shell, data proof pending.**

Yang sudah sesuai:

- Input Stellar wallet ada.
- Validasi address ada.
- Horizon testnet fetch ada.
- Summary cards ada.
- Transaction table ada.
- Explorer link ada.
- Auto-refresh 30 detik ada.
- Empty/error/loading state ada.

Gap:

- Belum dites dengan wallet yang punya MPP payment real.
- Dashboard menghitung "Total Requests" sebagai jumlah payment masuk. Ini valid sebagai proxy untuk paid requests, tapi belum benar-benar "per endpoint".
- Tidak ada endpoint-level breakdown karena transaksi Horizon tidak otomatis tahu endpoint mana yang dimonetisasi.
- Filtering USDC hanya berdasarkan `code === 'USDC'`, sesuai POC spec, tapi tetap harus diverifikasi dengan tx real.

Product implication:

- Dashboard cukup untuk POC jika narasinya "payments received".
- Jika tetap mengklaim "requests per endpoint", kita butuh additional design: `description`, `externalId`, atau payment metadata strategy.

## 7. Key Business Gaps

### Gap 1 - End-to-End Payment Proof

Ini gap paling penting.

Business risk:

- Tanpa real payment proof, PayGate terlihat seperti code generator mockup.
- SOW meminta evidence demo video dan tx hash.

Definition of done:

- Ada sample paid API.
- Ada wallet testnet penerima.
- Ada client/payer testnet.
- Ada payment real.
- Ada tx hash real.
- Dashboard menampilkan payment tersebut.

### Gap 2 - Onboarding Developer Masih Agak Berat

PayGate ingin membantu developer tanpa blockchain knowledge.

Sekarang developer masih perlu paham:

- Stellar testnet account.
- Funding XLM.
- USDC trustline/faucet.
- Environment variable.
- MPP client flow.

Definition of done:

- Ada step-by-step setup doc.
- Ada demo server.
- Ada sample client.
- Result page memberi checklist yang jelas.
- Error yang sering muncul terdokumentasi.

### Gap 3 - Dashboard Per Endpoint Belum Nyata

SOW menyebut request count per endpoint.

Sekarang:

- Dashboard hanya tahu wallet menerima transfer USDC.
- Tidak ada metadata endpoint.

Possible decisions:

- Option A: Untuk POC, ubah copy menjadi "Total paid requests" atau "Total payments".
- Option B: Tambahkan generated middleware `description` atau `externalId` yang mencantumkan path.
- Option C: Tambahkan server-side logging, tapi ini melanggar no database jika tidak hati-hati.

Recommendation:

- Untuk sprint ini, pilih Option A plus optional `description: '${path}'` di generated charge jika API mendukung.

### Gap 4 - Evidence Package Belum Ada

SOW meminta:

- Live URL.
- GitHub repo documented.
- Demo video.
- Tx hashes.
- Evidence checklist.

Definition of done:

- Produk deployed.
- Demo script final.
- Demo video direkam.
- README updated.
- Tx hash dicatat di dokumen evidence.

## 8. Next Plan

> [!todo] Product Priority
> Jangan tambah fitur besar dulu. Fokus berikutnya adalah membuktikan satu full payment loop bekerja dari generate code sampai dashboard update.

### Phase 1 - Stabilize Generated Middleware

Goal:

- Pastikan generated code benar-benar jalan di Express sample server.

Tasks:

- [ ] Buat `examples/express-paid-api/`.
- [ ] Tambahkan sample `server.js`.
- [ ] Tambahkan sample `.env.example`.
- [ ] Tambahkan sample paid route `/v1/data`.
- [ ] Paste generated middleware ke sample app.
- [ ] Run sample app locally.
- [ ] Request endpoint tanpa payment dan pastikan keluar `402 Payment Required`.
- [ ] Catat exact response headers/body.

Output:

- Sample server yang bisa dipakai demo.
- Proof bahwa middleware tidak hanya string, tapi executable.

### Phase 2 - Build/Test MPP Client Flow

Goal:

- Simulasikan payer yang membayar endpoint.

Tasks:

- [ ] Buat atau gunakan Stellar testnet payer account.
- [ ] Fund payer account dengan XLM testnet.
- [ ] Siapkan USDC testnet untuk payer.
- [ ] Buat sample client script.
- [ ] Client request paid endpoint.
- [ ] Client membayar challenge.
- [ ] API response sukses.
- [ ] Catat tx hash.

Output:

- Tx hash real.
- API response after payment.
- Evidence bahwa MPP flow jalan.

### Phase 3 - Dashboard Real Data Validation

Goal:

- Pastikan dashboard membaca tx hash real dari wallet penerima.

Tasks:

- [ ] Input recipient wallet ke `/dashboard`.
- [ ] Pastikan total USDC bertambah.
- [ ] Pastikan total requests/payment count bertambah.
- [ ] Pastikan tx hash muncul.
- [ ] Klik tx hash dan buka Stellar Expert testnet.
- [ ] Tunggu auto-refresh 30 detik dan pastikan update tetap stabil.

Output:

- Screenshot dashboard.
- Tx hash explorer link.
- Confidence bahwa deliverable 3 bisa didemokan.

### Phase 4 - Product Polish For SOW Demo

Goal:

- Membuat demo jelas dan mudah dipahami reviewer.

Tasks:

- [ ] Ubah landing CTA utama dari "View on GitHub" menjadi "Generate Paywall" atau tambahkan CTA tersebut.
- [ ] Update README sesuai produk terbaru.
- [ ] Tambahkan setup guide untuk demo.
- [ ] Tambahkan troubleshooting section.
- [ ] Rapikan result page checklist.
- [ ] Tambahkan note bahwa dashboard saat ini menghitung payments sebagai paid requests.
- [ ] Deploy frontend/backend ke live URL.

Output:

- Produk siap dicoba reviewer.
- Demo story lebih kuat.

### Phase 5 - Evidence Package

Goal:

- Siapkan semua bukti untuk Instawards.

Tasks:

- [ ] Live URL.
- [ ] GitHub repo final.
- [ ] Demo video script.
- [ ] Demo video recording.
- [ ] Tx hash list.
- [ ] Screenshot dashboard.
- [ ] Evidence checklist.
- [ ] Grant acceptance/KYC status note.

Output:

- Submission-ready evidence.

## 9. Scenario Testing Playbook

> [!info] Cara Pakai Section Ini
> Jalankan scenario dari atas ke bawah. Jangan skip end-to-end payment test, karena itu bagian paling penting untuk validasi bisnis.

### Scenario 0 - Local Environment Sanity Check

Purpose:

- Memastikan frontend dan backend bisa jalan sebelum test fitur.

Steps:

1. Buka terminal di repo:

```bash
cd /Users/wildanniam/Development/project/paygate
```

2. Install dependency jika belum:

```bash
cd frontend
npm install
cd ../backend
npm install
```

3. Start backend:

```bash
cd /Users/wildanniam/Development/project/paygate/backend
npm run dev
```

Expected:

```text
PayGate backend running on port 3001
```

4. Start frontend di terminal lain:

```bash
cd /Users/wildanniam/Development/project/paygate/frontend
npm run dev
```

Expected:

```text
Local: http://localhost:5173/
```

Jika port 5173 dipakai, Vite akan memilih 5174/5175. Pakai URL yang muncul.

5. Health check backend:

```bash
curl http://localhost:3001/health
```

Expected:

```json
{"ok":true}
```

Pass criteria:

- Backend running.
- Frontend running.
- Health endpoint OK.

Fail indicators:

- Port 3001 sudah dipakai.
- Dependency belum terinstall.
- Node version terlalu lama.

### Scenario 1 - Backend Generate API Valid Payload

Purpose:

- Membuktikan Deliverable 1 backend generator bekerja.

Command:

```bash
curl -s -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "endpointUrl": "https://api.yourservice.com",
    "path": "/v1/data",
    "price": "0.01"
  }'
```

Expected:

- Response HTTP 200.
- JSON punya key:
  - `middleware`
  - `integration`
- `middleware` mengandung:
  - `mppx/express`
  - `@stellar/mpp/charge/server`
  - `USDC_SAC_TESTNET`
  - `STELLAR_RECIPIENT`
  - `MPP_SECRET_KEY`
  - `Store.memory()`
- `integration` mengandung path `/v1/data`.

Pass criteria:

- Response valid JSON.
- Middleware dan integration tidak kosong.
- Semua string penting ada.

### Scenario 2 - Backend Validation Errors

Purpose:

- Memastikan input buruk ditolak dengan pesan jelas.

Command:

```bash
curl -i -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "endpointUrl": "http://api.yourservice.com",
    "path": "v1/data",
    "price": "-1"
  }'
```

Expected:

- HTTP 400.
- JSON:

```json
{
  "error": "Validation failed",
  "details": {
    "endpointUrl": "Must use HTTPS",
    "path": "Must start with /",
    "price": "Minimum price is 0.0001 USDC"
  }
}
```

Pass criteria:

- Error per field muncul.
- Tidak ada server crash.

### Scenario 3 - Frontend Generate Flow

Purpose:

- Memastikan user flow web berjalan dari form ke result.

Steps:

1. Buka frontend local.
2. Masuk ke `/generate`.
3. Isi:

| Field | Value |
|---|---|
| API Endpoint URL | `https://api.yourservice.com` |
| Path to monetize | `/v1/data` |
| Price per request | `0.01` |

4. Klik `Generate Code`.

Expected:

- Redirect ke `/result`.
- Header menampilkan:
  - Path `/v1/data`.
  - Price `0.01 USDC`.
  - Endpoint `https://api.yourservice.com`.
- Ada 2 code block:
  - `mpp-middleware.js`.
  - `server.js (snippet)`.
- Copy button bekerja.

Pass criteria:

- Tidak ada console error.
- Result page muncul tanpa refresh manual.
- Generated code sesuai input.

### Scenario 4 - Result Persistence

Purpose:

- Memastikan `/result` tidak hilang saat user refresh.

Steps:

1. Selesaikan Scenario 3.
2. Saat berada di `/result`, refresh browser.

Expected:

- Result page tetap tampil.
- Code block masih ada.

Pass criteria:

- Data berhasil diambil dari `sessionStorage`.

Additional test:

1. Buka private/incognito window.
2. Masuk langsung ke `/result`.

Expected:

- Redirect ke `/generate`.

### Scenario 5 - Dashboard Address Validation

Purpose:

- Memastikan dashboard menolak address invalid.

Steps:

1. Buka `/dashboard`.
2. Isi wallet address:

```text
INVALID_ADDRESS
```

3. Klik `Load Dashboard`.

Expected:

- Muncul error:

```text
Alamat Stellar tidak valid. Harus dimulai dengan G dan 56 karakter.
```

Pass criteria:

- Tidak ada request Horizon.
- Error jelas untuk user.

### Scenario 6 - Dashboard Wallet Not Found

Purpose:

- Memastikan error Horizon 404 informatif.

Steps:

1. Generate Stellar public key testnet yang belum pernah difund.
2. Input public key tersebut ke dashboard.
3. Klik `Load Dashboard`.

Expected:

- Horizon mengembalikan 404.
- UI menampilkan:

```text
Wallet address tidak ditemukan di Stellar testnet. Pastikan account sudah difund.
```

Pass criteria:

- Error state tampil.
- App tidak crash.

### Scenario 7 - Dashboard Empty State

Purpose:

- Memastikan wallet yang ada tapi belum menerima MPP payment menampilkan empty state.

Steps:

1. Buat Stellar testnet account.
2. Fund account dengan XLM testnet.
3. Jangan kirim USDC payment ke account tersebut.
4. Input wallet ke dashboard.

Expected:

- Summary:
  - Total USDC `0 USDC`.
  - Total Requests `0`.
  - Last Payment `-`.
- Empty state:

```text
Belum ada MPP payment diterima. Generate paywall dan mulai menerima requests.
```

Pass criteria:

- Wallet valid dan loaded.
- Tidak ada transaction row palsu.

### Scenario 8 - Generated Middleware Runs In Sample Express API

Purpose:

- Membuktikan generated code executable.

Prerequisite:

- Buat folder sample, misalnya:

```bash
mkdir -p examples/express-paid-api
```

Recommended sample structure:

```text
examples/express-paid-api/
├── package.json
├── server.js
├── mpp-middleware.js
└── .env.example
```

Steps:

1. Dari PayGate `/generate`, isi:

| Field | Value |
|---|---|
| API Endpoint URL | `https://localhost:4000` atau URL tunnel HTTPS |
| Path | `/v1/data` |
| Price | `0.01` |

2. Copy generated `mpp-middleware.js`.
3. Paste ke `examples/express-paid-api/mpp-middleware.js`.
4. Buat `server.js`:

```js
import express from 'express';
import { paywall } from './mpp-middleware.js';

const app = express();

app.get('/v1/data', paywall, (req, res) => {
  res.json({ data: 'paid content' });
});

app.listen(4000, () => {
  console.log('Sample API running on http://localhost:4000');
});
```

5. Buat `.env`:

```bash
STELLAR_RECIPIENT=G_REPLACE_WITH_YOUR_TESTNET_RECIPIENT
MPP_SECRET_KEY=replace-with-random-string-at-least-32-chars
```

6. Install dependencies:

```bash
npm install express dotenv @stellar/mpp mppx @stellar/stellar-sdk
```

7. Jika pakai `.env`, pastikan `server.js` import dotenv:

```js
import 'dotenv/config';
```

8. Run server:

```bash
node server.js
```

9. Request tanpa payment:

```bash
curl -i http://localhost:4000/v1/data
```

Expected:

- HTTP `402 Payment Required`.
- Response berisi payment challenge.

Pass criteria:

- Server startup tidak crash.
- Request tanpa payment menghasilkan 402, bukan 500.

Fail indicators:

- Env var belum di-set.
- `Store.memory()` missing.
- Network identifier tidak cocok.
- Package API berubah.

### Scenario 9 - Real MPP Payment Flow

Purpose:

- Ini test paling penting untuk SOW. Membuktikan paid API benar-benar menerima payment di Stellar testnet.

Prerequisite:

- Sample API dari Scenario 8 sudah running.
- Recipient wallet sudah funded.
- Payer wallet sudah funded.
- Payer punya USDC testnet.
- Ada MPP-compatible client flow.

Steps high-level:

1. Jalankan sample paid API.
2. Jalankan MPP client dengan payer secret key.
3. Client request paid endpoint.
4. Client menerima 402 challenge.
5. Client membayar challenge.
6. Server menerima credential.
7. Server lanjut ke handler.
8. Client menerima JSON `{ data: 'paid content' }`.
9. Catat transaction hash.

Expected:

- Ada tx hash Stellar testnet.
- API response sukses setelah payment.
- Recipient wallet menerima USDC.

Pass criteria:

- Tx hash valid di Stellar Expert.
- Amount sesuai price.
- Recipient sesuai `STELLAR_RECIPIENT`.
- Payment muncul di Horizon.

> [!warning] Open Technical Work
> Scenario ini kemungkinan membutuhkan sample MPP client script. Kalau belum ada, next agent harus membuat `examples/express-paid-api/client.js` berdasarkan official `@stellar/mpp/charge/client` API.

### Scenario 10 - Dashboard Shows Real Payment

Purpose:

- Membuktikan Deliverable 3 dengan data real.

Steps:

1. Ambil recipient wallet dari Scenario 9.
2. Buka `/dashboard`.
3. Input recipient wallet.
4. Klik `Load Dashboard`.
5. Cek summary dan transaction table.

Expected:

- Total USDC bertambah.
- Total Requests atau payment count minimal 1.
- Last Payment terisi.
- Row transaksi muncul.
- Tx hash link menuju:

```text
https://stellar.expert/explorer/testnet/tx/{txHash}
```

Pass criteria:

- Tx hash sama dengan Scenario 9.
- Amount sama.
- Link explorer terbuka.
- Auto-refresh tidak menghapus data.

### Scenario 11 - Mobile Visual Sanity

Purpose:

- Memastikan frontend layak demo di mobile.

Steps:

1. Buka Chrome DevTools.
2. Toggle device toolbar.
3. Test viewport:
  - iPhone SE width.
  - iPhone 14 width.
  - iPad width.
4. Cek route:
  - `/`
  - `/generate`
  - `/result`
  - `/dashboard`

Expected:

- Tidak ada horizontal overflow.
- Code block bisa scroll horizontal.
- Navbar tidak pecah parah.
- Form tetap usable.
- Dashboard table bisa scroll horizontal.

Pass criteria:

- Semua route bisa digunakan di mobile.
- Tidak ada text overlap.

### Scenario 12 - Rate Limit

Purpose:

- Memastikan API tidak bebas spam.

Command:

```bash
for i in {1..21}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3001/api/generate \
    -H "Content-Type: application/json" \
    -d '{"endpointUrl":"https://api.yourservice.com","path":"/v1/data","price":"0.01"}'
done
```

Expected:

- Request awal HTTP 200.
- Request ke-21 dalam 1 menit terkena HTTP 429.

Pass criteria:

- 429 muncul.
- Response body:

```json
{"error":"Too many requests, please try again later."}
```

## 9. Evidence Checklist For SOW

Gunakan checklist ini sebelum menganggap project siap submit.

### Deliverable 1 Evidence

- [ ] Video generate code dari form.
- [ ] Backend source code di GitHub.
- [ ] API generate endpoint documented.
- [ ] Generated middleware includes `mppx/express`.
- [ ] Generated middleware tested in sample Express API.
- [ ] Request without payment returns 402.
- [ ] Request with payment returns API data.

### Deliverable 2 Evidence

- [ ] Live frontend URL.
- [ ] Landing page accessible.
- [ ] `/generate` accessible.
- [ ] `/result` accessible after generation.
- [ ] Copy button works.
- [ ] Refresh result page still works.
- [ ] Demo video shows full user journey.

### Deliverable 3 Evidence

- [ ] Dashboard live URL.
- [ ] Real recipient wallet tested.
- [ ] Real USDC payment shown.
- [ ] Tx hash shown in dashboard.
- [ ] Tx hash opens Stellar Expert testnet.
- [ ] Auto-refresh demonstrated or explained.
- [ ] Empty/error states tested.

### Submission Evidence

- [ ] GitHub repo link.
- [ ] Live URL.
- [ ] Demo video link.
- [ ] Tx hash list.
- [ ] README updated.
- [ ] Short explanation of POC limitations.

## 10. Recommended Demo Script

Use this script for the final video.

1. Open PayGate landing page.
2. Click `Generate Paywall`.
3. Fill:
  - `https://api.demo-paygate.com`
  - `/v1/data`
  - `0.01`
4. Click Generate.
5. Show generated middleware.
6. Click Copy.
7. Paste middleware into sample Express API.
8. Run sample Express API.
9. Make request without payment and show 402.
10. Run MPP client payment request.
11. Show successful API response.
12. Copy tx hash.
13. Open PayGate dashboard.
14. Input recipient wallet.
15. Show total USDC, total paid requests, transaction table.
16. Click Stellar Expert tx hash.
17. End by explaining:
   - No database.
   - No auth.
   - Testnet POC.
   - Node.js/Express only.
   - Next scope: multi-language/session intent/analytics.

## 11. Product Copy Recommendation

Current product promise should be careful.

Safe claim:

> Generate MPP-ready Express middleware in under 5 minutes.

Risky claim until real E2E proof:

> Start accepting USDC in under 5 minutes.

Recommended landing CTA:

- Primary: `Generate Paywall`
- Secondary: `View on GitHub`

Recommended dashboard label:

- Use `Total Paid Requests` or `Total Payments`.
- Avoid `Requests per Endpoint` until endpoint metadata is implemented.

## 12. Open Decisions For Next Agent

### Decision 1 - Dashboard "Requests" Semantics

Question:

- Should dashboard count payments as requests, or do we need endpoint-level metadata?

Recommendation:

- For POC: count successful payments as paid requests.
- Update UI copy to be explicit.

### Decision 2 - Generated Middleware Store

Current:

- Generated middleware uses `Store.memory()`.

Why:

- `@stellar/mpp@0.5.1` requires a store for charge replay protection.

Risk:

- In-memory store resets on server restart.

Recommendation:

- Keep for POC.
- Add comment that production should use Redis/Postgres-backed store if supported.

### Decision 3 - Sample Client

Question:

- Do we build a sample MPP client script now?

Recommendation:

- Yes. This is required to prove payment flow.

## 13. Next Session Prompt For Agent

Use this prompt for the next agent:

```text
Read PAYGATE_NEXT_PLAN.md, TECHNICAL_SPEC.md, AGENTS.md, and CLAUDE.md.

Your priority is not adding random features. Your priority is proving the PayGate SOW end-to-end:

1. Create a sample Express paid API using generated middleware.
2. Create or document an MPP charge client flow.
3. Execute a real Stellar testnet payment.
4. Verify tx hash in Stellar Expert.
5. Confirm PayGate dashboard reads the payment from Horizon.
6. Update README and evidence notes.

Do not add database, auth, mainnet, multi-currency, or non-Express support.
```

## 14. Final Product Readiness Score

| Area | Score | Notes |
|---|---:|---|
| Landing/product framing | 7/10 | Strong visual, CTA should shift toward Generate |
| Generator frontend | 8/10 | Functional, needs polish edge cases |
| Generator backend | 8/10 | Good foundation, needs generated code integration proof |
| Dashboard frontend | 7/10 | Good shell, needs real tx data |
| Stellar/MPP proof | 3/10 | Biggest gap |
| SOW evidence readiness | 4/10 | Need live URL, video, tx hash |

Overall:

> PayGate is a credible functional alpha. The next milestone is not more UI. The next milestone is one undeniable end-to-end Stellar testnet payment demo.
