"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pencil, Plus, RefreshCw, Settings, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddHoldingDialog } from "@/components/portfolio/add-holding-dialog";
import { AllocationChart } from "@/components/portfolio/allocation-chart";
import { CurrencyPicker } from "@/components/portfolio/currency-picker";
import { assetBySymbol } from "@/data/assets";
import { cn } from "@/lib/cn";
import { formatClock, formatCurrency, formatPercent, formatQuantity, formatSignedCurrency } from "@/lib/format";
import { listStagger } from "@/lib/motion";
import { allocationPercent, holdingValue, portfolioTotal, valueChange } from "@/lib/portfolio/calc";
import { STORAGE_KEYS } from "@/lib/storage/local";
import { useStoredState } from "@/lib/storage/use-stored";
import { currencySchema, holdingsSchema, priceResponseSchema } from "@/lib/validation/schemas";
import type { AssetQuote, Currency, Holding, TimeRange } from "@/types";
import { TIME_RANGES } from "@/types";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";

const EMPTY_HOLDINGS: Holding[] = [];

const RANGE_LABEL: Record<TimeRange, string> = {
  "1D": "today",
  "7D": "over 7 days",
  "1M": "over 1 month",
  "3M": "over 3 months",
  "1Y": "over 1 year",
  ALL: "over the available history",
};

function sourceLabel(quotes: AssetQuote[]) {
  if (quotes.length === 0) return "Demo";
  if (quotes.every((quote) => quote.source === "live")) return "Live";
  if (quotes.every((quote) => quote.source === "demo")) return "Demo";
  if (quotes.every((quote) => quote.source === "cached")) return "Cached";
  return "Partial";
}

