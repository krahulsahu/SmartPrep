import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
import { serializeId } from '@/lib/serializers';
import { requireUser } from '@/lib/server-auth';

export async function GET(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const userIdParam = searchParams.get('userId');
  const userId = auth.user.role === 'admin' && userIdParam ? userIdParam : auth.user.id;

  try {
    const db = await getDb();
    const attempts = await db
      .collection(COLLECTIONS.attempts)
      .find({ userId })
      .sort({ submittedAt: -1 })
      .toArray();

    const tests = await db.collection(COLLECTIONS.tests).find({
      _id: { $in: attempts.map((attempt) => new ObjectId(attempt.testId)) },
    }).toArray();
    const testsById = new Map(tests.map((test) => [test._id.toString(), test]));

    const categories = new Map<
      string,
      { totalQuestions: number; correctAnswers: number; tests: number; scores: number[] }
    >();

    for (const attempt of attempts) {
      const test = testsById.get(attempt.testId);
      if (!test) continue;
      const entry = categories.get(test.category) || {
        totalQuestions: 0,
        correctAnswers: 0,
        tests: 0,
        scores: [],
      };
      entry.totalQuestions += attempt.answers.length;
      entry.correctAnswers += attempt.score || 0;
      entry.tests += 1;
      entry.scores.push(attempt.percentage || 0);
      categories.set(test.category, entry);
    }

    const categoryPerformance = [...categories.entries()].map(([categoryName, value]) => ({
      categoryName,
      score: value.scores.length
        ? Math.round(value.scores.reduce((sum, score) => sum + score, 0) / value.scores.length)
        : 0,
      totalQuestions: value.totalQuestions,
      correctAnswers: value.correctAnswers,
      accuracy: value.totalQuestions ? Math.round((value.correctAnswers / value.totalQuestions) * 100) : 0,
    }));

    const progressTrend = attempts
      .slice()
      .reverse()
      .map((attempt) => ({
        date: attempt.submittedAt || attempt.startedAt,
        score: attempt.percentage || 0,
        testId: attempt.testId,
      }));

    return Response.json({
      success: true,
      data: {
        userId,
        totalTestsTaken: attempts.length,
        averageScore: attempts.length
          ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / attempts.length)
          : 0,
        totalTimeSpent: attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0),
        categoryPerformance,
        recentAttempts: attempts.map(serializeId),
        progressTrend,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 400 }
    );
  }
}
