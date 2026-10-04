import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'rinjani-clothing-secret-key-change-in-production';
const TOKEN_NAME = 'rinjani_auth_token';
const TOKEN_EXPIRY = '7d';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(response, token) {
  response.cookies.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  return response;
}

export function clearAuthCookie(response) {
  response.cookies.set(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export async function requireAuth(request) {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }
  const user = verifyToken(token);
  if (!user) {
    return { error: 'Invalid token', status: 401 };
  }
  return { user };
}
