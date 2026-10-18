import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { generateToken, setAuthCookie } from '@/lib/auth';

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

    // Try finding user by email
    let { data: user } = await supabase
      .from('User')
      .select('*')
      .eq('email', identifier)
      .maybeSingle();

    // If not found, try finding by name (username)
    if (!user) {
      const { data: userByName } = await supabase
        .from('User')
        .select('*')
        .ilike('name', identifier)
        .maybeSingle();
      user = userByName;
    }

    // If still not found and doesn't contain '@', try with default domain
    if (!user && !identifier.includes('@')) {
      const { data: userByDomain } = await supabase
        .from('User')
        .select('*')
        .eq('email', `${identifier}@rinjani.com`)
        .maybeSingle();
      user = userByDomain;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
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
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
