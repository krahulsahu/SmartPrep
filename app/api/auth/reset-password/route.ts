import { COLLECTIONS, getDb } from '@/lib/db';
import { hashAuthToken } from '@/lib/auth-tokens';
import { hashPassword } from '@/lib/password';
import { resetPasswordSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = resetPasswordSchema.parse(await request.json());
    const db = await getDb();
    const user = await db.collection(COLLECTIONS.users).findOne({
      passwordResetTokenHash: hashAuthToken(body.token),
    });

    if (!user || !user.passwordResetTokenExpiresAt || new Date(user.passwordResetTokenExpiresAt).getTime() < Date.now()) {
      return Response.json(
        { success: false, error: 'Password reset link is invalid or expired.' },
        { status: 400 }
      );
    }

    await db.collection(COLLECTIONS.users).updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: hashPassword(body.password),
          failedLoginAttempts: 0,
          lockUntil: null,
        },
        $unset: {
          passwordResetTokenHash: '',
          passwordResetTokenExpiresAt: '',
        },
      }
    );

    return Response.json({
      success: true,
      message: 'Password reset successfully. You can now sign in.',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to reset password' },
      { status: 400 }
    );
  }
}
