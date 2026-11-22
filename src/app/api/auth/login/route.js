import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { generateToken, setAuthCookie } from '@/lib/auth';

const DEFAULT_ADMIN = {
  id: 'cmumu1sdy0000sxkst1cs7ni1',
  name: 'Amidi Rinjani',
  email: 'amidi@rinjani.com',
  username: 'amidi',
  role: 'ADMIN',
  // bcrypt hash for 'amidi123'
  passwordHash: '$2b$10$2DDef4ZcKRoc1ASM8k560.70Y3v6feodcrsCa2MnCa9D6P4SmImGa',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = (body.email || body.username || '').toLowerCase().trim();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username/email dan password wajib diisi' },
        { status: 400 }
      );
    }

    let user = null;

    // 1. Coba cari di Supabase jika database terhubung
    try {
      const { data: userByEmail } = await supabase
        .from('User')
        .select('*')
        .eq('email', identifier)
        .maybeSingle();
      user = userByEmail;

      if (!user) {
        const { data: userByName } = await supabase
          .from('User')
          .select('*')
          .ilike('name', identifier)
          .maybeSingle();
        user = userByName;
      }

      if (!user && !identifier.includes('@')) {
        const { data: userByDomain } = await supabase
          .from('User')
          .select('*')
          .eq('email', `${identifier}@rinjani.com`)
          .maybeSingle();
        user = userByDomain;
      }
    } catch (dbError) {
      console.warn('Peringatan: Gagal query Supabase (database offline/belum dikonfigurasi). Menggunakan fallback admin default.', dbError?.message);
    }

    // 2. Fallback jika user belum ada di Supabase atau database belum terhubung
    const isAmidiAdmin =
      identifier === 'amidi' ||
      identifier === 'amidi@rinjani.com' ||
      identifier === 'amidi@rinjaniclothing.com' ||
      identifier === 'amidi rinjani';

    if (!user && isAmidiAdmin) {
      user = DEFAULT_ADMIN;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // 3. Verifikasi password dengan bcrypt
    let isMatch = false;
    if (user.passwordHash) {
      try {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      } catch (err) {
        console.error('Bcrypt compare error:', err);
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = generateToken(user);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat memproses login.' },
      { status: 500 }
    );
  }
}
