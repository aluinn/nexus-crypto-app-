"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EventDialog } from "@/components/events/event-dialog";
import { ConfirmDialog } from "@/components/ui/dialog";
import { assetBySymbol, TAG_STYLES } from "@/data/assets";
import { CATEGORY_STYLES } from "@/data/events";
import { cn } from "@/lib/cn";
import { formatDayCountdown, formatEventDate } from "@/lib/format";
import { EASE, listStagger } from "@/lib/motion";
import { STORAGE_KEYS } from "@/lib/storage/local";
import { useStoredState } from "@/lib/storage/use-stored";
import { useNow } from "@/lib/use-now";
import { eventsResponseSchema, eventsSchema } from "@/lib/validation/schemas";
import { EVENT_CATEGORIES, type CalendarEvent, type EventCategory } from "@/types";

const FILTERS = ["ALL", ...EVENT_CATEGORIES] as const;
const EMPTY_EVENTS: CalendarEvent[] = [];

export function EventsView() {
  const reduce = useReducedMotion();
  const stagger = listStagger(Boolean(reduce));
  const now = useNow();
  const [events, setEvents] = useStoredState(STORAGE_KEYS.events, eventsSchema, EMPTY_EVENTS);
  const [liveEvents, setLiveEvents] = useState<CalendarEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [cached, setCached] = useState(false);
  const [partial, setPartial] = useState(false);
  // Live governance votes and listings skew toward "just happened" rather
  // than scheduled months out, so default to where the real activity is.
  const [tab, setTab] = useState<"upcoming" | "past">("past");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const load = async (refresh = false) => {
    setStatus("loading");
    try {
      const response = await fetch(refresh ? "/api/events?refresh=1" : "/api/events");
      if (!response.ok) throw new Error("status");
      const parsed = eventsResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error("shape");
      setLiveEvents(parsed.data.events);
      setCached(parsed.data.cached);
      setPartial(parsed.data.sources.some((source) => !source.ok));
      setStatus("ready");
    } catch {
      setLiveEvents([]);
      setCached(false);
      setPartial(false);
      setStatus("ready");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const allEvents = useMemo(() => [...events, ...liveEvents], [events, liveEvents]);

  const visible = useMemo(() => {
    if (now == null) return [];
    const needle = query.trim().toLowerCase();
    // Events only carry a calendar date (no time of day), so "upcoming" vs.
    // "past" compares whole days, not the exact moment the page loaded.
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    return allEvents
      .filter((event) => {
        const eventMs = new Date(event.date).getTime();
        const isUpcoming = eventMs >= todayStartMs;
        const matchesTab = tab === "upcoming" ? isUpcoming : !isUpcoming;
        const matchesFilter = filter === "ALL" || event.category === filter;
        const text = `${event.title} ${event.description} ${event.assets.join(" ")}`.toLowerCase();
        const matchesQuery = needle.length === 0 || text.includes(needle);
        return matchesTab && matchesFilter && matchesQuery;
      })
      .sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return tab === "upcoming" ? diff : -diff;
      });
  }, [allEvents, filter, now, query, tab]);

  const save = (input: Omit<CalendarEvent, "id"> & { id?: string }) => {
    setEvents((current) => {
      if (input.id) {
        return current.map((event) => (event.id === input.id ? { ...event, ...input, id: event.id } : event));
      }
      return [{ ...input, id: crypto.randomUUID() }, ...current];
    });
  };

  const removing = events.find((event) => event.id === removeId);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted">Live governance votes and exchange activity, plus your own catalysts</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void load(true)}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-muted hover:text-foreground"
            aria-label="Refresh live events"
          >
            <RefreshCw className={cn("size-4", status === "loading" && "motion-safe:animate-spin")} />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-expanded={searchOpen}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-muted hover:text-foreground"
            aria-label="Search events"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary-bright"
          >
            <Plus className="size-4" />
            New Event
          </button>
        </div>
      </div>

      {cached ? (
        <p className="mt-4 rounded-xl border border-white/10 bg-[#121624] px-3 py-2 text-sm text-muted" role="status">
          Showing cached live events
        </p>
      ) : null}
      {partial && !cached ? (
        <p className="mt-4 text-sm text-muted" role="status">
          Some live sources could not be reached. Events from the others, and your own, are shown.
        </p>
      ) : null}

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
            ["past", "Recent"],
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
        {status === "loading" && allEvents.length === 0
          ? Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="motion-safe:animate-pulse rounded-2xl border border-white/10 bg-panel p-5">
                <div className="h-3 w-24 rounded bg-white/10" />
                <div className="mt-4 h-5 w-4/5 rounded bg-white/10" />
                <div className="mt-3 h-4 w-full rounded bg-white/5" />
              </div>
            ))
          : null}
        {status !== "loading" && visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
            <p className="text-base font-medium">
              {allEvents.length === 0 ? "No events yet" : "No events in this view"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {allEvents.length === 0
                ? "Add a network upgrade, unlock, vote or other catalyst you want to track."
                : "Try another category filter or clear the search."}
            </p>
            {allEvents.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
                className="mt-5 inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary-bright"
              >
                <Plus className="size-4" />
                New Event
              </button>
            ) : null}
          </div>
        ) : null}
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((event) => {
            const style = CATEGORY_STYLES[event.category];
            const isLive = Boolean(event.source);
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
                  {isLive ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted">via {event.source}</span>
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-foreground"
                        aria-label={`Open "${event.title}" from ${event.source} in a new tab`}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex">
                      <button
                        type="button"
                        className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-foreground"
                        aria-label={`Edit ${event.title}`}
                        onClick={() => {
                          setEditing(event);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-negative"
                        aria-label={`Delete ${event.title}`}
                        onClick={() => setRemoveId(event.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{event.title}</h3>
                {event.description ? <p className="mt-2 text-sm leading-6 text-muted">{event.description}</p> : null}
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

      <EventDialog
        open={dialogOpen}
        event={editing}
        onClose={() => setDialogOpen(false)}
        onSave={save}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        title={removing ? `Delete "${removing.title}"?` : "Delete event?"}
        body="This removes the event from this browser. This cannot be undone."
        confirmLabel="Delete event"
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) setEvents((current) => current.filter((event) => event.id !== removeId));
          setRemoveId(null);
        }}
      />
    </div>
  );
}
