"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { assetBySymbol, TAG_STYLES } from "@/data/assets";
import { CATEGORY_STYLES, SEED_EVENTS } from "@/data/seed-events";
import { cn } from "@/lib/cn";
import { formatDayCountdown, formatEventDate } from "@/lib/format";
import { EASE, listStagger } from "@/lib/motion";
import { useNow } from "@/lib/use-now";
import { EVENT_CATEGORIES, type EventCategory } from "@/types";

const FILTERS = ["ALL", ...EVENT_CATEGORIES] as const;

export function EventsView() {
  const reduce = useReducedMotion();
  const stagger = listStagger(Boolean(reduce));
  const now = useNow();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const visible = useMemo(() => {
    if (now == null) return [];
    const needle = query.trim().toLowerCase();
    const nowMs = now;
    return SEED_EVENTS.filter((event) => {
      const eventMs = new Date(event.date).getTime();
      const isUpcoming = eventMs >= nowMs;
      const matchesTab = tab === "upcoming" ? isUpcoming : !isUpcoming;
      const matchesFilter = filter === "ALL" || event.category === filter;
      const text = `${event.title} ${event.description} ${event.assets.join(" ")}`.toLowerCase();
      const matchesQuery = needle.length === 0 || text.includes(needle);
      return matchesTab && matchesFilter && matchesQuery;
    }).sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return tab === "upcoming" ? diff : -diff;
    });
  }, [filter, now, query, tab]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted">Network upgrades, unlocks, votes, and other catalysts</p>
        </div>
        <button
          type="button"
          onClick={() => setSearchOpen((open) => !open)}
          aria-expanded={searchOpen}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-muted hover:text-foreground"
          aria-label="Search events"
        >
          <Search className="size-4" />
        </button>
      </div>

      <p className="mt-4 rounded-xl border border-white/10 bg-[#121624] px-3 py-2 text-sm text-muted" role="status">
        Every event below is a local demonstration, not a confirmed date or a live feed.
      </p>

      <AnimatePresence initial={false}>
        {searchOpen ? (
          <motion.label
            className="mt-4 block"
            initial={reduce ? false : { opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <span className="sr-only">Search events</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events"
              className="min-h-11 w-full rounded-xl border border-white/10 bg-input px-3 text-sm outline-none"
              autoFocus
            />
          </motion.label>
        ) : null}
      </AnimatePresence>

      <div className="scroll-row -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="toolbar" aria-label="Filter by category">
        {FILTERS.map((item) => {
          const style = item === "ALL" ? TAG_STYLES.ALL : CATEGORY_STYLES[item as EventCategory];
          const active = filter === item;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item)}
              className="min-h-10 shrink-0 rounded-full px-3 text-xs font-semibold tracking-wide"
              style={{
                color: style.text,
                background: style.bg,
                boxShadow: active ? `0 0 0 1px ${style.text}, 0 0 18px ${style.bg}` : undefined,
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div role="tablist" aria-label="Event timing" className="mt-5 flex gap-5 border-b border-white/10">
        {(
          [
            ["upcoming", "Upcoming"],
            ["past", "Past"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`events-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`events-panel-${id}`}
            onClick={() => setTab(id)}
            className={cn(
              "min-h-11 border-b-2 px-1 text-sm",
              tab === id ? "border-primary text-foreground" : "border-transparent text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <motion.div
        className="mt-4 space-y-3"
        role="tabpanel"
        id={`events-panel-${tab}`}
        aria-labelledby={`events-tab-${tab}`}
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
            <p className="text-base font-medium">No events in this view</p>
            <p className="mt-2 text-sm text-muted">Try another category filter or clear the search.</p>
          </div>
        ) : null}
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((event) => {
            const style = CATEGORY_STYLES[event.category];
            return (
              <motion.article
                key={event.id}
                layout
                variants={stagger.item}
                initial="hidden"
                animate="show"
                exit="exit"
                className="rounded-2xl border border-white/10 bg-panel p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide"
                    style={{ color: style.text, background: style.bg }}
                  >
                    {event.category}
                  </span>
                  <span className="rounded-full bg-[#241c12] px-2 py-0.5 text-[11px] font-medium text-warning">
                    Demonstration
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{event.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{event.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {event.assets.map((symbol) => {
                      const color = assetBySymbol(symbol)?.color ?? "#9aa6bd";
                      return (
                        <span
                          key={symbol}
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ color, background: `${color}22` }}
                        >
                          {symbol}
                        </span>
                      );
                    })}
                  </div>
                  <time dateTime={event.date} className="text-sm text-muted">
                    {formatEventDate(event.date)}
                    {now != null ? ` · ${formatDayCountdown(event.date, now)}` : ""}
                  </time>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
