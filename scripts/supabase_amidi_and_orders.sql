-- ====================================================================
-- RINJANI CLOTHING - SYNC DATA KE SUPABASE
-- Akun Admin: "amidi" (Password terenkripsi bcrypt)
-- Serta Data Pesanan Custom & Produk Lengkap dengan Riwayat & Bukti Pembayaran
-- 
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard -> SQL Editor
-- 2. Klik "New Query", paste seluruh isi file ini, lalu klik "Run"
-- ====================================================================

-- 1. PASTIKAN STRUKTUR TABEL & KOLOM PAYMENT HISTORY TERSEDIA
ALTER TABLE IF EXISTS "CustomOrder" ADD COLUMN IF NOT EXISTS "paymentHistory" TEXT DEFAULT '[]';
ALTER TABLE IF EXISTS "CustomOrder" ADD COLUMN IF NOT EXISTS "totalPrice" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE IF EXISTS "ProductOrder" ADD COLUMN IF NOT EXISTS "paymentHistory" TEXT DEFAULT '[]';

-- 2. SIMPAN / UPDATE AKUN ADMIN "amidi"
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt")
VALUES (
  'cmumu1sdy0000sxkst1cs7ni1',
  'Amidi Rinjani',
  'amidi@rinjani.com',
  '$2b$10$2DDef4ZcKRoc1ASM8k560.70Y3v6feodcrsCa2MnCa9D6P4SmImGa',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "email" = EXCLUDED."email",
  "passwordHash" = EXCLUDED."passwordHash",
  "role" = EXCLUDED."role",
  "updatedAt" = NOW();

-- Sinkronkan juga jika sebelumnya ada akun dengan email admin@rinjani.com
UPDATE "User"
SET "name" = 'Amidi Rinjani',
    "email" = 'amidi@rinjani.com',
    "passwordHash" = '$2b$10$2DDef4ZcKRoc1ASM8k560.70Y3v6feodcrsCa2MnCa9D6P4SmImGa',
    "updatedAt" = NOW()
WHERE "email" = 'admin@rinjani.com';

-- 3. (OPSIONAL) BUCKET STORAGE BUKTI PEMBAYARAN
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan akses publik bucket payment-proofs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access payment-proofs'
  ) THEN
    CREATE POLICY "Public Access payment-proofs" ON storage.objects
    FOR SELECT USING (bucket_id = 'payment-proofs');
  END IF;
END $$;

