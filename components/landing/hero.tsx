"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { BrowserFrame } from "@/components/landing/browser-frame";
import { TransitionLink } from "@/components/transition/transition-link";
import { EASE } from "@/lib/motion";

function pointerTiltAllowed(pointerType: string) {
  if (pointerType !== "mouse") return false;
  if (typeof window === "undefined") return false;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return fine && !reduced;
}

export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerTiltAllowed(event.pointerType) || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -3.5, y: px * 4.5 });
  };

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:pb-28 lg:pt-36"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[min(900px,90vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(130,92,237,0.16),transparent_68%)]"
        style={reduce ? undefined : { scale: glowScale, opacity: glowOpacity }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <motion.div style={reduce ? undefined : { y: textY, opacity: textOpacity }}>
          <p className="text-xs font-medium tracking-[0.22em] text-[#a78bfa]">CRYPTO INTELLIGENCE</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl sm:leading-[1.05]">
            Your investments, connected.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
            Track your portfolio, follow the stories shaping your assets, and record every investment decision in one intelligent workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TransitionLink
              href="/app/for-you"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-bright"
            >
              Open Nexus
            </TransitionLink>
            <a
              href="#features"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-medium text-foreground hover:bg-white/5"
            >
              Explore the features
            </a>
          </div>
        </motion.div>
        <motion.div
          ref={frameRef}
          onPointerMove={onMove}
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          className="relative"
          style={{
            perspective: 1200,
            ...(reduce ? {} : { y: imageY, scale: imageScale, opacity: imageOpacity }),
          }}
        >
          <motion.div
            animate={reduce ? undefined : { rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(130,92,237,0.22),transparent_70%)]"
            />
            <BrowserFrame>
              <Image
                src="/assets/nexus/nexus-portfolio.png"
                alt="Nexus portfolio screen with a pound total, daily change, allocation chart, and holdings for ETH, SOL, and BTC."
                width={2050}
                height={1148}
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
                className="h-auto w-full"
              />
            </BrowserFrame>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
