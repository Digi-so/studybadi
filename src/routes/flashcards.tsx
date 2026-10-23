import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, RotateCcw, Shuffle, Sparkles, Trash2, X } from "lucide-react";
import { PageHeader, Panel, btnPrimary, btnSecondary } from "@/components/AppShell";
import { FLASHCARDS } from "@/data/flashcards";
import { useCardStatus, useCustomCards, type CustomCard } from "@/lib/app-state";
import { generateFlashcards } from "@/lib/ai/flashcards.functions";
import { MAX_DEF, MAX_SOURCE_CHARS, MAX_TERM, type GeneratedCard } from "@/lib/ai/flashcards-shared";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — AI Study Buddy" },
      { name: "description", content: "Flip Azure Fundamentals flashcards, create your own, turn notes into cards with AI, and mark what you know." },
      { property: "og:title", content: "AZ-900 Flashcards — AI Study Buddy" },
      { property: "og:description", content: "Built-in and personal Azure flashcards, with AI that turns your notes into new cards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Flashcards,
});

type DeckCard = { id: string; term: string; definition: string; category: string; custom: boolean };
const BUILT_IN = "Built-in";

function Flashcards() {
  const [custom, setCustom, { error: customError }] = useCustomCards();
  const [status, setStatus, { error }] = useCardStatus();
  const [filter, setFilter] = useState<string>("All");
  const [order, setOrder] = useState<string[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState<CustomCard | "new" | null>(null);
  const [deleting, setDeleting] = useState<CustomCard | null>(null);

  const all: DeckCard[] = useMemo(
    () => [
      ...FLASHCARDS.map((c) => ({ ...c, category: BUILT_IN, custom: false })),
      ...custom.map((c) => ({ ...c, custom: true })),
    ],
    [custom],
  );
  const categories = useMemo(() => [...new Set(custom.map((c) => c.category))].sort(), [custom]);
  const filters = ["All", BUILT_IN, "My cards", ...categories];

  const filtered = all.filter((c) =>
    filter === "All" ? true : filter === "My cards" ? c.custom : c.category === filter,
  );
  const deck = order ? order.map((id) => filtered.find((c) => c.id === id)).filter((c): c is DeckCard => !!c) : filtered;
  // Include cards added after shuffling.
  const cards = order ? [...deck, ...filtered.filter((c) => !order.includes(c.id))] : deck;

  useEffect(() => {
    if (pos >= cards.length && cards.length) setPos(cards.length - 1);
  }, [cards.length, pos]);

  const card = cards[Math.min(pos, cards.length - 1)];
  const known = Object.values(status).filter((s) => s === "known").length;
  const review = Object.values(status).filter((s) => s === "review").length;

  const go = (d: number) => {
    if (!cards.length) return;
    setFlipped(false);
    setPos((p) => (p + d + cards.length) % cards.length);
  };
  const shuffle = () => {
    const a = cards.map((c) => c.id);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    setOrder(a);
    setPos(0);
    setFlipped(false);
  };
  const changeFilter = (f: string) => {
    setFilter(f);
    setOrder(null);
    setPos(0);
    setFlipped(false);
  };
  const mark = (s: "known" | "review") => {
    if (!card) return;
    setStatus((prev) => ({ ...prev, [card.id]: s }));
    go(1);
  };

  const save = (c: CustomCard) => {
    setCustom((prev) => (prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c]));
    setEditing(null);
  };
  const remove = (c: CustomCard) => {
    setCustom((prev) => prev.filter((x) => x.id !== c.id));
    setStatus((prev) => {
      const { [c.id]: _, ...rest } = prev;
      return rest;
    });
    setDeleting(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <PageHeader title="Flashcards" subtitle="Click a card to reveal its meaning.">
          <div className="flex gap-2 text-sm">
            <span className="rounded-full bg-success/15 px-3 py-1 font-medium">Known {known}</span>
            <span className="rounded-full bg-warning/20 px-3 py-1 font-medium">Review {review}</span>
          </div>
        </PageHeader>

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Deck">
          {filters.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => changeFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${filter === f ? "border-primary bg-accent text-accent-foreground" : "bg-card hover:border-primary"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-xl">
          {!card ? (
            <Panel className="py-12 text-center">
              <p className="font-semibold">No cards in this deck yet</p>
              <p className="mb-4 text-sm text-muted-foreground">Create your own card to start studying it here.</p>
              <button className={btnPrimary} onClick={() => setEditing("new")}><Plus className="size-4" /> New card</button>
            </Panel>
          ) : (
            <>
              <p className="mb-2 text-center text-sm text-muted-foreground">
                Card {Math.min(pos, cards.length - 1) + 1} of {cards.length} · {card.custom ? card.category : BUILT_IN}
                {status[card.id] && <> · marked <strong>{status[card.id] === "known" ? "known" : "need to review"}</strong></>}
              </p>
              <button onClick={() => setFlipped((f) => !f)} aria-label={flipped ? "Show term" : "Reveal definition"} className="perspective block h-64 w-full focus-visible:outline-none">
                <div className={`preserve-3d relative h-full w-full transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}>
                  <div className="backface-hidden absolute inset-0 grid place-items-center rounded-3xl border bg-card p-6 shadow-card">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.custom ? "My card" : "Term"}</p>
                      <p className="mt-2 break-words font-display text-3xl font-bold">{card.term}</p>
                      <p className="mt-4 text-xs text-muted-foreground">Click to flip</p>
                    </div>
                  </div>
                  <div className="backface-hidden rotate-y-180 absolute inset-0 grid place-items-center overflow-auto rounded-3xl bg-brand p-6 text-primary-foreground shadow-glow">
                    <p className="whitespace-pre-line break-words text-lg leading-relaxed">{card.definition}</p>
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
            </>
          )}
          {(error || customError) && <p role="alert" className="mt-3 text-sm text-destructive">Your browser blocked saving, so changes won't persist after refresh.</p>}
        </div>
      </div>

      <AiGeneratePanel categories={categories} existingTerms={new Set(all.map((c) => c.term.toLowerCase()))}
        onAdd={(cards, category) =>
          setCustom((prev) => [
            ...prev,
            ...cards.map((c) => ({ id: `c-${crypto.randomUUID()}`, term: c.term, definition: c.definition, category })),
          ])
        } />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">My cards</h2>
            <p className="text-sm text-muted-foreground">Create your own cards and group them into categories.</p>
          </div>
          {editing === null && <button className={btnPrimary} onClick={() => setEditing("new")}><Plus className="size-4" /> New card</button>}
        </div>

        {editing !== null && (
          <CardForm key={editing === "new" ? "new" : editing.id} initial={editing === "new" ? null : editing} categories={categories}
            onSave={save} onCancel={() => setEditing(null)} />
        )}

        {custom.length === 0 ? (
          editing === null && <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">You haven't created any cards yet. Add terms you find tricky so you can study them next to the built-in cards.</p>
        ) : (
          <div className="space-y-5">
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">{cat} <span className="font-normal text-muted-foreground">({custom.filter((c) => c.category === cat).length})</span></h3>
                <ul className="divide-y rounded-xl border">
                  {custom.filter((c) => c.category === cat).map((c) => (
                    <li key={c.id} className="flex items-start gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-medium">{c.term}</p>
                        <p className="line-clamp-2 break-words text-sm text-muted-foreground">{c.definition}</p>
                      </div>
                      <button onClick={() => setEditing(c)} aria-label={`Edit ${c.term}`} className="rounded-md p-2 hover:bg-muted"><Pencil className="size-4" /></button>
                      <button onClick={() => setDeleting(c)} aria-label={`Delete ${c.term}`} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this card?</AlertDialogTitle>
            <AlertDialogDescription>"{deleting?.term}" will be removed from your cards. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove(deleting)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CardForm({ initial, categories, onSave, onCancel }: {
  initial: CustomCard | null; categories: string[]; onSave: (c: CustomCard) => void; onCancel: () => void;
}) {
  const [term, setTerm] = useState(initial?.term ?? "");
  const [definition, setDefinition] = useState(initial?.definition ?? "");
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? "My notes");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = term.trim(), d = definition.trim(), c = category.trim() || "My notes";
    if (!t || !d) return setErr("Please fill in both the term and the definition.");
    if (c.toLowerCase() === BUILT_IN.toLowerCase() || c === "All" || c === "My cards") return setErr("Please choose a different category name.");
    onSave({ id: initial?.id ?? `c-${crypto.randomUUID()}`, term: t, definition: d, category: c.slice(0, 40) });
  };

  const input = "mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <form onSubmit={submit} className="mb-5 space-y-3 rounded-xl border border-primary/30 bg-accent/40 p-4" noValidate>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{initial ? "Edit card" : "New card"}</h3>
        <button type="button" onClick={onCancel} aria-label="Close" className="rounded-md p-1 hover:bg-muted"><X className="size-4" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-term" className="text-sm font-medium">Term</label>
          <input id="cf-term" autoFocus value={term} maxLength={MAX_TERM} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. Azure Key Vault" className={input} />
        </div>
        <div>
          <label htmlFor="cf-cat" className="text-sm font-medium">Category</label>
          <input id="cf-cat" list="cf-cats" value={category} maxLength={40} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Security" className={input} />
          <datalist id="cf-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
      </div>
      <div>
        <label htmlFor="cf-def" className="text-sm font-medium">Definition</label>
        <textarea id="cf-def" rows={3} value={definition} maxLength={MAX_DEF} onChange={(e) => setDefinition(e.target.value)} placeholder="What it means, in your own words" className={input} />
        <p className="text-right text-xs text-muted-foreground">{definition.length}/{MAX_DEF}</p>
      </div>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className={btnSecondary} onClick={onCancel}>Cancel</button>
        <button type="submit" className={btnPrimary}>{initial ? "Save changes" : "Add card"}</button>
      </div>
    </form>
  );
}

function sanitizeCategory(c: string): string {
  const t = c.trim().slice(0, 40) || "My notes";
  return t.toLowerCase() === BUILT_IN.toLowerCase() || t === "All" || t === "My cards" ? "My notes" : t;
}

const AI_COUNTS = [5, 8, 12];

function AiGeneratePanel({ categories, existingTerms, onAdd }: {
  categories: string[];
  existingTerms: Set<string>;
  onAdd: (cards: GeneratedCard[], category: string) => void;
}) {
  const [source, setSource] = useState("");
  const [count, setCount] = useState(8);
  const [category, setCategory] = useState("My notes");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedCard[] | null>(null);
  const [picked, setPicked] = useState<Set<number>>(() => new Set());

  const generate = async () => {
    if (!source.trim() || busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await generateFlashcards({ data: { source, count, category: sanitizeCategory(category) } });
      if (res.error) {
        setError(res.error);
        setResults(null);
      } else {
        setResults(res.cards);
        setPicked(new Set(res.cards.map((_, i) => i)));
      }
    } catch {
      setError("Something went wrong while generating cards. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (i: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const addSelected = () => {
    if (!results) return;
    const cards = results.filter((_, i) => picked.has(i));
    if (cards.length) onAdd(cards, sanitizeCategory(category));
    setResults(null);
    setPicked(new Set());
    setSource("");
  };

  const input = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const selected = results?.filter((_, i) => picked.has(i)).length ?? 0;

  return (
    <Panel>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5 text-primary" /> Generate with AI</h2>
        <p className="text-sm text-muted-foreground">Paste study notes or name a topic, and Lovable AI turns it into flashcards. Review them before they're added.</p>
      </div>

      <textarea rows={5} value={source} maxLength={MAX_SOURCE_CHARS} disabled={busy}
        onChange={(e) => setSource(e.target.value)}
        placeholder="e.g. Paste your notes about Azure security, or just type a topic like 'Networking basics'"
        className={input} />
      <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="ai-count" className="text-sm font-medium">How many cards</label>
          <select id="ai-count" value={count} onChange={(e) => setCount(Number(e.target.value))}
            className={`mt-1 ${input} ${busy ? "opacity-60" : ""}`} disabled={busy}>
            {AI_COUNTS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ai-cat" className="text-sm font-medium">Category for new cards</label>
          <input id="ai-cat" list="ai-cats" value={category} maxLength={40} disabled={busy}
            onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Security" className={`mt-1 ${input}`} />
          <datalist id="ai-cats">{[...categories, "My notes"].map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <button onClick={generate} disabled={!source.trim() || busy} className={btnPrimary}>
          {busy ? <><Loader2 className="size-4 animate-spin" /> Thinking…</> : <><Sparkles className="size-4" /> Generate cards</>}
        </button>
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}

      {results && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">{results.length} cards generated — untick any you don't want.</p>
            <button onClick={() => { setResults(null); setPicked(new Set()); }} className={btnSecondary}><X className="size-4" /> Discard</button>
          </div>
          <ul className="divide-y rounded-xl border">
            {results.map((c, i) => {
              const dupe = existingTerms.has(c.term.toLowerCase());
              return (
                <li key={`${c.term}-${i}`} className="flex items-start gap-3 p-3">
                  <input type="checkbox" checked={picked.has(i)} onChange={() => toggle(i)} aria-label={`Include ${c.term}`}
                    className="mt-1 size-4 accent-[var(--primary)]" />
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium">{c.term}{dupe && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">already in your deck</span>}</p>
                    <p className="break-words text-sm text-muted-foreground">{c.definition}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex justify-end">
            <button onClick={addSelected} disabled={!selected} className={btnPrimary}>
              <Check className="size-4" /> Add {selected} {selected === 1 ? "card" : "cards"} to my cards
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
