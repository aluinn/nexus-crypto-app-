"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { NexusMark } from "@/components/ui/logo";
import { EASE } from "@/lib/motion";

const COVER_MS = 420;
const SETTLE_MS = 160;

type TransitionContextValue = { go: (href: string) => void };
const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useAppTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useAppTransition must be used within AppTransitionProvider");
  return ctx;
}

export function AppTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [covering, setCovering] = useState(false);
  const pendingHref = useRef<string | null>(null);

  const go = (href: string) => {
    if (href === pathname || covering) return;
    if (reduce) {
      router.push(href);
      return;
    }
    pendingHref.current = href;
    setCovering(true);
  };

  useEffect(() => {
    if (!covering || !pendingHref.current) return;
    const timer = window.setTimeout(() => {
      if (pendingHref.current) {
        router.push(pendingHref.current);
        pendingHref.current = null;
      }
    }, COVER_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covering]);

  useEffect(() => {
    if (!covering || pendingHref.current) return;
    const timer = window.setTimeout(() => setCovering(false), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, covering]);

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}
      <AnimatePresence>
        {covering ? (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: COVER_MS / 1000, ease: EASE }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <NexusMark className="size-14" iconClassName="size-6" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
