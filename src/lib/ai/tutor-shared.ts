// Client-safe types and limits for the AI tutor. No server-only imports here.

export interface TutorAnswer {
  title: string;
  simple: string;
  analogy: string;
  keyPoints: string[];
  check: string;
}

export type TutorHistoryMessage =
  | { role: "user"; text: string }
  | { role: "tutor"; text: string };

export const MAX_QUESTION_CHARS = 500;
export const MAX_HISTORY_MESSAGES = 8;
export const MAX_HISTORY_TEXT_CHARS = 600;

export function clampQuestion(raw: unknown): string {
  const text = typeof raw === "string" ? raw.trim() : "";
  return text.slice(0, MAX_QUESTION_CHARS);
}

/** Keeps only the last few valid conversation messages, trimmed and length-capped. */
export function sanitizeHistory(raw: unknown): TutorHistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: TutorHistoryMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { role, text } = item as Record<string, unknown>;
    if (role !== "user" && role !== "tutor") continue;
    if (typeof text !== "string") continue;
    const trimmed = text.trim();
    if (!trimmed) continue;
    cleaned.push(
      role === "user"
        ? { role: "user", text: trimmed.slice(0, MAX_HISTORY_TEXT_CHARS) }
        : { role: "tutor", text: trimmed.slice(0, MAX_HISTORY_TEXT_CHARS) },
    );
  }
  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}
