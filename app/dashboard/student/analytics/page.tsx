'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/client-api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

type AnalyticsPayload = {
  totalTestsTaken: number;
  averageScore: number;
  totalTimeSpent: number;
  categoryPerformance: Array<{
    categoryName: string;
    score: number;
  }>;
  recentAttempts: Array<{ percentage?: number }>;
  progressTrend: Array<{ date: string; score: number }>;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    const load = async () => {
      const payload = await apiRequest<{ data: AnalyticsPayload }>('/api/analytics/performance');
      setAnalytics(payload.data);
    };

    void load();
  }, []);

  if (!analytics) {
    return <div className="flex-1 p-8 text-muted-foreground">Loading analytics...</div>;
  }

  const scores = analytics.recentAttempts.map((attempt) => attempt.percentage || 0);
  const highestScore = scores.length ? Math.max(...scores) : 0;
  const lowestScore = scores.length ? Math.min(...scores) : 0;
  const passingRate = analytics.totalTestsTaken
    ? Math.round((scores.filter((score) => score >= 60).length / analytics.totalTestsTaken) * 100)
    : 0;

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Your performance metrics based on saved attempts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ['Average Score', `${analytics.averageScore}%`],
          ['Highest Score', `${highestScore}%`],
          ['Lowest Score', `${lowestScore}%`],
          ['Study Time', `${Math.round(analytics.totalTimeSpent / 3600)}h`],
        ].map(([label, value]) => (
          <Card key={label} className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Score Progress
            </CardTitle>
            <CardDescription>Your score trend over submitted attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.progressTrend.map((item, index) => ({ ...item, label: `Attempt ${index + 1}` }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Score (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Category Performance
            </CardTitle>
            <CardDescription>Average score by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryPerformance.map((entry) => ({ ...entry, category: entry.categoryName }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#6366f1" name="Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border mt-8">
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
          <CardDescription>Computed from your persisted attempt history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Total Tests Taken', value: analytics.totalTestsTaken },
              { label: 'Passing Rate', value: `${passingRate}%` },
              { label: 'Average Time per Test', value: `${analytics.totalTestsTaken ? Math.round((analytics.totalTimeSpent / analytics.totalTestsTaken) / 60) : 0} min` },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-3 bg-card rounded border border-border">
                <span className="text-foreground font-medium">{stat.label}</span>
                <span className="text-accent font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
