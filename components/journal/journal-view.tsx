"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EntryDialog } from "@/components/journal/entry-dialog";
import { TAG_STYLES } from "@/data/assets";
import { cn } from "@/lib/cn";
import { formatJournalDate, formatQuantity, formatUsd } from "@/lib/format";
import { listStagger } from "@/lib/motion";
import { STORAGE_KEYS } from "@/lib/storage/local";
import { useStoredState } from "@/lib/storage/use-stored";
import { journalSchema } from "@/lib/validation/schemas";
import type { JournalEntry, JournalType } from "@/types";
import { ConfirmDialog } from "@/components/ui/dialog";

const EMPTY_JOURNAL: JournalEntry[] = [];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "trades", label: "Trades" },
  { id: "notes", label: "Notes" },
  { id: "ideas", label: "Ideas" },
] as const;

const TYPE_STYLE: Record<JournalType, string> = {
  buy: "text-positive",
  sell: "text-negative",
  note: "text-[#c4b5fd]",
  idea: "text-warning",
};

function matches(entry: JournalEntry, filter: (typeof FILTERS)[number]["id"]) {
  if (filter === "trades") return entry.type === "buy" || entry.type === "sell";
  if (filter === "notes") return entry.type === "note";
  if (filter === "ideas") return entry.type === "idea";
  return true;
}

export function JournalView() {
  const reduce = useReducedMotion();
  const stagger = listStagger(Boolean(reduce));
  const [entries, setEntries] = useStoredState(STORAGE_KEYS.journal, journalSchema, EMPTY_JOURNAL);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const visible = useMemo(() => {
    return entries
      .filter((entry) => matches(entry, filter))
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [entries, filter]);

  const save = (input: Omit<JournalEntry, "id" | "createdAt"> & { id?: string }) => {
    setEntries((current) => {
      if (input.id) {
        return current.map((entry) =>
          entry.id === input.id ? { ...entry, ...input, id: entry.id, createdAt: entry.createdAt } : entry,
        );
      }
      return [
        {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ];
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Trade Journal</h1>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary-bright"
        >
          <Plus className="size-4" />
          New Entry
        </button>
      </div>

      <div className="scroll-row -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Journal filters">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "min-h-10 shrink-0 rounded-full px-4 text-sm",
              filter === item.id ? "bg-[#2a2148] text-foreground" : "bg-[#141824] text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 px-4 py-12 text-center">
          <p className="text-base font-medium">No entries in this filter</p>
          <p className="mt-2 text-sm text-muted">Add a buy, sell, note, or idea to start the journal.</p>
        </div>
      ) : (
        <motion.ul className="mt-4 space-y-3" variants={stagger.container} initial="hidden" animate="show">
          <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((entry) => {
            const assetStyle = entry.asset ? TAG_STYLES[entry.asset] : undefined;
            return (
              <motion.li
                key={entry.id}
                layout
                variants={stagger.item}
                initial="hidden"
                animate="show"
                exit="exit"
                className="rounded-2xl border border-white/10 bg-panel p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <time dateTime={entry.date} className="text-sm text-muted">
                    {formatJournalDate(entry.date)}
                  </time>
                  <span className={cn("text-xs font-semibold tracking-wide", TYPE_STYLE[entry.type])}>
                    {entry.type.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    {entry.asset ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          color: assetStyle?.text ?? "#e7edf3",
                          background: assetStyle?.bg ?? "#1a1732",
                        }}
                      >
                        {entry.asset}
                      </span>
                    ) : null}
                    {entry.price != null ? <span className="font-semibold">@ {formatUsd(entry.price)}</span> : null}
                  </p>
                  {entry.amount != null ? (
                    <p className="text-sm text-muted">Size: {formatQuantity(entry.amount)}</p>
                  ) : null}
                </div>
                {entry.notes ? <p className="mt-3 text-sm leading-6 text-muted">{entry.notes}</p> : null}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <ul className="flex flex-wrap gap-2" aria-label="Tags">
                    {entry.tags.map((tag) => (
                      <li key={tag} className="rounded-full bg-white/5 px-2 py-1 text-xs text-muted">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <div className="flex">
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-foreground"
                      aria-label={`Edit entry from ${formatJournalDate(entry.date)}`}
                      onClick={() => {
                        setEditing(entry);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-negative"
                      aria-label={`Delete entry from ${formatJournalDate(entry.date)}`}
                      onClick={() => setRemoveId(entry.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </motion.ul>
      )}

      <EntryDialog
        key={editing?.id ?? "new"}
        open={open}
        entry={editing}
        onClose={() => setOpen(false)}
        onSave={save}
      />
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Delete this entry?"
        body="The note is removed from this browser. This cannot be undone."
        confirmLabel="Delete entry"
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) setEntries((current) => current.filter((entry) => entry.id !== removeId));
          setRemoveId(null);
        }}
      />
    </div>
  );
}
