import { getDb } from '@/lib/db';
import { createSubject, getSubjectsForExamType } from '@/lib/exam-catalog';
import { requireAdmin, requireUser } from '@/lib/server-auth';

export async function GET(_: Request, context: { params: Promise<{ examType: string }> }) {
  const auth = await requireUser();
  if ('error' in auth) {
    return auth.error;
  }

  const { examType } = await context.params;
  const db = await getDb();
  const subjects = await getSubjectsForExamType(db, examType);

  if (!subjects) {
    return Response.json({ success: false, error: 'Invalid exam type' }, { status: 400 });
  }

  return Response.json({
    success: true,
    data: {
      examType,
      subjects,
    },
  });
}

export async function POST(request: Request, context: { params: Promise<{ examType: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { examType } = await context.params;
    const body = (await request.json()) as { subject?: string };
    const subject = body.subject?.trim();

    if (!subject) {
      return Response.json({ success: false, error: 'Subject is required' }, { status: 400 });
    }

    const db = await getDb();
    await createSubject(db, examType, subject);
    const subjects = await getSubjectsForExamType(db, examType);

    return Response.json({
      success: true,
      data: {
        examType,
        subjects,
      },
      message: 'Subject created successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create subject' },
      { status: 400 }
    );
  }
}
