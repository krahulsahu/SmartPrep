import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
import { createQuestionSchema, createQuestionsImportSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { requireAdmin, requireUser } from '@/lib/server-auth';
import { isExamType, isValidSubjectForExamType } from '@/lib/exam-catalog';

export async function GET(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const examType = searchParams.get('examType');
  const subject = searchParams.get('subject');
  const difficulty = searchParams.get('difficulty');

  const query: Record<string, unknown> = {};
  const db = await getDb();
  if (examType) {
    if (!(await isExamType(db, examType))) {
      return Response.json({ success: false, error: 'Invalid exam type' }, { status: 400 });
    }
    query.examType = examType;
  }
  if (subject) {
    if (!examType || !(await isValidSubjectForExamType(db, examType, subject))) {
      return Response.json({ success: false, error: 'Invalid subject for exam type' }, { status: 400 });
    }
    query.subject = subject;
  }
  if (difficulty) query.difficulty = difficulty;

  const questions = await db.collection(COLLECTIONS.questions).find(query).sort({ createdAt: -1 }).toArray();

  return Response.json({
    success: true,
    data: questions.map(serializeId),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const db = await getDb();
    const payload = Array.isArray(body?.questions)
      ? createQuestionsImportSchema.parse(body).questions
      : [createQuestionSchema.parse(body)];

    for (const question of payload) {
      if (!(await isExamType(db, question.examType))) {
        return Response.json({ success: false, error: `Invalid exam type: ${question.examType}` }, { status: 400 });
      }

      if (!(await isValidSubjectForExamType(db, question.examType, question.subject))) {
        return Response.json(
          { success: false, error: `Invalid subject ${question.subject} for exam type ${question.examType}` },
          { status: 400 }
        );
      }
    }
    const now = new Date();

    const result = await db.collection(COLLECTIONS.questions).insertMany(
      payload.map((question) => ({
        ...question,
        createdBy: auth.user.id,
        createdAt: now,
        updatedAt: now,
      }))
    );

    const ids = Object.values(result.insertedIds);
    const created = await db.collection(COLLECTIONS.questions).find({
      _id: { $in: ids },
    }).toArray();

    return Response.json({
      success: true,
      data: created.map(serializeId),
      message: payload.length > 1 ? 'Questions imported successfully' : 'Question created successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create question' },
      { status: 400 }
    );
  }
}
