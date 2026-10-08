"use client";

import { useEffect, useMemo, useState } from "react";
import { ASSETS } from "@/data/assets";
import { CURRENCY_INFO } from "@/data/currencies";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency, formatQuantity } from "@/lib/format";
import { cn } from "@/lib/cn";
import { priceResponseSchema } from "@/lib/validation/schemas";
import type { AssetQuote, Currency, Holding } from "@/types";

export function AddHoldingDialog({
  open,
  onClose,
  quotes,
  currency,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  quotes: Record<string, AssetQuote>;
  currency: Currency;
  editing: Holding | null;
  onSave: (holding: {
    symbol: string;
    name: string;
    quantity: number;
    purchaseValue?: number;
    purchaseCurrency?: Currency;
    id?: string;
  }) => void;
}) {
  const [symbol, setSymbol] = useState(editing?.symbol ?? "BTC");
  const [paid, setPaid] = useState("");
  const [quantity, setQuantity] = useState(editing ? String(editing.quantity) : "");
  const [error, setError] = useState("");
  const [fetchedQuote, setFetchedQuote] = useState<AssetQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [trackedSymbol, setTrackedSymbol] = useState(symbol);

  const asset = ASSETS.find((item) => item.symbol === symbol) ?? ASSETS[0];

  if (trackedSymbol !== asset.symbol) {
    setTrackedSymbol(asset.symbol);
    setFetchedQuote(null);
  }
  const quote = quotes[asset.symbol] ?? fetchedQuote ?? undefined;
  const price = quote?.price;
  const source = quote?.source;
  const currencySymbol = CURRENCY_INFO[currency].symbol;

  // The asset grid lets you pick any catalog symbol, including ones you
  // don't hold yet, so there may be no quote fetched for it. Fetch one.
  useEffect(() => {
    if (editing || quotes[asset.symbol] || !open) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setQuoteLoading(true);
      fetch(`/api/prices?symbols=${asset.symbol}&currency=${currency}`)
        .then((response) => response.json())
        .then((data) => {
          if (cancelled) return;
          const parsed = priceResponseSchema.safeParse(data);
          setFetchedQuote(parsed.success ? (parsed.data.quotes[asset.symbol] ?? null) : null);
        })
        .catch(() => {
          if (!cancelled) setFetchedQuote(null);
        })
        .finally(() => {
          if (!cancelled) setQuoteLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [asset.symbol, currency, editing, open, quotes]);

  const previewQuantity = useMemo(() => {
    const amount = Number(paid);
    if (!price || !Number.isFinite(amount) || amount <= 0) return null;
    return amount / price;
  }, [paid, price]);

  const submit = () => {
    if (editing) {
      const nextQuantity = Number(quantity);
      if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
        setError("Enter a quantity greater than zero.");
        return;
      }
      onSave({
        id: editing.id,
        symbol: editing.symbol,
        name: editing.name,
        quantity: nextQuantity,
        purchaseValue: editing.purchaseValue,
      });
      onClose();
      return;
    }
    const amount = Number(paid);
    if (!price) {
      setError("No price is available for this asset yet.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(`Enter the amount you paid in ${currency}.`);
      return;
    }
    onSave({
      symbol: asset.symbol,
      name: asset.name,
      quantity: amount / price,
      purchaseValue: amount,
      purchaseCurrency: currency,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit Holding" : "Add Holding"}
      description={editing ? "Update the quantity stored on this device." : `Choose an asset and the amount paid in ${currency}.`}
      wide
    >
      {editing ? (
        <label className="block text-sm">
          <span className="text-muted">Quantity ({editing.symbol})</span>
          <input
            value={quantity}
            onChange={(event) => {
              setQuantity(event.target.value);
              setError("");
            }}
            inputMode="decimal"
            className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
          />
        </label>
      ) : (
        <>
          <p className="text-sm text-muted">Select Asset</p>
          <div className="mt-3 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Select asset">
            {ASSETS.map((item) => {
              const selected = item.symbol === asset.symbol;
              return (
                <button
                  key={item.symbol}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setSymbol(item.symbol);
                    setError("");
                  }}
                  className={cn(
                    "grid aspect-square place-items-center rounded-full text-[11px] font-semibold",
                    selected ? "ring-2 ring-offset-2 ring-offset-[#0c101c]" : "",
                  )}
                  style={{
                    color: item.color,
                    background: `${item.color}22`,
                    boxShadow: selected ? `0 0 16px ${item.color}55` : undefined,
                    outlineColor: item.color,
                  }}
                >
                  {item.symbol}
                </button>
              );
            })}
          </div>
          <label className="mt-5 block text-sm">
            <span className="text-muted">Amount Paid ({currency})</span>
            <span className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-[#6d4fd4] bg-input px-3">
              <span aria-hidden>{currencySymbol}</span>
              <input
                value={paid}
                onChange={(event) => {
                  setPaid(event.target.value);
                  setError("");
                }}
                inputMode="decimal"
                className="min-h-11 w-full bg-transparent outline-none"
                aria-label={`Amount paid in ${currency}`}
              />
            </span>
          </label>
          <div className="mt-4 rounded-xl border border-white/10 px-4 py-3 text-sm">
            {price ? (
              <>
                <p className="text-muted">
                  1 {asset.symbol} = {formatCurrency(price, currency)}
                </p>
                <p className="mt-1 text-base text-foreground">
                  {previewQuantity ? `≈ ${formatQuantity(previewQuantity)} ${asset.symbol}` : "Enter an amount to estimate the quantity."}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {source === "live"
                    ? "Live Coinbase price, converted to your display currency."
                    : source === "cached"
                      ? "Cached Coinbase price from the last successful request."
                      : `Demo price. This is not a live ${currency} quote.`}
                </p>
              </>
            ) : quoteLoading ? (
              <p className="text-muted">Fetching price…</p>
            ) : (
              <p>No price is available for {asset.symbol}.</p>
            )}
          </div>
        </>
      )}
      {error ? (
        <p className="mt-3 text-sm text-negative" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="button" className="mt-5 w-full" onClick={submit}>
        {editing ? "Save changes" : "Add to Portfolio"}
      </Button>
    </Dialog>
  );
}
