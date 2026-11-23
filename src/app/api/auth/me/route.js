import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

// TIDAK ada import supabase/db/firebase di top-level.
// Route ini hanya butuh JWT verification, tidak perlu database.

export async function GET(request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // authUser dari token JWT sudah memegang identitas valid yang dienkripsi
    const user = {
      id: authUser.id,
      name: authUser.name || 'Amidi Rinjani',
      email: authUser.email || 'amidi@rinjani.com',
      role: authUser.role || 'ADMIN',
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
