// Client-safe helpers for AI-generated flashcards (used by both the server
// function and the UI, and by unit tests).

export interface GeneratedCard {
  term: string;
  definition: string;
}

export const MIN_GENERATED = 3;
export const MAX_GENERATED = 15;
export const MAX_SOURCE_CHARS = 8000;
export const MAX_TERM = 80;
export const MAX_DEF = 400;

/** Clean raw model output: trim, drop blanks, dedupe, clamp counts and lengths. */
export function normalizeGeneratedCards(raw: unknown, max: number): GeneratedCard[] {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set<string>();
  const cards: GeneratedCard[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const term = String((entry as { term?: unknown }).term ?? "").trim();
    const definition = String((entry as { definition?: unknown }).definition ?? "").trim();
    if (!term || !definition) continue;
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push({ term: term.slice(0, MAX_TERM), definition: definition.slice(0, MAX_DEF) });
    if (cards.length >= max) break;
  }
  return cards;
}

export function clampCardCount(count: unknown): number {
  const n = typeof count === "number" && Number.isFinite(count) ? Math.round(count) : 8;
  return Math.max(MIN_GENERATED, Math.min(MAX_GENERATED, n));
}
