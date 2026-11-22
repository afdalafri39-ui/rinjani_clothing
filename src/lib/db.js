import { firestoreAdapter } from './firestoreAdapter';

// Firestore adalah database utama aplikasi Rinjani Clothing
export const db = firestoreAdapter;
export const supabase = firestoreAdapter; // alias kompatibilitas

export function isDbConfigured() {
  return true;
}
export const isSupabaseConfigured = isDbConfigured;

export function generateId(prefix = '') {
  const p = prefix ? `${prefix}_` : '';
  return `${p}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
}

export default db;
