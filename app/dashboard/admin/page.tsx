'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import { Users, FileQuestion, ClipboardList, TrendingUp } from 'lucide-react';

type User = { id: string; role: 'student' | 'admin'; name: string; email: string };
type Question = { id: string };
type Test = { id: string; status: string };
type Attempt = { percentage?: number };

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    const load = async () => {
      const [usersPayload, questionsPayload, testsPayload, attemptsPayload] = await Promise.all([
        apiRequest<{ data: User[] }>('/api/users'),
        apiRequest<{ data: Question[] }>('/api/questions'),
        apiRequest<{ data: Test[] }>('/api/tests?status=published'),
        apiRequest<{ data: Attempt[] }>('/api/attempts'),
      ]);
      setUsers(usersPayload.data);
      setQuestions(questionsPayload.data);
      setTests(testsPayload.data);
      setAttempts(attemptsPayload.data);
    };

    void load();
  }, []);

  const avgScore = useMemo(
    () => (attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / attempts.length) : 0),
    [attempts]
  );

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Operate questions, tests, users, and platform analytics from one backend-backed panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          ['Total Users', users.length],
          ['Students', users.filter((user) => user.role === 'student').length],
          ['Questions', questions.length],
          ['Published Tests', tests.length],
          ['Avg Score', `${avgScore}%`],
        ].map(([label, value]) => (
          <Card key={String(label)} className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={ROUTES.ADMIN_QUESTIONS}>
              <Button className="w-full" size="lg" variant="outline">
                <FileQuestion className="w-4 h-4 mr-2" />
                Manage Questions
              </Button>
            </Link>
            <Link href={ROUTES.ADMIN_TESTS}>
              <Button className="w-full" size="lg" variant="outline">
                <ClipboardList className="w-4 h-4 mr-2" />
                Manage Tests
              </Button>
            </Link>
            <Link href={ROUTES.ADMIN_USERS}>
              <Button className="w-full" size="lg" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View Users
              </Button>
            </Link>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest accounts pulled from MongoDB</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-card rounded border border-border">
                    <div>
                      <p className="font-medium text-sm text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-gradient-to-br from-accent/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-base">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-foreground">MongoDB-backed persistence enabled</p>
              <p className="text-foreground">Secure cookie sessions enabled</p>
              <p className="text-foreground">Admin APIs protected server-side</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
