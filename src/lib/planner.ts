import { TOPICS, type Topic } from "@/data/quiz";

export interface PlanDay {
  date: string; // YYYY-MM-DD
  topic: Topic | "Full practice quiz & review";
  minutes: number;
  focus: string;
}

const FOCUS: Record<Topic, string[]> = {
  "Cloud concepts": [
    "Cloud benefits, CapEx vs OpEx, consumption model",
    "IaaS, PaaS, SaaS and the shared responsibility model",
    "Public, private and hybrid cloud",
  ],
  "Architecture & services": [
    "Regions, availability zones, resource groups, subscriptions",
    "Compute: VMs, App Service, containers, Functions",
    "Networking and storage tiers",
  ],
  "Management & governance": [
    "Cost Management, pricing and TCO calculators",
    "Azure Policy, resource locks, tags, RBAC",
    "Azure Monitor, Advisor, Service Health, ARM templates",
  ],
};

export type PlanError = "invalid-date" | "past-date" | "invalid-minutes";

export function generatePlan(
  examDate: string,
  minutesPerDay: number,
  weakTopics: Topic[],
  today = new Date(),
): { plan: PlanDay[] } | { error: PlanError } {
  const exam = new Date(examDate + "T00:00:00");
  if (!examDate || isNaN(exam.getTime())) return { error: "invalid-date" };
  if (!Number.isFinite(minutesPerDay) || minutesPerDay < 10 || minutesPerDay > 480)
    return { error: "invalid-minutes" };
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((exam.getTime() - start.getTime()) / 86400000);
  if (days < 1) return { error: "past-date" };

  const span = Math.min(days, 60);
  // Weak topics appear twice in the rotation so they get extra time.
  const rotation: Topic[] = [...TOPICS, ...weakTopics];
  const counters: Record<string, number> = {};
  const plan: PlanDay[] = [];
  for (let i = 0; i < span; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    const isReviewDay = (i + 1) % 7 === 0 || i === span - 1;
    if (isReviewDay) {
      plan.push({ date, topic: "Full practice quiz & review", minutes: minutesPerDay, focus: "Take the practice quiz, then revise any missed topics" });
      continue;
    }
    const topic = rotation[i % rotation.length]!;
    const n = counters[topic] ?? 0;
    counters[topic] = n + 1;
    plan.push({ date, topic, minutes: minutesPerDay, focus: FOCUS[topic][n % FOCUS[topic].length]! });
  }
  return { plan };
}
