# Panduan Setup Vercel WAF untuk PayGate

Tanggal: 2026-06-28

Domain produksi PayGate: `trypaygate.com`

## Ringkasan Rekomendasi

Vercel Firewall/WAF tetap direkomendasikan untuk PayGate, tetapi gunakan sebagai lapisan edge protection, bukan pengganti rate limit aplikasi Upstash yang sudah ada.

Baseline yang disarankan:

1. Aktifkan Firewall observability dan pantau traffic dulu.
2. Tambahkan custom rules yang jelas aman: block scanner path, block method aneh, dan rate limit endpoint berisiko.
3. Pakai Bot Protection dan AI Bots dalam mode `Log` dulu.
4. Jangan aktifkan challenge global permanen untuk `/api/pay/*`, karena AI agents dan CLI clients adalah traffic legitimate.
5. Gunakan Attack Mode hanya saat serangan aktif, bukan default harian.
6. Jika plan mendukung OWASP Core Ruleset, mulai dari `Log`, lalu naikkan rule berisiko tinggi ke `Deny` setelah tidak ada false positive.

Referensi resmi:

- Vercel Firewall overview: https://vercel.com/docs/vercel-firewall
- WAF rate limiting: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- WAF managed rulesets: https://vercel.com/docs/vercel-firewall/vercel-waf/managed-rulesets
- Attack Mode: https://vercel.com/docs/vercel-firewall/attack-challenge-mode

## Fakta Ketersediaan

Berdasarkan dokumentasi Vercel per Juni 2026:

- DDoS mitigation tersedia otomatis di semua plan.
- Vercel WAF tersedia di semua plan.
- WAF Rate Limiting tersedia di semua plan, tetapi ada pricing/limit rules.
- Bot Protection dan AI Bots managed ruleset tersedia di semua plan.
- OWASP Core Ruleset tersedia di Enterprise plan.
- Attack Mode tersedia di semua plan.

Artinya: untuk PayGate sekarang, WAF memang tersedia, tetapi beberapa fitur advanced atau kapasitas rules bergantung plan.

## Trust Boundary PayGate

Jangan treat semua bot/non-browser sebagai jahat.

Traffic legitimate PayGate mencakup:

- Browser user dashboard.
- Wallet/Freighter auth flow.
- AI agents atau CLI clients yang memanggil `/api/pay/:apiId`.
- Monitoring probes milik sendiri.

Traffic mencurigakan:

- Probe WordPress/PHP/admin panel.
- Flood ke `/api/auth/challenge` dan `/api/auth/verify`.
- Flood unpaid ke `/api/pay/:apiId`.
- Repeated paid credential retry yang tidak valid.
- Scanner path seperti `.env`, `.git`, `wp-login.php`, `xmlrpc.php`, `phpmyadmin`.

## Rollout Aman

### Phase A - Observability

Di Vercel Dashboard:

1. Buka project PayGate.
2. Buka `Firewall`.
3. Cek live traffic untuk domain `trypaygate.com`.
4. Catat:
   - IP/ASN dengan request tinggi.
   - Path yang sering 404.
   - User-Agent AI agent/CLI legitimate.
   - Negara/region traffic utama.

Jalankan minimal 24 jam sebelum rule agresif jika traffic beta sudah aktif.

### Phase B - Custom Rules Aman

Tambahkan rule berikut dalam mode `Deny` karena kecil kemungkinan false positive.

#### 1. Block Scanner Paths

Kondisi:

- `path` regex:

```text
^/(wp-login\.php|xmlrpc\.php|wp-admin|wp-content|phpmyadmin|adminer|\.env|\.git)(/|$)
```

Action:

- `Deny`

Alasan:

- PayGate bukan WordPress/PHP app.
- Request ke path ini hampir pasti scanner.

#### 2. Block Dangerous Methods

Kondisi:

- `method` in:

```text
TRACE, TRACK, CONNECT, PUT
```

Action:

- `Deny`

Catatan:

- PayGate saat ini memakai `GET`, `POST`, `PATCH`, dan `DELETE`.
- Jangan block `OPTIONS` karena browser/CORS/preflight bisa membutuhkannya.

### Phase C - Edge Rate Limits

Rate limit aplikasi Upstash tetap menjadi kontrol utama karena bisa memakai wallet/API/payment key. WAF rate limit hanya kontrol luar berbasis IP/edge.

Mulai dari mode `Log` selama 24 jam, lalu `Deny` kalau tidak ada false positive.

