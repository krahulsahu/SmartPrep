import { COLLECTIONS, getDb } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/auth-email';
import { createPasswordResetTokenRecord } from '@/lib/auth-tokens';
import { forgotPasswordSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = forgotPasswordSchema.parse(await request.json());
    const db = await getDb();
    const user = await db.collection(COLLECTIONS.users).findOne({ email: body.email });

    if (user) {
      const reset = createPasswordResetTokenRecord();
      await db.collection(COLLECTIONS.users).updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetTokenHash: reset.tokenHash,
            passwordResetTokenExpiresAt: reset.expiresAt,
          },
        }
      );

      await sendPasswordResetEmail(body.email, reset.token);
    }

    return Response.json({
      success: true,
      message: 'If this email exists, a password reset link has been sent.',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to start password reset' },
      { status: 400 }
    );
  }
}
