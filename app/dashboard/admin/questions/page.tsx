'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/client-api';

type ExamType = string;
type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionType = 'mcq' | 'numerical' | 'multi-correct';
type ConceptDepth = 'basic' | 'advanced';

type QuestionRecord = {
  id: string;
  examType: ExamType;
  subject: string;
  difficulty: Difficulty;
  type: QuestionType;
  questionText: string;
  correctAnswer: string | string[];
  options?: string[];
  explanation?: {
    concept: string;
    solution: string;
  };
};

type TestRecord = {
  id: string;
  title: string;
  examType: ExamType;
  sections: Array<{
    subject: string;
    difficulty: Difficulty;
    numberOfQuestions: number;
  }>;
  questionIds: string[];
  status: string;
};

type QuickTestForm = {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  totalPoints: number;
  status: string;
  numberOfQuestions: number;
};

type QuestionFormState = {
  examType: ExamType;
  subject: string;
  difficulty: Difficulty;
  type: QuestionType;
  questionText: string;
  options: string;
  correctAnswer: string;
  explanationConcept: string;
  explanationSolution: string;
};

const emptyQuestionForm: QuestionFormState = {
  examType: 'JEE',
  subject: '',
  difficulty: 'easy',
  type: 'mcq',
  questionText: '',
  options: 'Option A\nOption B\nOption C\nOption D',
  correctAnswer: 'Option A',
  explanationConcept: '',
  explanationSolution: '',
};

const emptyAiForm = {
  examType: 'JEE' as ExamType,
  subject: '',
  difficulty: 'medium' as Difficulty,
  type: 'mcq' as QuestionType,
  count: 5,
  conceptDepth: 'basic' as ConceptDepth,
  targetTestId: '',
};

