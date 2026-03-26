'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

type Attempt = {
  id: string;
  testId: string;
  status: 'in-progress' | 'submitted' | 'graded';
  answers: Array<{ questionId: string }>;
  percentage?: number;
  submittedAt?: string;
  startedAt: string;
  timeSpent?: number;
};

type TestSummary = {
  id: string;
  title: string;
};

export default function TestsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [tests, setTests] = useState<TestSummary[]>([]);

  useEffect(() => {
    const load = async () => {
      const [attemptsPayload, testsPayload] = await Promise.all([
        apiRequest<{ data: Attempt[] }>('/api/attempts'),
        apiRequest<{ data: TestSummary[] }>('/api/tests'),
      ]);
      setAttempts(attemptsPayload.data);
      setTests(testsPayload.data);
    };

    void load();
  }, []);

  const testsById = useMemo(() => new Map(tests.map((test) => [test.id, test])), [tests]);

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Tests</h1>
        <p className="text-muted-foreground">View your saved attempts and open detailed results.</p>
      </div>

      <div className="space-y-4">
        {attempts.map((attempt) => {
          const test = testsById.get(attempt.testId);
          const isGraded = attempt.status === 'graded';
          const statusIcon = isGraded ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-600" />
          );

          return (
            <Card key={attempt.id} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    {statusIcon}
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{test?.title || 'Unknown Test'}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(attempt.submittedAt || attempt.startedAt).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>{Math.round((attempt.timeSpent || 0) / 60)} min</span>
                        <span>{attempt.answers.length} answers saved</span>
                        {isGraded && <span className="font-medium text-accent">Score: {attempt.percentage || 0}%</span>}
                      </div>
                    </div>
                  </div>
                  {isGraded ? (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent">{attempt.percentage || 0}%</div>
                      <Link href={`${ROUTES.STUDENT_RESULTS}/${attempt.id}`}>
                        <Button size="sm" className="mt-2">View Details</Button>
                      </Link>
                    </div>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                      In Progress
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {attempts.length === 0 && (
        <Card className="border-border border-dashed text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground mb-4">You haven&apos;t taken any tests yet</p>
          <Link href={ROUTES.STUDENT_PRACTICE}>
            <Button>Start a Practice Test</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
