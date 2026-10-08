/** Shared motion timings. Ease is cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.22,
  base: 0.45,
  slow: 0.8,
  introWord: 1,
  introReveal: 1.2,
} as const;

export const INTRO_MS = {
  blank: 350,
  wordStart: 350,
  skipAt: 1300,
  revealAt: 3600,
  doneAt: 4800,
  reduced: 420,
  returning: 280,
} as const;

export const INTRO_STORAGE_KEY = "nexus-intro-complete";

/** Stagger + per-item variants for app-page lists. Durations collapse to 0 under reduced motion. */
export function listStagger(reduce: boolean) {
  return {
    container: {
      hidden: {},
      show: { transition: { staggerChildren: reduce ? 0 : 0.045 } },
    },
    item: {
      hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.35, ease: EASE } },
      exit: reduce
        ? { opacity: 0 }
        : { opacity: 0, x: -24, transition: { duration: 0.22, ease: EASE } },
    },
  } as const;
}
