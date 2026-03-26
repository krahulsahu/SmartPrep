import { z } from 'zod';

export const objectIdSchema = z.string().min(1);

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(128),
});

export const questionTypeSchema = z.enum([
  'multiple-choice',
  'short-answer',
  'essay',
  'true-false',
]);

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const userRoleSchema = z.enum(['student', 'admin']);

export const questionSchema = z.object({
  text: z.string().min(5),
  type: questionTypeSchema,
  difficulty: difficultySchema,
  category: z.string().min(2),
  options: z.array(z.string().min(1)).optional(),
  correctAnswer: z.union([z.string().min(1), z.array(z.string().min(1))]),
  explanation: z.string().min(3),
  tags: z.array(z.string().min(1)).optional(),
  timeEstimate: z.number().int().positive().max(3600).optional(),
});

export const createQuestionSchema = questionSchema.superRefine((value, ctx) => {
  if (value.type === 'multiple-choice' && (!value.options || value.options.length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Multiple-choice questions require at least two options',
      path: ['options'],
    });
  }
});

export const createQuestionsImportSchema = z.object({
  questions: z.array(createQuestionSchema).min(1),
});

export const createTestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  questionIds: z.array(objectIdSchema).min(1),
  timeLimit: z.number().int().min(1).max(480),
  passingScore: z.number().int().min(0).max(100),
  totalPoints: z.number().int().min(1).default(100),
  category: z.string().min(2),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const attemptAnswerSchema = z.object({
  questionId: objectIdSchema,
  answer: z.union([z.string(), z.array(z.string())]),
  timeSpent: z.number().int().min(0),
  isMarked: z.boolean().optional(),
});

export const createAttemptSchema = z.object({
  testId: objectIdSchema,
  answers: z.array(attemptAnswerSchema),
  timeSpent: z.number().int().min(0),
});

export const aiGenerateQuestionsSchema = z.object({
  topic: z.string().min(2),
  difficulty: difficultySchema,
  count: z.number().int().min(1).max(20).default(5),
});
