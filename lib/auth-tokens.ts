import { createHash, randomBytes } from 'crypto';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;

export function generateAuthToken() {
  return randomBytes(32).toString('hex');
}

export function hashAuthToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createVerificationTokenRecord() {
  const token = generateAuthToken();
  return {
    token,
    tokenHash: hashAuthToken(token),
    expiresAt: new Date(Date.now() + DAY_IN_MS),
  };
}

export function createPasswordResetTokenRecord() {
  const token = generateAuthToken();
  return {
    token,
    tokenHash: hashAuthToken(token),
    expiresAt: new Date(Date.now() + HOUR_IN_MS),
  };
}

export function lockUntilFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
