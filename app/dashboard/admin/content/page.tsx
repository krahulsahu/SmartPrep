'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiRequest } from '@/lib/client-api';
import { Flag, CheckCircle, AlertTriangle, XCircle, MessageSquare } from 'lucide-react';

type Report = {
  id: string;
  questionId: string;
  questionText?: string;
  reason: string;
  comment?: string;
  reportedBy?: string;
  createdAt: string;
  status: 'open' | 'resolved' | 'dismissed';
};

type Question = { id: string; questionText?: string; text?: string };

export default function ContentModerationPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reported' | 'unverified'>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await apiRequest<{ data: Question[] }>('/api/questions');
        setQuestions(payload.data);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  // Mock reports derived from questions for demonstration
  const mockReports: Report[] = questions.slice(0, 5).map((q, i) => ({
    id: `report-${i}`,
    questionId: q.id,
    questionText: (q.questionText || q.text || `Question ${i + 1}`).slice(0, 100),
    reason: ['Wrong answer', 'Unclear question', 'Typo in options', 'Outdated content', 'Incorrect explanation'][i % 5],
    comment: i % 2 === 0 ? 'The answer key seems incorrect based on the formula given.' : undefined,
    reportedBy: `student${i + 1}@example.com`,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    status: i === 0 ? 'open' : i === 1 ? 'resolved' : 'open',
  }));

  const stats = [
    { label: 'Total Questions', value: questions.length, icon: MessageSquare, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Open Reports', value: mockReports.filter((r) => r.status === 'open').length, icon: Flag, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
    { label: 'Resolved', value: mockReports.filter((r) => r.status === 'resolved').length, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Dismissed', value: mockReports.filter((r) => r.status === 'dismissed').length, icon: XCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Content Moderation</h1>
        <p className="text-muted-foreground">Review student-reported questions and manage content quality.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border card-hover">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'reported', 'unverified'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flag className="w-5 h-5 text-red-500" />
            Question Reports
          </CardTitle>
          <CardDescription>Student-submitted flags on questionable content</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border border-border rounded-xl">
                  <div className="h-3 w-3/4 skeleton mb-2" />
                  <div className="h-2.5 w-1/2 skeleton mb-3" />
                  <div className="flex gap-2"><div className="h-5 w-20 skeleton rounded-full" /><div className="h-5 w-16 skeleton rounded-full" /></div>
                </div>
              ))}
            </div>
          ) : mockReports.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-60" />
              <p className="text-muted-foreground font-medium">No reports — all content looks good!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockReports.map((report) => (
                <div key={report.id} className={`p-4 rounded-xl border transition-colors ${report.status === 'open' ? 'border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-900/10' : 'border-border bg-muted/20'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">{report.questionText}…</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                          {report.reason}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          report.status === 'open' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          report.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.comment && <p className="text-xs text-muted-foreground italic">&ldquo;{report.comment}&rdquo;</p>}
                      <p className="text-xs text-muted-foreground mt-1">Reported by {report.reportedBy} · {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    {report.status === 'open' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="h-7 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">Resolve</button>
                        <button className="h-7 px-3 text-xs font-medium border border-border text-muted-foreground hover:text-foreground rounded-lg transition-colors">Dismiss</button>
                      </div>
                    )}
                    {report.status === 'open' && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
