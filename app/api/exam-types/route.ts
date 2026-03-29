import { getDb } from '@/lib/db';
import { createExamType, getExamTypes } from '@/lib/exam-catalog';
import { requireAdmin, requireUser } from '@/lib/server-auth';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const db = await getDb();
  const examTypes = await getExamTypes(db);

  return Response.json({
    success: true,
    data: examTypes,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = (await request.json()) as { examType?: string; initialSubject?: string };
    const examType = body.examType?.trim();
    const initialSubject = body.initialSubject?.trim();

    if (!examType) {
      return Response.json({ success: false, error: 'Exam type is required' }, { status: 400 });
    }

    const db = await getDb();
    await createExamType(db, examType, initialSubject);

    return Response.json({
      success: true,
      data: { examType, initialSubject: initialSubject || null },
      message: 'Exam type created successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create exam type' },
      { status: 400 }
    );
  }
}
