import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  department: string | null;
}

export function signToken(userId: string, email: string, role: string, department: string | null): string {
  return jwt.sign(
    { userId, email, role, department },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function createAuthCookie(token: string) {
  return {
    name: 'nyayasetu_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 86400,
  };
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('nyayasetu_token')?.value ?? null;
}

export async function requireAuth(): Promise<JwtPayload & { user: any }> {
  const token = await getAuthCookie();
  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  const decoded = verifyToken(token);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  return { ...decoded, user };
}

export function requireRole(allowedRoles: string[]) {
  return async (auth: JwtPayload & { user: any }) => {
    if (!allowedRoles.includes(auth.role)) {
      throw new Error('Forbidden: Insufficient permissions');
    }
    return auth;
  };
}
