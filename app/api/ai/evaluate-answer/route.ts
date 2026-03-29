import { ObjectId } from 'mongodb';
import { evaluateAnswer } from '@/lib/ai-service';
import { COLLECTIONS, getDb } from '@/lib/db';
import { requireUser } from '@/lib/server-auth';
import { Question } from '@/lib/types';

export async function POST(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { questionId, studentAnswer } = body;

    if (!questionId || typeof studentAnswer !== 'string') {
      return Response.json(
        { success: false, error: 'questionId and studentAnswer are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const question = await db.collection(COLLECTIONS.questions).findOne({
      _id: new ObjectId(questionId),
    });

    if (!question) {
      return Response.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    const result = await evaluateAnswer(
      ({
        ...question,
        id: question._id.toString(),
      } as unknown) as Question,
      studentAnswer
    );

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to evaluate answer' },
      { status: 400 }
    );
  }
}
