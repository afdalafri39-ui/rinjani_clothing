// scripts/migrate_supabase_to_firestore.js
const { createClient } = require('@supabase/supabase-js');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// 1. Baca .env.local untuk mendapatkan kredensial Supabase
let env = {};
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const k = parts[0].trim();
      const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      env[k] = v;
    }
  });
}

// 2. Baca service account Firebase
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath) || fs.statSync(serviceAccountPath).size === 0) {
  console.error('\n❌ ERROR: File "scripts/serviceAccountKey.json" masih kosong atau belum ada.');
  console.error('Silakan buka file JSON yang diunduh dari Firebase, copy seluruh isinya, dan paste ke scripts/serviceAccountKey.json lalu save.\n');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (err) {
  console.error('\n❌ ERROR: Format JSON di "scripts/serviceAccountKey.json" tidak valid:', err.message);
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const firestore = getFirestore();

// 3. Inisialisasi Supabase
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: URL atau Key Supabase tidak ditemukan di .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = [
  'User',
  'Category',
  'Product',
  'ProductImage',
  'ProductVariant',
  'CustomGarment',
  'CustomOrder',
  'ProductOrder',
  'SiteSettings',
  'Notification'
];

async function migrate() {
    console.log('🚀 Memulai migrasi data dari Supabase ke Firestore...');

    for (const table of TABLES) {
        console.log(`Mengambil data dari tabel: ${table}...`);
        const { data, error } = await supabase.from(table).select('*');

        if (error) {
            console.warn(`Gagal mengambil data tabel ${table}:`, error.message);
            continue;
        }

        if (!data || data.length === 0) {
            console.log(`Tabel ${table} kosong, lewati.`);
            continue;
        }

        // Batch per 400 dokumen (limit Firestore batch adalah 500)
        const CHUNK_SIZE = 400;
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
          const chunk = data.slice(i, i + CHUNK_SIZE);
          const batch = firestore.batch();

          chunk.forEach((row) => {
            const docId = row.id ? String(row.id) : firestore.collection(table).doc().id;
            const docRef = firestore.collection(table).doc(docId);

            // Parse JSON field jika berupa string (misal: sizes, paymentHistory)
            const formattedRow = { ...row };
            if (typeof formattedRow.paymentHistory === 'string') {
              try { formattedRow.paymentHistory = JSON.parse(formattedRow.paymentHistory); } catch (e) { }
            }
            if (typeof formattedRow.sizes === 'string') {
              try { formattedRow.sizes = JSON.parse(formattedRow.sizes); } catch (e) { }
            }
            if (typeof formattedRow.items === 'string') {
              try { formattedRow.items = JSON.parse(formattedRow.items); } catch (e) { }
            }

            batch.set(docRef, formattedRow, { merge: true });
          });

          await batch.commit();
        }
        console.log(`✅ Berhasil migrasi ${data.length} dokumen ke koleksi Firestore: ${table}`);
    }

    console.log('🎉 Migrasi data selesai!');
}

migrate().catch(console.error);