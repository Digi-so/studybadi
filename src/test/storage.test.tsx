import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStored } from "@/lib/storage";

// Regression: appending to stored state (e.g. adding AI-generated cards) must
// store exactly the added items once — no duplicate application of the update.
let updateRef: (next: number[] | ((prev: number[]) => number[])) => void;

function Probe() {
  const [value, update] = useStored<number[]>("probe-double", []);
  updateRef = update;
  return <div data-testid="probe" data-count={value.length} />;
}

describe("useStored", () => {
  it("applies a single append update exactly once", () => {
    render(<Probe />);
    act(() => {
      updateRef((prev) => [...prev, 1, 2]);
    });
    const el = document.querySelector('[data-testid="probe"]')!;
    expect(el.getAttribute("data-count")).toBe("2");
    expect(JSON.parse(localStorage.getItem("asb:probe-double") ?? "[]")).toEqual([1, 2]);
  });
});
