import { ObjectId, type Db } from 'mongodb';
import { COLLECTIONS } from '@/lib/db';
import { env } from '@/lib/env';
import type { DifficultyLevel, ExamType, Question, QuestionType } from './types';

const MAX_GENERATION_BATCH_SIZE = 20;
const MAX_GENERATION_ATTEMPTS = 3;
const MAX_CORRECTION_ATTEMPTS = 2;

type ConceptDepth = 'basic' | 'advanced';

export type QuestionGenerationInput = {
  examType: ExamType;
  subject: string;
  difficulty: DifficultyLevel;
  type: 'mcq' | 'numerical' | 'multi-correct';
  count: number;
  conceptDepth: ConceptDepth;
  targetTestId: string;
  createdBy: string;
};

type GeneratedQuestionDraft = Omit<Question, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;

type GenerateQuestionsResult = {
  questions: GeneratedQuestionDraft[];
  duplicateCount: number;
  batches: Array<{
    requested: number;
    produced: number;
    retries: number;
  }>;
};

type FinalizeQuestionsResult = {
  savedQuestions: Array<Question & { id: string }>;
  assignedCount: number;
  duplicateCount: number;
};

function splitIntoBatches(count: number, maxBatchSize: number) {
  const batches: number[] = [];
  let remaining = count;

  while (remaining > 0) {
    const next = Math.min(remaining, maxBatchSize);
    batches.push(next);
    remaining -= next;
  }

  return batches;
}

function normalizeQuestionText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(a: string, b: string) {
  const left = new Set(normalizeQuestionText(a).split(' ').filter(Boolean));
  const right = new Set(normalizeQuestionText(b).split(' ').filter(Boolean));

  if (left.size === 0 || right.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const word of left) {
    if (right.has(word)) {
      intersection += 1;
    }
  }

  return intersection / new Set([...left, ...right]).size;
}

function explanationObject(
  explanation: GeneratedQuestionDraft['explanation']
): { concept: string; solution: string } {
  if (typeof explanation === 'string') {
    return {
      concept: explanation,
      solution: explanation,
    };
  }

  return explanation;
}

function isValidQuestionDraft(question: GeneratedQuestionDraft) {
  if (!question.questionText?.trim()) {
    return { valid: false, reason: 'Question text is empty.' };
  }

  const explanation = explanationObject(question.explanation);
  if (!explanation.concept.trim() || !explanation.solution.trim()) {
    return { valid: false, reason: 'Explanation is incomplete.' };
  }

  if (question.type === 'mcq' || question.type === 'multi-correct') {
    if (!question.options || question.options.length !== 4) {
      return { valid: false, reason: 'Option-based questions must contain exactly 4 options.' };
    }

    if (question.type === 'mcq') {
      if (Array.isArray(question.correctAnswer) || !question.options.includes(question.correctAnswer)) {
        return { valid: false, reason: 'MCQ correct answer must match one of the options.' };
      }
    } else if (
      !Array.isArray(question.correctAnswer) ||
      question.correctAnswer.length === 0 ||
      question.correctAnswer.some((answer) => !question.options!.includes(answer))
    ) {
      return { valid: false, reason: 'Multi-correct answers must all exist in the options list.' };
    }
  }

  if (question.type === 'numerical' && Array.isArray(question.correctAnswer)) {
    return { valid: false, reason: 'Numerical questions require a single answer.' };
  }

  return { valid: true as const };
}

function coerceQuestionDraft(
  payload: Partial<GeneratedQuestionDraft>,
  input: QuestionGenerationInput
): GeneratedQuestionDraft {
  return {
    examType: input.examType,
    subject: input.subject,
    difficulty: input.difficulty,
    type: input.type,
    questionText: payload.questionText?.trim() || '',
    options:
      input.type === 'numerical'
        ? undefined
        : (payload.options || []).map((option) => option.trim()).filter(Boolean).slice(0, 4),
    correctAnswer: Array.isArray(payload.correctAnswer)
      ? payload.correctAnswer.map((answer) => String(answer).trim()).filter(Boolean)
      : String(payload.correctAnswer || '').trim(),
    explanation: {
      concept: explanationObject(payload.explanation as GeneratedQuestionDraft['explanation']).concept.trim(),
      solution: explanationObject(payload.explanation as GeneratedQuestionDraft['explanation']).solution.trim(),
    },
  };
}

