"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BrowserFrame } from "@/components/landing/browser-frame";
import { Reveal } from "@/components/landing/reveal";
import { EASE } from "@/lib/motion";

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
    body: "Track network upgrades, token unlocks, governance votes, regulatory decisions, exchange listings, project launches and economic announcements in one filterable calendar.",
    src: "/assets/nexus/nexus-events.png",
    width: 2110,
    height: 1192,
    alt: "Nexus events calendar with category filters and upcoming entries like a token unlock and a governance vote.",
  },
] as const;

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
  const [active, setActive] = useState(0);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const nodes = itemRefs.current.filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number(visible.target.getAttribute("data-index"));
        if (!Number.isNaN(index)) setActive(index);
      },
      { rootMargin: "-35% 0px -40% 0px", threshold: [0.25, 0.5, 0.75] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="px-4 py-8 sm:px-6" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="features-heading" className="sr-only">
          Product features
        </h2>
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
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="sticky top-24">
              <div className="relative">
                {CHAPTERS.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    className={index === active ? "relative" : "pointer-events-none absolute inset-0"}
                    animate={{
                      opacity: active === index ? 1 : 0,
                      scale: active === index ? 1 : 0.96,
                      y: active === index ? 0 : 14,
                    }}
                    transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
                    aria-hidden={active !== index}
                  >
                    <Shot chapter={chapter} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div>
            {CHAPTERS.map((chapter, index) => (
              <article
                key={chapter.id}
                data-index={index}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="flex min-h-[80vh] flex-col justify-center py-16"
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-35% 0px -35% 0px" }}
                  transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                >
                  <p className="text-xs font-medium tracking-[0.2em] text-[#a78bfa]">{chapter.kicker}</p>
                  <h3 className="mt-3 text-4xl font-semibold tracking-tight">{chapter.heading}</h3>
                  <p className="mt-4 max-w-md text-base leading-7 text-muted">{chapter.body}</p>
                </motion.div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
