import { getCurrentUser } from '@/lib/server-auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    user,
  });
}
