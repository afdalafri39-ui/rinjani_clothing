import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'rinjani-clothing-secret-key-change-in-production';
const TOKEN_NAME = 'rinjani_auth_token';
const TOKEN_EXPIRY = '7d';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getAuthUser(request = null) {
  // 1. Coba baca dari Authorization Header jika request disediakan
  if (request && request.headers) {
    const authHeader = typeof request.headers.get === 'function' ? request.headers.get('authorization') : request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      const verified = verifyToken(bearerToken);
      if (verified) return verified;
    }
  }

  // 2. Coba baca dari next/headers
  try {
    const headerStore = await headers();
    const authHeader = headerStore.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      const verified = verifyToken(bearerToken);
      if (verified) return verified;
    }
  } catch (e) {}

  // 3. Coba baca dari Cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (token) {
      const verified = verifyToken(token);
      if (verified) return verified;
    }
  } catch (e) {}

  return null;
}

export function setAuthCookie(response, token) {
  try {
    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
  } catch (err) {
    console.warn('⚠️ setAuthCookie error:', err?.message);
  }
  return response;
}

export function clearAuthCookie(response) {
  try {
    response.cookies.set(TOKEN_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  } catch (err) {
    console.warn('⚠️ clearAuthCookie error:', err?.message);
  }
  return response;
}

export async function requireAuth(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  return { user };
}
