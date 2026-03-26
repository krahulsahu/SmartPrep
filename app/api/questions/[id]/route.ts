import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
import { createQuestionSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { requireAdmin, requireUser } from '@/lib/server-auth';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const db = await getDb();
  const question = await db.collection(COLLECTIONS.questions).findOne({ _id: new ObjectId(id) });

  if (!question) {
    return Response.json({ success: false, error: 'Question not found' }, { status: 404 });
  }

  return Response.json({
    success: true,
    data: serializeId(question),
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    const body = createQuestionSchema.partial().parse(await request.json());
    const db = await getDb();

    await db.collection(COLLECTIONS.questions).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    const updated = await db.collection(COLLECTIONS.questions).findOne({ _id: new ObjectId(id) });
    return Response.json({
      success: true,
      data: updated ? serializeId(updated) : null,
      message: 'Question updated successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update question' },
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
  await db.collection(COLLECTIONS.questions).deleteOne({ _id: new ObjectId(id) });

  return Response.json({
    success: true,
    message: 'Question deleted successfully',
  });
}
