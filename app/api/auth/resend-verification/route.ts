import { COLLECTIONS, getDb } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/auth-email';
import { createVerificationTokenRecord } from '@/lib/auth-tokens';
import { resendVerificationSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = resendVerificationSchema.parse(await request.json());
    const db = await getDb();
    const user = await db.collection(COLLECTIONS.users).findOne({ email: body.email });

    if (!user) {
      return Response.json({
        success: true,
        message: 'If this email exists, a verification email has been sent.',
      });
    }

    if (user.emailVerifiedAt) {
      return Response.json({
        success: true,
        message: 'This account is already verified.',
      });
    }

    const verification = createVerificationTokenRecord();
    await db.collection(COLLECTIONS.users).updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerificationTokenHash: verification.tokenHash,
          emailVerificationTokenExpiresAt: verification.expiresAt,
        },
      }
    );

    await sendVerificationEmail(body.email, verification.token);

    return Response.json({
      success: true,
      message: 'If this email exists, a verification email has been sent.',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to resend verification email' },
      { status: 400 }
    );
  }
}
