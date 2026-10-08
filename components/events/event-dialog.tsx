"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { todayInputValue } from "@/lib/format";
import { EVENT_CATEGORIES, type CalendarEvent, type EventCategory } from "@/types";

type Draft = {
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  assets: string;
};

function draftFrom(event: CalendarEvent | null): Draft {
  if (!event) {
    return { title: "", description: "", category: "Network Upgrade", date: "", assets: "" };
  }
  return {
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date.slice(0, 10),
    assets: event.assets.join(", "),
  };
}

export function EventDialog({
  open,
  event,
  onClose,
  onSave,
}: {
  open: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id"> & { id?: string }) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(event));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(open);

  // Dialog stays mounted so it can animate out, so re-derive a fresh draft
  // whenever it actually opens, rather than relying on remount.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const next = draftFrom(event);
      setDraft(event ? next : { ...next, date: todayInputValue() });
      setErrors({});
    }
  }

  const set = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const submit = () => {
    const nextErrors: Record<string, string> = {};
    const title = draft.title.trim();
    if (title.length < 2) nextErrors.title = "Give the event a short title.";
    if (title.length > 120) nextErrors.title = "Keep the title under 120 characters.";
    if (draft.description.length > 600) nextErrors.description = "Keep the description under 600 characters.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) nextErrors.date = "Choose a date.";
    const assets = draft.assets
      .split(",")
      .map((symbol) => symbol.trim().toUpperCase())
      .filter(Boolean);
    if (assets.length > 8) nextErrors.assets = "Use up to 8 symbols.";
    if (assets.some((symbol) => !/^[A-Z0-9]{2,10}$/.test(symbol))) {
      nextErrors.assets = "Use 2–10 letter symbols such as BTC, separated by commas.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSave({
      id: event?.id,
      title,
      description: draft.description.trim(),
      category: draft.category,
      date: new Date(`${draft.date}T00:00:00.000Z`).toISOString(),
      assets,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={event ? "Edit Event" : "New Event"}
      description="Track a catalyst you want to see coming."
      wide
    >
      <label className="block text-sm">
        <span className="text-muted">Title</span>
        <input
          value={draft.title}
          onChange={(event_) => set({ title: event_.target.value })}
          placeholder="e.g. ETH mainnet upgrade"
          className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title ? (
          <span id="title-error" className="mt-1 block text-negative">
            {errors.title}
          </span>
        ) : null}
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm text-muted">Category</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EVENT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={draft.category === category}
              onClick={() => set({ category })}
              className={cn(
                "min-h-11 rounded-xl border border-transparent px-2 text-xs font-medium text-muted",
                draft.category === category && "border-primary/70 bg-white/5 text-foreground",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block text-sm">
        <span className="text-muted">Description (optional)</span>
        <textarea
          value={draft.description}
          onChange={(event_) => set({ description: event_.target.value })}
          placeholder="What is this, and why does it matter?"
          rows={3}
          className="mt-2 w-full rounded-xl border border-white/10 bg-input px-3 py-3"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description ? (
          <span id="description-error" className="mt-1 block text-negative">
            {errors.description}
          </span>
        ) : null}
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Date</span>
          <input
            type="date"
            value={draft.date}
            onChange={(event_) => set({ date: event_.target.value })}
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
        <label className="block text-sm">
          <span className="text-muted">Related assets</span>
          <input
            value={draft.assets}
            onChange={(event_) => set({ assets: event_.target.value })}
            placeholder="BTC, ETH"
            className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
            aria-invalid={Boolean(errors.assets)}
            aria-describedby={errors.assets ? "assets-error" : "assets-hint"}
          />
          <span id="assets-hint" className="mt-1 block text-xs text-muted">
            Separate symbols with commas, or leave blank.
          </span>
          {errors.assets ? (
            <span id="assets-error" className="mt-1 block text-negative">
              {errors.assets}
            </span>
          ) : null}
        </label>
      </div>

      <Button type="button" className="mt-5 w-full" onClick={submit}>
        {event ? "Save changes" : "Add Event"}
      </Button>
    </Dialog>
  );
}
