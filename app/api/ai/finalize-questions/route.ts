import { finalizeQuestionsForTest } from '@/lib/ai-service';
import { getDb } from '@/lib/db';
import { aiFinalizeQuestionsSchema } from '@/lib/schemas';
import { requireAdmin } from '@/lib/server-auth';

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = aiFinalizeQuestionsSchema.parse(await request.json());
    const db = await getDb();
    const result = await finalizeQuestionsForTest(db, {
      ...body,
      createdBy: auth.user.id,
    });

    return Response.json({
      success: true,
      data: result,
      message: 'Selected questions were added to the target test.',
    });
  } catch (error) {
    console.error('AI question finalization failed:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to finalize questions' },
      { status: 400 }
    );
  }
}
