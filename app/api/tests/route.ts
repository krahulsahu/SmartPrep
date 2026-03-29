import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
import { createTestSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { requireAdmin, requireUser } from '@/lib/server-auth';
import { buildTestQuestions } from '@/lib/test-builder';
import { isExamType, isValidSubjectForExamType } from '@/lib/exam-catalog';

export async function GET(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const includeQuestions = searchParams.get('includeQuestions') === 'true';
  const status = searchParams.get('status');
  const examType = searchParams.get('examType');

  const db = await getDb();
  const query: Record<string, unknown> = {};

  if (status) {
    query.status = status;
  } else if (auth.user.role !== 'admin') {
    query.status = 'published';
  }

  if (examType) {
    if (!(await isExamType(db, examType))) {
      return Response.json({ success: false, error: 'Invalid exam type' }, { status: 400 });
    }
    query.examType = examType;
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
    if (!(await isExamType(db, body.examType))) {
      return Response.json({ success: false, error: 'Invalid exam type' }, { status: 400 });
    }

    for (const section of body.sections) {
      if (!(await isValidSubjectForExamType(db, body.examType, section.subject))) {
        return Response.json({ success: false, error: `Invalid subject ${section.subject}` }, { status: 400 });
      }
    }

    const generated = body.skipQuestionAssignment
      ? { questionIds: [], questions: [] }
      : await buildTestQuestions(db, body.examType, body.sections);

    const now = new Date();
    const testDoc = {
      ...body,
      skipQuestionAssignment: undefined,
      questionIds: generated.questionIds,
      createdBy: auth.user.id,
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await db.collection(COLLECTIONS.tests).insertOne(testDoc);

    return Response.json({
      success: true,
      data: {
        ...serializeId({ _id: insertResult.insertedId, ...testDoc }),
        questions: generated.questions.map(serializeId),
      },
      message: 'Test created successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create test' },
      { status: 400 }
    );
  }
}
