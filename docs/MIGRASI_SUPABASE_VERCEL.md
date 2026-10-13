# Panduan Migrasi Database ke Supabase & Deploy ke Vercel (Pure Supabase SDK)

Aplikasi **Rinjani Clothing** kini telah dimigrasikan secara penuh untuk menggunakan **Supabase Client SDK (`@supabase/supabase-js`)** secara langsung, tanpa ketergantungan pada Prisma ORM.

Hal ini membuat aplikasi jauh lebih ringan, cepat, bebas dari isu binary engine serverless di Vercel, dan seluruh operasi database dijalankan melalui REST/Realtime Supabase API yang aman dan scalable.

---

## 📁 File Penting yang Disediakan

1. **`scripts/supabase_migration_and_data.sql`**: Script SQL lengkap (DDL tabel + seluruh data dummy produk, kategori, varian, model custom, pengaturan situs, user admin, dll) yang langsung siap di-run di **Supabase SQL Editor**.
2. **`scripts/db_backup_full.json`**: Cadangan lengkap seluruh data asli dalam format JSON.
3. **`src/lib/supabase.js`**: Client Supabase terpusat dan helper `generateId`.
4. **`.env.local` & `.env.example`**: Konfigurasi environment Supabase SDK.

---

## 🚀 Langkah 1: Buat Project di Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login/daftar.
2. Klik **New Project**, beri nama (misal: `rinjani-clothing`).
3. Tentukan Database Password dan pilih region (misal: *Singapore*).

---

## 📦 Langkah 2: Jalankan SQL Migration di Supabase

1. Buka dashboard Supabase project Anda -> klik menu **SQL Editor** di menu kiri.
2. Klik **New Query**.
3. Buka file [`scripts/supabase_migration_and_data.sql`](../scripts/supabase_migration_and_data.sql), copy seluruh isinya, lalu paste ke SQL Editor.
4. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
5. Selesai! Semua tabel otomatis dibuat lengkap dengan data dummy awal dan kebijakan RLS (Row Level Security).
   - Anda dapat memeriksa data di menu **Table Editor**.

---

## 🔑 Langkah 3: Konfigurasi `.env.local`

Dapatkan API credentials dari menu **Project Settings -> API** di Supabase Dashboard:

1. **Project URL**: salin ke `NEXT_PUBLIC_SUPABASE_URL`
2. **Project API keys (anon / public)**: salin ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. *(Opsional)* **service_role (secret)**: salin ke `SUPABASE_SERVICE_ROLE_KEY` (jika ingin hak akses penuh di backend tanpa batasan RLS)
4. **JWT Secret**: string rahasia untuk sesi login admin

Contoh isi `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
JWT_SECRET="rinjani-secret-key-2026-super-secure"
```

> **Catatan:** Anda tidak lagi memerlukan `DATABASE_URL` atau `DIRECT_URL` karena Prisma sudah dihapus sepenuhnya!

---

## 🌐 Langkah 4: Deploy & Pre-Testing di Vercel

1. Buka [https://vercel.com](https://vercel.com) dan hubungkan dengan akun GitHub repository Anda (`rinjani_clothing`).
2. Klik **Add New... -> Project** lalu pilih repositori `rinjani_clothing`.
3. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(opsional)*
   - `JWT_SECRET`
4. Klik **Deploy**!
   - Build script sekarang murni `next build` yang cepat dan stabil di serverless Vercel.
5. Setelah build sukses, buka URL Vercel untuk menguji:
   - Halaman Utama & Katalog Produk
   - Detail Produk & Tambah ke Keranjang
   - Form Custom Order
   - Checkout & Order tracking
   - Admin Dashboard (`/admin`)
