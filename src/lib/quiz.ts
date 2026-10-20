import { TOPICS, type QuizQuestion, type Topic } from "@/data/quiz";

export interface TopicResult {
  topic: Topic;
  correct: number;
  total: number;
}

export interface QuizAttempt {
  id: string;
  date: string;
  correct: number;
  total: number;
  percent: number;
  topics: TopicResult[];
}

/** answers[i] is the chosen option index or null if unanswered. */
export function scoreQuiz(questions: QuizQuestion[], answers: (number | null)[]) {
  let correct = 0;
  const topics: TopicResult[] = TOPICS.map((topic) => ({ topic, correct: 0, total: 0 }));
  questions.forEach((q, i) => {
    const t = topics.find((x) => x.topic === q.topic)!;
    t.total++;
    if (answers[i] === q.answer) {
      correct++;
      t.correct++;
    }
  });
  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent, topics: topics.filter((t) => t.total > 0) };
}

export function aggregateTopics(attempts: QuizAttempt[]) {
  return TOPICS.map((topic) => {
    let c = 0;
    let t = 0;
    attempts.forEach((a) =>
      a.topics.forEach((r) => {
        if (r.topic === topic) {
          c += r.correct;
          t += r.total;
        }
      }),
    );
    return { topic, correct: c, total: t, percent: t ? Math.round((c / t) * 100) : null };
  });
}

export function averageScore(attempts: QuizAttempt[]) {
  if (!attempts.length) return null;
  return Math.round(attempts.reduce((s, a) => s + a.percent, 0) / attempts.length);
}
