import { DifficultyLevel, QuestionType, UserRole } from './types';

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const QUESTION_TYPES: QuestionType[] = ['multiple-choice', 'short-answer', 'essay', 'true-false'];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'short-answer': 'Short Answer',
  essay: 'Essay',
  'true-false': 'True/False',
};

export const USER_ROLES: UserRole[] = ['student', 'admin'];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  admin: 'Administrator',
};

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Student routes
  STUDENT_DASHBOARD: '/dashboard/student',
  STUDENT_PRACTICE: '/dashboard/student/practice',
  STUDENT_TESTS: '/dashboard/student/tests',
  STUDENT_RESULTS: '/dashboard/student/results',
  STUDENT_ANALYTICS: '/dashboard/student/analytics',

  // Admin routes
  ADMIN_DASHBOARD: '/dashboard/admin',
  ADMIN_USERS: '/dashboard/admin/users',
  ADMIN_QUESTIONS: '/dashboard/admin/questions',
  ADMIN_TESTS: '/dashboard/admin/tests',
  ADMIN_CONTENT: '/dashboard/admin/content',
  ADMIN_ANALYTICS: '/dashboard/admin/analytics',
};

export const NOTIFICATIONS = {
  TEST_SUBMITTED: 'Your test has been submitted successfully',
  QUESTION_CREATED: 'Question created successfully',
  TEST_CREATED: 'Test created successfully',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_AUTH: 'Authentication failed. Please check your credentials.',
  ERROR_VALIDATION: 'Please check your input and try again.',
};

export const DEFAULT_CATEGORIES = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Computer Science',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const TEST_SETTINGS = {
  MIN_TIME_LIMIT: 1, // minutes
  MAX_TIME_LIMIT: 480, // 8 hours
  DEFAULT_TIME_LIMIT: 60,
  MIN_PASSING_SCORE: 0,
  MAX_PASSING_SCORE: 100,
  DEFAULT_PASSING_SCORE: 60,
};

export const API_ENDPOINTS = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',

  QUESTIONS: '/api/questions',
  TESTS: '/api/tests',
  TEST_ATTEMPTS: '/api/attempts',
  ANALYTICS: '/api/analytics',
  USERS: '/api/users',

  AI_GENERATE_QUESTIONS: '/api/ai/generate-questions',
  AI_EVALUATE_ANSWER: '/api/ai/evaluate-answer',
  AI_GENERATE_FEEDBACK: '/api/ai/generate-feedback',
};

export const DATE_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'hh:mm a';
export const DATETIME_FORMAT = 'MMM dd, yyyy hh:mm a';
