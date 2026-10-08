"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ASSETS } from "@/data/assets";
import { cn } from "@/lib/cn";

const MAX_INTERESTS = 5;

export function InterestsPicker({
  open,
  onClose,
  selected,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onSave: (symbols: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(selected);
  }

  const toggle = (symbol: string) => {
    setDraft((current) => {
      if (current.includes(symbol)) return current.filter((item) => item !== symbol);
      if (current.length >= MAX_INTERESTS) return current;
      return [...current, symbol];
    });
  };

  const submit = () => {
    onSave(draft);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Pick your coins"
      description={`Choose up to ${MAX_INTERESTS} coins to personalize your For You feed.`}
      wide
    >
      <p className="text-sm font-medium text-foreground" aria-live="polite">
        {draft.length}/{MAX_INTERESTS} selected
      </p>
      <div
        className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"
        role="group"
        aria-label={`Choose up to ${MAX_INTERESTS} coins`}
      >
        {ASSETS.map((asset) => {
          const isSelected = draft.includes(asset.symbol);
          const disabled = !isSelected && draft.length >= MAX_INTERESTS;
          return (
            <button
              key={asset.symbol}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => toggle(asset.symbol)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors",
                isSelected ? "border-white/30" : "border-white/10",
                disabled ? "opacity-40" : "hover:border-white/20",
              )}
              style={{
                background: isSelected ? `${asset.color}22` : "transparent",
                boxShadow: isSelected ? `0 0 0 1px ${asset.color}` : undefined,
              }}
            >
              <span
                className="grid size-9 place-items-center rounded-full text-[11px] font-semibold"
                style={{ color: asset.color, background: `${asset.color}22` }}
              >
                {asset.symbol.slice(0, 4)}
              </span>
              <span className="text-xs text-muted">{asset.name}</span>
            </button>
          );
        })}
      </div>
      <Button type="button" className="mt-5 w-full" onClick={submit}>
        Save
      </Button>
    </Dialog>
  );
}
