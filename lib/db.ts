import { Db, MongoClient } from 'mongodb';
import { env } from '@/lib/env';

declare global {
  // eslint-disable-next-line no-var
  var __smartprepMongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var __smartprepDbStatus:
    | {
        connected: boolean;
        message: string;
        checkedAt: string;
      }
    | undefined;
}

function normalizeMongoError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : 'Unknown MongoDB connection error';

  if (
    rawMessage.includes('tlsv1 alert internal error') ||
    rawMessage.includes('SSL routines') ||
    rawMessage.toLowerCase().includes('tls')
  ) {
    return [
      'MongoDB TLS handshake failed.',
      'If you are using MongoDB Atlas, verify that your Atlas cluster is reachable and your IP is allowlisted.',
      'If you want local MongoDB development, change MONGODB_URI to mongodb://127.0.0.1:27017.',
    ].join(' ');
  }

  if (rawMessage.toLowerCase().includes('authentication failed')) {
    return 'MongoDB authentication failed. Check the username and password in MONGODB_URI.';
  }

  return rawMessage;
}

function getClientPromise() {
  if (!global.__smartprepMongoClientPromise) {
    global.__smartprepMongoClientPromise = new MongoClient(env.mongodbUri(), {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).connect();
  }
  return global.__smartprepMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  try {
    const client = await getClientPromise();
    const db = client.db(env.mongodbDbName());
    global.__smartprepDbStatus = {
      connected: true,
      message: `Connected to ${env.mongodbDbName()}`,
      checkedAt: new Date().toISOString(),
    };
    return db;
  } catch (error) {
    const message = normalizeMongoError(error);
    global.__smartprepDbStatus = {
      connected: false,
      message,
      checkedAt: new Date().toISOString(),
    };
    throw new Error(message);
  }
}

export async function getDbStatus() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return (
      global.__smartprepDbStatus || {
        connected: true,
        message: `Connected to ${env.mongodbDbName()}`,
        checkedAt: new Date().toISOString(),
      }
    );
  } catch {
    return (
      global.__smartprepDbStatus || {
        connected: false,
        message: 'Database connection failed',
        checkedAt: new Date().toISOString(),
      }
    );
  }
}

export const COLLECTIONS = {
  users: 'users',
  questions: 'questions',
  tests: 'tests',
  attempts: 'attempts',
} as const;
