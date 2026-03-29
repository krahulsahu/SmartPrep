import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { COLLECTIONS, getDb } from '@/lib/db';
import { getSessionFromCookie } from '@/lib/session';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: Date;
  emailVerifiedAt?: Date | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSessionFromCookie();
  if (!session) {
    return null;
  }

  const db = await getDb();
  const user = await db.collection(COLLECTIONS.users).findOne({
    _id: new ObjectId(session.userId),
  });

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user };
}

export async function requireAdmin() {
  const result = await requireUser();
  if ('error' in result) {
    return result;
  }
  if (result.user.role !== 'admin') {
    return { error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) };
  }
  return result;
}
