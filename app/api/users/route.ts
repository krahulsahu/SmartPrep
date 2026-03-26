import { COLLECTIONS, getDb } from '@/lib/db';
import { serializeId } from '@/lib/serializers';
import { requireAdmin } from '@/lib/server-auth';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  const db = await getDb();
  const users = await db.collection(COLLECTIONS.users).find({}).sort({ createdAt: -1 }).toArray();

  return Response.json({
    success: true,
    data: users.map((user) =>
      serializeId({
        ...user,
        passwordHash: undefined,
      })
    ),
  });
}
