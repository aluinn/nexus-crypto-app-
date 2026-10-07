"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { EASE } from "@/lib/motion";

const STEPS = [
  { title: "Discover news", body: "Scan stories tied to the assets you follow." },
  { title: "Save research", body: "Keep the pieces you want to revisit." },
  { title: "Record an idea or trade", body: "Write down the decision while the reason is fresh." },
  { title: "Review the portfolio", body: "See value and allocation in one place." },
];

export function Workflow() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <section id="workflow" className="px-4 py-20 sm:px-6 lg:py-28" aria-labelledby="workflow-heading">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium tracking-[0.22em] text-muted">CONNECTED WORKFLOW</p>
        <h2 id="workflow-heading" className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Discover news → Save research → Record an idea or trade → Review the portfolio
        </h2>
        <div ref={ref} className="relative mt-12">
          <svg
            className="pointer-events-none absolute left-6 top-0 hidden h-full w-px md:left-0 md:top-8 md:block md:h-px md:w-full"
            aria-hidden
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
          >
            <motion.line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="rgba(130,92,237,0.7)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: inView || reduce ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 1.1, ease: EASE }}
            />
          </svg>
          <ol className="grid gap-4 md:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-white/10 bg-panel p-5">
                <p className="text-xs tracking-[0.16em] text-[#a78bfa]">0{index + 1}</p>
                <h3 className="mt-3 text-base font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
