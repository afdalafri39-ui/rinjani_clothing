import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

function getCredential() {
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const key = process.env.FIREBASE_PRIVATE_KEY;

  if (email && key && !email.includes('xxxxx')) {
    return cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: email,
      privateKey: key.replace(/\\n/g, '\n'),
    });
  }

  // Fallback: baca dari file scripts/serviceAccountKey.json jika env belum diisi
  const localKeyPath = path.resolve(process.cwd(), 'scripts/serviceAccountKey.json');
  if (fs.existsSync(localKeyPath) && fs.statSync(localKeyPath).size > 0) {
    const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
    return cert(serviceAccount);
  }

  return null;
}

if (!getApps().length) {
  const credential = getCredential();
  if (credential) {
    initializeApp({
      credential,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    console.warn('⚠️ Firebase Admin SDK belum terkonfigurasi dengan service account yang valid.');
  }
}

export const adminDb = getApps().length ? getFirestore() : null;
export const adminStorage = getApps().length ? getStorage() : null;
export const adminAuth = getApps().length ? getAuth() : null;

