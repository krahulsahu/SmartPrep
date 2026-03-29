'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/client-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { BarChart3, BookOpen, TrendingUp, Clock, Flame, CheckCircle, Trophy, Target } from 'lucide-react';

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

function SkeletonCard() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3"><div className="h-3 w-28 skeleton" /></CardHeader>
      <CardContent><div className="h-8 w-20 skeleton" /><div className="h-2.5 w-32 skeleton mt-2" /></CardContent>
    </Card>
  );
}

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

  const avgScore = useMemo(
    () => (attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length) : 0),
    [attempts]
  );
  const totalTimeSpent = attempts.reduce((s, a) => s + (a.timeSpent || 0), 0);
  const passRate = useMemo(() => {
    const passed = attempts.filter((a) => (a.percentage || 0) >= 60).length;
    return attempts.length ? Math.round((passed / attempts.length) * 100) : 0;
  }, [attempts]);

  // Simple streak: count consecutive days with attempts ending today
  const streakDays = useMemo(() => {
    const days = new Set(attempts.map((a) => new Date(a.submittedAt || a.startedAt).toDateString()));
    let streak = 0;
    const d = new Date();
    while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }, [attempts]);

  const statCards = [
    { label: 'Average Score', value: `${avgScore}%`, hint: 'Across all attempts', icon: BarChart3, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Tests Taken', value: `${attempts.length}`, hint: 'Total attempts', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Study Time', value: `${Math.round(totalTimeSpent / 3600)}h`, hint: 'Hours studied', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Pass Rate', value: `${passRate}%`, hint: 'Passing threshold ≥60%', icon: Trophy, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">Keep practicing — you&apos;re on the right track.</p>
        </div>
        {streakDays > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
            <span className="font-bold text-sm">{streakDays}-day streak!</span>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(({ label, value, hint, icon: Icon, color, bg }) => (
              <Card key={label} className="border-border card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-foreground">{value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{hint}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Attempts */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-accent" />
                Recent Attempts
              </CardTitle>
              <CardDescription>Your latest graded submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg">
                      <div className="space-y-1.5"><div className="h-3 w-40 skeleton" /><div className="h-2.5 w-28 skeleton" /></div>
                      <div className="h-8 w-14 skeleton" />
                    </div>
                  ))}
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-10 h-10 text-muted-foreground opacity-40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No attempts yet. Start your first test!</p>
                  <Link href={ROUTES.STUDENT_PRACTICE}><Button size="sm" className="mt-3">Browse Tests</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {attempts.slice(0, 5).map((attempt) => {
                    const test = tests.find((t) => t.id === attempt.testId);
                    const pct = attempt.percentage || 0;
                    return (
                      <div key={attempt.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{test?.title || 'Unknown Test'}</h4>
                          <p className="text-xs text-muted-foreground">{new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xl font-extrabold ${pct >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{pct}%</span>
                          <Link href={`${ROUTES.STUDENT_RESULTS}/${attempt.id}`}>
                            <Button size="sm" variant="outline" className="text-xs h-7">View</Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Tests */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-5 h-5 text-accent" />
                Available Tests
              </CardTitle>
              <CardDescription>Published tests you can take right now</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border">
                      <div className="h-3 w-48 skeleton mb-2" /><div className="h-2.5 w-full skeleton mb-3" />
                      <div className="flex gap-3"><div className="h-5 w-16 skeleton rounded-full" /><div className="h-5 w-16 skeleton rounded-full" /></div>
                    </div>
                  ))}
                </div>
              ) : tests.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No tests available yet.</p>
              ) : (
                <div className="space-y-3">
                  {tests.map((test) => (
                    <div key={test.id} className="p-4 rounded-xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-accent transition-colors">{test.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{test.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">{test.timeLimit} min</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{test.questionIds.length} Qs</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Pass: {test.passingScore}%</span>
                          </div>
                        </div>
                        <Link href={`${ROUTES.STUDENT_TESTS}/${test.id}`}>
                          <Button size="sm" className="flex-shrink-0">Take Test</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Card className="border-border bg-gradient-to-br from-accent/10 via-purple-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-accent" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-foreground">Overall Average</span>
                    <span className="text-sm font-bold text-accent">{avgScore}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${avgScore}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-foreground">Pass Rate</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{passRate}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700" style={{ width: `${passRate}%` }} />
                  </div>
                </div>
                <Link href={ROUTES.STUDENT_ANALYTICS}>
                  <Button className="w-full gap-2 mt-2"><BarChart3 className="w-4 h-4" />Full Analytics</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {streakDays > 0 && (
            <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10">
              <CardContent className="pt-5 text-center">
                <Flame className="w-10 h-10 text-orange-500 fill-orange-500 mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{streakDays}</div>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Day Streak</p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Keep it going!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
