// User Types
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Question Types
export type QuestionType = 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  category: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
  timeEstimate?: number; // in seconds
}

// Test Types
export type TestStatus = 'draft' | 'published' | 'archived';

export interface Test {
  id: string;
  title: string;
  description: string;
  questionIds: string[];
  questions?: Question[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  totalPoints: number;
  category: string;
  createdBy: string;
  status: TestStatus;
  createdAt: Date;
  updatedAt: Date;
  schedules?: TestSchedule[];
}

export interface TestSchedule {
  id: string;
  testId: string;
  startTime: Date;
  endTime: Date;
  allowedUsers?: string[]; // user IDs
}

// Test Attempt Types
export type TestAttemptStatus = 'in-progress' | 'submitted' | 'graded';

export interface TestAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent: number; // in seconds
  isMarked?: boolean;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  answers: TestAnswer[];
  score?: number;
  percentage?: number;
  status: TestAttemptStatus;
  startedAt: Date;
  submittedAt?: Date;
  timeSpent?: number; // in seconds
  feedback?: string;
  test?: Test;
}

// Analytics Types
export interface PerformanceMetric {
  categoryName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface UserAnalytics {
  userId: string;
  totalTestsTaken: number;
  averageScore: number;
  totalTimeSpent: number;
  categoryPerformance: PerformanceMetric[];
  recentAttempts: TestAttempt[];
  progressTrend: ProgressPoint[];
}

export interface ProgressPoint {
  date: Date;
  score: number;
  testId: string;
}

// AI Feedback Types
export interface AIFeedback {
  id: string;
  questionId: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  suggestedReading?: string;
  difficulty: DifficultyLevel;
  generatedAt: Date;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalTests: number;
  totalQuestions: number;
  averageScore: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// Auth Types
export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
