/** Shared motion timings. Ease is cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.22,
  base: 0.45,
  slow: 0.8,
  introWord: 1,
  introReveal: 1.05,
} as const;

export const INTRO_MS = {
  blank: 350,
  wordStart: 350,
  skipAt: 1000,
  revealAt: 1750,
  doneAt: 2900,
  reduced: 420,
  returning: 280,
} as const;

export const INTRO_STORAGE_KEY = "nexus-intro-complete";
