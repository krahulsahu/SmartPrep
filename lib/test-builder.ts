import { Db } from 'mongodb';
import { COLLECTIONS } from '@/lib/db';

type TestSectionInput = {
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  numberOfQuestions: number;
};

export async function buildTestQuestions(
  db: Db,
  examType: string,
  sections: TestSectionInput[]
) {
  const selectedQuestions: Array<Record<string, unknown>> = [];
  const mergedSections = new Map<string, TestSectionInput>();

  for (const section of sections) {
    const key = `${section.subject}::${section.difficulty}`;
    const existing = mergedSections.get(key);
    if (existing) {
      existing.numberOfQuestions += section.numberOfQuestions;
    } else {
      mergedSections.set(key, { ...section });
    }
  }

  for (const section of mergedSections.values()) {
    const questions = await db
      .collection(COLLECTIONS.questions)
      .aggregate([
        {
          $match: {
            examType,
            subject: section.subject,
            difficulty: section.difficulty,
          },
        },
        { $sample: { size: section.numberOfQuestions } },
      ])
      .toArray() as Array<{ _id: { toString(): string } } & Record<string, unknown>>;

    if (questions.length !== section.numberOfQuestions) {
      throw new Error(
        `Not enough questions for ${examType} / ${section.subject} / ${section.difficulty}. Requested ${section.numberOfQuestions}, found ${questions.length}.`
      );
    }

    selectedQuestions.push(...questions);
  }

  const requiredCount = sections.reduce((sum, section) => sum + section.numberOfQuestions, 0);

  return {
    questions: selectedQuestions,
    questionIds: selectedQuestions.map((question) => (question as { _id: { toString(): string } })._id.toString()),
  };
}
