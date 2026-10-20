import { useStored } from "./storage";
import type { QuizAttempt } from "./quiz";
import type { PlanDay } from "./planner";
import type { Topic } from "@/data/quiz";

export type CardStatus = "known" | "review";

export const useAttempts = () => useStored<QuizAttempt[]>("attempts", []);
export const useCardStatus = () => useStored<Record<string, CardStatus>>("cards", {});
export const useDailyGoal = () => useStored<number>("goal", 30);
export const usePlan = () =>
  useStored<{ examDate: string; minutes: number; topics: Topic[]; days: PlanDay[] } | null>("plan", null);
