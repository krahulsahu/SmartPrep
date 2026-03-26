import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
import { createTestSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { requireAdmin, requireUser } from '@/lib/server-auth';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const db = await getDb();
  const test = await db.collection(COLLECTIONS.tests).findOne({ _id: new ObjectId(id) });

  if (!test) {
    return Response.json({ success: false, error: 'Test not found' }, { status: 404 });
  }

  if (auth.user.role !== 'admin' && test.status !== 'published') {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const questions = await db
    .collection(COLLECTIONS.questions)
    .find({ _id: { $in: test.questionIds.map((questionId: string) => new ObjectId(questionId)) } })
    .toArray();

  return Response.json({
    success: true,
    data: {
      ...serializeId(test),
      questions: questions.map(serializeId),
    },
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    const body = createTestSchema.partial().parse(await request.json());
    const db = await getDb();

    await db.collection(COLLECTIONS.tests).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    const updated = await db.collection(COLLECTIONS.tests).findOne({ _id: new ObjectId(id) });
    return Response.json({
      success: true,
      data: updated ? serializeId(updated) : null,
      message: 'Test updated successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update test' },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const db = await getDb();
  await db.collection(COLLECTIONS.tests).deleteOne({ _id: new ObjectId(id) });

  return Response.json({
    success: true,
    message: 'Test deleted successfully',
  });
}
