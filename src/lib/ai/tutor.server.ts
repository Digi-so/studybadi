import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText, type ModelMessage } from "ai";
import { z } from "zod";
import type { TutorAnswer, TutorHistoryMessage } from "./tutor-shared";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
} from "./run-id.server";

// Server-only AI tutor through Lovable AI Gateway.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const answerSchema = z.object({
  title: z.string(),
  simple: z.string(),
  analogy: z.string(),
  keyPoints: z.array(z.string()),
  check: z.string(),
});

const SYSTEM_PROMPT = [
  "You are an AI study tutor for the Microsoft Azure Fundamentals (AZ-900) exam, aimed at complete beginners.",
  "Answer the student's latest question. Use the earlier conversation for context when the question refers back to it (for example \"why?\" or \"what about the other one?\").",
  "Rules:",
  "- Use plain, friendly language. Explain any jargon the first time you use it.",
  "- Structure every answer exactly as the required format asks: a short title, a simple explanation, a real-world analogy, 3-5 key points, and a one-question self-check.",
  "- Keep it concise: the simple explanation is 2-5 sentences, the analogy one or two, and each key point one short sentence.",
  "- Use only well-established Azure fundamentals knowledge; never invent service names, prices or numbers.",
  "- If the question is unrelated to cloud or Azure study, answer briefly and gently steer the student back to study topics.",
  "- Never claim the student is ready for the exam and never promise they will pass.",
].join("\n");

export interface TutorAnswerInput {
  question: string;
  history: TutorHistoryMessage[];
}

export async function runTutorAnswer(
  request: Request,
  input: TutorAnswerInput,
): Promise<TutorAnswer> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Missing AI configuration (LOVABLE_API_KEY).");

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const messages: ModelMessage[] = input.history.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.text,
  }));
  messages.push({ role: "user", content: input.question });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: SYSTEM_PROMPT,
    messages,
    output: Output.object({ schema: answerSchema }),
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
  const keyPoints = Array.isArray(output?.keyPoints)
    ? output.keyPoints
        .filter((k): k is string => typeof k === "string")
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];
  return {
    title: (output?.title ?? "").trim() || "Explanation",
    simple: (output?.simple ?? "").trim(),
    analogy: (output?.analogy ?? "").trim(),
    keyPoints,
    check: (output?.check ?? "").trim(),
  };
}
