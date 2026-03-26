'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/client-api';

type Question = { id: string; text: string; category: string };
type Test = { id: string; title: string; description: string; category: string; questionIds: string[]; status: string };

export default function AdminTestsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    timeLimit: 60,
    passingScore: 60,
    totalPoints: 100,
    status: 'draft',
  });

  const load = async () => {
    const [questionsPayload, testsPayload] = await Promise.all([
      apiRequest<{ data: Question[] }>('/api/questions'),
      apiRequest<{ data: Test[] }>('/api/tests'),
    ]);
    setQuestions(questionsPayload.data);
    setTests(testsPayload.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const createTest = async () => {
    setError('');
    setSuccess('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }

    if (!form.category.trim()) {
      setError('Category is required.');
      return;
    }

    if (selectedQuestionIds.length === 0) {
      setError('Select at least one question before creating a test.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/api/tests', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          timeLimit: Number(form.timeLimit),
          passingScore: Number(form.passingScore),
          totalPoints: Number(form.totalPoints),
          questionIds: selectedQuestionIds,
        }),
      });
      setForm({
        title: '',
        description: '',
        category: '',
        timeLimit: 60,
        passingScore: 60,
        totalPoints: 100,
        status: 'draft',
      });
      setSelectedQuestionIds([]);
      setSuccess('Test created successfully.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Test Management</h1>
        <p className="text-muted-foreground">Create tests from existing question records and publish them through the API.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Create Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Input type="number" placeholder="Time Limit" value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })} />
              <Input type="number" placeholder="Passing Score" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })} />
              <Input type="number" placeholder="Total Points" value={form.totalPoints} onChange={(e) => setForm({ ...form, totalPoints: Number(e.target.value) })} />
            </div>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <div className="rounded-lg border border-border p-3 max-h-72 overflow-y-auto space-y-2">
              {questions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No questions available. Create questions first, then come back to build a test.
                </p>
              )}
              {questions.map((question) => {
                const checked = selectedQuestionIds.includes(question.id);
                return (
                  <label key={question.id} className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedQuestionIds((current) =>
                          checked ? current.filter((id) => id !== question.id) : [...current, question.id]
                        )
                      }
                    />
                    <span>{question.text}</span>
                  </label>
                );
              })}
            </div>
            <Button
              onClick={() => void createTest()}
              className="w-full"
              disabled={isSubmitting || questions.length === 0}
            >
              {isSubmitting ? 'Creating Test...' : 'Create Test'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Tests</CardTitle>
            <CardDescription>{tests.length} tests currently returned by the API query</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-foreground">{test.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{test.category}</span>
                  <span>{test.questionIds.length} questions</span>
                  <span>{test.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
