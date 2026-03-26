import { generateQuestions } from '@/lib/ai-service';
import { aiGenerateQuestionsSchema } from '@/lib/schemas';
import { requireAdmin } from '@/lib/server-auth';

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = aiGenerateQuestionsSchema.parse(await request.json());
    const questions = await generateQuestions(body.topic, body.difficulty, body.count);

    return Response.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 400 }
    );
  }
}