function buildDraft(
  input: QuestionGenerationInput,
  payload: Pick<GeneratedQuestionDraft, 'questionText' | 'correctAnswer' | 'explanation'> & {
    options?: string[];
  }
): GeneratedQuestionDraft {
  return {
    examType: input.examType,
    subject: input.subject,
    difficulty: input.difficulty,
    type: input.type,
    questionText: payload.questionText,
    options: input.type === 'numerical' ? undefined : payload.options,
    correctAnswer: payload.correctAnswer,
    explanation: payload.explanation,
  };
}

function normalizedSubject(subject: string) {
  return subject.toLowerCase().trim();
}

function realisticPhysicsQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  const n = index + 1;
  const templates = [
    () => {
      const mass = 2 + (n % 4);
      const accel = 3 + (n % 5);
      const force = mass * accel;
      return buildDraft(input, {
        questionText: `A body of mass ${mass} kg moves with constant acceleration ${accel} m/s^2. What net force acts on it?`,
        options: [`${force - 2} N`, `${force} N`, `${force + 2} N`, `${force + 4} N`],
        correctAnswer: `${force} N`,
        explanation: {
          concept: 'Newton’s second law states that net force equals mass multiplied by acceleration.',
          solution: `Using F = ma, we get F = ${mass} x ${accel} = ${force} N.`,
        },
      });
    },
    () => {
      const speed = 10 + n;
      return buildDraft(input, {
        questionText: `A ball is projected vertically upward with speed ${speed} m/s. Taking g = 10 m/s^2, what is the maximum height reached?`,
        options: [`${speed / 2} m`, `${(speed * speed) / 20} m`, `${speed} m`, `${(speed * speed) / 10} m`],
        correctAnswer: `${(speed * speed) / 20} m`,
        explanation: {
          concept: 'At maximum height final velocity becomes zero, so v^2 = u^2 - 2gh is used.',
          solution: `Put v = 0. Then h = u^2 / 2g = ${speed}^2 / 20 = ${(speed * speed) / 20} m.`,
        },
      });
    },
    () => buildDraft(input, {
      questionText: 'Which physical quantity remains constant for a satellite moving in a circular orbit around Earth?',
      options: ['Speed only', 'Velocity only', 'Kinetic energy only', 'Both speed and kinetic energy'],
      correctAnswer: 'Both speed and kinetic energy',
      explanation: {
        concept: 'In uniform circular motion, the magnitude of velocity remains constant though direction changes.',
        solution: 'Since speed is constant, kinetic energy is also constant. Velocity is not constant because its direction keeps changing.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'For a spring-mass system executing simple harmonic motion, acceleration is proportional to',
      options: ['Velocity', 'Displacement from mean position', 'Time period', 'Amplitude squared'],
      correctAnswer: 'Displacement from mean position',
      explanation: {
        concept: 'In SHM, restoring acceleration follows a = -omega^2 x.',
        solution: 'The negative sign shows acceleration is opposite to displacement, and its magnitude is proportional to displacement.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'Two resistors of 6 ohm and 3 ohm are connected in parallel. Their equivalent resistance is',
      options: ['9 ohm', '4.5 ohm', '2 ohm', '3 ohm'],
      correctAnswer: '2 ohm',
      explanation: {
        concept: 'For resistors in parallel, 1/Req = 1/R1 + 1/R2.',
        solution: '1/Req = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2. Hence Req = 2 ohm.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'The electric field inside a charged conducting sphere in electrostatic equilibrium is',
      options: ['Maximum at the center', 'Zero everywhere inside', 'Uniform and non-zero', 'Inverse square with radius'],
      correctAnswer: 'Zero everywhere inside',
      explanation: {
        concept: 'Charges in a conductor redistribute until the internal electric field vanishes.',
        solution: 'If the field were non-zero, free charges would keep moving. Electrostatic equilibrium requires zero electric field inside the conductor.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'When light travels from a rarer medium to a denser medium, which quantity remains unchanged?',
      options: ['Speed', 'Wavelength', 'Frequency', 'Refractive index'],
      correctAnswer: 'Frequency',
      explanation: {
        concept: 'Frequency is fixed by the source and does not change across media.',
        solution: 'On refraction, speed and wavelength change, but frequency remains the same.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'The dimensional formula of work done is',
      options: ['MLT^-1', 'ML^2T^-2', 'ML^2T^-1', 'ML^-1T^-2'],
      correctAnswer: 'ML^2T^-2',
      explanation: {
        concept: 'Work equals force multiplied by displacement.',
        solution: 'Force has dimensions MLT^-2 and displacement has L, so work has dimensions ML^2T^-2.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'A convex lens forms a real image of an object. Which statement is always true?',
      options: [
        'Object is placed between optical center and focus',
        'Image is formed on the same side as the object',
        'Image is inverted',
        'Image is always diminished'
      ],
      correctAnswer: 'Image is inverted',
      explanation: {
        concept: 'Real images formed by a convex lens are inverted.',
        solution: 'The size may vary, but for a real image produced by a convex lens, inversion is always present.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'Which graph correctly represents velocity-time relation for a body moving with uniform acceleration?',
      options: ['A straight line', 'A horizontal parabola', 'A circle', 'An inverse curve'],
      correctAnswer: 'A straight line',
      explanation: {
        concept: 'Uniform acceleration means constant rate of change of velocity.',
        solution: 'If acceleration is constant, velocity changes linearly with time, so the v-t graph is a straight line.',
      },
    }),
  ];

  return templates[index % templates.length]();
}

function realisticChemistryQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  const templates = [
    () => buildDraft(input, {
      questionText: 'The number of molecules present in 22 g of CO2 is',
      options: ['3.01 x 10^23', '6.02 x 10^23', '1.204 x 10^24', '2.24 x 10^22'],
      correctAnswer: '3.01 x 10^23',
      explanation: {
        concept: 'Moles are calculated by mass divided by molar mass, then multiplied by Avogadro number.',
        solution: 'Molar mass of CO2 is 44 g/mol. So 22 g = 0.5 mol. Molecules = 0.5 x 6.02 x 10^23 = 3.01 x 10^23.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'Which quantum number determines the shape of an orbital?',
      options: ['Principal quantum number', 'Azimuthal quantum number', 'Magnetic quantum number', 'Spin quantum number'],
      correctAnswer: 'Azimuthal quantum number',
      explanation: {
        concept: 'The azimuthal quantum number l defines the subshell and orbital shape.',
        solution: 'The principal quantum number gives size and energy level, while l determines shape.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'Among the following, the bond with maximum ionic character is',
      options: ['H-F', 'Na-Cl', 'C-Cl', 'N-H'],
      correctAnswer: 'Na-Cl',
      explanation: {
        concept: 'Greater electronegativity difference gives greater ionic character.',
        solution: 'Na-Cl has the largest difference among the given pairs, so it has the highest ionic character.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'For an exothermic reaction, the enthalpy change Delta H is',
      options: ['Positive', 'Negative', 'Zero', 'Always equal to activation energy'],
      correctAnswer: 'Negative',
      explanation: {
        concept: 'Exothermic reactions release heat to the surroundings.',
        solution: 'Because products are at lower enthalpy than reactants, Delta H is negative.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'The pH of a neutral solution at 25 degree C is',
      options: ['0', '7', '10', '14'],
      correctAnswer: '7',
      explanation: {
        concept: 'At 25 degree C, neutral water has equal H+ and OH- concentrations of 10^-7 M.',
        solution: 'pH = -log[H+] = -log(10^-7) = 7.',
      },
    }),
  ];

  return templates[index % templates.length]();
}

function realisticMathQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  const n = index + 2;
  const templates = [
    () => buildDraft(input, {
      questionText: `If f(x) = x^2 + ${n}x, then f'(x) is`,
      options: [`2x + ${n}`, `x + ${n}`, `2x^2 + ${n}`, `${n}x`],
      correctAnswer: `2x + ${n}`,
      explanation: {
        concept: 'Differentiate each term separately using power rule.',
        solution: `d/dx(x^2) = 2x and d/dx(${n}x) = ${n}. Therefore f'(x) = 2x + ${n}.`,
      },
    }),
    () => buildDraft(input, {
      questionText: 'The sum of the first n natural numbers is',
      options: ['n(n-1)/2', 'n(n+1)/2', '2n+1', 'n^2'],
      correctAnswer: 'n(n+1)/2',
      explanation: {
        concept: 'This is the standard formula for the sum of the first n natural numbers.',
        solution: 'Adding 1 + 2 + ... + n gives n(n+1)/2.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'If sin theta = 3/5 and theta is acute, then cos theta equals',
      options: ['4/5', '5/4', '3/4', '1/5'],
      correctAnswer: '4/5',
      explanation: {
        concept: 'Use sin^2 theta + cos^2 theta = 1.',
        solution: 'cos theta = sqrt(1 - 9/25) = sqrt(16/25) = 4/5 for acute theta.',
      },
    }),
  ];

  return templates[index % templates.length]();
}

function realisticAptitudeQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  const n = index + 1;
  const templates = [
    () => buildDraft(input, {
      questionText: `A train covers ${60 + n * 2} km in ${2 + (n % 3)} hours. What is its average speed?`,
      options: ['20 km/h', '24 km/h', `${(60 + n * 2) / (2 + (n % 3))} km/h`, '40 km/h'],
      correctAnswer: `${(60 + n * 2) / (2 + (n % 3))} km/h`,
      explanation: {
        concept: 'Average speed is total distance divided by total time.',
        solution: `Average speed = ${(60 + n * 2)} / ${2 + (n % 3)} = ${(60 + n * 2) / (2 + (n % 3))} km/h.`,
      },
    }),
    () => buildDraft(input, {
      questionText: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
      options: ['36', '40', '42', '44'],
      correctAnswer: '42',
      explanation: {
        concept: 'The pattern is n(n+1): 1x2, 2x3, 3x4, 4x5, 5x6.',
        solution: 'The next term is 6x7 = 42.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'Choose the correctly spelt word.',
      options: ['Definately', 'Definitely', 'Definetly', 'Defanitely'],
      correctAnswer: 'Definitely',
      explanation: {
        concept: 'This tests standard English spelling accuracy.',
        solution: 'Among the options, only "Definitely" is correctly spelt.',
      },
    }),
  ];

  return templates[index % templates.length]();
}

function realisticProgrammingQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  const templates = [
    () => buildDraft(input, {
      questionText: 'Which data structure follows the Last In First Out principle?',
      options: ['Queue', 'Stack', 'Linked list', 'Tree'],
      correctAnswer: 'Stack',
      explanation: {
        concept: 'LIFO means the last inserted element is removed first.',
        solution: 'A stack follows LIFO, while a queue follows FIFO.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'What is the time complexity of binary search on a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctAnswer: 'O(log n)',
      explanation: {
        concept: 'Binary search halves the search interval in each step.',
        solution: 'Because the problem size is divided by 2 repeatedly, the complexity is logarithmic.',
      },
    }),
    () => buildDraft(input, {
      questionText: 'Which keyword is used to define a constant in JavaScript?',
      options: ['let', 'var', 'const', 'static'],
      correctAnswer: 'const',
      explanation: {
        concept: 'JavaScript provides const for block-scoped constants.',
        solution: 'const declares a binding that cannot be reassigned.',
      },
    }),
  ];

  return templates[index % templates.length]();
}

function realisticGenericQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  return buildDraft(input, {
    questionText: `Which statement best matches a core concept of ${input.subject}?`,
    options: [
      `${input.subject} relies on memorizing one isolated fact only`,
      `${input.subject} requires applying concepts to analyze the given situation`,
      `${input.subject} can never be tested with objective questions`,
      `${input.subject} has no relation to problem solving`
    ],
    correctAnswer: `${input.subject} requires applying concepts to analyze the given situation`,
    explanation: {
      concept: `${input.subject} is usually assessed through concept application rather than blind recall.`,
      solution: 'The best choice is the one that reflects conceptual understanding and application.',
    },
  });
}

function realisticNumericalQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  const n = index + 1;
  const subject = normalizedSubject(input.subject);

  if (subject.includes('physics')) {
    const velocity = 12 + n;
    return buildDraft(input, {
      questionText: `A body starts from rest and moves with acceleration 2 m/s^2 for ${velocity / 2} s. Find its final speed in m/s.`,
      correctAnswer: `${velocity}`,
      explanation: {
        concept: 'Use the first equation of motion, v = u + at.',
        solution: `Here u = 0, a = 2 and t = ${velocity / 2}. Therefore v = 0 + 2 x ${velocity / 2} = ${velocity} m/s.`,
      },
    });
  }

  if (subject.includes('chemistry')) {
    const mass = 18 * (n + 1);
    return buildDraft(input, {
      questionText: `How many moles are present in ${mass} g of water?`,
      correctAnswer: `${n + 1}`,
      explanation: {
        concept: 'Number of moles is mass divided by molar mass.',
        solution: `Molar mass of water is 18 g/mol. So moles = ${mass} / 18 = ${n + 1}.`,
      },
    });
  }

  return buildDraft(input, {
    questionText: `A basic ${input.subject} numerical problem gives a final value of ${10 + n}. Find the required answer.`,
    correctAnswer: `${10 + n}`,
    explanation: {
      concept: `This checks direct calculation in ${input.subject}.`,
      solution: `Applying the standard formula gives the final value ${10 + n}.`,
    },
  });
}

function realisticMultiCorrectQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  const subject = normalizedSubject(input.subject);

  if (subject.includes('physics')) {
    return buildDraft(input, {
      questionText: 'Which of the following quantities can be zero for a body in motion?',
      options: ['Speed', 'Velocity', 'Acceleration', 'Net force'],
      correctAnswer: ['Acceleration', 'Net force'],
      explanation: {
        concept: 'A body can move with constant velocity, in which case both acceleration and net force are zero.',
        solution: 'A moving body cannot have zero speed, but it may have zero acceleration and zero net force during uniform motion.',
      },
    });
  }

  return buildDraft(input, {
    questionText: `Select all statements that correctly describe problem solving in ${input.subject}.`,
    options: [
      'It depends only on memorizing one answer',
      'It often needs concept application',
      'Checking assumptions can matter',
      'All options are always false'
    ],
    correctAnswer: ['It often needs concept application', 'Checking assumptions can matter'],
    explanation: {
      concept: `${input.subject} questions often require concept use and logical verification.`,
      solution: 'The correct statements are the ones that reflect applied understanding and structured reasoning.',
    },
  });
}

function createFallbackQuestion(input: QuestionGenerationInput, index: number): GeneratedQuestionDraft {
  if (input.type === 'numerical') {
    return realisticNumericalQuestion(input, index);
  }

  if (input.type === 'multi-correct') {
    return realisticMultiCorrectQuestion(input, index);
  }

  const subject = normalizedSubject(input.subject);

  if (subject.includes('physics')) {
    return realisticPhysicsQuestion(input, index);
  }

  if (subject.includes('chemistry')) {
    return realisticChemistryQuestion(input, index);
  }

  if (subject.includes('mathematics') || subject.includes('math')) {
    return realisticMathQuestion(input, index);
  }

  if (
    subject.includes('aptitude') ||
    subject.includes('reasoning') ||
    subject.includes('verbal') ||
    subject.includes('interpretation') ||
    subject.includes('awareness') ||
    subject.includes('english')
  ) {
    return realisticAptitudeQuestion(input, index);
  }

  if (subject.includes('programming')) {
    return realisticProgrammingQuestion(input, index);
  }

  return realisticGenericQuestion(input, index);
}

function createFallbackBatch(input: QuestionGenerationInput, count: number, offset: number) {
  return Array.from({ length: count }, (_, index) => createFallbackQuestion(input, offset + index));
}

async function callOpenAIJson<T>(messages: Array<{ role: 'system' | 'user'; content: string }>, fallback: T): Promise<T> {
  const apiKey = env.openaiApiKey();
  if (!apiKey) {
    return fallback;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      temperature: 0.3,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('OpenAI returned an empty response.');
  }

  return JSON.parse(content) as T;
}

function buildGenerationPrompt(input: QuestionGenerationInput, count: number) {
  const optionRule =
    input.type === 'numerical'
      ? 'Do not include options. Return a single numerical correctAnswer as a string.'
      : 'Return exactly 4 realistic options. correctAnswer must reference the option text.';

  const difficultyRule =
    input.examType === 'JEE' && input.difficulty === 'hard'
      ? 'Questions must be deeply conceptual and exam-grade, similar to advanced JEE difficulty.'
      : `Questions must strictly match ${input.difficulty} difficulty for ${input.examType}.`;

  return [
    {
      role: 'system' as const,
      content:
        'You generate production-grade exam questions. Output strict JSON only. Do not wrap in markdown. Avoid duplicates and vague wording.',
    },
    {
      role: 'user' as const,
      content: [
        `Generate ${count} unique questions.`,
        `Exam Type: ${input.examType}`,
        `Subject: ${input.subject}`,
        `Difficulty: ${input.difficulty}`,
        `Question Type: ${input.type}`,
        `Concept Depth: ${input.conceptDepth}`,
        difficultyRule,
        optionRule,
        'Each question must include questionText, options, correctAnswer, explanation.concept, explanation.solution.',
        'Return JSON in the form {"questions":[...]} with no extra keys or commentary.',
      ].join('\n'),
    },
  ];
}

async function generateBatchWithFallback(input: QuestionGenerationInput, count: number, offset: number) {
  const fallback = {
    questions: createFallbackBatch(input, count, offset),
  };

  try {
    return await callOpenAIJson<{ questions: Array<Partial<GeneratedQuestionDraft>> }>(
      buildGenerationPrompt(input, count),
      fallback
    );
  } catch {
    return fallback;
  }
}

async function refineQuestion(question: GeneratedQuestionDraft, input: QuestionGenerationInput) {
  const fallback = {
    question: {
      ...question,
      explanation: {
        concept: explanationObject(question.explanation).concept.trim(),
        solution: explanationObject(question.explanation).solution.trim(),
      },
    },
  };

  try {
    return await callOpenAIJson<{ question: Partial<GeneratedQuestionDraft> }>(
      [
        {
          role: 'system',
          content:
            'You refine assessment questions. Return strict JSON only. Preserve meaning, improve clarity, correctness, and explanation quality.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            examType: input.examType,
            subject: input.subject,
            difficulty: input.difficulty,
            type: input.type,
            question,
            instruction:
              'Refine this question for wording clarity, difficulty correctness, answer validity, and explanation quality. Return {"question":{...}} only.',
          }),
        },
      ],
      fallback
    );
  } catch {
    return fallback;
  }
}

async function correctQuestion(
  invalidQuestion: GeneratedQuestionDraft,
  input: QuestionGenerationInput,
  failureReason: string
) {
  const fallback = {
    question: {
      ...createFallbackQuestion(input, 0),
      questionText: `${invalidQuestion.questionText || input.subject} corrected version`,
    },
  };

  try {
    return await callOpenAIJson<{ question: Partial<GeneratedQuestionDraft> }>(
      [
        {
          role: 'system',
          content:
            'You repair invalid exam questions. Return strict JSON only and fix the issue completely while preserving the target exam context.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            invalidQuestion,
            failureReason,
            target: {
              examType: input.examType,
              subject: input.subject,
              difficulty: input.difficulty,
              type: input.type,
              conceptDepth: input.conceptDepth,
            },
          }),
        },
      ],
      fallback
    );
  } catch {
    return fallback;
  }
}

async function generateValidQuestionsForBatch(
  input: QuestionGenerationInput,
  requestedCount: number,
  existingQuestions: Array<{ questionText: string }>,
  offset: number
) {
  const acceptedQuestions: GeneratedQuestionDraft[] = [];
  let batchSize = requestedCount;
  let retries = 0;

  while (retries < MAX_GENERATION_ATTEMPTS && acceptedQuestions.length < requestedCount) {
    try {
      const remaining = requestedCount - acceptedQuestions.length;
      const currentBatchSize = Math.min(batchSize, remaining);
      const generated = await generateBatchWithFallback(
        input,
        currentBatchSize,
        offset + acceptedQuestions.length + retries * requestedCount
      );

      for (const rawQuestion of generated.questions || []) {
        let candidate = coerceQuestionDraft(rawQuestion, input);
        const refined = await refineQuestion(candidate, input);
        candidate = coerceQuestionDraft(refined.question, input);

        let validation = isValidQuestionDraft(candidate);
        let corrections = 0;

        while (!validation.valid && corrections < MAX_CORRECTION_ATTEMPTS) {
          const repaired = await correctQuestion(candidate, input, validation.reason);
          candidate = coerceQuestionDraft(repaired.question, input);
          validation = isValidQuestionDraft(candidate);
          corrections += 1;
        }

        if (!validation.valid) {
          continue;
        }

        const normalized = normalizeQuestionText(candidate.questionText);
        const isDuplicate =
          acceptedQuestions.some((item) => normalizeQuestionText(item.questionText) === normalized) ||
          existingQuestions.some(
            (item) =>
              normalizeQuestionText(item.questionText) === normalized ||
              calculateSimilarity(item.questionText, candidate.questionText) >= 0.9
          );

        if (!isDuplicate) {
          acceptedQuestions.push(candidate);
        }

        if (acceptedQuestions.length >= requestedCount) {
          break;
        }
      }
    } catch {
      // Retry below with smaller batches.
    }

    retries += 1;
    batchSize = Math.max(1, Math.ceil(batchSize / 2));
  }

  if (acceptedQuestions.length < requestedCount) {
    const fallbackQuestions = createFallbackBatch(
      input,
      requestedCount * 3,
      offset + acceptedQuestions.length + retries * requestedCount
    ).filter((candidate) => {
      const normalized = normalizeQuestionText(candidate.questionText);
      return !acceptedQuestions.some((item) => normalizeQuestionText(item.questionText) === normalized) &&
        !existingQuestions.some(
          (item) =>
            normalizeQuestionText(item.questionText) === normalized ||
            calculateSimilarity(item.questionText, candidate.questionText) >= 0.9
        );
    });

    acceptedQuestions.push(...fallbackQuestions.slice(0, requestedCount - acceptedQuestions.length));
  }

  if (acceptedQuestions.length < requestedCount) {
    throw new Error(`Failed to generate a valid batch of ${requestedCount} questions.`);
  }

  return {
    questions: acceptedQuestions.slice(0, requestedCount),
    retries,
  };
}

function answersMatch(correctAnswer: string | string[], answer: string | string[]) {
  if (Array.isArray(correctAnswer) && Array.isArray(answer)) {
    return JSON.stringify([...correctAnswer].sort()) === JSON.stringify([...answer].sort());
  }
  return String(correctAnswer).trim().toLowerCase() === String(answer).trim().toLowerCase();
}

async function validateTargetTest(db: Db, input: Pick<QuestionGenerationInput, 'targetTestId' | 'examType' | 'subject' | 'difficulty'>) {
  const test = await db.collection(COLLECTIONS.tests).findOne({
    _id: new ObjectId(input.targetTestId),
  });

  if (!test) {
    throw new Error('Target test not found.');
  }

  if (test.examType !== input.examType) {
    throw new Error('Selected test exam type does not match the requested question exam type.');
  }

  const matchingSectionIndex = Array.isArray(test.sections)
    ? test.sections.findIndex(
        (section: { subject: string; difficulty: DifficultyLevel }) =>
          section.subject === input.subject && section.difficulty === input.difficulty
      )
    : -1;

  if (matchingSectionIndex === -1) {
    throw new Error('Selected test does not contain a matching subject and difficulty section.');
  }

  return {
    test,
    matchingSectionIndex,
  };
}

export async function generateQuestionsPreview(db: Db, input: QuestionGenerationInput): Promise<GenerateQuestionsResult> {
  await validateTargetTest(db, input);

  const existingQuestions = await db
    .collection(COLLECTIONS.questions)
    .find(
      { examType: input.examType, subject: input.subject },
      { projection: { questionText: 1 } }
    )
    .toArray() as unknown as Array<{ questionText: string }>;

  const batches = splitIntoBatches(input.count, MAX_GENERATION_BATCH_SIZE);
  const createdQuestions: GeneratedQuestionDraft[] = [];
  const batchReport: GenerateQuestionsResult['batches'] = [];

  let generatedOffset = 0;
  for (const batchSize of batches) {
    const result = await generateValidQuestionsForBatch(input, batchSize, [
      ...existingQuestions,
      ...createdQuestions.map((question) => ({ questionText: question.questionText })),
    ], generatedOffset);

    createdQuestions.push(...result.questions);
    generatedOffset += batchSize;
    batchReport.push({
      requested: batchSize,
      produced: result.questions.length,
      retries: result.retries,
    });
  }

  const uniqueQuestions = createdQuestions.filter((question, index, arr) => {
    const normalized = normalizeQuestionText(question.questionText);
    return index === arr.findIndex((item) => normalizeQuestionText(item.questionText) === normalized);
  });

  const duplicateCount = createdQuestions.length - uniqueQuestions.length;

  if (uniqueQuestions.length === 0) {
    throw new Error('AI generation did not produce any valid non-duplicate questions.');
  }

  return {
    questions: uniqueQuestions,
    duplicateCount,
    batches: batchReport,
  };
}

export async function finalizeQuestionsForTest(
  db: Db,
  input: {
    targetTestId: string;
    questions: GeneratedQuestionDraft[];
    createdBy: string;
  }
): Promise<FinalizeQuestionsResult> {
  if (input.questions.length === 0) {
    throw new Error('No questions selected for finalization.');
  }

  const first = input.questions[0];
  const { test, matchingSectionIndex } = await validateTargetTest(db, {
    targetTestId: input.targetTestId,
    examType: first.examType,
    subject: first.subject,
    difficulty: first.difficulty,
  });

  const existingQuestions = await db
    .collection(COLLECTIONS.questions)
    .find(
      { examType: first.examType, subject: first.subject },
      { projection: { questionText: 1 } }
    )
    .toArray() as unknown as Array<{ questionText: string }>;

  const uniqueQuestions = input.questions.filter((question, index, arr) => {
    const normalized = normalizeQuestionText(question.questionText);
    const duplicateInsideSelection = index !== arr.findIndex((item) => normalizeQuestionText(item.questionText) === normalized);
    const duplicateInDb = existingQuestions.some(
      (item) =>
        normalizeQuestionText(item.questionText) === normalized ||
        calculateSimilarity(item.questionText, question.questionText) >= 0.9
    );
    return !duplicateInsideSelection && !duplicateInDb;
  });

  if (uniqueQuestions.length === 0) {
    throw new Error('All selected questions were duplicates of existing questions.');
  }

  const now = new Date();
  const insertPayload = uniqueQuestions.map((question) => ({
    ...question,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  }));

  const insertResult = await db.collection(COLLECTIONS.questions).insertMany(insertPayload);
  const insertedIds = Object.values(insertResult.insertedIds);
  const insertedDocs = await db
    .collection(COLLECTIONS.questions)
    .find({ _id: { $in: insertedIds } })
    .toArray();

  const finalQuestionIds = insertedDocs.map((doc) => doc._id.toString());
  const nextQuestionIds = [...new Set([...(test.questionIds || []), ...finalQuestionIds])];
  const nextSections = [...test.sections];
  nextSections[matchingSectionIndex] = {
    ...nextSections[matchingSectionIndex],
    numberOfQuestions: nextSections[matchingSectionIndex].numberOfQuestions + insertedDocs.length,
  };

  await db.collection(COLLECTIONS.tests).updateOne(
    { _id: test._id },
    {
      $set: {
        questionIds: nextQuestionIds,
        sections: nextSections,
        updatedAt: new Date(),
      },
    }
  );

  return {
    savedQuestions: insertedDocs.map((doc) => ({
      ...((doc as unknown) as Question),
      id: doc._id.toString(),
    })),
    assignedCount: insertedDocs.length,
    duplicateCount: input.questions.length - uniqueQuestions.length,
  };
}

export async function evaluateAnswer(
  question: Question,
  studentAnswer: string
): Promise<{
  isCorrect: boolean;
  score: number;
  feedback: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isCorrect = answersMatch(question.correctAnswer, studentAnswer);
      const score = isCorrect ? 100 : 0;
      const feedback = isCorrect
        ? 'Great! Your answer is correct.'
        : `The correct answer is: ${Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}`;

      resolve({
        isCorrect,
        score,
        feedback,
      });
    }, 200);
  });
}

export async function generateFeedback(
  studentAnswers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }>,
  topicArea: string
): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const correctCount = studentAnswers.filter((a) => a.isCorrect).length;
      const totalCount = studentAnswers.length;
      const percentage = Math.round((correctCount / Math.max(totalCount, 1)) * 100);

      let feedback = `You scored ${percentage}% on ${topicArea}. `;

      if (percentage >= 80) {
        feedback += 'Excellent work! You have a strong understanding of this topic.';
      } else if (percentage >= 60) {
        feedback += 'Good effort! Review the concepts you missed to improve further.';
      } else {
        feedback += 'You need more practice on this topic. Consider reviewing the fundamentals.';
      }

      resolve(feedback);
    }, 200);
  });
}

export async function suggestStudyPlan(
  userPerformance: Array<{
    category: string;
    score: number;
  }>
): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const suggestions = userPerformance
        .filter((p) => p.score < 70)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((p) => `Focus on improving ${p.category} (current score: ${p.score}%)`);

      if (suggestions.length === 0) {
        suggestions.push('You are performing well! Consider taking advanced practice tests.');
      }

      resolve(suggestions);
    }, 200);
  });
}
