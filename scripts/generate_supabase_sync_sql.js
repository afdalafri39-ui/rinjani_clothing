const fs = require('fs');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function generate() {
  const cache = JSON.parse(fs.readFileSync('src/data/orders_cache.json', 'utf8'));

  let sql = `-- ====================================================================
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
`;

  cache.customOrders.forEach(o => {
    sql += `INSERT INTO "CustomOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "garmentModel", "garmentCategory", "color", "colorHex", "fabric", "fabricWeight",
  "printingMethod", "sizes", "totalQuantity", "totalPrice", "notes", "designFiles",
  "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  ${escapeSql(o.id)}, ${escapeSql(o.orderNumber)}, ${escapeSql(o.customerName)}, ${escapeSql(o.customerPhone)}, ${escapeSql(o.customerEmail)},
  ${escapeSql(o.garmentModel)}, ${escapeSql(o.garmentCategory)}, ${escapeSql(o.color)}, ${escapeSql(o.colorHex)}, ${escapeSql(o.fabric)}, ${escapeSql(o.fabricWeight)},
  ${escapeSql(o.printingMethod)}, ${escapeSql(o.sizes)}, ${o.totalQuantity || 1}, ${o.totalPrice || 0}, ${escapeSql(o.notes)}, ${escapeSql(o.designFiles || '[]')},
  ${escapeSql(o.status)}, ${escapeSql(o.adminNotes)}, ${escapeSql(o.paymentHistory || '[]')}, ${escapeSql(o.createdAt)}, ${escapeSql(o.updatedAt)}
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
\n`;
  });

  sql += `\n-- 5. INSERT / UPSERT DATA PRODUCT ORDERS DENGAN RIWAYAT & BUKTI PEMBAYARAN\n`;

  cache.productOrders.forEach(o => {
    sql += `INSERT INTO "ProductOrder" (
  "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
  "productName", "productSlug", "price", "quantity", "size", "color",
  "totalPrice", "notes", "status", "adminNotes", "paymentHistory", "createdAt", "updatedAt"
) VALUES (
  ${escapeSql(o.id)}, ${escapeSql(o.orderNumber)}, ${escapeSql(o.customerName)}, ${escapeSql(o.customerPhone)}, ${escapeSql(o.customerEmail)},
  ${escapeSql(o.productName)}, ${escapeSql(o.productSlug)}, ${o.price || 0}, ${o.quantity || 1}, ${escapeSql(o.size)}, ${escapeSql(o.color)},
  ${o.totalPrice || 0}, ${escapeSql(o.notes)}, ${escapeSql(o.status)}, ${escapeSql(o.adminNotes)}, ${escapeSql(o.paymentHistory || '[]')}, ${escapeSql(o.createdAt)}, ${escapeSql(o.updatedAt)}
) ON CONFLICT ("id") DO UPDATE SET
  "orderNumber" = EXCLUDED."orderNumber",
  "customerName" = EXCLUDED."customerName",
  "customerPhone" = EXCLUDED."customerPhone",
  "status" = EXCLUDED."status",
  "adminNotes" = EXCLUDED."adminNotes",
  "paymentHistory" = EXCLUDED."paymentHistory",
  "totalPrice" = EXCLUDED."totalPrice",
  "updatedAt" = NOW();
\n`;
  });

  fs.writeFileSync('scripts/supabase_amidi_and_orders.sql', sql, 'utf8');
  console.log('Successfully generated scripts/supabase_amidi_and_orders.sql');
}

generate();
