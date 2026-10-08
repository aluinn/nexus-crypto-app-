import type { z } from "zod";

const memory = new Map<string, string>();

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readStorage<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return fallback;
    return parsed.data;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (!canUseStorage()) {
    memory.set(key, JSON.stringify(value));
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const STORAGE_KEYS = {
  holdings: "nexus.holdings.v1",
  journal: "nexus.journal.v1",
  saved: "nexus.saved.v1",
  dismissedNotifications: "nexus.notifications.dismissed.v1",
  interests: "nexus.interests.v1",
} as const;