-- 4. INSERT / UPSERT DATA CUSTOM ORDERS DENGAN RIWAYAT & BUKTI PEMBAYARAN
INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'co_mwrj0hiorocgpyg0', 'CO-20261117-Y8X8', 'Fajar Nugraha (Komunitas Pendaki Lombok)', '081234567890', 'fajar.lombok@gmail.com',
  'T-Shirt Reguler', 'T-Shirt', 'Hitam Jetblack', '#0A0A0A', 'Cotton Combed 24s', '170–180 gsm',
  'Sablon Manual (Plastisol)', '{"S":10,"M":25,"L":30,"XL":15,"2XL":5}', 85, 5000000, 'Desain sablon depan dada kiri logo Rinjani Tracker, belakang grafis peta jalur Sembalun warna emas.', '[]',
  'PRODUKSI', 'Desain sablon depan dada kiri logo Rinjani Tracker, belakang grafis peta jalur Sembalun warna emas.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_co_0_1","date":"2026-11-17T03:39:27.022Z","method":"MANDIRI","type":"DP","amount":2500000,"referenceNumber":"Livin Mandiri Ref #88921","note":"Uang muka 50% telah diterima","createdAt":"2026-11-17T03:39:27.022Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_mandiri.svg","proofFileSize":245000}]-->', '[{"id":"pay_co_0_1","date":"2026-11-17T03:39:27.022Z","method":"MANDIRI","type":"DP","amount":2500000,"referenceNumber":"Livin Mandiri Ref #88921","note":"Uang muka 50% telah diterima","createdAt":"2026-11-17T03:39:27.022Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_mandiri.svg","proofFileSize":245000}]', '2026-11-17T03:39:27.022Z', '2026-11-17T03:39:27.022Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "customerEmail" = EXCLUDED."customerEmail",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'co_mwrj0hio0ztn9hy1', 'CO-20261113-AQSE', 'Budi Santoso (PT Sumber Makmur)', '081398765432', 'budi.santoso@makmur.co.id',
  'Polo Shirt', 'Polo', 'Navy Blue', '#1B2A4A', 'Lacoste CVC 24s', '220–230 gsm',
  'Bordir Komputer', '{"M":20,"L":20,"XL":10}', 50, 4000000, 'Seragam gathering kantor. Bordir logo perusahaan di dada kiri dan tulisan di lengan kanan.', '[]',
  'SELESAI', 'Seragam gathering kantor. Bordir logo perusahaan di dada kiri dan tulisan di lengan kanan.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_co_1_1","date":"2026-11-13T01:39:27.024Z","method":"BCA","type":"DP","amount":2000000,"referenceNumber":"Transfer BCA a/n Budi","note":"DP 50% sebelum produksi","createdAt":"2026-11-13T01:39:27.024Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000},{"id":"pay_co_1_2","date":"2026-11-13T01:39:27.024Z","method":"BCA","type":"PELUNASAN","amount":2000000,"referenceNumber":"Transfer BCA Pelunasan","note":"Pelunasan barang siap kirim","createdAt":"2026-11-13T01:39:27.024Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000}]-->', '[{"id":"pay_co_1_1","date":"2026-11-13T01:39:27.024Z","method":"BCA","type":"DP","amount":2000000,"referenceNumber":"Transfer BCA a/n Budi","note":"DP 50% sebelum produksi","createdAt":"2026-11-13T01:39:27.024Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000},{"id":"pay_co_1_2","date":"2026-11-13T01:39:27.024Z","method":"BCA","type":"PELUNASAN","amount":2000000,"referenceNumber":"Transfer BCA Pelunasan","note":"Pelunasan barang siap kirim","createdAt":"2026-11-13T01:39:27.024Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000}]', '2026-11-13T01:39:27.024Z', '2026-11-13T01:39:27.024Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "customerEmail" = EXCLUDED."customerEmail",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'co_mwrj0hio7mudoik3', 'CO-20261119-FGFV', 'Dinda Ayu Lestari (BEM Universitas)', '087788990011', 'dinda.ayulestari@student.ac.id',
  'Hoodie Jumper', 'Hoodie', 'Charcoal', '#333333', 'Cotton Fleece Heavyweight', '280–300 gsm',
  'Bordir Komputer', '{"S":10,"M":25,"L":20,"XL":5}', 60, 4200000, 'Hoodie angkatan mahasiswa baru. Bordir monogram di dada & nama divisi di punggung.', '[]',
  'DIPROSES', 'Hoodie angkatan mahasiswa baru. Bordir monogram di dada & nama divisi di punggung.
