import { createServerFn, getRequest } from "@tanstack/react-start";
import {
  clampCardCount,
  MAX_SOURCE_CHARS,
  normalizeGeneratedCards,
  type GeneratedCard,
} from "./flashcards-shared";

export interface GenerateFlashcardsResult {
  cards: GeneratedCard[];
  error: string | null;
}

function friendlyError(message: string): string {
  if (/credit|402/i.test(message)) {
    return "The AI credit for this app has run out. Top up your credits or try again later.";
  }
  if (/aborted|AbortError/i.test(message)) {
    return "Generation was stopped.";
  }
  if (/NoObject|schema|parse/i.test(message)) {
    return "The model couldn't shape the cards from that. Try more detailed notes and generate again.";
  }
  return "Something went wrong while generating cards. Please try again.";
}

export const generateFlashcards = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Invalid request.");
    const { source, count, category } = input as Record<string, unknown>;
    const text = typeof source === "string" ? source.trim() : "";
    if (!text) throw new Error("Please enter your study notes or a topic first.");
    if (text.length > MAX_SOURCE_CHARS) {
      throw new Error("Your notes are too long. Trim them to about 8,000 characters.");
    }
    return {
      source: text,
      count: clampCardCount(count),
      category: typeof category === "string" ? category.trim().slice(0, 40) : "My notes",
    };
  })
  .handler(async ({ data }): Promise<GenerateFlashcardsResult> => {
    const request = getRequest();
    try {
      const { runFlashcardGeneration } = await import("./flashcards.server");
      const { cards } = await runFlashcardGeneration(request, data);
      const normalized = normalizeGeneratedCards(cards, data.count);
      if (!normalized.length) {
        return {
          cards: [],
          error: "The model couldn't find anything worth memorising in that. Try adding more detailed notes.",
        };
      }
      return { cards: normalized, error: null };
    } catch (e) {
      console.error("AI flashcard generation failed", e);
      if (request.signal.aborted) return { cards: [], error: "Generation was stopped." };
      const message = e instanceof Error ? e.message : String(e);
      return { cards: [], error: friendlyError(message) };
    }
  });
