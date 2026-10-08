"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/landing/reveal";
import { TransitionLink } from "@/components/transition/transition-link";
import { EASE } from "@/lib/motion";

export function FinalCta() {
  const reduce = useReducedMotion();
  return (
    <section className="px-4 py-24 sm:px-6" aria-labelledby="cta-heading">
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-[min(520px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(130,92,237,0.2),transparent_70%)]"
          animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] }}
          transition={reduce ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <Reveal>
          <h2 id="cta-heading" className="relative text-4xl font-semibold tracking-tight sm:text-5xl">
            See the whole picture.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
            One place for your portfolio, market intelligence, research and investment decisions.
          </p>
        </Reveal>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.2, ease: EASE }}
        >
          <TransitionLink
            href="/app/for-you"
            className="relative mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-bright"
          >
            Open Nexus
          </TransitionLink>
        </motion.div>
      </div>
    </section>
  );
}
