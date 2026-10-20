import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { PageHeader, btnPrimary, btnSecondary } from "@/components/AppShell";
import { FLASHCARDS } from "@/data/flashcards";
import { useCardStatus } from "@/lib/app-state";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — AI Study Buddy" },
      { name: "description", content: "Flip through Azure Fundamentals flashcards and mark what you know." },
      { property: "og:title", content: "AZ-900 Flashcards — AI Study Buddy" },
      { property: "og:description", content: "Interactive Azure term flashcards with saved review progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Flashcards,
});

function Flashcards() {
  const [order, setOrder] = useState(() => FLASHCARDS.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus, { error }] = useCardStatus();

  const card = FLASHCARDS[order[pos]];
  const known = Object.values(status).filter((s) => s === "known").length;
  const review = Object.values(status).filter((s) => s === "review").length;

  const go = (d: number) => {
    setFlipped(false);
    setPos((p) => (p + d + order.length) % order.length);
  };
  const shuffle = () => {
    const a = [...order];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    setOrder(a);
    setPos(0);
    setFlipped(false);
  };
  const mark = (s: "known" | "review") => {
    setStatus((prev) => ({ ...prev, [card.id]: s }));
    go(1);
  };

  return (
    <div>
      <PageHeader title="Flashcards" subtitle="Click a card to reveal its meaning.">
        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-success/15 px-3 py-1 font-medium">Known {known}</span>
          <span className="rounded-full bg-warning/20 px-3 py-1 font-medium">Review {review}</span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-xl">
        <p className="mb-2 text-center text-sm text-muted-foreground">Card {pos + 1} of {order.length}
          {status[card.id] && <> · marked <strong>{status[card.id] === "known" ? "known" : "need to review"}</strong></>}</p>
        <button onClick={() => setFlipped((f) => !f)} aria-label={flipped ? "Show term" : "Reveal definition"} className="perspective block h-64 w-full focus-visible:outline-none">
          <div className={`preserve-3d relative h-full w-full transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}>
            <div className="backface-hidden absolute inset-0 grid place-items-center rounded-3xl border bg-card p-6 shadow-card">
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Term</p><p className="mt-2 font-display text-3xl font-bold">{card.term}</p><p className="mt-4 text-xs text-muted-foreground">Click to flip</p></div>
            </div>
            <div className="backface-hidden rotate-y-180 absolute inset-0 grid place-items-center rounded-3xl bg-brand p-6 text-primary-foreground shadow-glow">
              <p className="text-lg leading-relaxed">{card.definition}</p>
            </div>
          </div>
        </button>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={() => mark("review")} className={btnSecondary}><RotateCcw className="size-4" /> Need to review</button>
          <button onClick={() => mark("known")} className={btnPrimary}><Check className="size-4" /> I know this</button>
        </div>
        <div className="mt-3 flex justify-between">
          <button onClick={() => go(-1)} className={btnSecondary}><ChevronLeft className="size-4" /> Previous</button>
          <button onClick={shuffle} className={btnSecondary}><Shuffle className="size-4" /> Shuffle</button>
          <button onClick={() => go(1)} className={btnSecondary}>Next <ChevronRight className="size-4" /></button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">Your browser blocked saving, so review status won't persist.</p>}
      </div>
    </div>
  );
}
