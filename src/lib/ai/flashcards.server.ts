import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText, type ModelMessage } from "ai";
import { z } from "zod";
import { clampCardCount, MAX_SOURCE_CHARS } from "./flashcards-shared";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
} from "./run-id.server";

// Server-only helpers for AI flashcard generation through Lovable AI Gateway.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const outputSchema = z.object({
  cards: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
    }),
  ),
});

const SYSTEM_PROMPT = [
  "You are a study assistant that turns a student's study notes, or a named topic, into revision flashcards.",
  "Pick the most important and most testable concepts from what the student provides.",
  "Rules for every card:",
  "- The term is short: a name, acronym or concept, at most eight words.",
  "- The definition is self-contained and makes sense without reading the notes: one to three sentences, in plain language.",
  "- Where the notes give a concrete example, include it in the definition.",
  "- Never invent facts that are not supported by the notes. When the student only names a topic, use well-established, widely accepted knowledge.",
  "- Produce exactly the number of cards requested.",
].join("\n");

export interface FlashcardGenerationInput {
  source: string;
  count: number;
  category: string;
}

export async function runFlashcardGeneration(
  request: Request,
  input: FlashcardGenerationInput,
): Promise<{ cards: { term: string; definition: string }[] }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Missing AI configuration (LOVABLE_API_KEY).");

  const count = clampCardCount(input.count);
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const userPrompt = [
    `Create ${count} flashcards. Category the student gave: "${input.category || "My notes"}".`,
    "Study notes or topic:",
    input.source.slice(0, MAX_SOURCE_CHARS),
  ].join("\n\n");

  const messages: ModelMessage[] = [{ role: "user", content: userPrompt }];

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: SYSTEM_PROMPT,
    messages,
    output: Output.object({ schema: outputSchema }),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const output = await result.output;
  return { cards: Array.isArray(output?.cards) ? output.cards : [] };
}
