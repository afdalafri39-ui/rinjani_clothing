# 🏔️ Rinjani Clothing

> **Modern Apparel Catalog & Custom Screen-Printing Management System**  
> Platform katalog pakaian online bergaya editorial/streetwear modern yang dilengkapi dengan fitur pemesanan langsung (*direct message checkout* via WhatsApp/Telegram) serta panel administrasi terintegrasi.

---

## 📌 Daftar Isi
- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Proyek](#-struktur-proyek)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Setup Database Supabase](#-setup-database-supabase)
- [Daftar Perintah (Scripts)](#-daftar-perintah-scripts)
- [Akses Admin](#-akses-admin)

---

## 📖 Tentang Proyek

**Rinjani Clothing** dirancang khusus untuk memenuhi kebutuhan bisnis pakaian lokal:
1. **Eksplorasi Katalog Produk**: Memudahkan calon pembeli menjelajahi berbagai varian pakaian (T-Shirt Reguler, T-Shirt Oversize, Long Sleeve) dengan pilihan 22 warna katalog interaktif.
2. **Kustomisasi & Sablon**: Halaman khusus bagi pelanggan yang ingin memesan kaos custom dengan spesifikasi sablon, jumlah, dan preferensi desain.
3. **Pemesanan Direct Messaging**: Menghubungkan pembeli langsung ke admin melalui WhatsApp atau Telegram dengan format pesan detail pesanan yang tersusun rapi secara otomatis.
4. **Dashboard Admin**: Pengelolaan katalog produk, kategori, data pesanan (produk & custom), inventaris stok, serta konfigurasi toko.

---

## ✨ Fitur Utama

### 🛍️ Sisi Pembeli (Storefront)
- **Beranda Interaktif**: Banner hero slider otomatis, kartu koleksi unggulan, dan *quick value proposition*.
- **Katalog & Pencarian**: Filter produk berdasarkan kategori, warna, harga, serta fitur pencarian cepat (*Search Overlay*).
- **Halaman Detail Produk (`/product/[slug]`)**: 
  - Galeri produk dinamis berdasarkan warna yang dipilih.
  - Pemilih ukuran (S, M, L, XL, XXL) dengan indikator stok aktual.
  - Deskripsi detail bahan, panduan ukuran (*size chart*), dan instruksi perawatan.
- **Kustomisasi Sablon (`/custom`)**: Form pemesanan custom apparel dengan pilihan model kaos, jumlah sisi sablon, ukuran cetak, dan kuantitas.
- **Keranjang Belanja (Cart Drawer)**: State belanja disimpan secara lokal (*LocalStorage*), mendukung penambahan, pengurangan, dan kalkulasi subtotal.
- **Checkout Cepat**: Tombol checkout yang langsung membuka aplikasi perpesanan (WhatsApp / Telegram) dengan rincian pesanan siap kirim.

### 🛡️ Sisi Admin (Dashboard)
- **Otentikasi Aman**: Login admin berbasis *JSON Web Token* (JWT) yang disimpan dalam *HTTP-Only Cookie* yang aman.
- **Dashboard Ringkasan**: Statistik jumlah produk, kategori aktif, dan pesanan yang masuk.
- **Manajemen Produk (CRUD)**: Tambah, edit, dan hapus produk katalog dengan upload gambar, penentuan varian warna, dan stok ukuran.
- **Manajemen Model Custom**: Mengatur template kaos atau produk yang dapat dikustomisasi pembeli.
- **Manajemen Pesanan**: Pelacakan status pesanan reguler dan pesanan sablon custom (*Pending*, *Diproses*, *Selesai*, *Dibatalkan*).
- **Notifikasi Real-time**: Lonceng notifikasi pesanan baru pada header panel admin.
- **Ekspor Laporan**: Fasilitas ekspor data pesanan ke format Spreadsheet / Excel.
- **Pengaturan Toko**: Konfigurasi nomor WhatsApp admin, username Telegram, dan informasi kontak publik.

---

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi |
|---|---|
| **Framework Frontend & Backend** | [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/) |
| **Database & Cloud Storage** | [Supabase](https://supabase.com/) (PostgreSQL & Storage Bucket) |
| **Styling** | Vanilla CSS murni dengan Design Tokens & CSS Variables |
| **Ikon** | [Lucide React](https://lucide.dev/) |
| **Otentikasi & Keamanan** | `jsonwebtoken`, `bcryptjs`, dan `cookie` |
| **Pemrosesan Gambar** | `sharp` (optimasi format WebP) & `multer` |

---

## 📂 Struktur Proyek

```text
rinjani_clothing/
├── public/                 # Aset statis (hero banner, katalog foto produk, logo)
│   ├── hero/               # Banner slideshow beranda (.webp)
│   ├── products/           # Foto produk berdasarkan varian & warna
│   └── logo-rc.svg         # Logo brand SVG
├── scripts/                # Script utilitas database, seed, dan migrasi
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (public)/       # Halaman beranda, about, contact, custom, shop, product
│   │   ├── admin/          # Panel dashboard admin & manajemen
│   │   ├── api/            # API Route Handlers (auth, products, orders, settings)
│   │   ├── globals.css     # Design tokens & styling utama
│   │   └── layout.js       # Root layout aplikasi
│   ├── components/         # Komponen UI (Header, Footer, CartDrawer, Cards, Form)
│   ├── context/            # React Context (CartContext)
│   ├── data/               # Data referensi statis (tshirt_colors.json)
│   └── lib/                # Konfigurasi Supabase, auth helper, utils
├── .env.example            # Template konfigurasi variabel lingkungan
├── package.json            # Daftar dependensi & npm scripts
└── README.md               # Dokumentasi proyek
```

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Prasyarat
Pastikan komputer Anda telah terinstal:
- **Node.js** versi 18.18 atau lebih baru
- **npm** (bawaan Node.js) atau **yarn** / **pnpm**

### 2. Kloning Repositori & Instalasi
```bash
# Masuk ke folder proyek
cd "rinjani_clothing"

# Install semua dependensi
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan nilainya dengan kredensial Supabase Anda (lihat bagian [Konfigurasi Environment](#-konfigurasi-environment)).

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser dan akses:
- **Halaman Pembeli**: [http://localhost:3000](http://localhost:3000)
- **Panel Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## ⚙️ Konfigurasi Environment

Isi file `.env.local` dengan format berikut:

```env
# URL & Public Anon Key Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Supabase Service Role Secret Key (untuk operasi admin di server)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Kunci Rahasia JWT untuk Sesi Admin
JWT_SECRET="your-super-secret-jwt-key"
```

---

## 🗄️ Setup Database Supabase

Skrip SQL lengkap untuk membuat tabel, relasi, dan data awal telah disediakan pada folder `scripts/`:

1. Buka dashboard proyek Anda di [Supabase](https://supabase.com/).
2. Masuk ke menu **SQL Editor**.
3. Buka file `scripts/supabase_migration_and_data.sql` dan jalankan (*Run*) kueri tersebut untuk membuat seluruh skema tabel:
   - `users` (admin)
   - `categories`
   - `products`
   - `product_variants`
   - `custom_models`
   - `orders` & `order_items`
   - `custom_orders`
   - `store_settings`
   - `notifications`
4. Untuk menyinkronkan data katalog tambahan atau gambar, Anda dapat menjalankan skrip pembantu:
   ```bash
   node scripts/seed.js
   ```

---

## 📜 Daftar Perintah (Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan aplikasi dalam mode pengembangan (*hot-reload*) |
| `npm run build` | Melakukan kompilasi aplikasi untuk rilis produksi |
| `npm run start` | Menjalankan aplikasi hasil *build* produksi |
| `npm run lint` | Menjalankan pemeriksaan kode dengan ESLint |

---

## 🔐 Akses Admin

Setelah database di-seed dengan skrip migrasi bawaan, Anda dapat masuk ke panel admin:
- **URL Login**: `/admin/login`
- **Email**: `admin@rinjaniclothing.com` *(atau sesuai data pada seed/users)*
- **Password**: *(sesuai konfigurasi seed)*

> 💡 **Catatan**: Selalu ganti password dan secret key `JWT_SECRET` sebelum meluncurkan aplikasi ke lingkungan produksi.

---

## 📄 Lisensi

Hak Cipta © 2026 **Rinjani Clothing**. Seluruh hak cipta dilindungi undang-undang.
