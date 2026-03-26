'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TestPlayer } from '@/components/test-player';
import { ROUTES } from '@/lib/constants';
import { TestAnswer } from '@/lib/types';
import { apiRequest } from '@/lib/client-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type TestDetail = {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  category: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
  }>;
};

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const [test, setTest] = useState<TestDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await apiRequest<{ data: TestDetail }>(`/api/tests/${testId}`);
        setTest(payload.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test');
      }
    };

    void load();
  }, [testId]);

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Test Not Available</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(ROUTES.STUDENT_PRACTICE)}>
              Back to Practice Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test) {
    return <div className="flex-1 p-8 text-muted-foreground">Loading test...</div>;
  }

  const handleSubmit = async (answers: TestAnswer[]) => {
    setIsSubmitting(true);
    try {
      const timeSpent = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
      const payload = await apiRequest<{ data: { id: string } }>('/api/attempts', {
        method: 'POST',
        body: JSON.stringify({
          testId: test.id,
          answers,
          timeSpent,
        }),
      });
      router.push(`${ROUTES.STUDENT_RESULTS}/${payload.data.id}`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!testStarted) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <Card className="border-border max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{test.title}</CardTitle>
            <CardDescription>{test.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Time Limit', `${test.timeLimit} minutes`],
                ['Questions', `${test.questions.length} total`],
                ['Passing Score', `${test.passingScore}% required`],
                ['Category', `${test.category}`],
              ].map(([label, value]) => (
                <div key={label} className="p-4 bg-card rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-blue-900 dark:text-blue-200">Test Instructions</p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>Answer all questions before the timer ends.</li>
                <li>Use mark-for-review if you want to revisit a question.</li>
                <li>Submission saves the attempt directly to MongoDB.</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={() => setTestStarted(true)} className="flex-1" disabled={isSubmitting}>
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <TestPlayer test={test as never} onSubmit={handleSubmit} />
    </div>
  );
}
