'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/client-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { BarChart3, BookOpen, TrendingUp, Clock } from 'lucide-react';

type TestSummary = {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  category: string;
  questionIds: string[];
};

type AttemptSummary = {
  id: string;
  testId: string;
  percentage?: number;
  submittedAt?: string;
  startedAt: string;
  timeSpent?: number;
};

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [testsPayload, attemptsPayload] = await Promise.all([
          apiRequest<{ data: TestSummary[] }>('/api/tests'),
          apiRequest<{ data: AttemptSummary[] }>('/api/attempts'),
        ]);
        setTests(testsPayload.data);
        setAttempts(attemptsPayload.data);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / attempts.length)
    : 0;
  const totalTimeSpent = attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Keep working through published tests and track your progress over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Average Score', value: `${avgScore}%`, hint: 'Across completed attempts' },
          { label: 'Tests Taken', value: `${attempts.length}`, hint: 'Saved in the database' },
          { label: 'Study Time', value: `${Math.round(totalTimeSpent / 3600)}h`, hint: 'Tracked from submissions' },
          { label: 'Available Tests', value: `${tests.length}`, hint: 'Published and available now' },
        ].map((item) => (
          <Card key={item.label} className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Recent Attempts
              </CardTitle>
              <CardDescription>Your latest graded submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attempts.slice(0, 5).map((attempt) => {
                  const test = tests.find((entry) => entry.id === attempt.testId);
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <div>
                        <h4 className="font-medium text-foreground">{test?.title || 'Unknown Test'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.submittedAt || attempt.startedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">{attempt.percentage || 0}%</div>
                        <Link href={`${ROUTES.STUDENT_RESULTS}/${attempt.id}`}>
                          <Button size="sm" variant="outline" className="mt-2">View Result</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
                {!isLoading && attempts.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No attempts yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Available Tests
              </CardTitle>
              <CardDescription>Published tests you can start now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests.map((test) => (
                  <div key={test.id} className="p-4 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{test.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{test.timeLimit} min</span>
                          <span>{test.questionIds.length} questions</span>
                          <span>{test.passingScore}% pass</span>
                        </div>
                      </div>
                      <Link href={`${ROUTES.STUDENT_TESTS}/${test.id}`}>
                        <Button size="sm">Take Test</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-gradient-to-br from-accent/10 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-accent" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Overall Average</span>
                    <span className="text-sm font-bold text-accent">{avgScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${avgScore}%` }} />
                  </div>
                </div>
                <Link href={ROUTES.STUDENT_ANALYTICS}>
                  <Button className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Open Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
