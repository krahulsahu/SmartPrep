import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
import { createAttemptSchema } from '@/lib/schemas';
import { serializeId } from '@/lib/serializers';
import { requireUser } from '@/lib/server-auth';

function answersMatch(correctAnswer: string | string[], answer: string | string[]) {
  if (Array.isArray(correctAnswer) && Array.isArray(answer)) {
    return JSON.stringify([...correctAnswer].sort()) === JSON.stringify([...answer].sort());
  }
  return String(correctAnswer).trim().toLowerCase() === String(answer).trim().toLowerCase();
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const testId = searchParams.get('testId');
  const db = await getDb();

  const query: Record<string, unknown> = {};
  if (auth.user.role !== 'admin') {
    query.userId = auth.user.id;
  }
  if (testId) {
    query.testId = testId;
  }

  const attempts = await db
    .collection(COLLECTIONS.attempts)
    .find(query)
    .sort({ submittedAt: -1 })
    .toArray();

  return Response.json({
    success: true,
    data: attempts.map(serializeId),
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = createAttemptSchema.parse(await request.json());
    const db = await getDb();

    const test = await db.collection(COLLECTIONS.tests).findOne({
      _id: new ObjectId(body.testId),
    });

    if (!test) {
      return Response.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    if (auth.user.role !== 'admin' && test.status !== 'published') {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const questions = await db
      .collection(COLLECTIONS.questions)
      .find({ _id: { $in: test.questionIds.map((id: string) => new ObjectId(id)) } })
      .toArray();

    const questionMap = new Map(questions.map((question) => [question._id.toString(), question]));
    const correctAnswers = body.answers.filter((answer) => {
      const question = questionMap.get(answer.questionId);
      return question && answersMatch(question.correctAnswer, answer.answer);
    }).length;

    const percentage = test.questionIds.length
      ? Math.round((correctAnswers / test.questionIds.length) * 100)
      : 0;

    const now = new Date();
    const attemptDoc = {
      testId: body.testId,
      userId: auth.user.id,
      answers: body.answers,
      score: correctAnswers,
      percentage,
      status: 'graded',
      startedAt: now,
      submittedAt: now,
      timeSpent: body.timeSpent,
      feedback:
        percentage >= test.passingScore
          ? 'Great job! You passed the test.'
          : 'You did not reach the passing score. Review the explanations and try again.',
    };

    const insertResult = await db.collection(COLLECTIONS.attempts).insertOne(attemptDoc);

    return Response.json({
      success: true,
      data: serializeId({
        _id: insertResult.insertedId,
        ...attemptDoc,
      }),
      message: 'Attempt saved successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save attempt' },
      { status: 400 }
    );
  }
}
