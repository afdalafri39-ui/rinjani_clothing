// Firebase Admin SDK — FULLY LAZY
// Semua import firebase-admin dilakukan secara dynamic agar module ini
// tidak crash saat di-import oleh route lain pada Vercel serverless.

import fs from 'fs';
import path from 'path';

let _app = null;
let _db = null;
let _storage = null;
let _auth = null;
let _initAttempted = false;

function getCredential(cert) {
  // 1. Coba baca dari file lokal scripts/serviceAccountKey.json jika ada
  try {
    const localKeyPath = path.resolve(process.cwd(), 'scripts/serviceAccountKey.json');
    if (fs.existsSync(localKeyPath) && fs.statSync(localKeyPath).size > 0) {
      const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      return cert(serviceAccount);
    }
  } catch (e) {}

  // 2. Baca dari environment variable FIREBASE_SERVICE_ACCOUNT_KEY atau FIREBASE_SERVICE_ACCOUNT
  const rawServiceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawServiceAccountJson) {
    try {
      const sa = JSON.parse(rawServiceAccountJson.trim());
      return cert(sa);
    } catch (err) {
      console.warn('Gagal parse JSON dari FIREBASE_SERVICE_ACCOUNT_KEY:', err.message);
    }
  }

  // 3. Baca dari environment variable Base64 FIREBASE_SERVICE_ACCOUNT_BASE64
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

async function ensureInit() {
  if (_app) return _app;
  if (_initAttempted) return _app;
  _initAttempted = true;

  try {
    // Dynamic import — firebase-admin hanya dimuat di sini, bukan di top-level
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');

    if (getApps().length) {
      _app = getApps()[0];
      return _app;
    }

    const credential = getCredential(cert);
    if (credential) {
      _app = initializeApp({
        credential,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'rinjani-clothing.firebasestorage.app',
      });
    } else {
      console.warn('⚠️ Firebase Admin SDK belum terkonfigurasi dengan service account yang valid.');
    }
  } catch (err) {
    console.warn('⚠️ Gagal inisialisasi Firebase Admin SDK:', err?.message);
  }
  return _app;
}

export async function getDb() {
  try {
    await ensureInit();
    if (!_app) return null;
    if (!_db) {
      const { getFirestore } = await import('firebase-admin/firestore');
      _db = getFirestore();
    }
    return _db;
  } catch (err) {
    console.warn('⚠️ getDb error:', err?.message);
    return null;
  }
}

export async function getAdminStorage() {
  try {
    await ensureInit();
    if (!_app) return null;
    if (!_storage) {
      const { getStorage } = await import('firebase-admin/storage');
      _storage = getStorage();
    }
    return _storage;
  } catch (err) {
    console.warn('⚠️ getAdminStorage error:', err?.message);
    return null;
  }
}

export async function getAdminAuth() {
  try {
    await ensureInit();
    if (!_app) return null;
    if (!_auth) {
      const { getAuth } = await import('firebase-admin/auth');
      _auth = getAuth();
    }
    return _auth;
  } catch (err) {
    console.warn('⚠️ getAdminAuth error:', err?.message);
    return null;
  }
}

// Lazy getters — backward compatibility (semua kini async, jadi ini selalu null placeholder)
export const adminDb = null;
export const adminStorage = null;
export const adminAuth = null;

// Legacy sync exports — untuk kompatibilitas, re-export initFirebaseAdmin sebagai no-op
export function initFirebaseAdmin() {
  // No-op — initialization now happens lazily via ensureInit()
}
