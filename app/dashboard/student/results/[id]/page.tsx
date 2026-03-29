'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

type AttemptPayload = {
  id: string;
  testId: string;
  percentage?: number;
  timeSpent?: number;
  feedback?: string;
  answers: Array<{ questionId: string; answer: string; isMarked?: boolean }>;
  test: {
    id: string;
    title: string;
    passingScore: number;
  } | null;
  questions: Array<{
    id: string;
    text: string;
    correctAnswer: string | string[];
    explanation: string | { concept: string; solution: string };
  }>;
};

function answersMatch(correctAnswer: string | string[], answer: string) {
  return String(correctAnswer).trim().toLowerCase() === String(answer).trim().toLowerCase();
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await apiRequest<{ data: AttemptPayload }>(`/api/attempts/${params.id as string}`);
        setAttempt(payload.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load result');
      }
    };

    void load();
  }, [params.id]);

  const derived = useMemo(() => {
    if (!attempt || !attempt.test) return null;
    const correctCount = attempt.answers.filter((answer) => {
      const question = attempt.questions.find((entry) => entry.id === answer.questionId);
      return question && answersMatch(question.correctAnswer, answer.answer);
    }).length;
    return {
      isPassed: (attempt.percentage || 0) >= attempt.test.passingScore,
      correctCount,
      answeredCount: attempt.answers.filter((answer) => String(answer.answer).trim() !== '').length,
    };
  }, [attempt]);

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Result Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(ROUTES.STUDENT_TESTS)}>Back to My Tests</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attempt || !attempt.test || !derived) {
    return <div className="flex-1 p-8 text-muted-foreground">Loading result...</div>;
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Test Results</h1>
        <p className="text-muted-foreground">{attempt.test.title}</p>
      </div>

      <Card className={`border-2 mb-8 ${derived.isPassed ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
        <CardContent className="pt-8">
          <div className="text-center mb-8">
            {derived.isPassed ? (
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
            )}
            <h2 className={`text-2xl font-bold mb-2 ${derived.isPassed ? 'text-green-900 dark:text-green-200' : 'text-red-900 dark:text-red-200'}`}>
              {derived.isPassed ? 'Congratulations!' : 'Test Not Passed'}
            </h2>
            <p className={derived.isPassed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
              {attempt.feedback}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Your Score', value: `${attempt.percentage || 0}%`, hint: `${derived.correctCount}/${attempt.questions?.length || 0} correct` },
              { label: 'Passing Score', value: `${attempt.test.passingScore}%`, hint: 'Required' },
              { label: 'Time Spent', value: `${Math.round((attempt.timeSpent || 0) / 60)}m`, hint: 'Recorded in DB' },
              { label: 'Answered', value: `${derived.answeredCount}/${attempt.questions?.length || 0}`, hint: 'Questions answered' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-white dark:bg-black/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.hint}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border mb-8">
        <CardHeader>
          <CardTitle>Answer Review</CardTitle>
          <CardDescription>Review your answers and the stored explanations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {attempt.answers.map((answer, index) => {
              const question = attempt.questions?.find((entry) => entry.id === answer.questionId);
              if (!question) return null;
              const isCorrect = answersMatch(question.correctAnswer, answer.answer);

              return (
                <div key={answer.questionId} className="p-4 bg-card rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Question {index + 1}</h4>
                  <p className="text-foreground mb-3">{question.text}</p>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">YOUR ANSWER</p>
                  <p className={`p-2 rounded border mb-3 ${isCorrect ? 'border-green-200 text-green-700 dark:text-green-300' : 'border-blue-200 text-blue-700 dark:text-blue-300'}`}>
                    {answer.answer || '(No answer)'}
                  </p>
                  {!isCorrect && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">CORRECT ANSWER</p>
                      <p className="p-2 rounded border border-green-200 text-green-700 dark:text-green-300 mb-3">
                        {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                      </p>
                    </>
                  )}
                  <p className="text-xs font-semibold text-muted-foreground mb-1 mt-4">EXPLANATION</p>
                  <div className="text-sm text-foreground bg-accent/5 p-4 rounded-lg border border-accent/20">
                    {typeof question.explanation === 'string' ? (
                      <p>{question.explanation}</p>
                    ) : (
                      <div className="space-y-3">
                        {question.explanation?.concept && (
                          <div>
                            <p className="font-semibold text-accent mb-1">Concept</p>
                            <p>{question.explanation.concept}</p>
                          </div>
                        )}
                        {question.explanation?.solution && (
                          <div>
                            <p className="font-semibold text-accent mb-1">Solution</p>
                            <p>{question.explanation.solution}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <LinkButton href={ROUTES.STUDENT_PRACTICE}>Take Another Test</LinkButton>
      </div>
    </div>
  );
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
      {children}
    </a>
  );
}
