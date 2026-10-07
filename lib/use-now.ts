"use client";

import { useEffect, useState } from "react";

/** Client clock. Null during prerender so the first render stays stable. */
export function useNow() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const start = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 60_000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, []);

  return now;
}
