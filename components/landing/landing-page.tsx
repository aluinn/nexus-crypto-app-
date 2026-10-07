"use client";

import { useEffect, useState } from "react";
import { About } from "@/components/landing/about";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { IntroOverlay, markIntroComplete, readIntroPlan, type IntroPhase } from "@/components/landing/intro";
import { LandingNav } from "@/components/landing/landing-nav";
import { Problem } from "@/components/landing/problem";
import { ProductStory } from "@/components/landing/product-story";
import { Workflow } from "@/components/landing/workflow";
import { INTRO_MS } from "@/lib/motion";

export function LandingPage() {
  const [phase, setPhase] = useState<IntroPhase>("boot");
  const [plan, setPlan] = useState<"pending" | "full" | "short" | "reduce">("pending");
  const [skipVisible, setSkipVisible] = useState(false);

  useEffect(() => {
    const nextPlan = readIntroPlan();
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setPlan(nextPlan);
        if (nextPlan !== "full") {
          setPhase("reveal");
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
        }, INTRO_MS.revealAt),
        window.setTimeout(() => setPhase("done"), INTRO_MS.doneAt),
      );
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const locked = phase !== "done";
    document.documentElement.classList.toggle("overflow-hidden", locked);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [phase]);

  const revealed = phase === "reveal" || phase === "done";

  const skip = () => {
    markIntroComplete();
    setPhase("done");
    setSkipVisible(false);
  };

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
      <IntroOverlay phase={phase} plan={plan} />
      <div
        className="nexus-landing"
        inert={revealed ? undefined : true}
        aria-hidden={revealed ? undefined : true}
        style={{
          opacity: revealed ? 1 : 0,
          transition: "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
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
      </div>
    </>
  );
}
