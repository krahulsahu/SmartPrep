'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/client-api';

type Question = {
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
};

const emptyQuestion = {
  text: '',
  type: 'multiple-choice',
  difficulty: 'easy',
  category: '',
  options: 'Option A\nOption B',
  correctAnswer: 'Option A',
  explanation: '',
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState(emptyQuestion);
  const [jsonPayload, setJsonPayload] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [message, setMessage] = useState('');

  const loadQuestions = async () => {
    const payload = await apiRequest<{ data: Question[] }>('/api/questions');
    setQuestions(payload.data);
  };

  useEffect(() => {
    void loadQuestions();
  }, []);

  const createQuestion = async () => {
    await apiRequest('/api/questions', {
      method: 'POST',
      body: JSON.stringify({
        text: form.text,
        type: form.type,
        difficulty: form.difficulty,
        category: form.category,
        options: form.type === 'multiple-choice' ? form.options.split('\n').map((item) => item.trim()).filter(Boolean) : undefined,
        correctAnswer: form.correctAnswer,
        explanation: form.explanation,
      }),
    });
    setForm(emptyQuestion);
    setMessage('Question created successfully.');
    await loadQuestions();
  };

  const importQuestions = async () => {
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
    const payload = await apiRequest<{ data: Array<Omit<Question, 'id'>> }>('/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        topic: aiTopic,
        difficulty: 'medium',
        count: 30,
      }),
    });
    await apiRequest('/api/questions', {
      method: 'POST',
      body: JSON.stringify({ questions: payload.data }),
    });
    setAiTopic('');
    setMessage('AI-generated questions saved successfully.');
    await loadQuestions();
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Question Management</h1>
        <p className="text-muted-foreground">Create questions manually, upload JSON batches, or generate them with AI.</p>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Create Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Question text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <select className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Question['type'] })}>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="short-answer">Short Answer</option>
              <option value="essay">Essay</option>
              <option value="true-false">True/False</option>
            </select>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Question['difficulty'] })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <Textarea placeholder="Options, one per line" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
            <Input placeholder="Correct answer" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
            <Textarea placeholder="Explanation" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
            <Button onClick={() => void createQuestion()} className="w-full">Save Question</Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Upload JSON</CardTitle>
            <CardDescription>Paste an array of question objects using the API schema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea rows={14} value={jsonPayload} onChange={(e) => setJsonPayload(e.target.value)} placeholder='[{"text":"...","type":"multiple-choice","difficulty":"easy","category":"Math","options":["A","B"],"correctAnswer":"A","explanation":"..."}]' />
            <Button onClick={() => void importQuestions()} className="w-full" variant="outline">Import Questions</Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>AI Question Generation</CardTitle>
            <CardDescription>Generate sample questions and save them directly to MongoDB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Topic or subject" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
            <Button onClick={() => void generateAiQuestions()} className="w-full">Generate 3 Questions</Button>
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
              <p className="font-medium text-foreground mb-2">{question.text}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{question.type}</span>
                <span>{question.difficulty}</span>
                <span>{question.category}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
