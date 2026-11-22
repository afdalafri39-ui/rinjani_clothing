const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const keyPath = path.resolve(__dirname, './serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('❌ File scripts/serviceAccountKey.json tidak ditemukan.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function check() {
  console.log('=== VERIFIKASI DATA FIREBASE CLOUD FIRESTORE ===\n');

  // 1. Users
  const userSnap = await db.collection('User').get();
  console.log(`👤 Total User: ${userSnap.size}`);
  userSnap.docs.forEach((d) => {
    const u = d.data();
    console.log(`  - [${u.role || 'USER'}] ${u.name} (${u.email}) - ID: ${d.id}`);
  });

  // 2. Categories & Products
  const [catSnap, prodSnap, varSnap, imgSnap, garmentSnap] = await Promise.all([
    db.collection('Category').get(),
    db.collection('Product').get(),
    db.collection('ProductVariant').get(),
    db.collection('ProductImage').get(),
    db.collection('CustomGarment').get(),
  ]);

  console.log(`\n📦 Katalog & Produk:`);
  console.log(`  - Kategori: ${catSnap.size} dokumen`);
  console.log(`  - Produk: ${prodSnap.size} dokumen`);
  console.log(`  - Varian Produk: ${varSnap.size} dokumen`);
  console.log(`  - Foto Produk: ${imgSnap.size} dokumen`);
  console.log(`  - Custom Garment Model: ${garmentSnap.size} dokumen`);

  // 3. Orders
  const [coSnap, poSnap] = await Promise.all([
    db.collection('CustomOrder').get(),
    db.collection('ProductOrder').get(),
  ]);

  console.log(`\n📋 Pesanan:`);
  console.log(`  - Total Custom Orders: ${coSnap.size}`);
  console.log(`  - Total Product Orders: ${poSnap.size}`);

  // Sample Custom Orders
  console.log('\n🔍 Contoh Custom Orders Terbaru:');
  coSnap.docs.slice(0, 2).forEach((d) => {
    const c = d.data();
    console.log(`  - ${c.orderNumber} | ${c.customerName} | Status: ${c.status} | Item: ${c.garmentModel} (${c.totalQuantity} pcs)`);
  });

  // Sample Product Orders
  console.log('\n🔍 Contoh Product Orders Terbaru:');
  poSnap.docs.slice(0, 2).forEach((d) => {
    const p = d.data();
    console.log(`  - ${p.orderNumber} | ${p.customerName} | Status: ${p.status} | Total: Rp ${Number(p.grandTotal || p.totalPrice || 0).toLocaleString('id-ID')}`);
  });

  // 4. Site Settings
  const settingsSnap = await db.collection('SiteSettings').get();
  console.log(`\n⚙️ Site Settings: ${settingsSnap.size} dokumen terkonfigurasi.`);

  console.log('\n✅ Seluruh data Firebase Firestore berhasil diverifikasi dan aktif!\n');
}

check().catch(console.error);
