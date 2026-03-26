import { getDbStatus } from '@/lib/db';

export async function GET() {
  const status = await getDbStatus();
  return Response.json({
    success: status.connected,
    data: status,
  });
}
