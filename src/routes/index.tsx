import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CalendarDays, Layers, MessageCircle, Target } from "lucide-react";
import { Panel } from "@/components/AppShell";
import { useAttempts, useCardStatus, useDailyGoal } from "@/lib/app-state";
import { aggregateTopics, averageScore } from "@/lib/quiz";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Study Buddy" },
      { name: "description", content: "Your AZ-900 study dashboard: goals, quiz scores and topics to revise." },
      { property: "og:title", content: "AI Study Buddy — AZ-900 Dashboard" },
      { property: "og:description", content: "Track your Azure Fundamentals study goals, quiz scores and topics to revise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const LINKS = [
  { to: "/tutor", label: "AI Tutor", desc: "Ask Azure questions", icon: MessageCircle },
  { to: "/quiz", label: "Practice Quiz", desc: "13 exam-style questions", icon: BookOpen },
  { to: "/flashcards", label: "Flashcards", desc: "Key terms & definitions", icon: Layers },
  { to: "/planner", label: "Study Planner", desc: "Build a revision schedule", icon: CalendarDays },
] as const;

function Dashboard() {
  const [attempts] = useAttempts();
  const [cards] = useCardStatus();
  const [goal, setGoal] = useDailyGoal();
  const avg = averageScore(attempts);
  const weak = aggregateTopics(attempts).filter((t) => t.percent !== null && t.percent < 70);
  const reviewCount = Object.values(cards).filter((s) => s === "review").length;
  const next = attempts.length === 0 ? "/quiz" : weak.length ? "/flashcards" : "/quiz";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-brand p-6 text-primary-foreground shadow-glow sm:p-8">
        <p className="text-sm font-medium opacity-80">AZ-900 · Microsoft Azure Fundamentals</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome to AI Study Buddy</h1>
        <p className="mt-2 max-w-xl opacity-90">Learn the concepts, practise with original questions, and see where to focus next.</p>
        <Link to={next} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
          Continue Learning <ArrowRight className="size-4" />
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="size-4" /> Daily study goal</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold">{goal}</span><span className="text-muted-foreground">min</span>
          </div>
          <label className="sr-only" htmlFor="goal">Daily goal in minutes</label>
          <select id="goal" value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="mt-2 w-full rounded-md border bg-card px-2 py-1 text-sm">
            {[15, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </Panel>
        <Stat label="Quizzes completed" value={String(attempts.length)} />
        <Stat label="Average quiz score" value={avg === null ? "—" : `${avg}%`} hint={avg === null ? "Take a quiz to see this" : undefined} />
        <Stat label="Cards to review" value={String(reviewCount)} />
      </div>

      <Panel>
        <h2 className="text-lg font-semibold">Topics to revise</h2>
        {attempts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No quiz results yet. Complete a practice quiz and we'll highlight topics scoring under 70%.</p>
        ) : weak.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nice — all topics are at 70% or above across your attempts.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {weak.map((t) => (
              <li key={t.topic} className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">{t.topic} · {t.percent}%</li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card transition hover:border-primary">
            <span className="grid size-11 place-items-center rounded-xl bg-soft text-primary"><Icon className="size-5" /></span>
            <span className="flex-1"><span className="block font-semibold">{label}</span><span className="text-sm text-muted-foreground">{desc}</span></span>
            <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Panel>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </Panel>
  );
}
