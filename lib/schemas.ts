import { z } from 'zod';

export const objectIdSchema = z.string().min(1);

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character'),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const resendVerificationSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character'),
});

export const examTypeSchema = z.string().min(2);
export const questionTypeSchema = z.enum(['mcq', 'numerical', 'multi-correct']);

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const userRoleSchema = z.enum(['student', 'admin']);

export const questionSchema = z.object({
  examType: examTypeSchema,
  subject: z.string().min(2),
  type: questionTypeSchema,
  difficulty: difficultySchema,
  questionText: z.string().min(5),
  options: z.array(z.string().min(1)).optional(),
  correctAnswer: z.union([z.string().min(1), z.array(z.string().min(1))]),
  explanation: z.object({
    concept: z.string().min(3),
    solution: z.string().min(3),
  }),
});

export const createQuestionSchema = questionSchema.superRefine((value, ctx) => {
  if (value.type === 'mcq' && (!value.options || value.options.length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'MCQ questions require at least two options',
      path: ['options'],
    });
  }

  if (value.type === 'multi-correct') {
    if (!value.options || value.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multi-correct questions require at least two options',
        path: ['options'],
      });
    }

    if (!Array.isArray(value.correctAnswer) || value.correctAnswer.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multi-correct questions require multiple correct answers',
        path: ['correctAnswer'],
      });
    }
  }

  if (value.type === 'numerical' && Array.isArray(value.correctAnswer)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Numerical questions require a single correct answer',
      path: ['correctAnswer'],
    });
  }
});

export const questionUpdateSchema = questionSchema.partial().superRefine((value, ctx) => {
  if (value.type === 'mcq' && value.options && value.options.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'MCQ questions require at least two options',
      path: ['options'],
    });
  }

  if (value.type === 'multi-correct') {
    if (value.options && value.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multi-correct questions require at least two options',
        path: ['options'],
      });
    }

    if (value.correctAnswer && (!Array.isArray(value.correctAnswer) || value.correctAnswer.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multi-correct questions require multiple correct answers',
        path: ['correctAnswer'],
      });
    }
  }

  if (value.type === 'numerical' && value.correctAnswer && Array.isArray(value.correctAnswer)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Numerical questions require a single correct answer',
      path: ['correctAnswer'],
    });
  }
});

export const createQuestionsImportSchema = z.object({
  questions: z.array(createQuestionSchema).min(1),
});

export const createTestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  examType: examTypeSchema,
  sections: z
    .array(
      z.object({
        subject: z.string().min(2),
        difficulty: difficultySchema,
        numberOfQuestions: z.number().int().min(1).max(200),
      })
    )
    .min(1),
  timeLimit: z.number().int().min(1).max(480),
  passingScore: z.number().int().min(0).max(100),
  totalPoints: z.number().int().min(1).default(100),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  skipQuestionAssignment: z.boolean().optional().default(false),
});

export const testUpdateSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    examType: examTypeSchema.optional(),
    sections: z
      .array(
        z.object({
          subject: z.string().min(2),
          difficulty: difficultySchema,
          numberOfQuestions: z.number().int().min(1).max(200),
        })
      )
      .min(1)
      .optional(),
    timeLimit: z.number().int().min(1).max(480).optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    totalPoints: z.number().int().min(1).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  })
  .extend({
    skipQuestionAssignment: z.boolean().optional(),
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
  examType: examTypeSchema,
  subject: z.string().min(2),
  difficulty: difficultySchema,
  type: questionTypeSchema,
  count: z.number().int().min(1).max(200).default(5),
  conceptDepth: z.enum(['basic', 'advanced']).optional().default('basic'),
  targetTestId: objectIdSchema,
  previewOnly: z.boolean().optional().default(true),
});

export const aiFinalizeQuestionsSchema = z.object({
  targetTestId: objectIdSchema,
  questions: z
    .array(questionSchema)
    .min(1),
});
