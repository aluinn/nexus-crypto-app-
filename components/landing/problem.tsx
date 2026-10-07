"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

const PROBLEMS = [
  {
    title: "Scattered holdings",
    body: "Holdings are spread across exchanges and wallets.",
  },
  {
    title: "Inconsistent performance",
    body: "Portfolio performance is tracked inconsistently.",
  },
  {
    title: "Split reasoning",
    body: "Market news and personal investment reasoning are disconnected.",
  },
  {
    title: "Too many tabs",
    body: "Too many open news tabs create noise rather than clarity.",
  },
];

export function Problem() {
  const reduce = useReducedMotion();
  return (
    <section className="px-4 py-20 sm:px-6 lg:py-28" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium tracking-[0.22em] text-muted">THE GAP</p>
        <h2 id="problem-heading" className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          The picture of a portfolio is usually incomplete.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PROBLEMS.map((problem, index) => (
            <motion.article
              key={problem.title}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: reduce ? 0 : index * 0.06, ease: EASE }}
              className="rounded-2xl border border-white/10 bg-panel p-5"
            >
              <h3 className="text-base font-medium text-foreground">{problem.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{problem.body}</p>
            </motion.article>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-lg leading-8 text-foreground">
          Nexus brings holdings, the stories around them, saved research, and the reasoning behind each decision into one workspace.
        </p>
      </div>
    </section>
  );
}
