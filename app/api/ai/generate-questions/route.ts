import { generateQuestionsPreview, type QuestionGenerationInput } from '@/lib/ai-service';
import { getDb } from '@/lib/db';
import { aiGenerateQuestionsSchema } from '@/lib/schemas';
import { requireAdmin } from '@/lib/server-auth';

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = aiGenerateQuestionsSchema.parse(await request.json());
    const db = await getDb();
    const result = await generateQuestionsPreview(db, {
      ...body,
      createdBy: auth.user.id,
    } as QuestionGenerationInput);

    return Response.json({
      success: true,
      data: {
        questions: result.questions,
        duplicateCount: result.duplicateCount,
        batches: result.batches,
      },
      message: 'Questions generated and ready for review.',
    });
  } catch (error) {
    console.error('AI question generation failed:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 400 }
    );
  }
}