export function PortfolioView() {
  const reduce = useReducedMotion();
  const stagger = listStagger(Boolean(reduce));
  const [holdings, setHoldings, ready] = useStoredState(STORAGE_KEYS.holdings, holdingsSchema, EMPTY_HOLDINGS);
  const [currency, setCurrency] = useStoredState(STORAGE_KEYS.currency, currencySchema, "GBP" as Currency);
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, AssetQuote>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>("1D");
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [editing, setEditing] = useState<Holding | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const symbols = useMemo(() => holdings.map((holding) => holding.symbol).join(","), [holdings]);

  const loadPrices = async (refresh = false) => {
    if (!symbols) {
      setQuotes({});
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/prices?symbols=${encodeURIComponent(symbols)}&range=${range}&currency=${currency}${refresh ? "&refresh=1" : ""}`,
      );
      const parsed = priceResponseSchema.safeParse(await response.json());
      if (parsed.success) {
        setQuotes(parsed.data.quotes);
        setUpdatedAt(parsed.data.updatedAt);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      void loadPrices(false);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols, range, currency, ready]);

  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      if (document.visibilityState === "visible") void loadPrices(false);
    };
    const interval = window.setInterval(tick, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void loadPrices(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols, range, currency, ready]);

  const rows = holdings.map((holding) => {
    const quote = quotes[holding.symbol];
    const price = quote?.price ?? 0;
    const value = holdingValue(holding.quantity, price);
    const previous = quote?.periodOpen;
    const change = valueChange(holding.quantity, price, previous);
    return { holding, quote, value, change };
  });
  const total = portfolioTotal(rows.map((row) => row.value));
  const changeTotal = rows.every((row) => row.change != null)
    ? rows.reduce((sum, row) => sum + (row.change ?? 0), 0)
    : undefined;
  const quoted = rows.map((row) => row.quote).filter((quote): quote is AssetQuote => Boolean(quote));
  const label = sourceLabel(quoted);
  const slices = rows
    .map((row) => ({
      symbol: row.holding.symbol,
      name: row.holding.name,
      value: row.value,
      percent: allocationPercent(row.value, total),
    }))
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value);

  const saveHolding = (input: {
    symbol: string;
    name: string;
    quantity: number;
    purchaseValue?: number;
    purchaseCurrency?: Currency;
    id?: string;
  }) => {
    setHoldings((current) => {
      if (input.id) {
        return current.map((holding) =>
          holding.id === input.id ? { ...holding, quantity: input.quantity, purchaseValue: input.purchaseValue } : holding,
        );
      }
      const existing = current.find((holding) => holding.symbol === input.symbol);
      if (existing) {
        const sameCurrency = !existing.purchaseCurrency || existing.purchaseCurrency === input.purchaseCurrency;
        return current.map((holding) =>
          holding.symbol === input.symbol
            ? {
                ...holding,
                quantity: holding.quantity + input.quantity,
                purchaseValue: sameCurrency ? (holding.purchaseValue ?? 0) + (input.purchaseValue ?? 0) : undefined,
                purchaseCurrency: sameCurrency ? (holding.purchaseCurrency ?? input.purchaseCurrency) : input.purchaseCurrency,
              }
            : holding,
        );
      }
      return [
        {
          id: crypto.randomUUID(),
          symbol: input.symbol,
          name: input.name,
          quantity: input.quantity,
          purchaseValue: input.purchaseValue,
          purchaseCurrency: input.purchaseCurrency,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ];
    });
  };

  const removing = holdings.find((holding) => holding.id === removeId);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrencyPickerOpen(true)}
            className="min-h-11 rounded-full border border-white/10 px-3 text-sm font-medium text-muted hover:text-foreground"
            aria-label="Change display currency"
          >
            {currency}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="grid size-11 place-items-center rounded-full border border-white/10 text-muted hover:text-foreground"
            aria-label="Portfolio details"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <button type="button" className="min-h-10 rounded-full bg-[#2a2148] px-4 text-sm text-[#d5c7ff]" aria-current="true">
          My Portfolio
        </button>
        <button
          type="button"
          className="min-h-10 rounded-full border border-white/10 px-4 text-sm text-muted"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Multiple
        </button>
        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              className="absolute left-0 top-12 z-10 w-64 rounded-xl border border-white/10 bg-[#121624] p-3 text-sm text-muted shadow-xl"
              initial={reduce ? false : { opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: reduce ? 0 : 0.16, ease: "easeOut" }}
            >
              Combined portfolios stay out of this version. Holdings remain in My Portfolio on this device.
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <section className="mt-4 rounded-2xl border border-[#3c2f72] bg-panel p-5 shadow-[0_0_40px_rgba(130,92,237,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted">{rows.length === 0 ? "Total Value" : `Total Value (${label})`}</p>
          <button
            type="button"
            onClick={() => void loadPrices(true)}
            className="grid size-11 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-foreground"
            aria-label="Refresh prices"
          >
            <RefreshCw className={cn("size-4", loading && "motion-safe:animate-spin")} />
          </button>
        </div>
        <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(total, currency)}</p>
        {rows.length === 0 ? (
          <p className="mt-3 text-xs text-muted">Add a holding to see its live value and allocation.</p>
        ) : (
          <>
            <p className={cn("mt-2 flex items-center gap-1 text-sm", (changeTotal ?? 0) >= 0 ? "text-positive" : "text-negative")}>
              {changeTotal == null ? (
                <span className="text-muted">Change unavailable for this range</span>
              ) : (
                <>
                  {changeTotal >= 0 ? <TrendingUp className="size-4" aria-hidden /> : <TrendingDown className="size-4" aria-hidden />}
                  <span>
                    {formatSignedCurrency(changeTotal, currency)} {RANGE_LABEL[range]}
                    <span className="sr-only">{changeTotal >= 0 ? ", up" : ", down"}</span>
                  </span>
                </>
              )}
            </p>
            <p className="mt-3 text-xs text-muted">
              {label === "Live"
                ? currency === "USD"
                  ? "Live Coinbase USD prices."
                  : `Live Coinbase USD prices, converted to ${currency}.`
                : label === "Cached"
                  ? "Showing the last prices received."
                  : label === "Demo"
                    ? "Demo prices. These are not live market values."
                    : "Some prices are live and some are demo or cached."}
              {updatedAt ? ` Updated ${formatClock(updatedAt)}.` : ""}
            </p>
          </>
        )}
      </section>

      <div className="scroll-row -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="radiogroup" aria-label="Performance range">
        {TIME_RANGES.map((item) => (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={range === item}
            onClick={() => setRange(item)}
            className={cn(
              "min-h-10 shrink-0 rounded-full px-3 text-sm",
              range === item ? "bg-[#241c3d] text-foreground ring-1 ring-primary/70" : "bg-[#141824] text-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {range === "ALL" || range === "1Y" ? (
        <p className="mt-2 text-xs text-muted">Daily history uses the earliest Coinbase candle in a 300-day window.</p>
      ) : null}

      <section className="mt-4 rounded-2xl border border-white/10 bg-panel p-5">
        <h2 className="text-base font-medium">Allocation</h2>
        <div className="mt-4">
          <AllocationChart slices={slices} />
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-base font-medium">Holdings</h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setEditorKey((key) => key + 1);
            setEditorOpen(true);
          }}
          className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary-bright"
        >
          <Plus className="size-4" />
          Add Asset
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-muted">
          No holdings yet. Add an asset to calculate a portfolio value.
        </p>
      ) : (
        <motion.ul className="mt-3 space-y-3" variants={stagger.container} initial="hidden" animate="show">
          <AnimatePresence mode="popLayout" initial={false}>
          {rows.map((row) => {
            const color = assetBySymbol(row.holding.symbol)?.color ?? "#9aa6bd";
            return (
              <motion.li
                key={row.holding.id}
                layout
                variants={stagger.item}
                initial="hidden"
                animate="show"
                exit="exit"
                className="rounded-2xl border border-white/10 bg-panel p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
                    style={{ color, background: `${color}22` }}
                  >
                    {row.holding.symbol}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{row.holding.name}</p>
                        <p className="text-sm text-muted">
                          {formatQuantity(row.holding.quantity)} {row.holding.symbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums">{formatCurrency(row.value, currency)}</p>
                        <p className={cn("text-sm tabular-nums", (row.change ?? 0) >= 0 ? "text-positive" : "text-negative")}>
                          {row.change == null ? "—" : formatSignedCurrency(row.change, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-xs text-muted">
                        {formatPercent(allocationPercent(row.value, total))} of portfolio
                        {row.quote ? ` · ${row.quote.source === "live" ? "Live" : row.quote.source === "cached" ? "Cached" : "Demo"}` : ""}
                      </p>
                      <div className="flex">
                        <button
                          type="button"
                          className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-foreground"
                          aria-label={`Edit ${row.holding.name}`}
                          onClick={() => {
                            setEditing(row.holding);
                            setEditorKey((key) => key + 1);
                            setEditorOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-negative"
                          aria-label={`Remove ${row.holding.name}`}
                          onClick={() => setRemoveId(row.holding.id)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </motion.ul>
      )}

      <AddHoldingDialog
        key={editorKey}
        open={editorOpen}
        editing={editing}
        quotes={quotes}
        currency={currency}
        onClose={() => setEditorOpen(false)}
        onSave={saveHolding}
      />
      <CurrencyPicker
        open={currencyPickerOpen}
        onClose={() => setCurrencyPickerOpen(false)}
        selected={currency}
        onSelect={setCurrency}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        title={removing ? `Remove ${removing.symbol}?` : "Remove holding?"}
        body="This deletes the holding from this browser only. It does not touch an exchange or wallet."
        confirmLabel="Remove holding"
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) setHoldings((current) => current.filter((holding) => holding.id !== removeId));
          setRemoveId(null);
        }}
      />
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Portfolio details">
        <div className="space-y-3 text-sm leading-6 text-muted">
          <p>
            Live prices come from Coinbase public USD market data, converted to your chosen display currency
            (currently {currency}) at the latest exchange rate. Change the currency from the button beside Settings.
          </p>
          <p>Live means the latest figure came from that feed. Cached means the last successful figure is being reused. Demo means a fallback number, never a live quote.</p>
          <p>Prices refresh about once a minute while this page is visible, and pause when the tab is hidden.</p>
          <p>Nexus does not connect an exchange account and cannot place trades.</p>
        </div>
      </Dialog>
    </div>
  );
}
