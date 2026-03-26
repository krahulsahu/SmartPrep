import { MongoClient } from 'mongodb';
import { scryptSync, randomBytes } from 'crypto';

const required = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return process.env[name];
};

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const legacyUsers = [
  { name: 'Alex Johnson', email: 'alex@example.com' },
  { name: 'Sarah Smith', email: 'sarah@example.com' },
  { name: 'Admin User', email: 'admin@example.com' },
];

const sampleQuestions = [
  {
    text: 'What is 2 + 2?',
    type: 'multiple-choice',
    difficulty: 'easy',
    category: 'Mathematics',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    explanation: '2 plus 2 equals 4.',
  },
  {
    text: 'Water boils at what temperature in Celsius?',
    type: 'short-answer',
    difficulty: 'easy',
    category: 'Science',
    correctAnswer: '100',
    explanation: 'At standard atmospheric pressure, water boils at 100C.',
  },
  {
    text: 'The Earth revolves around the Sun.',
    type: 'true-false',
    difficulty: 'easy',
    category: 'Science',
    correctAnswer: 'True',
    explanation: 'The Earth revolves around the Sun once every year.',
  },
];

const run = async () => {
  const client = await new MongoClient(required('MONGODB_URI')).connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'smartprep_ai');

  const usersCollection = db.collection('users');
  const questionsCollection = db.collection('questions');
  const testsCollection = db.collection('tests');

  const studentIds = [];
  for (const legacyUser of legacyUsers) {
    const existing = await usersCollection.findOne({ email: legacyUser.email });
    if (existing) {
      studentIds.push(existing._id.toString());
      continue;
    }
    const insertResult = await usersCollection.insertOne({
      name: legacyUser.name,
      email: legacyUser.email,
      passwordHash: hashPassword('password123'),
      role: 'student',
      createdAt: new Date(),
      lastLogin: new Date(),
    });
    studentIds.push(insertResult.insertedId.toString());
  }

  const questionIds = [];
  for (const question of sampleQuestions) {
    const existing = await questionsCollection.findOne({ text: question.text });
    if (existing) {
      questionIds.push(existing._id.toString());
      continue;
    }
    const insertResult = await questionsCollection.insertOne({
      ...question,
      createdBy: 'seed-script',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    questionIds.push(insertResult.insertedId.toString());
  }

  const sampleTest = await testsCollection.findOne({ title: 'Starter Assessment' });
  if (!sampleTest) {
    await testsCollection.insertOne({
      title: 'Starter Assessment',
      description: 'Initial seeded assessment for local development.',
      questionIds,
      timeLimit: 30,
      passingScore: 60,
      totalPoints: 100,
      category: 'General',
      createdBy: 'seed-script',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(`Seed complete. Imported ${studentIds.length} legacy users as students.`);
  console.log('Admin users must be created manually in MongoDB with role=admin.');
  await client.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
