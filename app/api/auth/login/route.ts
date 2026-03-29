import { COLLECTIONS, getDb } from '@/lib/db';
import { lockUntilFromNow } from '@/lib/auth-tokens';
import { verifyPassword } from '@/lib/password';
import { loginSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { setSessionCookie } from '@/lib/session';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const db = await getDb();

    const user = await db.collection(COLLECTIONS.users).findOne({
      email: body.email,
    });

    if (!user) {
      return Response.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
      return Response.json(
        {
          success: false,
          code: 'ACCOUNT_LOCKED',
          error: 'Too many failed login attempts. Please try again after 15 minutes.',
        },
        { status: 423 }
      );
    }

    if (typeof user.passwordHash !== 'string' || !verifyPassword(body.password, user.passwordHash)) {
      const failedLoginAttempts = Number(user.failedLoginAttempts || 0) + 1;
      const lockUntil = failedLoginAttempts >= MAX_FAILED_ATTEMPTS ? lockUntilFromNow(LOCK_MINUTES) : null;

      await db.collection(COLLECTIONS.users).updateOne(
        { _id: user._id },
        {
          $set: {
            failedLoginAttempts,
            lockUntil,
          },
        }
      );

      return Response.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.emailVerifiedAt) {
      return Response.json(
        {
          success: false,
          code: 'EMAIL_NOT_VERIFIED',
          error: 'Your email is not verified. Please verify it before logging in.',
        },
        { status: 403 }
      );
    }

    await db.collection(COLLECTIONS.users).updateOne(
      { _id: user._id },
      {
        $set: {
          lastLogin: new Date(),
          failedLoginAttempts: 0,
          lockUntil: null,
        },
      }
    );

    await setSessionCookie({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return Response.json({
      success: true,
      user: serializeId({
        ...user,
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        lockUntil: null,
      }),
      message: 'Logged in successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Login failed' },
      { status: 400 }
    );
  }
}
