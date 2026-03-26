'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Test, Question, TestAnswer } from '@/lib/types';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, Flag } from 'lucide-react';

interface TestPlayerProps {
  test: Test;
  onSubmit: (answers: TestAnswer[]) => void;
}

export function TestPlayer({ test, onSubmit }: TestPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>(
    test.questions.map((q) => ({
      questionId: q.id,
      answer: '',
      timeSpent: 0,
    }))
  );
  const [timeRemaining, setTimeRemaining] = useState(test.timeLimit * 60);
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);

  const currentQuestion = test.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 60 && prev > 0) {
          setShowWarning(true);
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      ...currentAnswer,
      answer: value,
      timeSpent: Math.round((Date.now() - startTime) / 1000),
    };
    setAnswers(newAnswers);
  };

  const handleMarkQuestion = () => {
    const newMarked = new Set(markedQuestions);
    if (newMarked.has(currentQuestion.id)) {
      newMarked.delete(currentQuestion.id);
    } else {
      newMarked.add(currentQuestion.id);
    }
    setMarkedQuestions(newMarked);
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit your test? You cannot change your answers after submission.')) {
      onSubmit(answers);
    }
  };

  const questionsWithAnswers = answers.filter((a) => a.answer.trim() !== '').length;
  const progress = Math.round((questionsWithAnswers / test.questions.length) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-100px)]">
      {/* Question Area */}
      <div className="lg:col-span-3 flex flex-col">
        {/* Header */}
        <Card className="border-border mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{test.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </p>
              </div>
              <div className={`text-right ${timeRemaining < 60 ? 'text-red-600' : ''}`}>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Clock className="w-5 h-5" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
            {showWarning && timeRemaining < 60 && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  Time is running out! You have less than 1 minute remaining.
                </p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Question Content */}
        <Card className="border-border flex-1 flex flex-col mb-4 overflow-hidden">
          <CardContent className="pt-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{currentQuestion.text}</h3>

              {/* Answer Input */}
              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-card transition-colors"
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={currentAnswer.answer === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-foreground">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true-false' && (
                <div className="space-y-3">
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-card transition-colors"
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={currentAnswer.answer === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-foreground">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'essay') && (
                <textarea
                  value={currentAnswer.answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={currentQuestion.type === 'essay' ? 6 : 3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            onClick={handleMarkQuestion}
            variant={markedQuestions.has(currentQuestion.id) ? 'default' : 'outline'}
            className="gap-2"
          >
            <Flag className="w-4 h-4" />
            {markedQuestions.has(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
          </Button>

          {currentQuestionIndex === test.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === test.questions.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        {/* Progress */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Answered</span>
                <span className="text-sm font-bold text-accent">{questionsWithAnswers}/{test.questions.length}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <Card className="border-border flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Questions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {test.questions.map((question, idx) => {
                const isAnswered = answers[idx].answer.trim() !== '';
                const isMarked = markedQuestions.has(question.id);
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`p-2 rounded text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-accent text-white'
                        : isAnswered
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'bg-border text-muted-foreground hover:bg-border/80'
                    } ${isMarked ? 'ring-2 ring-orange-400' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
