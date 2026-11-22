-- ====================================================================
-- RINJANI CLOTHING - SQL MIGRATION FOR PAYMENT HISTORY (RIWAYAT PEMBAYARAN)
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Tambahkan kolom paymentHistory pada tabel CustomOrder (jika belum ada)
ALTER TABLE IF EXISTS "CustomOrder"
ADD COLUMN IF NOT EXISTS "paymentHistory" TEXT DEFAULT '[]';

-- 2. Tambahkan kolom totalPrice pada tabel CustomOrder (opsional untuk menyimpan nilai kesepakatan)
ALTER TABLE IF EXISTS "CustomOrder"
ADD COLUMN IF NOT EXISTS "totalPrice" DOUBLE PRECISION DEFAULT 0;

-- 3. Tambahkan kolom paymentHistory pada tabel ProductOrder (jika belum ada)
ALTER TABLE IF EXISTS "ProductOrder"
ADD COLUMN IF NOT EXISTS "paymentHistory" TEXT DEFAULT '[]';

-- Penjelasan Struktur Data JSON paymentHistory:
-- [
--   {
--     "id": "pay_123abc",
--     "date": "2026-11-22T14:30:00.000Z",
--     "method": "BCA",             -- BCA, MANDIRI, BRI, BNI, BSI, QRIS, DANA, GOPAY, SHOPEEPAY, TUNAI, COD, dll.
--     "customMethodName": null,    -- Nama kustom jika metode adalah BANK_LAIN / LAINNYA
--     "type": "LUNAS",             -- LUNAS, DP, PELUNASAN, TERMIN
--     "amount": 250000,            -- Nominal dalam Rupiah
--     "referenceNumber": "a/n Budi Santoso", -- No. Referensi atau nama pengirim
--     "note": "Transfer via m-BCA",-- Catatan admin
--     "proofUrl": "https://.../bukti_transfer.jpg", -- URL screenshot bukti transfer (Supabase Storage / local)
--     "proofFileName": "bukti_bca_budi.jpg",        -- Nama file asli
--     "proofFileSize": 245000,                      -- Ukuran file dalam bytes
--     "createdAt": "2026-11-22T14:30:00.000Z"
--   }
-- ]

-- 4. (Opsional) Buat Bucket Supabase Storage untuk Bukti Pembayaran:
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('payment-proofs', 'payment-proofs', true)
-- ON CONFLICT (id) DO NOTHING;
