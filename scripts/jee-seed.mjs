/**
 * JEE Main Seed — 15 tests × 3 subjects = 45 tests
 * Each test gets 25 questions drawn from the subject's question pool.
 * Run: node --env-file=.env scripts/jee-seed.mjs
 */
import { MongoClient } from 'mongodb';
import { JEE_PHYSICS, JEE_CHEMISTRY, JEE_MATHS } from './jee-questions.mjs';

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI env var is required');
  const client = await new MongoClient(uri).connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'smartprep_ai');
  const questionsCol = db.collection('questions');
  const testsCol = db.collection('tests');

  // Find admin user id
  const admin = await db.collection('users').findOne({ role: 'admin' });
  const adminId = admin ? admin._id.toString() : 'seed-jee';
  const now = new Date();

  // Delete existing JEE questions & tests
  console.log('🗑  Removing old JEE questions and tests…');
  await questionsCol.deleteMany({ examType: 'JEE' });
  await testsCol.deleteMany({ examType: 'JEE' });

  // Helper to insert subject questions and return their IDs
  const insertSubject = async (subject, rawList) => {
    const docs = rawList.map((q) => ({
      examType: 'JEE',
      subject,
      type: 'mcq',
      difficulty: 'hard',
      questionText: q.q,
      options: q.opts,
      correctAnswer: q.ans,
      explanation: { concept: q.concept, solution: q.sol },
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    }));
    const res = await questionsCol.insertMany(docs);
    const ids = Object.values(res.insertedIds).map(id => id.toString());
    console.log(`  ✓  Inserted ${ids.length} ${subject} questions`);
    return ids;
  };

  const physIds = await insertSubject('Physics', JEE_PHYSICS);
  const chemIds = await insertSubject('Chemistry', JEE_CHEMISTRY);
  const mathIds = await insertSubject('Mathematics', JEE_MATHS);

  // Rolling window: for test i (0-based), start at index (i * step) % len
  // Each test gets PER_TEST questions cycling through the pool
  const PER_TEST = 25;
  const NUM_TESTS = 15;

  const makeTests = (subject, ids, step = 1) => {
    return Array.from({ length: NUM_TESTS }, (_, i) => {
      const setNum = i + 1;
      const start = (i * step) % ids.length;
      // Build a 25-question window that wraps around
      const slice = [];
      for (let j = 0; j < PER_TEST; j++) {
        slice.push(ids[(start + j) % ids.length]);
      }
      return {
        title: `JEE Main ${subject} — Set ${String(setNum).padStart(2, '0')} (2025)`,
        description: `JEE Main 2025 ${subject} practice set ${setNum} of ${NUM_TESTS}. Covers key JEE Main concepts with 25 high-level questions.`,
        examType: 'JEE',
        category: 'JEE',
        questionIds: slice,
        timeLimit: 60,
        passingScore: 60,
        totalPoints: 100,
        status: 'published',
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      };
    });
  };

  const allTests = [
    ...makeTests('Physics', physIds),
    ...makeTests('Chemistry', chemIds),
    ...makeTests('Mathematics', mathIds),
  ];

  await testsCol.insertMany(allTests);
  console.log(`\n✅  Created ${allTests.length} JEE tests (15 per subject)`);
  allTests.forEach(t => console.log(`   • ${t.title} (${t.questionIds.length} Qs)`));

  console.log('\n🎉  JEE seed complete!');
  await client.close();
};

run().catch((err) => { console.error('❌', err.message); process.exit(1); });
