import { COLLECTIONS, getDb } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/auth-email';
import { createVerificationTokenRecord } from '@/lib/auth-tokens';
import { hashPassword } from '@/lib/password';
import { registerSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const db = await getDb();

    const existingUser = await db.collection(COLLECTIONS.users).findOne({
      email: body.email,
    });

    if (existingUser) {
      return Response.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const now = new Date();
    const verification = createVerificationTokenRecord();
    const insertResult = await db.collection(COLLECTIONS.users).insertOne({
      name: body.name,
      email: body.email,
      passwordHash: hashPassword(body.password),
      role: 'student',
      createdAt: now,
      lastLogin: null,
      emailVerifiedAt: null,
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationTokenExpiresAt: verification.expiresAt,
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    const user = {
      _id: insertResult.insertedId,
      name: body.name,
      email: body.email,
      role: 'student' as const,
      createdAt: now,
      lastLogin: null,
      emailVerifiedAt: null,
    };

    await sendVerificationEmail(body.email, verification.token);

    return Response.json({
      success: true,
      user: serializeId(user),
      message: 'Account created. Please verify your email before logging in.',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
