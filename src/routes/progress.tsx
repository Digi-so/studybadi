import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Trash2 } from "lucide-react";
import { PageHeader, Panel, btnPrimary, btnSecondary } from "@/components/AppShell";
import { useAttempts, useCardStatus } from "@/lib/app-state";
import { aggregateTopics, averageScore } from "@/lib/quiz";
import { clearAllStore } from "@/lib/storage";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — AI Study Buddy" },
      { name: "description", content: "Review your AZ-900 quiz attempts, scores and topic performance." },
      { property: "og:title", content: "AZ-900 Progress — AI Study Buddy" },
      { property: "og:description", content: "See quiz history and topic-level performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Progress,
});

function Progress() {
  const [attempts, , { ready }] = useAttempts();
  const [cards] = useCardStatus();
  const avg = averageScore(attempts);
  const topics = aggregateTopics(attempts);
  const best = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null;

  return (
    <div>
      <PageHeader title="Progress" subtitle="Saved in this browser only.">
        <AlertDialog>
          <AlertDialogTrigger className={btnSecondary}><Trash2 className="size-4" /> Reset Demo Data</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
              <AlertDialogDescription>This deletes quiz attempts, flashcard progress, your study plan and daily goal from this browser. It can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllStore}>Reset data</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageHeader>

      {ready && attempts.length === 0 ? (
        <Panel className="grid place-items-center py-16 text-center">
          <BarChart3 className="mb-3 size-10 text-primary" />
          <p className="font-semibold">No quiz attempts yet</p>
          <p className="mb-4 text-sm text-muted-foreground">Complete a practice quiz to start tracking your scores.</p>
          <Link to="/quiz" className={btnPrimary}>Start the quiz</Link>
        </Panel>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["Attempts", String(attempts.length)],
              ["Average score", avg === null ? "—" : `${avg}%`],
              ["Best score", best === null ? "—" : `${best}%`],
              ["Cards known", String(Object.values(cards).filter((s) => s === "known").length)],
            ].map(([l, v]) => (
              <Panel key={l}><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 font-display text-3xl font-bold">{v}</p></Panel>
            ))}
          </div>

          <Panel>
            <h2 className="mb-4 text-lg font-semibold">Topic performance (all attempts)</h2>
            <div className="space-y-4">
              {topics.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{t.topic}</span><span className="text-muted-foreground">{t.percent === null ? "No data" : `${t.correct}/${t.total} · ${t.percent}%`}</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-brand" style={{ width: `${t.percent ?? 0}%` }} /></div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="mb-3 text-lg font-semibold">Quiz history</h2>
            <ul className="divide-y">
              {[...attempts].reverse().map((a, i) => (
                <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                  <span><span className="font-medium">Attempt {attempts.length - i}</span> <span className="text-muted-foreground">· {new Date(a.date).toLocaleString()}</span></span>
                  <span className="font-semibold">{a.correct}/{a.total} ({a.percent}%)</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </div>
  );
}
