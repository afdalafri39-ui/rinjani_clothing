import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

function getCredential() {
  // 1. Coba baca dari file lokal scripts/serviceAccountKey.json jika ada
  const localKeyPath = path.resolve(process.cwd(), 'scripts/serviceAccountKey.json');
  try {
    if (fs.existsSync(localKeyPath) && fs.statSync(localKeyPath).size > 0) {
      const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      return cert(serviceAccount);
    }
  } catch (e) {}

  // 2. Baca dari environment variable FIREBASE_SERVICE_ACCOUNT_KEY atau FIREBASE_SERVICE_ACCOUNT (Sangat cocok untuk Vercel / Hosting)
  const rawServiceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawServiceAccountJson) {
    try {
      const sa = JSON.parse(rawServiceAccountJson.trim());
      return cert(sa);
    } catch (err) {
      console.warn('Gagal parse JSON dari FIREBASE_SERVICE_ACCOUNT_KEY:', err.message);
    }
  }

  // 3. Baca dari environment variable Base64 FIREBASE_SERVICE_ACCOUNT_BASE64 (Anti-error newline di cloud)
  let rawBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (rawBase64) {
    try {
      rawBase64 = rawBase64.trim();
      if (rawBase64.startsWith('"') && rawBase64.endsWith('"')) {
        rawBase64 = rawBase64.slice(1, -1);
      }
      rawBase64 = rawBase64.replace(/[\r\n\s]/g, '');
      const decoded = Buffer.from(rawBase64, 'base64').toString('utf8');
      const sa = JSON.parse(decoded);
      return cert(sa);
    } catch (err) {
      console.warn('Gagal parse Base64 FIREBASE_SERVICE_ACCOUNT_BASE64:', err.message);
    }
  }

  // 4. Baca dari FIREBASE_CLIENT_EMAIL dan FIREBASE_PRIVATE_KEY
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  let key = process.env.FIREBASE_PRIVATE_KEY;

  if (email && key && !email.includes('xxxxx')) {
    let cleanKey = key.trim();
    if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
      cleanKey = cleanKey.slice(1, -1);
    }
    cleanKey = cleanKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
    return cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'rinjani-clothing',
      clientEmail: email,
      privateKey: cleanKey,
    });
  }

  return null;
}

export function initFirebaseAdmin() {
  if (getApps().length) return;
  try {
    const credential = getCredential();
    if (credential) {
      initializeApp({
        credential,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'rinjani-clothing.firebasestorage.app',
      });
    } else {
      console.warn('⚠️ Firebase Admin SDK belum terkonfigurasi dengan service account yang valid.');
    }
  } catch (err) {
    console.warn('⚠️ Gagal inisialisasi Firebase Admin SDK:', err?.message);
  }
}

export function getDb() {
  try {
    initFirebaseAdmin();
    return getApps().length ? getFirestore() : null;
  } catch (err) {
    console.warn('⚠️ getDb error:', err?.message);
    return null;
  }
}

export function getAdminStorage() {
  try {
    initFirebaseAdmin();
    return getApps().length ? getStorage() : null;
  } catch (err) {
    console.warn('⚠️ getAdminStorage error:', err?.message);
    return null;
  }
}

export function getAdminAuth() {
  try {
    initFirebaseAdmin();
    return getApps().length ? getAuth() : null;
  } catch (err) {
    console.warn('⚠️ getAdminAuth error:', err?.message);
    return null;
  }
}

export const adminDb = null;
export const adminStorage = null;
export const adminAuth = null;


