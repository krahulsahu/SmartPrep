import { generateFeedback } from '@/lib/ai-service';
import { requireUser } from '@/lib/server-auth';

export async function POST(request: Request) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { studentAnswers, topicArea } = body;

    if (!studentAnswers || !topicArea) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const feedback = await generateFeedback(studentAnswers, topicArea);

    return Response.json({
      success: true,
      data: { feedback },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
