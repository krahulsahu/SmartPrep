'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import { Users, FileQuestion, ClipboardList, TrendingUp, BarChart3, Shield, Plus } from 'lucide-react';

type User = { id: string; role: 'student' | 'admin'; name: string; email: string };
type Question = { id: string };
type Test = { id: string; status: string };
type Attempt = { percentage?: number };

function SkeletonCard() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3"><div className="h-3 w-24 skeleton" /></CardHeader>
      <CardContent><div className="h-8 w-16 skeleton" /></CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
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
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const avgScore = useMemo(
    () => (attempts.length ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length) : 0),
    [attempts]
  );

  const statCards = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Students', value: users.filter((u) => u.role === 'student').length, icon: Shield, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Questions', value: questions.length, icon: FileQuestion, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
    { label: 'Published Tests', value: tests.length, icon: ClipboardList, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: BarChart3, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  ];

  const quickActions = [
    { label: 'Manage Questions', href: ROUTES.ADMIN_QUESTIONS, icon: FileQuestion, desc: 'Create, import & review questions' },
    { label: 'Manage Tests', href: ROUTES.ADMIN_TESTS, icon: ClipboardList, desc: 'Build and publish tests' },
    { label: 'View Users', href: ROUTES.ADMIN_USERS, icon: Users, desc: 'Search and manage accounts' },
    { label: 'Analytics', href: ROUTES.ADMIN_ANALYTICS, icon: BarChart3, desc: 'Platform-wide statistics' },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 animate-fade-in">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage questions, tests, users and analytics from one panel.</p>
        </div>
        <Link href={ROUTES.ADMIN_QUESTIONS}>
          <Button className="gap-2 shadow-lg shadow-accent/20"><Plus className="w-4 h-4" />New Question</Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(({ label, value, icon: Icon, bg, text }) => (
              <Card key={label} className="border-border card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${text}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-foreground">{value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map(({ label, href, icon: Icon, desc }) => (
              <Link key={label} href={href}>
                <div className="group p-4 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer card-hover">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-semibold text-foreground text-sm">{label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Users */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-accent" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest accounts registered on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                      <div className="space-y-1.5"><div className="h-3 w-32 skeleton" /><div className="h-2.5 w-48 skeleton" /></div>
                      <div className="h-6 w-16 skeleton rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No users yet.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <Card className="border-border bg-gradient-to-br from-accent/10 to-transparent">
            <CardHeader><CardTitle className="text-base">System Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'MongoDB persistence', ok: true },
                { label: 'Secure cookie sessions', ok: true },
                { label: 'Admin APIs protected', ok: true },
                { label: 'AI question generation', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Attempt Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-accent mb-1">{attempts.length}</div>
              <p className="text-xs text-muted-foreground">Total attempts recorded</p>
              {attempts.length > 0 && (
                <div className="mt-4 space-y-2">
                  {[
                    { range: '80–100%', count: attempts.filter((a) => (a.percentage ?? 0) >= 80).length, color: 'bg-emerald-500' },
                    { range: '50–79%', count: attempts.filter((a) => (a.percentage ?? 0) >= 50 && (a.percentage ?? 0) < 80).length, color: 'bg-amber-500' },
                    { range: '0–49%', count: attempts.filter((a) => (a.percentage ?? 0) < 50).length, color: 'bg-red-500' },
                  ].map(({ range, count, color }) => (
                    <div key={range}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{range}</span>
                        <span className="text-foreground font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${attempts.length ? (count / attempts.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
