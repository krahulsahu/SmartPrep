'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/client-api';

type ExamType = string;
type Difficulty = 'easy' | 'medium' | 'hard';

type TestSection = {
  subject: string;
  difficulty: Difficulty;
  numberOfQuestions: number;
};

type TestRecord = {
  id: string;
  title: string;
  description: string;
  examType: ExamType;
  sections?: TestSection[];
  questionIds: string[];
  status: string;
};

const createEmptySection = (): TestSection => ({
  subject: '',
  difficulty: 'easy',
  numberOfQuestions: 10,
});

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newExamType, setNewExamType] = useState('');
  const [newExamInitialSubject, setNewExamInitialSubject] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    examType: 'JEE' as ExamType,
    timeLimit: 60,
    passingScore: 60,
    totalPoints: 100,
    status: 'draft',
    sections: [createEmptySection()],
  });

  const load = async () => {
    const testsPayload = await apiRequest<{ data: TestRecord[] }>('/api/tests');
    setTests(testsPayload.data);
  };

  const loadExamTypes = async () => {
    const payload = await apiRequest<{ data: string[] }>('/api/exam-types');
    setExamTypes(payload.data);
    return payload.data;
  };

  const loadSubjects = async (examType: ExamType) => {
    const payload = await apiRequest<{ data: { subjects: string[] } }>(
      `/api/exam-types/${encodeURIComponent(examType)}/subjects`
    );
    setSubjects(payload.data.subjects);
    return payload.data.subjects;
  };

  useEffect(() => {
    void Promise.all([load(), loadExamTypes(), loadSubjects('JEE')]);
  }, []);

  useEffect(() => {
    void loadSubjects(form.examType).then((nextSubjects) => {
      setForm((current) => ({
        ...current,
        sections: current.sections.map((section) => ({
          ...section,
          subject: nextSubjects.includes(section.subject) ? section.subject : nextSubjects[0] || '',
        })),
      }));
    });
  }, [form.examType]);

  const updateSection = (index: number, next: Partial<TestSection>) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section, currentIndex) =>
        currentIndex === index ? { ...section, ...next } : section
      ),
    }));
  };

  const addSection = () => {
    setForm((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          ...createEmptySection(),
          subject: subjects[0] || '',
        },
      ],
    }));
  };

  const removeSection = (index: number) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

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

    if (form.sections.length === 0) {
      setError('Add at least one section.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/api/tests', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          examType: form.examType,
          sections: form.sections.map((section) => ({
            ...section,
            numberOfQuestions: Number(section.numberOfQuestions),
          })),
          timeLimit: Number(form.timeLimit),
          passingScore: Number(form.passingScore),
          totalPoints: Number(form.totalPoints),
          status: form.status,
        }),
      });

      setForm({
        title: '',
        description: '',
        examType: form.examType,
        timeLimit: 60,
        passingScore: 60,
        totalPoints: 100,
        status: 'draft',
        sections: [
          {
            ...createEmptySection(),
            subject: subjects[0] || '',
          },
        ],
      });
      setSuccess('Test created successfully.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createExamType = async () => {
    setError('');
    setSuccess('');
    await apiRequest('/api/exam-types', {
      method: 'POST',
      body: JSON.stringify({
        examType: newExamType,
        initialSubject: newExamInitialSubject || undefined,
      }),
    });
    await loadExamTypes();
    setForm((current) => ({ ...current, examType: newExamType }));
    setNewExamType('');
    setNewExamInitialSubject('');
    setSuccess('Exam type created successfully.');
  };

  const createSubject = async () => {
    setError('');
    setSuccess('');
    await apiRequest(`/api/exam-types/${encodeURIComponent(form.examType)}/subjects`, {
      method: 'POST',
      body: JSON.stringify({ subject: newSubject }),
    });
    await loadSubjects(form.examType);
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section, index) =>
        index === 0 ? { ...section, subject: newSubject } : section
      ),
    }));
    setNewSubject('');
    setSuccess('Subject created successfully.');
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Test Management</h1>
        <p className="text-muted-foreground">
          Define exam-type test sections and let the backend auto-pick matching questions from MongoDB.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Create Test</CardTitle>
            <CardDescription>Sections control automatic question assignment. Manual question picking is disabled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Test Title</label>
              <Input
                placeholder="Aptitude Full Test"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                placeholder="Short description for the test"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Exam Type</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                value={form.examType}
                onChange={(event) => setForm((current) => ({ ...current, examType: event.target.value as ExamType }))}
              >
                {examTypes.map((examType) => (
                  <option key={examType} value={examType}>
                    {examType}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">Create New Exam Type</p>
              <Input
                placeholder="New exam type"
                value={newExamType}
                onChange={(event) => setNewExamType(event.target.value)}
              />
              <Input
                placeholder="Initial subject"
                value={newExamInitialSubject}
                onChange={(event) => setNewExamInitialSubject(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!newExamType.trim()}
                onClick={() => void createExamType()}
              >
                Add Exam Type
              </Button>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">Create New Subject</p>
              <Input
                placeholder={`New subject for ${form.examType}`}
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!newSubject.trim()}
                onClick={() => void createSubject()}
              >
                Add Subject
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Time Limit</label>
                <Input
                  type="number"
                  placeholder="60"
                  value={form.timeLimit}
                  onChange={(event) => setForm((current) => ({ ...current, timeLimit: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Passing Score</label>
                <Input
                  type="number"
                  placeholder="60"
                  value={form.passingScore}
                  onChange={(event) => setForm((current) => ({ ...current, passingScore: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Total Points</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={form.totalPoints}
                  onChange={(event) => setForm((current) => ({ ...current, totalPoints: Number(event.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Test Sections</p>
                <p className="text-xs text-muted-foreground">
                  Build the test by selecting each section from dropdowns.
                </p>
              </div>
              {form.sections.map((section, index) => (
                <div key={`${section.subject}-${index}`} className="space-y-3 rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-foreground">Section {index + 1}</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">Subject</label>
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2"
                        value={section.subject}
                        onChange={(event) => updateSection(index, { subject: event.target.value })}
                      >
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">Difficulty</label>
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2"
                        value={section.difficulty}
                        onChange={(event) => updateSection(index, { difficulty: event.target.value as Difficulty })}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">Number Of Questions</label>
                      <Input
                        type="number"
                        min={1}
                        value={section.numberOfQuestions}
                        onChange={(event) =>
                          updateSection(index, { numberOfQuestions: Math.max(1, Number(event.target.value) || 1) })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground">Action</label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => removeSection(index)}
                        disabled={form.sections.length === 1}
                      >
                        Remove Section
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSection}>
                Add Section
              </Button>
            </div>

            <Button onClick={() => void createTest()} className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Test...' : 'Create Test'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Tests</CardTitle>
            <CardDescription>{tests.length} tests currently available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="rounded-lg border border-border p-4">
                {(() => {
                  const sections = test.sections ?? [];
                  return (
                    <>
                <p className="font-medium text-foreground">{test.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{test.examType}</span>
                  <span>{test.questionIds.length} questions</span>
                  <span>{test.status}</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {sections.length > 0 ? sections.map((section, index) => (
                    <p key={`${section.subject}-${section.difficulty}-${index}`}>
                      {section.subject} / {section.difficulty} / {section.numberOfQuestions} questions
                    </p>
                  )) : (
                    <p>Legacy test without section metadata</p>
                  )}
                </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
