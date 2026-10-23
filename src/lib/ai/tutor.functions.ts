import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  MAX_QUESTION_CHARS,
  sanitizeHistory,
  type TutorAnswer,
} from "./tutor-shared";

export interface AskTutorResult {
  answer: TutorAnswer | null;
  error: string | null;
}

function friendlyError(message: string): string {
  if (/credit|402/i.test(message)) {
    return "The AI credit for this app has run out. Top up your credits or try again later.";
  }
  if (/aborted|AbortError/i.test(message)) {
    return "The answer was stopped.";
  }
  if (/NoObject|schema|parse/i.test(message)) {
    return "The model couldn't structure an answer for that. Try rephrasing your question.";
  }
  return "Something went wrong while answering. Please try again.";
}

export const askTutor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Invalid request.");
    const { question, history } = input as Record<string, unknown>;
    const q = typeof question === "string" ? question.trim() : "";
    if (!q) throw new Error("Please type a question first.");
    if (q.length > MAX_QUESTION_CHARS) {
      throw new Error(`Please keep questions under ${MAX_QUESTION_CHARS} characters.`);
    }
    return { question: q, history: sanitizeHistory(history) };
  })
  .handler(async ({ data }): Promise<AskTutorResult> => {
    const request = getRequest();
    try {
      const { runTutorAnswer } = await import("./tutor.server");
      const answer = await runTutorAnswer(request, data);
      if (!answer.simple && !answer.keyPoints.length) {
        return {
          answer: null,
          error: "The model couldn't produce an answer. Try rephrasing your question.",
        };
      }
      return { answer, error: null };
    } catch (e) {
      console.error("AI tutor failed", e);
      if (request.signal.aborted) return { answer: null, error: "The answer was stopped." };
      const message = e instanceof Error ? e.message : String(e);
      return { answer: null, error: friendlyError(message) };
    }
  });
