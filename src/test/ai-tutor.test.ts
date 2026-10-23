import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY_MESSAGES,
  MAX_HISTORY_TEXT_CHARS,
  clampQuestion,
  sanitizeHistory,
} from "@/lib/ai/tutor-shared";

describe("tutor history sanitization", () => {
  it("drops invalid entries and trims text", () => {
    const history = sanitizeHistory([
      { role: "user", text: "  What is a VNet?  " },
      { role: "tutor", text: "  A private network in Azure. " },
      { role: "system", text: "evil" },
      "not an object",
      null,
      { role: "user", text: "   " },
      { role: "user", text: 42 },
    ]);
    expect(history).toEqual([
      { role: "user", text: "What is a VNet?" },
      { role: "tutor", text: "A private network in Azure." },
    ]);
  });

  it("keeps only the last messages and caps their length", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      role: "user",
      text: `Question ${i + 1}`,
    }));
    const history = sanitizeHistory(many);
    expect(history).toHaveLength(MAX_HISTORY_MESSAGES);
    expect(history[0]).toEqual({ role: "user", text: "Question 13" });
    expect(history[history.length - 1]).toEqual({ role: "user", text: "Question 20" });

    const long = sanitizeHistory([{ role: "tutor", text: "x".repeat(2000) }]);
    expect(long[0]!.text).toHaveLength(MAX_HISTORY_TEXT_CHARS);
  });

  it("returns an empty history for non-array input", () => {
    expect(sanitizeHistory(null)).toEqual([]);
    expect(sanitizeHistory("nope")).toEqual([]);
  });
});

describe("question clamp", () => {
  it("trims and caps the question length", () => {
    expect(clampQuestion("  hi  ")).toBe("hi");
    expect(clampQuestion(undefined)).toBe("");
    expect(clampQuestion("x".repeat(900))).toHaveLength(500);
  });
});
