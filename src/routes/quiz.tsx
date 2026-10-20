import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { PageHeader, Panel, btnPrimary, btnSecondary } from "@/components/AppShell";
import { QUIZ } from "@/data/quiz";
import { scoreQuiz } from "@/lib/quiz";
import { useAttempts } from "@/lib/app-state";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Practice Quiz — AI Study Buddy" },
      { name: "description", content: "Original AZ-900-style practice questions with explanations and topic results." },
      { property: "og:title", content: "AZ-900 Practice Quiz — AI Study Buddy" },
      { property: "og:description", content: "Practise cloud concepts, Azure services and governance with explained answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quiz,
});

const LETTERS = ["A", "B", "C", "D"];

function Quiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [idx, setIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [, setAttempts, { error: saveError }] = useAttempts();

  const q = QUIZ[idx];
  const answeredCount = answers.filter((a) => a !== null).length;
  const result = scoreQuiz(QUIZ, answers);

  function submit() {
    setSubmitted(true);
    setConfirm(false);
    setIdx(0);
    setAttempts((prev) => [...prev, { id: crypto.randomUUID(), date: new Date().toISOString(), ...result }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retake() {
    setAnswers(QUIZ.map(() => null));
    setSubmitted(false);
    setIdx(0);
  }

  return (
    <div>
      <PageHeader title="AZ-900 Practice Quiz" subtitle="Original practice questions — not official Microsoft exam items." />

      {submitted && (
        <Panel className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Your score</p>
              <p className="font-display text-4xl font-bold"><span className="text-brand">{result.percent}%</span></p>
              <p className="text-sm text-muted-foreground">{result.correct} of {result.total} correct</p>
            </div>
            <div className="flex gap-2">
              <Link to="/progress" className={btnSecondary}>View progress</Link>
              <button onClick={retake} className={btnPrimary}><RotateCcw className="size-4" /> Retake Quiz</button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {result.topics.map((t) => (
              <div key={t.topic} className="rounded-xl bg-muted p-3">
                <p className="text-sm font-medium">{t.topic}</p>
                <p className="text-lg font-bold">{t.correct}/{t.total}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full bg-brand" style={{ width: `${(t.correct / t.total) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          {saveError && <p role="alert" className="mt-3 text-sm text-destructive">Your browser blocked saving, so this result won't persist after refresh.</p>}
        </Panel>
      )}

      <Panel>
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>Question {idx + 1} of {QUIZ.length}</span>
            <span>{submitted ? "Review mode" : `${answeredCount} answered`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={idx + 1} aria-valuemin={1} aria-valuemax={QUIZ.length}>
            <div className="h-full bg-brand transition-all" style={{ width: `${((idx + 1) / QUIZ.length) * 100}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUIZ.map((qq, i) => {
              const state = submitted ? (answers[i] === qq.answer ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground") : answers[i] !== null ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground";
              return (
                <button key={qq.id} onClick={() => setIdx(i)} aria-label={`Go to question ${i + 1}`}
                  className={`size-8 rounded-md text-xs font-semibold ${state} ${i === idx ? "ring-2 ring-ring ring-offset-1" : ""}`}>{i + 1}</button>
              );
            })}
          </div>
        </div>

        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">{q.topic}</span>
        <h2 className="mt-3 text-lg font-semibold leading-snug">{q.question}</h2>

        <div className="mt-4 grid gap-2" role="radiogroup">
          {q.options.map((opt, i) => {
            const chosen = answers[idx] === i;
            const isCorrect = i === q.answer;
            let cls = "border bg-card hover:border-primary";
            if (!submitted && chosen) cls = "border-primary bg-accent";
            if (submitted && isCorrect) cls = "border-success bg-success/10";
            if (submitted && chosen && !isCorrect) cls = "border-destructive bg-destructive/10";
            return (
              <button key={i} role="radio" aria-checked={chosen} disabled={submitted}
                onClick={() => setAnswers((a) => a.map((v, j) => (j === idx ? i : v)))}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition disabled:cursor-default ${cls}`}>
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold">{LETTERS[i]}</span>
                <span className="flex-1">{opt}</span>
                {submitted && isCorrect && <Check className="size-4 text-success" />}
                {submitted && chosen && !isCorrect && <X className="size-4 text-destructive" />}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className="mt-4 rounded-xl bg-muted p-4 text-sm">
            <p className="font-semibold">{answers[idx] === q.answer ? "Correct!" : answers[idx] === null ? "Not answered." : "Not quite."} Correct answer: {LETTERS[q.answer]}</p>
            <p className="mt-1 text-muted-foreground">{q.explanation}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <button className={btnSecondary} disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ChevronLeft className="size-4" /> Previous</button>
          <div className="flex gap-2">
            {!submitted && <button className={btnSecondary} onClick={() => setConfirm(true)}>Submit</button>}
            <button className={btnPrimary} disabled={idx === QUIZ.length - 1} onClick={() => setIdx(idx + 1)}>Next <ChevronRight className="size-4" /></button>
          </div>
        </div>
      </Panel>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit your answers?</AlertDialogTitle>
            <AlertDialogDescription>
              You've answered {answeredCount} of {QUIZ.length} questions.
              {answeredCount < QUIZ.length && " Unanswered questions will be marked incorrect."} Answers are locked after submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep working</AlertDialogCancel>
            <AlertDialogAction onClick={submit}>Submit quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