<!--PAYMENT_HISTORY_JSON:[]-->', '[]', '2026-11-19T02:39:27.024Z', '2026-11-19T02:39:27.024Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "customerEmail" = EXCLUDED."customerEmail",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'co_mwrj0hiodupwkoj4', 'CO-20261120-L0AB', 'Hendro Wijaya (Lombok Cycling Club)', '081907123456', 'hendro.cyclist@yahoo.com',
  'T-Shirt Raglan', 'T-Shirt', 'Putih Solid', '#FFFFFF', 'Cotton Combed 30s', '140–150 gsm',
  'Sablon Manual (Plastisol)', '{"M":12,"L":18,"XL":10}', 40, 2800000, 'Jersey santai gowes mingguan. Lengan warna merah marun, sablon full color di depan.', '[]',
  'MOCKUP', 'Jersey santai gowes mingguan. Lengan warna merah marun, sablon full color di depan.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_co_4_1","date":"2026-11-20T04:39:27.024Z","method":"QRIS","type":"DP","amount":1000000,"referenceNumber":"Scan QRIS Dinamis Toko","note":"Tanda jadi DP mockup & sampling","createdAt":"2026-11-20T04:39:27.024Z","proofUrl":"/uploads/payment-proofs/sample_qris_receipt.svg","proofFileName":"bukti_qris_sukses.svg","proofFileSize":198000}]-->', '[{"id":"pay_co_4_1","date":"2026-11-20T04:39:27.024Z","method":"QRIS","type":"DP","amount":1000000,"referenceNumber":"Scan QRIS Dinamis Toko","note":"Tanda jadi DP mockup & sampling","createdAt":"2026-11-20T04:39:27.024Z","proofUrl":"/uploads/payment-proofs/sample_qris_receipt.svg","proofFileName":"bukti_qris_sukses.svg","proofFileSize":198000}]', '2026-11-20T04:39:27.024Z', '2026-11-20T04:39:27.024Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "customerEmail" = EXCLUDED."customerEmail",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'co_mwrj0hipwrg421b5', 'CO-20261118-66BG', 'Siti Rahmawati (Kafe Kopi Ketinggian)', '085934567890', 'sitirahma.barista@gmail.com',
  'Kemeja Drill PDL', 'Kemeja', 'Beige Sand', '#D8C7A5', 'American Drill 1919', '210–220 gsm',
  'Bordir Komputer', '{"S":4,"M":8,"L":8,"XL":4}', 24, 5000000, 'Seragam barista & staf kitchen. Ada saku pulpen di lengan kiri.', '[]',
  'PRODUKSI', 'Seragam barista & staf kitchen. Ada saku pulpen di lengan kiri.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_co_5_1","date":"2026-11-18T00:39:27.025Z","method":"MANDIRI","type":"DP","amount":2500000,"referenceNumber":"Livin Mandiri Ref #88921","note":"Uang muka 50% telah diterima","createdAt":"2026-11-18T00:39:27.025Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_mandiri.svg","proofFileSize":245000}]-->', '[{"id":"pay_co_5_1","date":"2026-11-18T00:39:27.025Z","method":"MANDIRI","type":"DP","amount":2500000,"referenceNumber":"Livin Mandiri Ref #88921","note":"Uang muka 50% telah diterima","createdAt":"2026-11-18T00:39:27.025Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_mandiri.svg","proofFileSize":245000}]', '2026-11-18T00:39:27.025Z', '2026-11-18T00:39:27.025Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "customerEmail" = EXCLUDED."customerEmail",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'co_mwrj0hipk4nlxdh6', 'CO-20261121-35JL', 'Aris Setiawan', '081298761234', 'aris.setiawan@outlook.com',
  'T-Shirt Reguler', 'T-Shirt', 'Maroon', '#6B1D2F', 'Cotton Combed 30s', '140–150 gsm',
  'DTF (Digital Transfer Film)', '{"M":10,"L":10}', 20, 2100000, 'Kaos reuni keluarga akbar akhir tahun. Tulisan font retro warna krem.', '[]',
  'BARU', 'Kaos reuni keluarga akbar akhir tahun. Tulisan font retro warna krem.
