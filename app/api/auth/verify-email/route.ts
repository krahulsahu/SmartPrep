import { COLLECTIONS, getDb } from '@/lib/db';
import { hashAuthToken } from '@/lib/auth-tokens';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return Response.redirect(
      new URL('/auth/login?message=Verification%20link%20is%20invalid', origin),
      302
    );
  }

  const db = await getDb();
  const user = await db.collection(COLLECTIONS.users).findOne({
    emailVerificationTokenHash: hashAuthToken(token),
  });

  if (!user) {
    return Response.redirect(
      new URL('/auth/login?message=Verification%20link%20is%20invalid%20or%20already%20used', origin),
      302
    );
  }

  if (!user.emailVerificationTokenExpiresAt || new Date(user.emailVerificationTokenExpiresAt).getTime() < Date.now()) {
    return Response.redirect(
      new URL('/auth/login?message=Verification%20link%20has%20expired', origin),
      302
    );
  }

  await db.collection(COLLECTIONS.users).updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerifiedAt: new Date(),
      },
      $unset: {
        emailVerificationTokenHash: '',
        emailVerificationTokenExpiresAt: '',
      },
    }
  );

  return Response.redirect(
    new URL('/auth/login?message=Email%20verified%20successfully.%20You%20can%20now%20sign%20in.', origin),
    302
  );
}
