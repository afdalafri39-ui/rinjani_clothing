import { createClient } from '@supabase/supabase-js';
import { firestoreAdapter } from './firestoreAdapter';

const databaseDriver = process.env.DATABASE_DRIVER || 'firestore';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !url.includes('[YOUR-PROJECT-REF]');
  } catch {
    return false;
  }
}

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://dummy-project.supabase.co';
const supabaseKey = (rawKey && !rawKey.includes('your-')) ? rawKey : 'dummy-anon-key-placeholder';

const rawSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function isSupabaseConfigured() {
  if (databaseDriver === 'firestore') {
    return true;
  }
  return isValidUrl(rawUrl) && !rawUrl.includes('dummy-project.supabase.co') && Boolean(rawKey && !rawKey.includes('dummy-') && !rawKey.includes('your-'));
}

// Gunakan Firestore sebagai driver utama, atau Supabase jika DATABASE_DRIVER='supabase'
export const supabase = databaseDriver === 'firestore' ? firestoreAdapter : rawSupabase;

export function generateId(prefix = '') {
  const p = prefix ? `${prefix}_` : '';
  return `${p}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
}

