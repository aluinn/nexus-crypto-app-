"use client";

import { Check } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { CURRENCY_INFO } from "@/data/currencies";
import { cn } from "@/lib/cn";
import { CURRENCIES, type Currency } from "@/types";

export function CurrencyPicker({
  open,
  onClose,
  selected,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selected: Currency;
  onSelect: (currency: Currency) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Display currency"
      description="Prices and totals convert to this currency using live exchange rates."
    >
      <div className="space-y-1.5" role="radiogroup" aria-label="Display currency">
        {CURRENCIES.map((code) => {
          const info = CURRENCY_INFO[code];
          const active = code === selected;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                onSelect(code);
                onClose();
              }}
              className={cn(
                "flex min-h-14 w-full items-center justify-between rounded-xl border px-4 text-left",
                active ? "border-primary/70 bg-[#1a1732]" : "border-white/10 hover:bg-white/5",
              )}
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/5 text-sm font-semibold text-foreground">
                  {info.symbol}
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{code}</span>
                  <span className="block text-xs text-muted">{info.label}</span>
                </span>
              </span>
              {active ? <Check className="size-4 shrink-0 text-primary" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
