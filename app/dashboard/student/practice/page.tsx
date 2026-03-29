'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/client-api';

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
  testId: string;
  percentage: number;
  status: string;
};

function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-border">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 skeleton" />
          <div className="h-3 w-full skeleton" />
          <div className="flex gap-2 mt-3">
            <div className="h-5 w-16 skeleton rounded-full" />
            <div className="h-5 w-16 skeleton rounded-full" />
            <div className="h-5 w-20 skeleton rounded-full" />
          </div>
        </div>
        <div className="h-9 w-24 skeleton rounded-xl" />
      </div>
    </div>
  );
}

export default function PracticePage() {
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [testsRes, attemptsRes] = await Promise.all([
          apiRequest<{ data: TestSummary[] }>('/api/tests'),
          apiRequest<{ data: AttemptSummary[] }>('/api/attempts')
        ]);
        setTests(testsRes.data);
        
        const attemptMap: Record<string, number> = {};
        attemptsRes.data.forEach(att => {
          if (att.status === 'graded') {
            // keep the highest score if multiple attempts
            attemptMap[att.testId] = Math.max(attemptMap[att.testId] || 0, att.percentage);
          }
        });
        setAttempts(attemptMap);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const categories = useMemo(
    () => [...new Set(tests.map((t) => t.category).filter(Boolean))].sort(),
    [tests]
  );
  
  // Extract subjects from titles (since seeded tests embed subject in title: "JEE Main Physics — Set 01")
  const subjects = useMemo(() => {
    if (!selectedCategory) return [];
    const catTests = tests.filter((t) => t.category === selectedCategory);
    const subjs = new Set<string>();
    catTests.forEach(t => {
      if (t.title.includes('Physics')) subjs.add('Physics');
      if (t.title.includes('Chemistry')) subjs.add('Chemistry');
      if (t.title.includes('Math') || t.title.includes('Mathematics')) subjs.add('Mathematics');
      if (t.title.includes('Biology')) subjs.add('Biology');
      if (t.title.includes('Aptitude')) subjs.add('Aptitude');
      if (t.title.includes('Reasoning')) subjs.add('Reasoning');
      if (t.title.includes('English') || t.title.includes('Verbal')) subjs.add('English / Verbal');
      if (t.title.includes('Programming')) subjs.add('Programming');
      if (t.title.includes('Awareness') || t.title.includes('GK')) subjs.add('General Awareness');
    });
    return [...subjs].sort();
  }, [tests, selectedCategory]);

  const filteredTests = useMemo(() => {
    let result = tests;
    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }
    if (selectedSubject) {
      result = result.filter(t => {
        if (selectedSubject === 'Mathematics') return t.title.includes('Math');
        if (selectedSubject === 'English / Verbal') return t.title.includes('English') || t.title.includes('Verbal');
        if (selectedSubject === 'General Awareness') return t.title.includes('Awareness') || t.title.includes('GK');
        return t.title.includes(selectedSubject);
      });
    }
    return result;
  }, [tests, selectedCategory, selectedSubject]);

  return (
    <div className="flex-1 p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Practice Tests</h1>
        <p className="text-muted-foreground">Browse all published tests and start practising.</p>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedSubject(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              selectedCategory === null ? 'bg-accent text-white shadow-md shadow-accent/30' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({tests.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setSelectedSubject(null); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                selectedCategory === cat ? 'bg-accent text-white shadow-md shadow-accent/30' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat} ({tests.filter((t) => t.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Subject Filter Pills (only show if a category is selected and has subjects) */}
      {selectedCategory && subjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-card border border-border rounded-xl">
          <span className="text-xs font-bold text-muted-foreground flex items-center mr-2">Subjects:</span>
          <button
            onClick={() => setSelectedSubject(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              selectedSubject === null ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedSubject === subj ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      )}

      {/* Test Grid */}
      <div className="grid gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredTests.length === 0
          ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No tests found</h3>
              <p className="text-muted-foreground text-sm">
                {selectedCategory ? `No tests in "${selectedCategory}" yet.` : 'No tests published yet.'}
              </p>
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="mt-3 text-sm text-accent hover:underline font-medium">
                  Show all tests
                </button>
              )}
            </div>
          )
          : filteredTests.map((test) => (
            <div key={test.id} className="group p-5 rounded-2xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-accent transition-colors">{test.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{test.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium">
                      <Clock className="w-3 h-3" /> {test.timeLimit} min
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {test.questionIds.length} Qs
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                      Pass: {test.passingScore}%
                    </span>
                    {test.category && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium capitalize">
                        {test.category}
                      </span>
                    )}
                    {attempts[test.id] !== undefined && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm ${attempts[test.id] >= test.passingScore ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        Score: {attempts[test.id]}%
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`${ROUTES.STUDENT_TESTS}/${test.id}`} className="flex-shrink-0">
                  {attempts[test.id] !== undefined ? (
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-background border-2 border-accent text-accent hover:bg-accent hover:text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-accent/20">
                      Retry Test <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-accent/20">
                      Start <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </Link>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
