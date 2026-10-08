"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { About } from "@/components/landing/about";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { IntroOverlay, markIntroComplete, readIntroPlan, type IntroPhase } from "@/components/landing/intro";
import { LandingNav } from "@/components/landing/landing-nav";
import { Problem } from "@/components/landing/problem";
import { ProductStory } from "@/components/landing/product-story";
import { Workflow } from "@/components/landing/workflow";
import { EASE, INTRO_MS } from "@/lib/motion";

/** Cumulative wheel/touch px to complete the scroll-triggered zoom reveal. Short on purpose. */
const SCROLL_ZOOM_PX = 180;

export function LandingPage() {
  const [phase, setPhase] = useState<IntroPhase>("boot");
  const [plan, setPlan] = useState<"pending" | "full" | "short" | "reduce">("pending");
  const [skipVisible, setSkipVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  // 0 → 1. The single source of truth for "how revealed is the main page",
  // whether driven by a timed animation or scrubbed live by user input.
  const revealProgress = useMotionValue(0);
  const landingScale = useTransform(revealProgress, [0, 1], [prefersReducedMotion ? 1 : 1.06, 1]);

  useEffect(() => {
    const nextPlan = readIntroPlan();
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setPlan(nextPlan);
        if (nextPlan !== "full") {
          setPhase("reveal");
          animate(revealProgress, 1, {
            duration: (nextPlan === "reduce" ? INTRO_MS.reduced : INTRO_MS.returning) / 1000,
            ease: EASE,
          });
          return;
        }
        setPhase("blank");
      }, 0),
    );
    if (nextPlan !== "full") {
      timers.push(
        window.setTimeout(() => {
          markIntroComplete();
          setPhase("done");
        }, nextPlan === "reduce" ? INTRO_MS.reduced : INTRO_MS.returning),
      );
    } else {
      timers.push(
        window.setTimeout(() => setPhase("word"), INTRO_MS.wordStart),
        window.setTimeout(() => setSkipVisible(true), INTRO_MS.skipAt),
        window.setTimeout(() => {
          markIntroComplete();
          setPhase("reveal");
          animate(revealProgress, 1, {
            duration: (INTRO_MS.doneAt - INTRO_MS.revealAt) / 1000,
            ease: EASE,
          });
        }, INTRO_MS.revealAt),
        window.setTimeout(() => setPhase("done"), INTRO_MS.doneAt),
      );
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const locked = phase !== "done";
    document.documentElement.classList.toggle("overflow-hidden", locked);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [phase]);

  const revealed = phase === "reveal" || phase === "done";

  // Skip jumps straight into the same clean reveal animation the auto-timer
  // uses, instead of cutting instantly to "done".
  const skip = () => {
    if (phase !== "word") {
      markIntroComplete();
      setPhase("done");
      setSkipVisible(false);
      return;
    }
    markIntroComplete();
    setSkipVisible(false);
    setPhase("reveal");
    const duration = (INTRO_MS.doneAt - INTRO_MS.revealAt) / 1000;
    animate(revealProgress, 1, { duration, ease: EASE });
    window.setTimeout(() => setPhase("done"), duration * 1000);
  };

  // A short scroll, touch swipe, or navigation key press while the word is
  // held zooms straight through it into the main page, scrubbed live with
  // the gesture rather than playing a fixed-length animation.
  useEffect(() => {
    if (phase !== "word") return;
    let acc = 0;
    let finished = false;
    let lastTouchY: number | null = null;

    const finish = () => {
      if (finished) return;
      finished = true;
      markIntroComplete();
      setSkipVisible(false);
      setPhase("done");
    };

    const bump = (delta: number) => {
      if (delta <= 0 || finished) return;
      acc = Math.min(SCROLL_ZOOM_PX, acc + delta);
      revealProgress.set(acc / SCROLL_ZOOM_PX);
      if (acc >= SCROLL_ZOOM_PX) finish();
    };

    const onWheel = (event: WheelEvent) => bump(event.deltaY);
    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY;
      if (y == null || lastTouchY == null) return;
      bump(lastTouchY - y);
      lastTouchY = y;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "Enter"].includes(event.key)) bump(SCROLL_ZOOM_PX);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <>
      <a
        href="#product"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      {skipVisible && phase !== "done" ? (
        <button
          type="button"
          onClick={skip}
          className="fixed bottom-6 right-6 z-[60] min-h-11 rounded-full border border-white/15 bg-[#121624] px-4 text-sm text-foreground"
        >
          Skip intro
        </button>
      ) : null}
      <IntroOverlay phase={phase} plan={plan} revealProgress={revealProgress} />
      <motion.div
        className="nexus-landing"
        inert={revealed ? undefined : true}
        aria-hidden={revealed ? undefined : true}
        style={{ opacity: revealProgress, scale: landingScale }}
      >
        <LandingNav />
        <main>
          <Hero />
          <Problem />
          <ProductStory />
          <Workflow />
          <About />
          <FinalCta />
        </main>
        <footer className="border-t border-white/10 px-4 py-8 text-center text-xs leading-5 text-muted sm:px-6">
          Nexus organises market information and personal notes for informational purposes only. It is not financial advice and it does not place trades.
        </footer>
      </motion.div>
    </>
  );
}
