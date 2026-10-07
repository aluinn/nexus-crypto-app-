"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { readStorage, writeStorage } from "@/lib/storage/local";

export function useStoredState<T>(key: string, schema: z.ZodType<T>, fallback: T) {
  const schemaRef = useRef(schema);
  const fallbackRef = useRef(fallback);
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(readStorage(key, schemaRef.current, fallbackRef.current));
    setReady(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const base = ready ? current : readStorage(key, schemaRef.current, fallbackRef.current);
        const resolved = typeof next === "function" ? (next as (value: T) => T)(base) : next;
        const parsed = schemaRef.current.safeParse(resolved);
        const safe = parsed.success ? parsed.data : fallbackRef.current;
        writeStorage(key, safe);
        return safe;
      });
    },
    [key, ready],
  );

  return [value, update, ready] as const;
}
