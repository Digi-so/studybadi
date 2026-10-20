import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Info, Loader2, Send } from "lucide-react";
import { PageHeader, btnPrimary } from "@/components/AppShell";
import { askDemoTutor, SUGGESTED_PROMPTS, type TutorAnswer } from "@/lib/tutor";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — AI Study Buddy" },
      { name: "description", content: "Ask Azure Fundamentals questions and get simple, structured explanations." },
      { property: "og:title", content: "AZ-900 Tutor — AI Study Buddy" },
      { property: "og:description", content: "Simple explanations, analogies and key points for Azure concepts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tutor,
});

type Msg = { role: "user"; text: string } | { role: "tutor"; answer: TutorAnswer };

function Tutor() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, loading]);

  async function ask(text: string) {
    const q = text.trim();
    if (!q) return setError("Please type a question first.");
    if (q.length > 500) return setError("Please keep questions under 500 characters.");
    setError(null);
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const answer = await askDemoTutor(q);
      setMsgs((m) => [...m, { role: "tutor", answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <div>
      <PageHeader title="AI Tutor" subtitle="Ask about any AZ-900 concept." />
      <div className="mb-4 flex gap-2 rounded-xl border border-primary/30 bg-accent p-3 text-sm text-accent-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p><strong>Demo tutor:</strong> answers come from prepared explanations in this app, not from an AI model. A real AI provider can be connected later.</p>
      </div>

      <div className="flex min-h-[420px] flex-col rounded-2xl border bg-card shadow-card">
        <div className="flex-1 space-y-4 p-4 sm:p-5" aria-live="polite">
          {msgs.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-semibold">Not sure where to start?</p>
              <p className="text-sm text-muted-foreground">Try one of these:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p} onClick={() => ask(p)} className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary">{p}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-sm text-primary-foreground">{m.text}</div>
            ) : (
              <AnswerCard key={i} a={m.answer} />
            ),
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Preparing explanation…</div>
          )}
          <div ref={endRef} />
        </div>
        {msgs.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t px-4 py-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button key={p} disabled={loading} onClick={() => ask(p)} className="rounded-full bg-muted px-2.5 py-1 text-xs hover:text-primary disabled:opacity-50">{p}</button>
            ))}
          </div>
        )}
        <form onSubmit={onSubmit} className="flex gap-2 border-t p-3">
          <label htmlFor="q" className="sr-only">Your question</label>
          <input id="q" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. What is a resource group?" maxLength={500}
            className="flex-1 rounded-lg border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <button type="submit" disabled={loading} className={btnPrimary} aria-label="Send">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}<span className="hidden sm:inline">Send</span>
          </button>
        </form>
        {error && <p role="alert" className="px-4 pb-3 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}

function AnswerCard({ a }: { a: TutorAnswer }) {
  return (
    <article className="max-w-[95%] rounded-2xl rounded-bl-sm border bg-background p-4 text-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{a.source === "demo" ? "Demo response" : "AI response"}</span>
        <h3 className="font-semibold">{a.title}</h3>
      </div>
      <Section title="Simple Explanation">{a.simple}</Section>
      <Section title="Real-World Analogy">{a.analogy}</Section>
      <Section title="Key Points">
        <ul className="list-disc space-y-1 pl-5">{a.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
      </Section>
      <Section title="Check Your Understanding"><em>{a.check}</em></Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">{title}</h4>
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}
