import { DifficultyLevel, Question } from './types';

/**
 * Local AI fallback helpers.
 * The route handlers are environment-driven and can be upgraded to call a provider with OPENAI_API_KEY.
 */

export async function generateQuestions(
  topic: string,
  difficulty: DifficultyLevel,
  count: number = 5
): Promise<Question[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const questions: Question[] = Array.from({ length: count }, (_, i) => ({
        id: `ai_question_${Date.now()}_${i}`,
        text: `Generated ${difficulty} question about ${topic}: ${i + 1}`,
        type: i % 2 === 0 ? 'multiple-choice' : 'short-answer',
        difficulty,
        category: topic,
        options: i % 2 === 0 ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
        correctAnswer: i % 2 === 0 ? 'Option A' : 'The correct answer text',
        explanation: `This is an explanation for the question about ${topic}.`,
        createdBy: 'ai_system',
        createdAt: new Date(),
        tags: ['ai-generated', topic.toLowerCase()],
      }));

      resolve(questions);
    }, 1000);
  });
}

export async function evaluateAnswer(
  question: Question,
  studentAnswer: string
): Promise<{
  isCorrect: boolean;
  score: number;
  feedback: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isCorrect = question.correctAnswer === studentAnswer;
      const score = isCorrect ? 100 : 0;
      const feedback = isCorrect
        ? 'Great! Your answer is correct.'
        : `The correct answer is: ${question.correctAnswer}`;

      resolve({
        isCorrect,
        score,
        feedback,
      });
    }, 500);
  });
}

export async function generateFeedback(
  studentAnswers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }>,
  topicArea: string
): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const correctCount = studentAnswers.filter((a) => a.isCorrect).length;
      const totalCount = studentAnswers.length;
      const percentage = Math.round((correctCount / totalCount) * 100);

      let feedback = `You scored ${percentage}% on ${topicArea}. `;

      if (percentage >= 80) {
        feedback += 'Excellent work! You have a strong understanding of this topic.';
      } else if (percentage >= 60) {
        feedback += 'Good effort! Review the concepts you missed to improve further.';
      } else {
        feedback +=
          'You need more practice on this topic. Consider reviewing the fundamentals.';
      }

      resolve(feedback);
    }, 800);
  });
}

export async function suggestStudyPlan(
  userPerformance: Array<{
    category: string;
    score: number;
  }>
): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const suggestions = userPerformance
        .filter((p) => p.score < 70)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((p) => `Focus on improving ${p.category} (current score: ${p.score}%)`);

      if (suggestions.length === 0) {
        suggestions.push(
          'You are performing well! Consider taking advanced practice tests.'
        );
      }

      resolve(suggestions);
    }, 600);
  });
}