<!--PAYMENT_HISTORY_JSON:[]-->', '[]', '2026-11-21T06:39:27.025Z', '2026-11-21T06:39:27.025Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "customerEmail" = EXCLUDED."customerEmail",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'co_mwrj0hipcx4ehws7', 'CO-20261114-C29W', 'Kevin Sanjaya (Esports Team Mataram)', '082155667788', 'kevin.esports@gmail.com',
  'Jaket Bomber', 'Jaket', 'Hitam Jetblack', '#0A0A0A', 'Taslan Milky Waterproof', '200 gsm',
  'Bordir Komputer', '{"M":6,"L":6,"XL":3}', 15, 4000000, 'Jaket official tim turnamen. Bordir emblem naga di punggung dan nickname di dada kanan.', '[]',
  'SELESAI', 'Jaket official tim turnamen. Bordir emblem naga di punggung dan nickname di dada kanan.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_co_7_1","date":"2026-11-14T03:39:27.025Z","method":"BCA","type":"DP","amount":2000000,"referenceNumber":"Transfer BCA a/n Kevin","note":"DP 50% sebelum produksi","createdAt":"2026-11-14T03:39:27.025Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000},{"id":"pay_co_7_2","date":"2026-11-14T03:39:27.025Z","method":"BCA","type":"PELUNASAN","amount":2000000,"referenceNumber":"Transfer BCA Pelunasan","note":"Pelunasan barang siap kirim","createdAt":"2026-11-14T03:39:27.025Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000}]-->', '[{"id":"pay_co_7_1","date":"2026-11-14T03:39:27.025Z","method":"BCA","type":"DP","amount":2000000,"referenceNumber":"Transfer BCA a/n Kevin","note":"DP 50% sebelum produksi","createdAt":"2026-11-14T03:39:27.025Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000},{"id":"pay_co_7_2","date":"2026-11-14T03:39:27.025Z","method":"BCA","type":"PELUNASAN","amount":2000000,"referenceNumber":"Transfer BCA Pelunasan","note":"Pelunasan barang siap kirim","createdAt":"2026-11-14T03:39:27.025Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000}]', '2026-11-14T03:39:27.025Z', '2026-11-14T03:39:27.025Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "customerEmail" = EXCLUDED."customerEmail",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'co_mwrj0his31oveme9', 'CO-20261121-6RNV', 'Dimas Anggara (Komunitas Musik Indie)', '081345670123', 'dimas.merch@soundoflombok.id',
  'T-Shirt Vintage Washed', 'T-Shirt', 'Washed Charcoal', '#2B2B2B', 'Cotton Combed 20s Washed', '190–200 gsm',
  'Sablon Discharge', '{"M":15,"L":25,"XL":10}', 50, 2800000, 'Merchandise konser amal. Efek sablon menyatu dengan serat kain (discharge).', '[]',
  'MOCKUP', 'Merchandise konser amal. Efek sablon menyatu dengan serat kain (discharge).
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_co_9_1","date":"2026-11-21T01:39:27.025Z","method":"QRIS","type":"DP","amount":1000000,"referenceNumber":"Scan QRIS Dinamis Toko","note":"Tanda jadi DP mockup & sampling","createdAt":"2026-11-21T01:39:27.025Z","proofUrl":"/uploads/payment-proofs/sample_qris_receipt.svg","proofFileName":"bukti_qris_sukses.svg","proofFileSize":198000}]-->', '[{"id":"pay_co_9_1","date":"2026-11-21T01:39:27.025Z","method":"QRIS","type":"DP","amount":1000000,"referenceNumber":"Scan QRIS Dinamis Toko","note":"Tanda jadi DP mockup & sampling","createdAt":"2026-11-21T01:39:27.025Z","proofUrl":"/uploads/payment-proofs/sample_qris_receipt.svg","proofFileName":"bukti_qris_sukses.svg","proofFileSize":198000}]', '2026-11-21T01:39:27.025Z', '2026-11-21T01:39:27.025Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "customerEmail" = EXCLUDED."customerEmail",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();


-- 5. INSERT / UPSERT DATA PRODUCT ORDERS DENGAN RIWAYAT & BUKTI PEMBAYARAN
INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0hisq955af70', 'PO-20261122-KUAN', 'Dewi Sartika', '081288776655', 'dewi.sartika@gmail.com',
  'Rinjani Mountain Tee', 'rinjani-mountain-tee', 125000, 2, 'M', 'Hitam',
  250000, 'Mohon dicek jahitan sebelum dikirim ke Jakarta Selatan.', 'BARU', 'Mohon dicek jahitan sebelum dikirim ke Jakarta Selatan.
