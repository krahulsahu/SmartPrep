import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
import { createTestSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { requireAdmin, requireUser } from '@/lib/server-auth';

export async function GET(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const includeQuestions = searchParams.get('includeQuestions') === 'true';
  const status = searchParams.get('status');

  const db = await getDb();
  const query: Record<string, unknown> = {};

  if (status) {
    query.status = status;
  } else if (auth.user.role !== 'admin') {
    query.status = 'published';
  }

  const tests = await db.collection(COLLECTIONS.tests).find(query).sort({ createdAt: -1 }).toArray();

  if (!includeQuestions) {
    return Response.json({
      success: true,
      data: tests.map(serializeId),
    });
  }

  const questionIds = tests.flatMap((test) => test.questionIds.map((id: string) => new ObjectId(id)));
  const questions = await db
    .collection(COLLECTIONS.questions)
    .find({ _id: { $in: questionIds } })
    .toArray();
  const questionMap = new Map(questions.map((question) => [question._id.toString(), serializeId(question)]));

  return Response.json({
    success: true,
    data: tests.map((test) => ({
      ...serializeId(test),
      questions: test.questionIds.map((questionId: string) => questionMap.get(questionId)).filter(Boolean),
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = createTestSchema.parse(await request.json());
    const db = await getDb();

    const existingQuestions = await db
      .collection(COLLECTIONS.questions)
      .countDocuments({ _id: { $in: body.questionIds.map((id) => new ObjectId(id)) } });

    if (existingQuestions !== body.questionIds.length) {
      return Response.json(
        { success: false, error: 'One or more question IDs are invalid' },
        { status: 400 }
      );
    }

    const now = new Date();
    const testDoc = {
      ...body,
      createdBy: auth.user.id,
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await db.collection(COLLECTIONS.tests).insertOne(testDoc);

    return Response.json({
      success: true,
      data: serializeId({ _id: insertResult.insertedId, ...testDoc }),
      message: 'Test created successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create test' },
      { status: 400 }
    );
  }
}
