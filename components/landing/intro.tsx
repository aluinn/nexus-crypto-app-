"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE, INTRO_MS, INTRO_STORAGE_KEY } from "@/lib/motion";

export type IntroPhase = "boot" | "blank" | "word" | "reveal" | "done";

export function markIntroComplete() {
  try {
    sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    /* Private mode can block storage. The intro still ends. */
  }
}

export function readIntroPlan() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = false;
  try {
    seen = sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {
    seen = false;
  }
  if (reduce) return "reduce" as const;
  if (seen) return "short" as const;
  return "full" as const;
}

export function IntroOverlay({
  phase,
  plan,
}: {
  phase: IntroPhase;
  plan: "full" | "short" | "reduce" | "pending";
}) {
  const reduce = useReducedMotion();
  if (phase === "done") return null;
  const showWord = plan === "full" && (phase === "word" || phase === "reveal");
  const leaving = phase === "reveal";

  return (
    <div
      className="nexus-intro pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#080a12]"
      style={{
        opacity: leaving && plan !== "full" ? 0 : 1,
        transition: `opacity ${plan === "reduce" ? INTRO_MS.reduced : INTRO_MS.returning}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        background: leaving && plan === "full" ? "transparent" : "#080a12",
      }}
      aria-hidden={phase === "boot" || phase === "blank"}
    >
      {showWord ? (
        <motion.div
          className="relative flex items-center justify-center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, filter: "blur(12px)" }}
          animate={
            leaving
              ? { opacity: 0, y: reduce ? 0 : -72, scale: 1, filter: "blur(0px)" }
              : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          }
          transition={{ duration: leaving ? DURATION.introReveal : DURATION.introWord, ease: EASE }}
        >
          <motion.span
            aria-hidden
            className="absolute h-24 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.55),rgba(96,140,230,0.2)_46%,transparent_72%)] blur-2xl"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={
              reduce || leaving
                ? { opacity: leaving ? 0 : 0.35, scale: 1 }
                : { opacity: [0, 0.9, 0.38], scale: [0.85, 1.04, 1] }
            }
            transition={{ duration: 1.35, ease: EASE, times: [0, 0.42, 1] }}
          />
          <motion.p
            className="relative text-5xl font-semibold text-[#d5c7ff] sm:text-7xl"
            initial={{ letterSpacing: reduce ? "0.08em" : "0.35em" }}
            animate={{ letterSpacing: "0.08em" }}
            transition={{ duration: reduce ? 0.2 : DURATION.introWord, ease: EASE }}
          >
            NEXUS
          </motion.p>
        </motion.div>
      ) : null}
    </div>
  );
}
