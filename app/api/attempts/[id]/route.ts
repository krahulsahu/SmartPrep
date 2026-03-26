import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
import { serializeId } from '@/lib/serializers';
import { requireUser } from '@/lib/server-auth';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const db = await getDb();
  const attempt = await db.collection(COLLECTIONS.attempts).findOne({
    _id: new ObjectId(id),
  });

  if (!attempt) {
    return Response.json({ success: false, error: 'Attempt not found' }, { status: 404 });
  }

  if (auth.user.role !== 'admin' && attempt.userId !== auth.user.id) {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const test = await db.collection(COLLECTIONS.tests).findOne({
    _id: new ObjectId(attempt.testId),
  });

  const questions = test
    ? await db
        .collection(COLLECTIONS.questions)
        .find({ _id: { $in: test.questionIds.map((questionId: string) => new ObjectId(questionId)) } })
        .toArray()
    : [];

  return Response.json({
    success: true,
    data: {
      ...serializeId(attempt),
      test: test ? serializeId(test) : null,
      questions: questions.map(serializeId),
    },
  });
}
