'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { BookOpen, Filter } from 'lucide-react';
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

export default function PracticePage() {
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const payload = await apiRequest<{ data: TestSummary[] }>('/api/tests');
      setTests(payload.data);
    };

    void load();
  }, []);

  const categories = useMemo(
    () => [...new Set(tests.map((test) => test.category))].sort(),
    [tests]
  );
  const filteredTests = selectedCategory ? tests.filter((test) => test.category === selectedCategory) : tests;

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Practice Tests</h1>
        <p className="text-muted-foreground">Browse published tests and filter them by category.</p>
      </div>

      <Card className="border-border mb-8">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant={selectedCategory === null ? 'default' : 'outline'} onClick={() => setSelectedCategory(null)} size="sm">
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredTests.map((test) => (
          <Card key={test.id} className="border-border hover:border-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{test.title}</h3>
                  <p className="text-muted-foreground mb-3">{test.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{test.questionIds.length} questions</span>
                    <span>{test.timeLimit} minutes</span>
                    <span>{test.passingScore}% to pass</span>
                    <span>{test.category}</span>
                  </div>
                </div>
                <Link href={`${ROUTES.STUDENT_TESTS}/${test.id}`}>
                  <Button>Start Test</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <Card className="border-border border-dashed text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No tests found in this category</p>
        </Card>
      )}
    </div>
  );
}