<!--PAYMENT_HISTORY_JSON:[]-->', '[]', '2026-11-22T06:39:27.028Z', '2026-11-22T06:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0his65big831', 'PO-20261121-2S34', 'Fandi Ahmad', '085712345678', 'fandi.ahmad@yahoo.com',
  'Basecamp Hoodie', 'basecamp-hoodie', 275000, 1, 'XL', 'Charcoal',
  275000, 'Packing kado ulang tahun ya min, terima kasih.', 'DIPROSES', 'Packing kado ulang tahun ya min, terima kasih.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_po_1_1","date":"2026-11-21T03:39:27.028Z","method":"BCA","type":"LUNAS","amount":275000,"referenceNumber":"Transfer m-BCA","note":"Konfirmasi WhatsApp lunas","createdAt":"2026-11-21T03:39:27.028Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000}]-->', '[{"id":"pay_po_1_1","date":"2026-11-21T03:39:27.028Z","method":"BCA","type":"LUNAS","amount":275000,"referenceNumber":"Transfer m-BCA","note":"Konfirmasi WhatsApp lunas","createdAt":"2026-11-21T03:39:27.028Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000}]', '2026-11-21T03:39:27.028Z', '2026-11-21T03:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0his6p9szye2', 'PO-20261120-8AII', 'Intan Permata', '081955443322', 'intan.permata@gmail.com',
  'Summit Oversize Tee', 'summit-oversize-tee', 145000, 1, 'L', 'Sage Green',
  145000, 'Kirim pakai SiCepat Regular ke Surabaya.', 'DIKIRIM', 'Kirim pakai SiCepat Regular ke Surabaya.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_po_2_1","date":"2026-11-20T02:39:27.028Z","method":"DANA","type":"LUNAS","amount":145000,"referenceNumber":"TRX-DANA-SDLXV","note":"Pembayaran lunas via DANA","createdAt":"2026-11-20T02:39:27.028Z"}]-->', '[{"id":"pay_po_2_1","date":"2026-11-20T02:39:27.028Z","method":"DANA","type":"LUNAS","amount":145000,"referenceNumber":"TRX-DANA-SDLXV","note":"Pembayaran lunas via DANA","createdAt":"2026-11-20T02:39:27.028Z"}]', '2026-11-20T02:39:27.028Z', '2026-11-20T02:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0hisznebwkv3', 'PO-20261117-6JHB', 'Bayu Wibowo', '081322334455', 'bayu.wibowo88@gmail.com',
  'Wilderness Oversize', 'wilderness-oversize', 155000, 2, 'XL', 'Forest Green',
  310000, 'Barang sudah sampai tepat waktu dan kainnya tebal berkualitas. Mantap!', 'SELESAI', 'Barang sudah sampai tepat waktu dan kainnya tebal berkualitas. Mantap!
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_po_3_1","date":"2026-11-17T00:39:27.028Z","method":"MANDIRI","type":"LUNAS","amount":310000,"referenceNumber":"TRX-MANDIRI-1IMBE","note":"Pembayaran lunas via MANDIRI","createdAt":"2026-11-17T00:39:27.028Z"}]-->', '[{"id":"pay_po_3_1","date":"2026-11-17T00:39:27.028Z","method":"MANDIRI","type":"LUNAS","amount":310000,"referenceNumber":"TRX-MANDIRI-1IMBE","note":"Pembayaran lunas via MANDIRI","createdAt":"2026-11-17T00:39:27.028Z"}]', '2026-11-17T00:39:27.028Z', '2026-11-17T00:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0hisbrqec0i4', 'PO-20261115-2032', 'Anisa Cindy', '087799887766', 'anisa.cindy@outlook.com',
  'Urban Graphic Tee', 'urban-graphic-tee', 135000, 1, 'S', 'Putih',
  135000, 'Pembeli membatalkan pesanan karena salah pilih ukuran baju.', 'DIBATALKAN', 'Pembeli membatalkan pesanan karena salah pilih ukuran baju.
<!--PAYMENT_HISTORY_JSON:[]-->', '[]', '2026-11-15T22:39:27.028Z', '2026-11-15T22:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0his52axi4l5', 'PO-20261122-LDLY', 'Rizky Ramadhan', '082133445566', 'rizky.ramadhan@gmail.com',
  'Trail Long Sleeve', 'trail-long-sleeve', 165000, 1, 'L', 'Navy',
  165000, 'Alamat pengiriman Ampenan, Mataram. Tolong kirim pagi ya kak.', 'BARU', 'Alamat pengiriman Ampenan, Mataram. Tolong kirim pagi ya kak.
