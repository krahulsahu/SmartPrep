import { Db } from 'mongodb';
import { COLLECTIONS } from '@/lib/db';
import { DEFAULT_EXAM_SUBJECTS, DEFAULT_EXAM_TYPES } from '@/lib/exam-config';

type ExamCatalogDoc = {
  examType: string;
  subjects: string[];
  createdAt: Date;
  updatedAt: Date;
};

async function ensureDefaultExamCatalog(db: Db) {
  const count = await db.collection(COLLECTIONS.examCatalog).countDocuments();
  if (count > 0) {
    return;
  }

  const now = new Date();
  await db.collection(COLLECTIONS.examCatalog).insertMany(
    DEFAULT_EXAM_TYPES.map((examType) => ({
      examType,
      subjects: [...DEFAULT_EXAM_SUBJECTS[examType as keyof typeof DEFAULT_EXAM_SUBJECTS]],
      createdAt: now,
      updatedAt: now,
    }))
  );
}

export async function getExamCatalog(db: Db) {
  await ensureDefaultExamCatalog(db);
  return (await db
    .collection(COLLECTIONS.examCatalog)
    .find({}, { projection: { examType: 1, subjects: 1 } })
    .sort({ examType: 1 })
    .toArray()) as unknown as Array<ExamCatalogDoc>;
}

export async function getExamTypes(db: Db) {
  const catalog = await getExamCatalog(db);
  return catalog.map((item) => item.examType);
}

export async function getSubjectsForExamType(db: Db, examType: string) {
  await ensureDefaultExamCatalog(db);
  const item = (await db.collection(COLLECTIONS.examCatalog).findOne({
    examType,
  })) as ExamCatalogDoc | null;

  return item?.subjects ?? null;
}

export async function isExamType(db: Db, examType: string) {
  return Boolean(await getSubjectsForExamType(db, examType));
}

export async function isValidSubjectForExamType(db: Db, examType: string, subject: string) {
  const subjects = await getSubjectsForExamType(db, examType);
  return subjects ? subjects.includes(subject) : false;
}

export async function createExamType(db: Db, examType: string, initialSubject?: string) {
  await ensureDefaultExamCatalog(db);
  const existing = await db.collection(COLLECTIONS.examCatalog).findOne({ examType });
  if (existing) {
    throw new Error('Exam type already exists.');
  }

  const now = new Date();
  await db.collection(COLLECTIONS.examCatalog).insertOne({
    examType,
    subjects: initialSubject ? [initialSubject] : [],
    createdAt: now,
    updatedAt: now,
  });
}

export async function createSubject(db: Db, examType: string, subject: string) {
  await ensureDefaultExamCatalog(db);
  const existing = await db.collection(COLLECTIONS.examCatalog).findOne({ examType });

  if (!existing) {
    throw new Error('Exam type not found.');
  }

  const nextSubjects = Array.from(new Set([...(existing.subjects || []), subject]));
  if (nextSubjects.length === (existing.subjects || []).length) {
    throw new Error('Subject already exists for this exam type.');
  }

  await db.collection(COLLECTIONS.examCatalog).updateOne(
    { examType },
    {
      $set: {
        subjects: nextSubjects,
        updatedAt: new Date(),
      },
    }
  );
}
