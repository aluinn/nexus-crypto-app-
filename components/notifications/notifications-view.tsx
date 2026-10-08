"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, Bookmark, Newspaper, PieChart } from "lucide-react";
import { SEED_NOTIFICATIONS } from "@/data/seed-notifications";
import { formatRelativeTime } from "@/lib/format";
import { listStagger } from "@/lib/motion";
import { useNow } from "@/lib/use-now";
import { STORAGE_KEYS } from "@/lib/storage/local";
import { useStoredState } from "@/lib/storage/use-stored";
import { dismissedNotificationsSchema } from "@/lib/validation/schemas";

const ICONS = {
  news: Newspaper,
  portfolio: PieChart,
  research: Bookmark,
} as const;

export function NotificationsView() {
  const reduce = useReducedMotion();
  const stagger = listStagger(Boolean(reduce));
  const [dismissed, setDismissed] = useStoredState(
    STORAGE_KEYS.dismissedNotifications,
    dismissedNotificationsSchema,
    [],
  );
  const now = useNow();
  const visible = SEED_NOTIFICATIONS.filter((item) => !dismissed.includes(item.id));

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        These items are local demonstrations. Nexus does not run background price alerts.
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-4 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#1a1732] text-primary">
            <Bell className="size-5" aria-hidden />
          </span>
          <p className="mt-4 text-lg font-medium">You are up to date</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            Dismissed demonstration notices stay hidden on this device. Restore them if you want the examples back.
          </p>
          <button
            type="button"
            onClick={() => setDismissed([])}
            className="mt-5 inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 text-sm hover:bg-white/5"
          >
            Restore examples
          </button>
        </div>
      ) : (
        <motion.ul className="mt-6 space-y-3" variants={stagger.container} initial="hidden" animate="show">
          <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <motion.li
                key={item.id}
                layout
                variants={stagger.item}
                initial="hidden"
                animate="show"
                exit="exit"
                className="rounded-2xl border border-white/10 bg-panel p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#1a1732] text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-medium">{item.title}</h2>
                      <span className="rounded-full bg-[#241c12] px-2 py-0.5 text-[11px] font-medium text-warning">
                        Demonstration
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <time dateTime={item.createdAt} className="text-xs text-muted">
                        {now == null ? "recently" : formatRelativeTime(item.createdAt, now)}
                      </time>
                      <button
                        type="button"
                        onClick={() => setDismissed((current) => [...current, item.id])}
                        className="min-h-11 rounded-full px-3 text-sm text-muted hover:bg-white/5 hover:text-foreground"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
