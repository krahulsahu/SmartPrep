'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/client-api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Target, Clock, Trophy, BarChart3 } from 'lucide-react';

type AnalyticsPayload = {
  totalTestsTaken: number;
  averageScore: number;
  totalTimeSpent: number;
  categoryPerformance: Array<{ categoryName: string; score: number }>;
  recentAttempts: Array<{ percentage?: number }>;
  progressTrend: Array<{ date: string; score: number }>;
};

function SkeletonChart() {
  return <div className="h-[280px] w-full skeleton rounded-xl" />;
}

function StatSkeleton() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3"><div className="h-3 w-24 skeleton" /></CardHeader>
      <CardContent><div className="h-8 w-20 skeleton" /></CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await apiRequest<{ data: AnalyticsPayload }>('/api/analytics/performance');
        setAnalytics(payload.data);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const scores = analytics?.recentAttempts.map((a) => a.percentage || 0) ?? [];
  const highestScore = scores.length ? Math.max(...scores) : 0;
  const lowestScore = scores.length ? Math.min(...scores) : 0;
  const passingRate = analytics?.totalTestsTaken ? Math.round((scores.filter((s) => s >= 60).length / analytics.totalTestsTaken) * 100) : 0;

  const pieData = [
    { name: 'Passed', value: scores.filter((s) => s >= 60).length, color: '#10b981' },
    { name: 'Failed', value: scores.filter((s) => s < 60).length, color: '#f43f5e' },
  ];

  const statCards = [
    { label: 'Average Score', value: `${analytics?.averageScore ?? 0}%`, icon: BarChart3, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Highest Score', value: `${highestScore}%`, icon: Trophy, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Lowest Score', value: `${lowestScore}%`, icon: Target, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
    { label: 'Study Time', value: `${Math.round((analytics?.totalTimeSpent ?? 0) / 3600)}h`, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-1">My Analytics</h1>
        <p className="text-muted-foreground">Detailed performance metrics across all your test attempts.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) :
          statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-border card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</CardTitle>
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-foreground">{value}</div>
              </CardContent>
            </Card>
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score Trend */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-accent" />
              Score Trend
            </CardTitle>
            <CardDescription>Your score progression over attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <SkeletonChart /> : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics!.progressTrend.map((item, i) => ({ ...item, label: `#${i + 1}` }))}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[stroke:#2a2a2a]" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Score (%)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-accent" />
              Subject Performance
            </CardTitle>
            <CardDescription>Average score per subject</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <SkeletonChart /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics!.categoryPerformance.map((e) => ({ ...e, category: e.categoryName }))}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="score" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="Score (%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Row + Pass/Fail Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Detailed Statistics</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 skeleton rounded-lg" />)}</div> : (
              <div className="space-y-3">
                {[
                  { label: 'Total Tests Taken', value: analytics!.totalTestsTaken },
                  { label: 'Passing Rate (≥60%)', value: `${passingRate}%` },
                  { label: 'Avg Time per Test', value: `${analytics!.totalTestsTaken ? Math.round(analytics!.totalTimeSpent / analytics!.totalTestsTaken / 60) : 0} min` },
                  { label: 'Tests Passed', value: scores.filter((s) => s >= 60).length },
                  { label: 'Tests Failed', value: scores.filter((s) => s < 60).length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-sm font-bold text-accent">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Pass vs Fail</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            {isLoading ? <div className="h-[180px] w-full skeleton rounded-xl" /> : scores.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No attempts yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}: <strong className="text-foreground">{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
