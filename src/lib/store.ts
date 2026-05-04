import type { ParsedResume, Analysis, Mode } from "@/lib/types";

export type AppState = {
  filename: string | null;
  resume: ParsedResume | null;
  analysis: Analysis | null;
  rawText: string | null;
  targetRole: string;
  mode: Mode;
  appliedRewrites: Record<string, boolean>; // key: "section-itemIdx-bulletIdx"
};

const KEY = "ai-resume-critique-state-v1";

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(s: AppState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore quota */
  }
}

export function defaultState(): AppState {
  return {
    filename: null,
    resume: null,
    analysis: null,
    rawText: null,
    targetRole: "",
    mode: "professional",
    appliedRewrites: {},
  };
}

export function bulletKey(section: string, itemIdx: number, bulletIdx: number) {
  return `${section}-${itemIdx}-${bulletIdx}`;
}

export function applyRewritesToResume(
  resume: ParsedResume,
  analysis: Analysis,
  applied: Record<string, boolean>,
): ParsedResume {
  const next: ParsedResume = JSON.parse(JSON.stringify(resume));
  for (const b of analysis.bullets) {
    if (!applied[bulletKey(b.section, b.itemIndex, b.bulletIndex)]) continue;
    const target = b.section === "experience" ? next.experience : next.projects;
    if (target[b.itemIndex] && target[b.itemIndex].bullets[b.bulletIndex] !== undefined) {
      target[b.itemIndex].bullets[b.bulletIndex] = b.rewrite;
    }
  }
  return next;
}
