"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { BrowserFrame } from "@/components/landing/browser-frame";
import { Reveal } from "@/components/landing/reveal";

const CHAPTERS = [
  {
    id: "for-you",
    kicker: "For You",
    heading: "News that knows what matters to you.",
    body: "Bring together stories from leading crypto publications, prioritised around the assets you follow. Scan concise excerpts, visit the original report or save an article for later.",
    src: "/assets/nexus/nexus-for-you.png",
    width: 2110,
    height: 1192,
    alt: "Nexus For You page with asset filters and news cards from CoinDesk and CryptoSlate.",
  },
  {
    id: "portfolio",
    kicker: "Portfolio",
    heading: "Every holding. One clear view.",
    body: "Organise your digital assets in one portfolio, calculate their current value and understand allocation through a clear visual breakdown.",
    src: "/assets/nexus/nexus-portfolio.png",
    width: 2050,
    height: 1148,
    alt: "Nexus portfolio page with total value, allocation doughnut, and an add-asset control.",
  },
  {
    id: "journal",
    kicker: "Trade Journal",
    heading: "Remember the thinking behind every move.",
    body: "Record buys, sells, notes and ideas alongside the reasoning that shaped each decision.",
    src: "/assets/nexus/nexus-journal.png",
    width: 2088,
    height: 1190,
    alt: "Nexus trade journal with buy, sell, and note entries for LINK, BTC, and ETH.",
  },
  {
    id: "saved",
    kicker: "Saved Research",
    heading: "Turn market noise into organised research.",
    body: "Save important stories and arrange them into collections by asset, investment thesis or market event.",
    src: "/assets/nexus/nexus-saved.png",
    width: 2134,
    height: 1188,
    alt: "Nexus saved articles page with search and stories from Cointelegraph and Decrypt.",
  },
  {
    id: "events",
    kicker: "Events",
    heading: "See the catalysts before they land.",
    body: "Live governance votes from Snapshot and exchange activity from Binance, alongside your own network upgrades, unlocks, and other catalysts, in one filterable calendar.",
    src: "/assets/nexus/nexus-events.png",
    width: 2110,
    height: 1192,
    alt: "Nexus events calendar with category filters and upcoming entries like a token unlock and a governance vote.",
  },
] as const;

function useChapterStyle(progress: MotionValue<number>, index: number, total: number) {
  const segment = 1 / total;
  const start = index * segment;
  const end = start + segment;
  const fade = segment * 0.45;
  const inputRange = [start - fade, start, end, end + fade];
  const opacity = useTransform(progress, inputRange, [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]);
  const y = useTransform(progress, inputRange, [20, 0, 0, -20]);
  const scale = useTransform(progress, inputRange, [0.96, 1, 1, 0.96]);
  return { opacity, y, scale };
}

function Shot({ chapter }: { chapter: (typeof CHAPTERS)[number] }) {
  return (
    <BrowserFrame>
      <Image
        src={chapter.src}
        alt={chapter.alt}
        width={chapter.width}
        height={chapter.height}
        sizes="(min-width: 1024px) 560px, 100vw"
        className="h-auto w-full"
      />
    </BrowserFrame>
  );
}

export function ProductStory() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 32, mass: 0.4, restDelta: 0.0005 });

  const total = CHAPTERS.length;
  // CHAPTERS has a fixed length of 5, so these are unrolled rather than
  // called from inside a .map callback (hooks can't run inside callbacks).
  const styles = [
    useChapterStyle(progress, 0, total),
    useChapterStyle(progress, 1, total),
    useChapterStyle(progress, 2, total),
    useChapterStyle(progress, 3, total),
    useChapterStyle(progress, 4, total),
  ];

  return (
    <section id="features" className="px-4 py-8 sm:px-6" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="features-heading" className="sr-only">
          Product features
        </h2>

        {reduce ? (
          <div className="space-y-16">
            {CHAPTERS.map((chapter) => (
              <article key={chapter.id} className="space-y-5">
                <p className="text-xs font-medium tracking-[0.2em] text-[#a78bfa]">{chapter.kicker}</p>
                <h3 className="text-3xl font-semibold tracking-tight">{chapter.heading}</h3>
                <p className="text-base leading-7 text-muted">{chapter.body}</p>
                <Shot chapter={chapter} />
              </article>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-16 lg:hidden">
              {CHAPTERS.map((chapter) => (
                <Reveal key={chapter.id} as="article" className="space-y-5">
                  <p className="text-xs font-medium tracking-[0.2em] text-[#a78bfa]">{chapter.kicker}</p>
                  <h3 className="text-3xl font-semibold tracking-tight">{chapter.heading}</h3>
                  <p className="text-base leading-7 text-muted">{chapter.body}</p>
                  <Shot chapter={chapter} />
                </Reveal>
              ))}
            </div>

            <div ref={trackRef} className="hidden lg:grid lg:grid-cols-2 lg:gap-16">
              <div className="relative">
                <div className="sticky top-1/2 -translate-y-1/2">
                  <div className="relative aspect-[2110/1192]">
                    {CHAPTERS.map((chapter, index) => (
                      <motion.div
                        key={chapter.id}
                        className="absolute inset-0"
                        style={{ opacity: styles[index].opacity, y: styles[index].y, scale: styles[index].scale }}
                      >
                        <Shot chapter={chapter} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="sticky top-1/2 -translate-y-1/2">
                  <div className="relative min-h-[260px]">
                    {CHAPTERS.map((chapter, index) => (
                      <motion.div
                        key={chapter.id}
                        className="absolute inset-0"
                        style={{ opacity: styles[index].opacity, y: styles[index].y }}
                      >
                        <p className="text-xs font-medium tracking-[0.2em] text-[#a78bfa]">{chapter.kicker}</p>
                        <h3 className="mt-3 text-4xl font-semibold tracking-tight">{chapter.heading}</h3>
                        <p className="mt-4 max-w-md text-base leading-7 text-muted">{chapter.body}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {CHAPTERS.map((chapter) => (
                  <div key={chapter.id} className="h-[80vh]" aria-hidden />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
