import { describe, expect, it } from "vitest";
import { normalizeGeneratedCards, clampCardCount } from "@/lib/ai/flashcards-shared";

describe("AI flashcard normalization", () => {
  it("drops blank entries and trims fields", () => {
    const cards = normalizeGeneratedCards(
      [
        { term: "  IaaS  ", definition: " Infrastructure as a Service. " },
        { term: "", definition: "no term" },
        { term: "Only term", definition: "" },
        "not an object",
        null,
      ],
      10,
    );
    expect(cards).toEqual([{ term: "IaaS", definition: "Infrastructure as a Service." }]);
  });

  it("dedupes the same term regardless of case", () => {
    const cards = normalizeGeneratedCards(
      [
        { term: "Region", definition: "First" },
        { term: "region", definition: "Second" },
      ],
      10,
    );
    expect(cards).toHaveLength(1);
    expect(cards[0]!.definition).toBe("First");
  });

  it("caps the count and clamps long fields", () => {
    const raw = Array.from({ length: 9 }, (_, i) => ({
      term: `Term ${i + 1}`,
      definition: "x".repeat(1000),
    }));
    const cards = normalizeGeneratedCards(raw, 5);
    expect(cards).toHaveLength(5);
    expect(cards.every((c) => c.definition.length <= 400)).toBe(true);
  });

  it("returns an empty list for non-array input", () => {
    expect(normalizeGeneratedCards(null, 5)).toEqual([]);
    expect(normalizeGeneratedCards({ cards: [] }, 5)).toEqual([]);
  });
});

describe("card count clamp", () => {
  it("keeps counts inside 3–15 and defaults to 8", () => {
    expect(clampCardCount(8)).toBe(8);
    expect(clampCardCount(1)).toBe(3);
    expect(clampCardCount(99)).toBe(15);
    expect(clampCardCount(undefined)).toBe(8);
    expect(clampCardCount(Number.NaN)).toBe(8);
  });
});
