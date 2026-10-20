import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import { PageHeader, Panel, btnPrimary } from "@/components/AppShell";
import { TOPICS, type Topic } from "@/data/quiz";
import { generatePlan, type PlanError } from "@/lib/planner";
import { usePlan } from "@/lib/app-state";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — AI Study Buddy" },
      { name: "description", content: "Generate a day-by-day AZ-900 revision schedule from your exam date and study time." },
      { property: "og:title", content: "AZ-900 Study Planner — AI Study Buddy" },
      { property: "og:description", content: "Build a simple revision schedule for Azure Fundamentals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planner,
});

const ERRORS: Record<PlanError, string> = {
  "invalid-date": "Please choose a valid exam date.",
  "past-date": "Your exam date needs to be at least one day from today.",
  "invalid-minutes": "Daily study time must be between 10 and 480 minutes.",
};

function Planner() {
  const [saved, setSaved] = usePlan();
  const [examDate, setExamDate] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const r = generatePlan(examDate, minutes, topics);
    if ("error" in r) return setError(ERRORS[r.error]);
    setError(null);
    setSaved({ examDate, minutes, topics, days: r.plan });
  };

  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  return (
    <div>
      <PageHeader title="Study Planner" subtitle="Tell us your timeline and we'll build a simple revision schedule." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Panel className="h-fit">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="exam" className="text-sm font-medium">Exam date</label>
              <input id="exam" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="min" className="text-sm font-medium">Daily study time (minutes)</label>
              <input id="min" type="number" min={10} max={480} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Topics needing improvement</legend>
              <div className="mt-2 space-y-2">
                {TOPICS.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 accent-primary" checked={topics.includes(t)}
                      onChange={(e) => setTopics((p) => (e.target.checked ? [...p, t] : p.filter((x) => x !== t)))} />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button type="submit" className={`${btnPrimary} w-full`}>Generate plan</button>
            <p className="text-xs text-muted-foreground">Selected topics get extra sessions. Every 7th day and the final day are practice & review days. Plans cover up to 60 days.</p>
          </form>
        </Panel>

        <Panel>
          {!saved ? (
            <div className="grid place-items-center py-16 text-center text-muted-foreground">
              <CalendarDays className="mb-3 size-10 text-primary" />
              <p className="font-medium text-foreground">No plan yet</p>
              <p className="text-sm">Fill in the form to generate your schedule.</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Your plan to {fmt(saved.examDate)}</h2>
              <p className="text-sm text-muted-foreground">{saved.days.length} days · {saved.minutes} min/day</p>
              <ol className="mt-4 divide-y">
                {saved.days.map((d) => (
                  <li key={d.date} className="flex gap-4 py-3">
                    <span className="w-24 shrink-0 text-sm font-medium text-muted-foreground">{fmt(d.date)}</span>
                    <span>
                      <span className={`block text-sm font-semibold ${d.topic.startsWith("Full") ? "text-violet" : "text-primary"}`}>{d.topic}</span>
                      <span className="text-sm text-muted-foreground">{d.focus} · {d.minutes} min</span>
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
