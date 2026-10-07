"use client";

import { useMemo, useState } from "react";
import { ASSETS, DEMO_PRICES_GBP } from "@/data/assets";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatGbp, formatQuantity } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AssetQuote, Holding } from "@/types";

export function AddHoldingDialog({
  open,
  onClose,
  quotes,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  quotes: Record<string, AssetQuote>;
  editing: Holding | null;
  onSave: (holding: { symbol: string; name: string; quantity: number; purchaseValue?: number; id?: string }) => void;
}) {
  const [symbol, setSymbol] = useState(editing?.symbol ?? "BTC");
  const [paid, setPaid] = useState("");
  const [quantity, setQuantity] = useState(editing ? String(editing.quantity) : "");
  const [error, setError] = useState("");

  const asset = ASSETS.find((item) => item.symbol === symbol) ?? ASSETS[0];
  const quote = quotes[asset.symbol];
  const price = quote?.price ?? DEMO_PRICES_GBP[asset.symbol]?.price;
  const source = quote?.source;

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
      setError("Enter the amount you paid in GBP.");
      return;
    }
    onSave({
      symbol: asset.symbol,
      name: asset.name,
      quantity: amount / price,
      purchaseValue: amount,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit Holding" : "Add Holding"}
      description={editing ? "Update the quantity stored on this device." : "Choose an asset and the amount paid in GBP."}
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
            <span className="text-muted">Amount Paid (GBP)</span>
            <span className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-[#6d4fd4] bg-input px-3">
              <span aria-hidden>£</span>
              <input
                value={paid}
                onChange={(event) => {
                  setPaid(event.target.value);
                  setError("");
                }}
                inputMode="decimal"
                className="min-h-11 w-full bg-transparent outline-none"
                aria-label="Amount paid in GBP"
              />
            </span>
          </label>
          <div className="mt-4 rounded-xl border border-white/10 px-4 py-3 text-sm">
            {price ? (
              <>
                <p className="text-muted">
                  1 {asset.symbol} = {formatGbp(price)} GBP
                </p>
                <p className="mt-1 text-base text-foreground">
                  {previewQuantity ? `≈ ${formatQuantity(previewQuantity)} ${asset.symbol}` : "Enter an amount to estimate the quantity."}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {source === "live"
                    ? "Live Coinbase price."
                    : source === "cached"
                      ? "Cached Coinbase price from the last successful request."
                      : "Demo price. This is not a live GBP quote."}
                </p>
              </>
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
