"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { todayInputValue } from "@/lib/format";
import type { JournalEntry, JournalType } from "@/types";

const TYPES: { id: JournalType; label: string; active: string }[] = [
  { id: "buy", label: "Buy", active: "border-positive text-positive" },
  { id: "sell", label: "Sell", active: "border-negative text-negative" },
  { id: "note", label: "Note", active: "border-[#c4b5fd] text-[#c4b5fd]" },
  { id: "idea", label: "Idea", active: "border-warning text-warning" },
];

type Draft = {
  type: JournalType;
  asset: string;
  price: string;
  amount: string;
  notes: string;
  tags: string;
  date: string;
};

function draftFrom(entry: JournalEntry | null): Draft {
  if (!entry) {
    return { type: "buy", asset: "", price: "", amount: "", notes: "", tags: "", date: "" };
  }
  return {
    type: entry.type,
    asset: entry.asset ?? "",
    price: entry.price != null ? String(entry.price) : "",
    amount: entry.amount != null ? String(entry.amount) : "",
    notes: entry.notes,
    tags: entry.tags.join(", "),
    date: entry.date,
  };
}

export function EntryDialog({
  open,
  entry,
  onClose,
  onSave,
}: {
  open: boolean;
  entry: JournalEntry | null;
  onClose: () => void;
  onSave: (entry: Omit<JournalEntry, "id" | "createdAt"> & { id?: string }) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(entry));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(open);

  // Dialog now stays mounted (so it can animate out), so re-derive a fresh
  // draft whenever it actually opens, rather than relying on remount.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const next = draftFrom(entry);
      setDraft(entry ? next : { ...next, date: todayInputValue() });
      setErrors({});
    }
  }

  const trade = draft.type === "buy" || draft.type === "sell";

  const set = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const submit = () => {
    const nextErrors: Record<string, string> = {};
    const asset = draft.asset.trim().toUpperCase();
    if (trade && !/^[A-Z0-9]{2,10}$/.test(asset)) nextErrors.asset = "Enter an asset symbol such as BTC.";
    if (!trade && asset && !/^[A-Z0-9]{2,10}$/.test(asset)) nextErrors.asset = "Use 2–10 letters or leave the asset blank.";
    const price = Number(draft.price);
    const amount = Number(draft.amount);
    if (trade && (!Number.isFinite(price) || price <= 0)) nextErrors.price = "Enter a price above zero.";
    if (trade && (!Number.isFinite(amount) || amount <= 0)) nextErrors.amount = "Enter an amount above zero.";
    if (!trade && draft.notes.trim().length < 2) nextErrors.notes = "Write a short note so you can find this later.";
    if (draft.notes.length > 2000) nextErrors.notes = "Notes need to stay under 2,000 characters.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) nextErrors.date = "Choose a date.";
    const tags = draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tags.length > 8) nextErrors.tags = "Use up to 8 tags.";
    if (tags.some((tag) => tag.length > 24)) nextErrors.tags = "Each tag needs to stay under 24 characters.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSave({
      id: entry?.id,
      type: draft.type,
      asset: asset || undefined,
      price: trade ? price : undefined,
      amount: trade ? amount : undefined,
      notes: draft.notes.trim(),
      tags,
      date: draft.date,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={entry ? "Edit Journal Entry" : "New Journal Entry"}
      description="Buys and sells keep a price and size. Notes and ideas keep the reasoning."
    >
      <fieldset>
        <legend className="text-sm text-muted">Type</legend>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              aria-pressed={draft.type === type.id}
              onClick={() => set({ type: type.id })}
              className={cn(
                "min-h-11 rounded-full border border-transparent text-sm text-muted",
                draft.type === type.id && type.active,
                draft.type === type.id && "bg-white/5",
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block text-sm">
        <span className="text-muted">Asset{trade ? "" : " (optional)"}</span>
        <input
          value={draft.asset}
          onChange={(event) => set({ asset: event.target.value })}
          placeholder="e.g. BTC"
          className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
          aria-invalid={Boolean(errors.asset)}
          aria-describedby={errors.asset ? "asset-error" : undefined}
        />
        {errors.asset ? (
          <span id="asset-error" className="mt-1 block text-negative">
            {errors.asset}
          </span>
        ) : null}
      </label>

      {trade ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Price (USD)</span>
            <input
              value={draft.price}
              onChange={(event) => set({ price: event.target.value })}
              inputMode="decimal"
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? "price-error" : undefined}
            />
            {errors.price ? (
              <span id="price-error" className="mt-1 block text-negative">
                {errors.price}
              </span>
            ) : null}
          </label>
          <label className="block text-sm">
            <span className="text-muted">Amount</span>
            <input
              value={draft.amount}
              onChange={(event) => set({ amount: event.target.value })}
              inputMode="decimal"
              className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />
            {errors.amount ? (
              <span id="amount-error" className="mt-1 block text-negative">
                {errors.amount}
              </span>
            ) : null}
          </label>
        </div>
      ) : null}

      <label className="mt-4 block text-sm">
        <span className="text-muted">Notes</span>
        <textarea
          value={draft.notes}
          onChange={(event) => set({ notes: event.target.value })}
          placeholder="Your thoughts..."
          rows={4}
          className="mt-2 w-full rounded-xl border border-white/10 bg-input px-3 py-3"
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? "notes-error" : undefined}
        />
        {errors.notes ? (
          <span id="notes-error" className="mt-1 block text-negative">
            {errors.notes}
          </span>
        ) : null}
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Tags</span>
          <input
            value={draft.tags}
            onChange={(event) => set({ tags: event.target.value })}
            placeholder="macro, CPI"
            className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
            aria-invalid={Boolean(errors.tags)}
            aria-describedby={errors.tags ? "tags-error" : "tags-hint"}
          />
          <span id="tags-hint" className="mt-1 block text-xs text-muted">
            Separate tags with commas.
          </span>
          {errors.tags ? (
            <span id="tags-error" className="mt-1 block text-negative">
              {errors.tags}
            </span>
          ) : null}
        </label>
        <label className="block text-sm">
          <span className="text-muted">Date</span>
          <input
            type="date"
            value={draft.date}
            onChange={(event) => set({ date: event.target.value })}
            className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "date-error" : undefined}
          />
          {errors.date ? (
            <span id="date-error" className="mt-1 block text-negative">
              {errors.date}
            </span>
          ) : null}
        </label>
      </div>

      <Button type="button" className="mt-5 w-full" onClick={submit}>
        Save Entry
      </Button>
    </Dialog>
  );
}
