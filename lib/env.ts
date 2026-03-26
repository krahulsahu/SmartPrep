const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  mongodbUri: () => requiredEnv('MONGODB_URI'),
  mongodbDbName: () => process.env.MONGODB_DB_NAME || 'smartprep_ai',
  authSecret: () => requiredEnv('AUTH_SECRET'),
  openaiApiKey: () => process.env.OPENAI_API_KEY || '',
};
