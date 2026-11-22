const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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

async function sync() {
  console.log('--- Memulai Sinkronisasi Data ke Firebase Firestore ---');
  console.log('Target Project ID:', serviceAccount.project_id);

  // 1. Cek & Update Akun Admin Amidi
  const newHash = '$2b$10$2DDef4ZcKRoc1ASM8k560.70Y3v6feodcrsCa2MnCa9D6P4SmImGa';
  const userRef = db.collection('User').doc('cmumu1sdy0000sxkst1cs7ni1');
  await userRef.set(
    {
      id: 'cmumu1sdy0000sxkst1cs7ni1',
      name: 'Amidi Rinjani',
      email: 'amidi@rinjani.com',
      passwordHash: newHash,
      role: 'ADMIN',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log('✅ Akun Admin "amidi" berhasil disinkronkan di Firestore!');

  // 2. Baca orders_cache.json
  const cachePath = path.resolve(__dirname, '../src/data/orders_cache.json');
  if (fs.existsSync(cachePath)) {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

    // 3. Upload Custom Orders
    if (cache.customOrders && cache.customOrders.length > 0) {
      const batch = db.batch();
      cache.customOrders.forEach((o) => {
        const docRef = db.collection('CustomOrder').doc(String(o.id));
        const formatted = { ...o };
        if (typeof formatted.paymentHistory === 'string') {
          try { formatted.paymentHistory = JSON.parse(formatted.paymentHistory); } catch (e) {}
        }
        if (typeof formatted.sizes === 'string') {
          try { formatted.sizes = JSON.parse(formatted.sizes); } catch (e) {}
        }
        batch.set(docRef, formatted, { merge: true });
      });
      await batch.commit();
      console.log(`✅ Berhasil menyinkronkan ${cache.customOrders.length} data CustomOrder ke Firestore!`);
    }

    // 4. Upload Product Orders
    if (cache.productOrders && cache.productOrders.length > 0) {
      const batch = db.batch();
      cache.productOrders.forEach((o) => {
        const docRef = db.collection('ProductOrder').doc(String(o.id));
        const formatted = { ...o };
        if (typeof formatted.paymentHistory === 'string') {
          try { formatted.paymentHistory = JSON.parse(formatted.paymentHistory); } catch (e) {}
        }
        if (typeof formatted.items === 'string') {
          try { formatted.items = JSON.parse(formatted.items); } catch (e) {}
        }
        batch.set(docRef, formatted, { merge: true });
      });
      await batch.commit();
      console.log(`✅ Berhasil menyinkronkan ${cache.productOrders.length} data ProductOrder ke Firestore!`);
    }
  }

  console.log('--- Selesai Sync ke Firebase Firestore ---');
}

sync().catch((err) => {
  console.error('Sync failed:', err);
});
