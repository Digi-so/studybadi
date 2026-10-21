import { describe, expect, it } from "vitest";
import { QUIZ } from "@/data/quiz";
import { scoreQuiz } from "@/lib/quiz";
import { generatePlan } from "@/lib/planner";

describe("quiz scoring", () => {
  it("has at least 12 questions with four options", () => {
    expect(QUIZ.length).toBeGreaterThanOrEqual(12);
    QUIZ.forEach((q) => expect(q.options).toHaveLength(4));
  });
  it("scores all-correct as 100%", () => {
    const r = scoreQuiz(QUIZ, QUIZ.map((q) => q.answer));
    expect(r.correct).toBe(QUIZ.length);
    expect(r.percent).toBe(100);
  });
  it("counts unanswered as wrong and splits by topic", () => {
    const answers = QUIZ.map((q, i) => (i === 0 ? q.answer : null));
    const r = scoreQuiz(QUIZ, answers);
    expect(r.correct).toBe(1);
    const t = r.topics.find((x) => x.topic === QUIZ[0]!.topic)!;
    expect(t.correct).toBe(1);
  });
});

describe("study planner", () => {
  const today = new Date(2026, 0, 1);
  it("rejects past exam dates", () => {
    expect(generatePlan("2025-12-31", 30, [], today)).toEqual({ error: "past-date" });
  });
  it("creates one day per day until the exam", () => {
    const r = generatePlan("2026-01-11", 30, ["Cloud concepts"], today);
    expect("plan" in r && r.plan.length).toBe(10);
  });
});
