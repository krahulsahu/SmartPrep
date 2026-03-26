import { COLLECTIONS, getDb } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { registerSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { setSessionCookie } from '@/lib/session';

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
    const insertResult = await db.collection(COLLECTIONS.users).insertOne({
      name: body.name,
      email: body.email,
      passwordHash: hashPassword(body.password),
      role: 'student',
      createdAt: now,
      lastLogin: now,
    });

    const user = {
      _id: insertResult.insertedId,
      name: body.name,
      email: body.email,
      role: 'student' as const,
      createdAt: now,
      lastLogin: now,
    };

    await setSessionCookie({
      userId: insertResult.insertedId.toString(),
      role: 'student',
      email: body.email,
      name: body.name,
    });

    return Response.json({
      success: true,
      user: serializeId(user),
      message: 'Account created successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