<!--PAYMENT_HISTORY_JSON:[]-->', '[]', '2026-11-22T04:39:27.028Z', '2026-11-22T04:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0his1aobnwu6', 'PO-20261119-FDGW', 'Galih Prakoso', '085299881122', 'galih.prakoso@gmail.com',
  'Basecamp Hoodie', 'basecamp-hoodie', 275000, 2, 'L', 'Hitam',
  550000, 'Resi JNE REG: 011230009823424', 'DIKIRIM', 'Resi JNE REG: 011230009823424
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_po_6_1","date":"2026-11-19T05:39:27.028Z","method":"QRIS","type":"LUNAS","amount":550000,"referenceNumber":"TRX-QRIS-RUCF9","note":"Pembayaran lunas via QRIS","createdAt":"2026-11-19T05:39:27.028Z","proofUrl":"/uploads/payment-proofs/sample_qris_receipt.svg","proofFileName":"bukti_qris_sukses.svg","proofFileSize":198000}]-->', '[{"id":"pay_po_6_1","date":"2026-11-19T05:39:27.028Z","method":"QRIS","type":"LUNAS","amount":550000,"referenceNumber":"TRX-QRIS-RUCF9","note":"Pembayaran lunas via QRIS","createdAt":"2026-11-19T05:39:27.028Z","proofUrl":"/uploads/payment-proofs/sample_qris_receipt.svg","proofFileName":"bukti_qris_sukses.svg","proofFileSize":198000}]', '2026-11-19T05:39:27.028Z', '2026-11-19T05:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0hisn4yysk57', 'PO-20261120-Q8S1', 'Nadia Safitri', '081277665544', 'nadia.safitri@gmail.com',
  'Rinjani Mountain Tee', 'rinjani-mountain-tee', 125000, 3, 'M', 'Abu Misty',
  375000, 'Untuk oleh-oleh pendakian Rinjani rombongan keluarga.', 'DIPROSES', 'Untuk oleh-oleh pendakian Rinjani rombongan keluarga.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_po_7_1","date":"2026-11-20T01:39:27.028Z","method":"BCA","type":"LUNAS","amount":375000,"referenceNumber":"Transfer m-BCA","note":"Konfirmasi WhatsApp lunas","createdAt":"2026-11-20T01:39:27.028Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000}]-->', '[{"id":"pay_po_7_1","date":"2026-11-20T01:39:27.028Z","method":"BCA","type":"LUNAS","amount":375000,"referenceNumber":"Transfer m-BCA","note":"Konfirmasi WhatsApp lunas","createdAt":"2026-11-20T01:39:27.028Z","proofUrl":"/uploads/payment-proofs/sample_bca_receipt.svg","proofFileName":"bukti_transfer_bca.svg","proofFileSize":245000}]', '2026-11-20T01:39:27.028Z', '2026-11-20T01:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0hiscn0fsit8', 'PO-20261116-1V44', 'Yusuf Maulana', '085611223399', 'yusuf.maulana@corp.id',
  'Summit Oversize Tee', 'summit-oversize-tee', 145000, 1, 'XXL', 'Hitam',
  145000, 'Selesai diterima via kurir instan langsung di toko.', 'SELESAI', 'Selesai diterima via kurir instan langsung di toko.
<!--PAYMENT_HISTORY_JSON:[{"id":"pay_po_8_1","date":"2026-11-16T04:39:27.028Z","method":"MANDIRI","type":"LUNAS","amount":145000,"referenceNumber":"TRX-MANDIRI-YNEP9","note":"Pembayaran lunas via MANDIRI","createdAt":"2026-11-16T04:39:27.028Z"}]-->', '[{"id":"pay_po_8_1","date":"2026-11-16T04:39:27.028Z","method":"MANDIRI","type":"LUNAS","amount":145000,"referenceNumber":"TRX-MANDIRI-YNEP9","note":"Pembayaran lunas via MANDIRI","createdAt":"2026-11-16T04:39:27.028Z"}]', '2026-11-16T04:39:27.028Z', '2026-11-16T04:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  'po_mwrj0hisvublega9', 'PO-20261121-BF0S', 'Tiara Andini', '087866554433', 'tiara.andini@gmail.com',
  'Wilderness Oversize', 'wilderness-oversize', 155000, 1, 'M', 'Beige',
  155000, 'Mohon info no resi jika sudah diserahkan ke pihak ekspedisi ya admin.', 'BARU', 'Mohon info no resi jika sudah diserahkan ke pihak ekspedisi ya admin.
<!--PAYMENT_HISTORY_JSON:[]-->', '[]', '2026-11-21T05:39:27.028Z', '2026-11-21T05:39:27.028Z'
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();

