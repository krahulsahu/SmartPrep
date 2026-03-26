import { COLLECTIONS, getDb } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { loginSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { setSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const db = await getDb();

    const user = await db.collection(COLLECTIONS.users).findOne({
      email: body.email,
    });

    if (!user || typeof user.passwordHash !== 'string' || !verifyPassword(body.password, user.passwordHash)) {
      return Response.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    await db.collection(COLLECTIONS.users).updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
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