| Rule | Path | Method | Limit awal | Action awal | Action final |
| --- | --- | --- | --- | --- | --- |
| Auth challenge | `/api/auth/challenge` | `POST` | 30/min/IP | Log | Deny atau Challenge |
| Auth verify | `/api/auth/verify` | `POST` | 30/min/IP | Log | Deny atau Challenge |
| API verify setup | `/api/apis/*/verify` | `POST` | 20/min/IP | Log | Deny |
| Withdrawal | `/api/withdraw/*` | `POST` | 20/min/IP | Log | Deny |
| Paid proxy | `/api/pay/*` | `GET` | 120/min/IP | Log | Deny |
| API mutations | `/api/apis*` | `POST/PATCH/DELETE` | 60/min/IP | Log | Deny |

Catatan untuk `/api/pay/*`:

- Jangan terlalu rendah. AI agents bisa retry dan parallelize.
- Jika ada partner/agent resmi dengan traffic tinggi, naikkan limit atau buat allow/bypass rule yang spesifik.
- App-level limiter tetap lebih presisi karena memakai `paymentId`, `apiId`, wallet, dan IP.

### Phase D - Managed Rulesets

#### Bot Protection

Rekomendasi awal:

- Set ke `Log`.
- Monitor traffic legitimate AI agent/CLI.
- Jangan langsung `Challenge` global sebelum tahu user-agent dan pola traffic buyer.

Naik ke `Challenge` hanya kalau:

- False positive rendah.
- `/api/pay/*` agent clients tetap lolos, atau ada bypass khusus.

#### AI Bots

Rekomendasi awal:

- Set ke `Log`.

Jangan langsung `Deny`, karena PayGate justru menargetkan AI agents sebagai buyer. Kalau ingin block crawler AI untuk marketing pages, buat rule yang scoped ke page publik, bukan paid API.

#### OWASP Core Ruleset

Jika Enterprise tersedia:

1. Aktifkan dalam mode `Log`.
2. Monitor false positive di:
   - `/api/pay/*`
   - `/api/apis/*/verify`
   - dashboard auth flow
3. Naikkan ke `Deny` untuk rule risiko tinggi setelah aman:
   - SQLi
   - XSS
   - RCE
   - LFI/RFI
4. Tetap hati-hati dengan generic rules di API endpoint yang menerima URL/path.

### Phase E - Attack Mode

Gunakan Attack Mode hanya saat:

- Ada targeted DDoS/app-layer attack.
- Traffic tidak normal dan custom rules belum cukup.
- Dashboard/user browser sedang lebih penting daripada non-browser API clients.

Jangan dijadikan default permanen, karena standalone API clients dan automated services yang tidak dikenali bisa gagal melewati challenge.

## Cara Testing Setelah Publish

Ganti `<apiId>` dengan API test milik sendiri.

### Paid API tetap bisa memberi challenge MPP

```sh
curl -i https://trypaygate.com/api/pay/<apiId>
```

Ekspektasi:

- HTTP `402`.
- Ada payment challenge.
- Tidak terkena browser challenge.

### Scanner path diblok

```sh
curl -i https://trypaygate.com/wp-login.php
curl -i https://trypaygate.com/.env
```

Ekspektasi:

- HTTP `403` atau mitigated response dari Vercel.

### Auth rate limit bekerja

```sh
for i in $(seq 1 40); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://trypaygate.com/api/auth/challenge \
    -H "Content-Type: application/json" \
    -d '{"walletAddress":"GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"}'
done
```

Ekspektasi:

- Request awal boleh gagal validasi app-level.
- Setelah threshold WAF, response menjadi `429`, `403`, atau challenge sesuai action.

## Runbook Saat Diserang

1. Buka Vercel `Firewall` live traffic.
2. Identifikasi path, IP, ASN, country, user-agent, JA3/JA4 fingerprint.
3. Jika path jelas malicious, tambahkan `Deny` custom rule.
4. Jika flood satu endpoint, turunkan WAF rate limit sementara.
5. Jika serangan luas, aktifkan Attack Mode sementara.
6. Pastikan `/api/pay/*` masih bisa dipakai agent legitimate.
7. Setelah stabil, review event log dan turunkan rule agresif yang berisiko false positive.

## Yang Jangan Dilakukan

- Jangan challenge semua `curl`/non-browser traffic secara global.
- Jangan deny semua AI bots secara global sebelum memisahkan crawler dari buyer agent.
- Jangan bypass IP besar/cloud provider secara luas.
- Jangan menyimpan `VERCEL_TOKEN` di repo.
- Jangan menghapus Upstash app-level limiter hanya karena WAF sudah aktif.

## Status Implementasi

Yang sudah di-code di repo:

- Upstash app-level rate limit.
- Same-origin checks untuk write routes.
- Body/upstream response limits.
- Security headers dasar di `vercel.json`.
- CI secret scan dan dependency audit.

Yang masih manual di Vercel Dashboard:

- Publish WAF custom rules.
- Aktifkan managed rulesets dalam mode yang aman.
- Review traffic dan tune false positive.
- Optional: OWASP Core Ruleset jika plan mendukung.
