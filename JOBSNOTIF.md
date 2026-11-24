# JobsNotif - CONTEXT BUAT AI, BACA INI DULU SEBELUM NGODING

## Ini web apa?
JobsNotif = Platform Smart Job Notifications.
Tagline: "Opportunities find their way to you."
Pelamar daftar minat sekali, sistem carikan loker yang cocok + kasih notif via Telegram.
Perusahaan bisa liat Candidates & posting loker.

## Tech Stack
- Next.js 16.4.6 App Router, React 19.3.0, TypeScript 5, Tailwind 4.3.3, Supabase
- Run: npm run dev --webpack

## Struktur
app/page.tsx = Landing, menu: Home, Auto Find Jobs, Candidates, See All PT
app/auto-find-jobs/page.tsx = Fitur utama pelamar
app/login/, register/, forgot-password/, reset-password/ = Auth
app/business-profile/, manager/, create-job/ = Perusahaan
app/detail/ = Detail loker
app/components/ = Komponen reusable

## API - JANGAN DIUBAH SEMBARANGAN
app/api/candidates/register/route.ts = Bikin kode link aktivasi pas daftar
app/api/telegram/webhook/route.ts = Webhook Bot Telegram

## CARA KERJA BOT TELEGRAM (DARI KODE ASLI)
- Endpoint: POST /api/telegram/webhook
- Env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET
- Security: Wajib header x-telegram-bot-api-secret-token == TELEGRAM_WEBHOOK_SECRET, kalau beda -> 401. Kalau env kosong -> 503.
- Pakai supabaseAdmin dari @/lib/supabase-admin, bukan supabase biasa.
- Log: Hanya log update_id dan command (/start atau other), jangan log isi chat.
- Kalau chatId / telegramUserId kosong -> return { ok: true } diam.
- Kalau text == "/start" -> balas: "Untuk mengaktifkan akun JobsNotif, silakan buka kembali tautan aktivasi dari halaman pendaftaran."
- Kalau text == "/start KODE" -> KODE harus regex /^[A-Za-z0-9_-]{20,64}$/, lalu di-hash sha256 pakai crypto.createHash, lalu dicocokkan ke DB. Jangan simpan kode polos.
- Kalau text bukan /start -> return { ok: true } DIAM, jangan dibalas.
- PRINSIP BOT: CUMA NOTIF & AKTIVASI, BUKAN CHATBOT, BUKAN PACAR.

## Supabase
lib/supabase.ts = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
lib/supabase-admin.ts = Client admin
JANGAN PERNAH MINTA ISI .env, JANGAN HARDCODE KEY

## Data
data/job_available.json, data/job_description_dataset.json = Dataset loker

## Navigasi
- Find Jobs -> /auto-find-jobs
- I'm Hiring -> /login

## Status
BETA, udah bisa dibuka.

## Aturan buat AI
1. Cek file yang ada sebelum bikin file baru
2. Jangan ubah AGENTS.md bawaan Next.js
3. Pakai Supabase yang udah ada di lib/
4. Jawab pake bahasa Indonesia santai
5. Bot Telegram cuma notif, jangan dibikin jadi chatbot pacar
