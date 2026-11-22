import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

function getCredential() {
  // 1. Coba baca langsung dari file scripts/serviceAccountKey.json (Paling stabil & anti-error OpenSSL)
  const localKeyPath = path.resolve(process.cwd(), 'scripts/serviceAccountKey.json');
  try {
    if (fs.existsSync(localKeyPath) && fs.statSync(localKeyPath).size > 0) {
      const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      return cert(serviceAccount);
    }
  } catch (e) {}

  // 2. Fallback: baca dari environment variables jika di-deploy tanpa file JSON fisik
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  let key = process.env.FIREBASE_PRIVATE_KEY;

  if (email && key && !email.includes('xxxxx')) {
    let cleanKey = key.trim();
    if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
      cleanKey = cleanKey.slice(1, -1);
    }
    cleanKey = cleanKey.replace(/\\n/g, '\n');
    return cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'rinjani-clothing',
      clientEmail: email,
      privateKey: cleanKey,
    });
  }

  return null;
}

export function initFirebaseAdmin() {
  if (!getApps().length) {
    const credential = getCredential();
    if (credential) {
      initializeApp({
        credential,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'rinjani-clothing.firebasestorage.app',
      });
    } else {
      console.warn('⚠️ Firebase Admin SDK belum terkonfigurasi dengan service account yang valid.');
    }
  }
}

// Inisialisasi awal
initFirebaseAdmin();

export function getDb() {
  initFirebaseAdmin();
  return getApps().length ? getFirestore() : null;
}

export function getAdminStorage() {
  initFirebaseAdmin();
  return getApps().length ? getStorage() : null;
}

export function getAdminAuth() {
  initFirebaseAdmin();
  return getApps().length ? getAuth() : null;
}

export const adminDb = getDb();
export const adminStorage = getAdminStorage();
export const adminAuth = getAdminAuth();


