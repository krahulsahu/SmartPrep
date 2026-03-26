'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiRequest } from '@/lib/client-api';

type User = { id: string; role: 'student' | 'admin' };
type Attempt = { percentage?: number };

export default function AnalyticsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    const load = async () => {
      const [usersPayload, attemptsPayload] = await Promise.all([
        apiRequest<{ data: User[] }>('/api/users'),
        apiRequest<{ data: Attempt[] }>('/api/attempts'),
      ]);
      setUsers(usersPayload.data);
      setAttempts(attemptsPayload.data);
    };

    void load();
  }, []);

  const userRoleData = [
    { name: 'Students', value: users.filter((user) => user.role === 'student').length },
    { name: 'Admins', value: users.filter((user) => user.role === 'admin').length },
  ];

  const scoreBuckets = [
    { name: '0-49', attempts: attempts.filter((attempt) => (attempt.percentage || 0) < 50).length },
    { name: '50-69', attempts: attempts.filter((attempt) => (attempt.percentage || 0) >= 50 && (attempt.percentage || 0) < 70).length },
    { name: '70-84', attempts: attempts.filter((attempt) => (attempt.percentage || 0) >= 70 && (attempt.percentage || 0) < 85).length },
    { name: '85-100', attempts: attempts.filter((attempt) => (attempt.percentage || 0) >= 85).length },
  ];

  const trendData = attempts.map((attempt, index) => ({
    name: `Attempt ${index + 1}`,
    avg: attempt.percentage || 0,
  }));

  return (
    <div className="flex-1 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">System Analytics</h1>
      <p className="text-muted-foreground mb-8">Live analytics generated from current user and attempt data.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={userRoleData} cx="50%" cy="50%" label={({ name, value }) => `${name}: ${value}`} outerRadius={100} dataKey="value">
                  {['#6366f1', '#06b6d4'].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Attempts grouped by score range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreBuckets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attempts" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Attempt Scores</CardTitle>
            <CardDescription>Score history across recorded attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Score (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