const emptyQuickTestForm: QuickTestForm = {
  title: '',
  description: '',
  timeLimit: 60,
  passingScore: 60,
  totalPoints: 100,
  status: 'draft',
  numberOfQuestions: 20,
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [manualSubjects, setManualSubjects] = useState<string[]>([]);
  const [form, setForm] = useState<QuestionFormState>(emptyQuestionForm);
  const [aiForm, setAiForm] = useState(emptyAiForm);
  const [jsonPayload, setJsonPayload] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [quickTestForm, setQuickTestForm] = useState<QuickTestForm>(emptyQuickTestForm);
  const [newExamType, setNewExamType] = useState('');
  const [newExamInitialSubject, setNewExamInitialSubject] = useState('');
  const [newManualSubject, setNewManualSubject] = useState('');
  const [newAiSubject, setNewAiSubject] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<QuestionRecord[]>([]);
  const [selectedPreviewIndexes, setSelectedPreviewIndexes] = useState<number[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const loadQuestions = async () => {
    const payload = await apiRequest<{ data: QuestionRecord[] }>('/api/questions');
    setQuestions(payload.data);
  };

  const loadTests = async () => {
    const payload = await apiRequest<{ data: TestRecord[] }>('/api/tests');
    setTests(payload.data);
  };

  const loadExamTypes = async () => {
    const payload = await apiRequest<{ data: string[] }>('/api/exam-types');
    setExamTypes(payload.data);
    return payload.data;
  };

  const loadSubjects = async (examType: ExamType, target: 'manual' | 'ai') => {
    const payload = await apiRequest<{ data: { subjects: string[] } }>(
      `/api/exam-types/${encodeURIComponent(examType)}/subjects`
    );
    if (target === 'manual') {
      setManualSubjects(payload.data.subjects);
    } else {
      setSubjects(payload.data.subjects);
    }
    return payload.data.subjects;
  };

  useEffect(() => {
    void Promise.all([loadQuestions(), loadTests(), loadExamTypes(), loadSubjects('JEE', 'manual'), loadSubjects('JEE', 'ai')]);
  }, []);

  useEffect(() => {
    void loadSubjects(form.examType, 'manual').then((nextSubjects) => {
      setForm((current) => ({
        ...current,
        subject: nextSubjects.includes(current.subject) ? current.subject : nextSubjects[0] || '',
      }));
    });
  }, [form.examType]);

  useEffect(() => {
    void loadSubjects(aiForm.examType, 'ai').then((nextSubjects) => {
      setAiForm((current) => ({
        ...current,
        subject: nextSubjects.includes(current.subject) ? current.subject : nextSubjects[0] || '',
        targetTestId:
          tests.some((test) => test.id === current.targetTestId && test.examType === current.examType)
            ? current.targetTestId
            : '',
      }));
    });
  }, [aiForm.examType, tests]);

  const matchingTests = tests.filter(
    (test) =>
      test.examType === aiForm.examType &&
      test.sections.some(
        (section) => section.subject === aiForm.subject && section.difficulty === aiForm.difficulty
      )
  );

  useEffect(() => {
    setAiForm((current) => {
      if (matchingTests.some((test) => test.id === current.targetTestId)) {
        return current;
      }

      return {
        ...current,
        targetTestId: '',
      };
    });
  }, [tests, aiForm.examType, aiForm.subject, aiForm.difficulty]);

  const createQuestion = async () => {
    setMessage('');
    setError('');

    await apiRequest('/api/questions', {
      method: 'POST',
      body: JSON.stringify({
        examType: form.examType,
        subject: form.subject,
        difficulty: form.difficulty,
        type: form.type,
        questionText: form.questionText,
        options: form.type === 'numerical' ? undefined : form.options.split('\n').map((item) => item.trim()).filter(Boolean),
        correctAnswer:
          form.type === 'multi-correct'
            ? form.correctAnswer.split('\n').map((item) => item.trim()).filter(Boolean)
            : form.correctAnswer,
        explanation: {
          concept: form.explanationConcept,
          solution: form.explanationSolution,
        },
      }),
    });

    setForm((current) => ({
      ...emptyQuestionForm,
      examType: current.examType,
      subject: current.subject,
    }));
    setMessage('Question created successfully.');
    await loadQuestions();
  };

  const importQuestions = async () => {
    setMessage('');
    setError('');
    const parsed = JSON.parse(jsonPayload);
    await apiRequest('/api/questions', {
      method: 'POST',
      body: JSON.stringify({ questions: parsed }),
    });
    setJsonPayload('');
    setMessage('Questions imported successfully.');
    await loadQuestions();
  };

  const generateAiQuestions = async () => {
    setMessage('');
    setError('');
    setIsGenerating(true);

    try {
      const payload = await apiRequest<{
        data: {
          questions: QuestionRecord[];
          duplicateCount: number;
          batches: Array<{ requested: number; produced: number; retries: number }>;
        };
      }>('/api/ai/generate-questions', {
        method: 'POST',
        body: JSON.stringify(aiForm),
      });

      setPreviewQuestions(payload.data.questions);
      setSelectedPreviewIndexes(payload.data.questions.map((_, index) => index));
      setMessage(
        `Generated ${payload.data.questions.length} questions for review. Skipped ${payload.data.duplicateCount} duplicates before preview.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const finalizePreviewQuestions = async () => {
    setMessage('');
    setError('');
    setIsFinalizing(true);

    try {
      const selectedQuestions = previewQuestions.filter((_, index) => selectedPreviewIndexes.includes(index));
      const payload = await apiRequest<{
        data: {
          assignedCount: number;
          duplicateCount: number;
        };
      }>('/api/ai/finalize-questions', {
        method: 'POST',
        body: JSON.stringify({
          targetTestId: aiForm.targetTestId,
          questions: selectedQuestions,
        }),
      });

      setPreviewQuestions([]);
      setSelectedPreviewIndexes([]);
      setMessage(
        `Added ${payload.data.assignedCount} questions to the target test. ${payload.data.duplicateCount} selected duplicates were skipped.`
      );
      await Promise.all([loadQuestions(), loadTests()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize questions.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const togglePreviewSelection = (index: number) => {
    setSelectedPreviewIndexes((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  };

  const createQuickTest = async () => {
    setMessage('');
    setError('');
    setIsCreatingTest(true);

    try {
      const payload = await apiRequest<{ data: TestRecord }>('/api/tests', {
        method: 'POST',
        body: JSON.stringify({
          title: quickTestForm.title,
          description: quickTestForm.description,
          examType: aiForm.examType,
          sections: [
            {
              subject: aiForm.subject,
              difficulty: aiForm.difficulty,
              numberOfQuestions: Number(quickTestForm.numberOfQuestions),
            },
          ],
          timeLimit: Number(quickTestForm.timeLimit),
          passingScore: Number(quickTestForm.passingScore),
          totalPoints: Number(quickTestForm.totalPoints),
          status: quickTestForm.status,
          skipQuestionAssignment: true,
        }),
      });

      setQuickTestForm(emptyQuickTestForm);
      setAiForm((current) => ({
        ...current,
        targetTestId: payload.data.id,
      }));
      setMessage('Target test created and selected successfully.');
      await loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test.');
    } finally {
      setIsCreatingTest(false);
    }
  };

  const createExamType = async () => {
    setMessage('');
    setError('');
    await apiRequest('/api/exam-types', {
      method: 'POST',
      body: JSON.stringify({
        examType: newExamType,
        initialSubject: newExamInitialSubject || undefined,
      }),
    });

    const updatedExamTypes = await loadExamTypes();
    setForm((current) => ({
      ...current,
      examType: updatedExamTypes.includes(newExamType) ? newExamType : current.examType,
    }));
    setAiForm((current) => ({
      ...current,
      examType: updatedExamTypes.includes(newExamType) ? newExamType : current.examType,
    }));
    setNewExamType('');
    setNewExamInitialSubject('');
    setMessage('Exam type created successfully.');
  };

  const createSubjectFor = async (target: 'manual' | 'ai') => {
    setMessage('');
    setError('');
    const examType = target === 'manual' ? form.examType : aiForm.examType;
    const subject = (target === 'manual' ? newManualSubject : newAiSubject).trim();

    await apiRequest(`/api/exam-types/${encodeURIComponent(examType)}/subjects`, {
      method: 'POST',
      body: JSON.stringify({ subject }),
    });

    const updatedSubjects = await loadSubjects(examType, target);
    if (target === 'manual') {
      setForm((current) => ({ ...current, subject }));
      setNewManualSubject('');
    } else {
      setAiForm((current) => ({ ...current, subject }));
      setNewAiSubject('');
    }

    if (!updatedSubjects.includes(subject)) {
      throw new Error('Subject was not created successfully.');
    }

    setMessage('Subject created successfully.');
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Question Management</h1>
        <p className="text-muted-foreground">
          Create questions manually, import structured JSON, or generate validated AI questions directly into a test.
        </p>
      </div>

      {message ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Create Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                placeholder="Initial subject for this exam type"
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
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Subject</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            >
              {manualSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">Create New Subject</p>
              <Input
                placeholder={`New subject for ${form.examType}`}
                value={newManualSubject}
                onChange={(event) => setNewManualSubject(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!newManualSubject.trim()}
                onClick={() => void createSubjectFor('manual')}
              >
                Add Subject
              </Button>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Question Type</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as QuestionType }))}
            >
              <option value="mcq">MCQ</option>
              <option value="numerical">Numerical</option>
              <option value="multi-correct">Multi Correct</option>
            </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Difficulty</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={form.difficulty}
              onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value as Difficulty }))}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Question Text</label>
            <Textarea
              placeholder="Question text"
              value={form.questionText}
              onChange={(event) => setForm((current) => ({ ...current, questionText: event.target.value }))}
            />
            </div>
            {form.type !== 'numerical' ? (
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Options</label>
              <Textarea
                placeholder="Options, one per line"
                value={form.options}
                onChange={(event) => setForm((current) => ({ ...current, options: event.target.value }))}
              />
              </div>
            ) : null}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                {form.type === 'multi-correct' ? 'Correct Answers' : 'Correct Answer'}
              </label>
            <Textarea
              placeholder={form.type === 'multi-correct' ? 'Correct answers, one per line' : 'Correct answer'}
              value={form.correctAnswer}
              onChange={(event) => setForm((current) => ({ ...current, correctAnswer: event.target.value }))}
            />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Concept Explanation</label>
            <Textarea
              placeholder="Concept explanation"
              value={form.explanationConcept}
              onChange={(event) => setForm((current) => ({ ...current, explanationConcept: event.target.value }))}
            />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Step-by-Step Solution</label>
            <Textarea
              placeholder="Step-by-step solution"
              value={form.explanationSolution}
              onChange={(event) => setForm((current) => ({ ...current, explanationSolution: event.target.value }))}
            />
            </div>
            <Button onClick={() => void createQuestion()} className="w-full">
              Save Question
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Upload JSON</CardTitle>
            <CardDescription>Paste question objects using the current examType / subject schema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Question JSON</label>
            <Textarea
              rows={14}
              value={jsonPayload}
              onChange={(event) => setJsonPayload(event.target.value)}
              placeholder='[{"examType":"JEE","subject":"Physics","difficulty":"hard","type":"mcq","questionText":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":{"concept":"...","solution":"..."}}]'
            />
            </div>
            <Button onClick={() => void importQuestions()} className="w-full" variant="outline">
              Import Questions
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>AI Question Generation</CardTitle>
            <CardDescription>
              Generate in managed batches, validate and refine each question, then link them directly to a selected test.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Exam Type</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={aiForm.examType}
              onChange={(event) => setAiForm((current) => ({ ...current, examType: event.target.value as ExamType }))}
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
                placeholder="Initial subject for this exam type"
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
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Subject</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={aiForm.subject}
              onChange={(event) => setAiForm((current) => ({ ...current, subject: event.target.value }))}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">Create New Subject</p>
              <Input
                placeholder={`New subject for ${aiForm.examType}`}
                value={newAiSubject}
                onChange={(event) => setNewAiSubject(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!newAiSubject.trim()}
                onClick={() => void createSubjectFor('ai')}
              >
                Add Subject
              </Button>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Difficulty</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={aiForm.difficulty}
              onChange={(event) => setAiForm((current) => ({ ...current, difficulty: event.target.value as Difficulty }))}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Question Type</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={aiForm.type}
              onChange={(event) => setAiForm((current) => ({ ...current, type: event.target.value as QuestionType }))}
            >
              <option value="mcq">MCQ</option>
              <option value="numerical">Numerical</option>
              <option value="multi-correct">Multi Correct</option>
            </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Concept Depth</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={aiForm.conceptDepth}
              onChange={(event) => setAiForm((current) => ({ ...current, conceptDepth: event.target.value as ConceptDepth }))}
            >
              <option value="basic">Basic</option>
              <option value="advanced">Advanced</option>
            </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Number of Questions</label>
            <Input
              type="number"
              min={1}
              max={200}
              placeholder="Question count"
              value={aiForm.count}
              onChange={(event) => setAiForm((current) => ({ ...current, count: Number(event.target.value) || 1 }))}
            />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Target Test</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={aiForm.targetTestId}
              onChange={(event) => setAiForm((current) => ({ ...current, targetTestId: event.target.value }))}
            >
              <option value="">Select target test</option>
              {matchingTests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title} ({test.status})
                </option>
              ))}
            </select>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Create New Target Test</p>
                <p className="text-xs text-muted-foreground">
                  A target test is the test that will receive these generated questions. This quick-create action makes an empty valid test first, then AI generation fills it.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Test Title</label>
                <Input
                  placeholder="JEE Chemistry Hard Practice Test"
                  value={quickTestForm.title}
                  onChange={(event) => setQuickTestForm((current) => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Test Description</label>
                <Textarea
                  placeholder="Short description for this test"
                  value={quickTestForm.description}
                  onChange={(event) => setQuickTestForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Section Question Count</label>
                  <Input
                    type="number"
                    min={1}
                    value={quickTestForm.numberOfQuestions}
                    onChange={(event) =>
                      setQuickTestForm((current) => ({
                        ...current,
                        numberOfQuestions: Math.max(1, Number(event.target.value) || 1),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    value={quickTestForm.status}
                    onChange={(event) => setQuickTestForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Time Limit</label>
                  <Input
                    type="number"
                    min={1}
                    value={quickTestForm.timeLimit}
                    onChange={(event) =>
                      setQuickTestForm((current) => ({ ...current, timeLimit: Math.max(1, Number(event.target.value) || 1) }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Passing Score</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={quickTestForm.passingScore}
                    onChange={(event) =>
                      setQuickTestForm((current) => ({ ...current, passingScore: Math.max(0, Number(event.target.value) || 0) }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Total Points</label>
                  <Input
                    type="number"
                    min={1}
                    value={quickTestForm.totalPoints}
                    onChange={(event) =>
                      setQuickTestForm((current) => ({ ...current, totalPoints: Math.max(1, Number(event.target.value) || 1) }))
                    }
                  />
                </div>
              </div>
              <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                This test will be created for <span className="font-medium text-foreground">{aiForm.examType}</span> /
                <span className="font-medium text-foreground"> {aiForm.subject}</span> /
                <span className="font-medium text-foreground"> {aiForm.difficulty}</span>.
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={
                  isCreatingTest ||
                  !quickTestForm.title.trim() ||
                  !quickTestForm.description.trim()
                }
                onClick={() => void createQuickTest()}
              >
                {isCreatingTest ? 'Creating Target Test...' : 'Create and Select Target Test'}
              </Button>
            </div>
            <Button onClick={() => void generateAiQuestions()} className="w-full" disabled={isGenerating || !aiForm.targetTestId}>
              {isGenerating ? 'Generating Questions...' : 'Generate Questions'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Question Library</CardTitle>
          <CardDescription>{questions.length} questions stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((question) => (
            <div key={question.id} className="rounded-lg border border-border p-4">
              <p className="mb-2 font-medium text-foreground">{question.questionText}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{question.examType}</span>
                <span>{question.subject}</span>
                <span>{question.type}</span>
                <span>{question.difficulty}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {previewQuestions.length > 0 ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-xl bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Review Generated Questions</h2>
                <p className="text-sm text-muted-foreground">
                  Select the questions you want to add to the target test before finalizing.
                </p>
              </div>
              <Button variant="outline" onClick={() => {
                setPreviewQuestions([]);
                setSelectedPreviewIndexes([]);
              }}>
                Close
              </Button>
            </div>
            <div className="flex items-center gap-3 border-b border-border px-6 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPreviewIndexes(previewQuestions.map((_, index) => index))}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPreviewIndexes([])}
              >
                Remove All
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedPreviewIndexes.length} of {previewQuestions.length} selected
              </span>
            </div>
            <div className="max-h-[55vh] space-y-4 overflow-y-auto px-6 py-4">
              {previewQuestions.map((question, index) => {
                const selected = selectedPreviewIndexes.includes(index);
                return (
                  <div key={`${question.questionText}-${index}`} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{question.questionText}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{question.examType}</span>
                          <span>{question.subject}</span>
                          <span>{question.type}</span>
                          <span>{question.difficulty}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => togglePreviewSelection(index)}
                        />
                        <Button type="button" variant="outline" onClick={() => togglePreviewSelection(index)}>
                          {selected ? 'Remove' : 'Add'}
                        </Button>
                      </div>
                    </div>
                    {question.options?.length ? (
                      <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                        {question.options.map((option) => (
                          <p key={option}>{option}</p>
                        ))}
                      </div>
                    ) : null}
                    {question.explanation ? (
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium text-foreground">Concept:</span> {question.explanation.concept}</p>
                        <p><span className="font-medium text-foreground">Solution:</span> {question.explanation.solution}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewQuestions([]);
                  setSelectedPreviewIndexes([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void finalizePreviewQuestions()}
                disabled={isFinalizing || selectedPreviewIndexes.length === 0}
              >
                {isFinalizing ? 'Adding To Test...' : 'Add Selected To Test'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  ); 
}
