import { coinbaseMarketData, coinbasePeriodOpen } from "@/lib/market/coinbase";
import { usdRate } from "@/lib/market/fx";
import { mockMarketData } from "@/lib/market/mock";
import type { AssetQuote, Currency, TimeRange } from "@/types";

const PRICE_TTL_MS = 60_000;
const HISTORY_TTL_MS = 10 * 60_000;

type CachedQuote = { at: number; price: number; change24h?: number; updatedAt: string };

/** Both caches are USD-denominated; display-currency conversion happens on read. */
const quoteCache = new Map<string, CachedQuote>();
const historyCache = new Map<string, { at: number; open?: number }>();

function rangeWindow(range: TimeRange) {
  const end = Math.floor(Date.now() / 1000);
  const day = 86_400;
  const days: Record<Exclude<TimeRange, "1D">, number> = {
    "7D": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 299,
    ALL: 299,
  };
  if (range === "1D") return null;
  return { start: end - days[range] * day, end };
}

async function demoQuote(symbol: string): Promise<AssetQuote | null> {
  const demo = await mockMarketData.getPrices([symbol]);
  const quote = demo[symbol];
  if (!quote) return null;
  return { ...quote, source: "demo" };
}

async function quoteForUsd(symbol: string, refresh: boolean): Promise<AssetQuote | null> {
  const cached = quoteCache.get(symbol);
  const fresh = cached && Date.now() - cached.at < PRICE_TTL_MS;
  if (cached && fresh && !refresh) {
    return {
      price: cached.price,
      change24h: cached.change24h,
      updatedAt: cached.updatedAt,
      source: "live",
    };
  }

  try {
    const live = await coinbaseMarketData.getPrices([symbol]);
    const quote = live[symbol];
    if (!quote) throw new Error("missing");
    quoteCache.set(symbol, { at: Date.now(), ...quote });
    return { ...quote, source: "live" };
  } catch {
    if (cached) {
      return {
        price: cached.price,
        change24h: cached.change24h,
        updatedAt: cached.updatedAt,
        source: "cached",
      };
    }
    return await demoQuote(symbol);
  }
}

async function periodOpenUsd(symbol: string, range: TimeRange, refresh: boolean, quote: AssetQuote) {
  if (range === "1D") {
    if (quote.change24h == null) return undefined;
    const factor = 1 + quote.change24h / 100;
    if (factor === 0) return undefined;
    return quote.price / factor;
  }
  const key = `${symbol}:${range}`;
  const cached = historyCache.get(key);
  if (cached && !refresh && Date.now() - cached.at < HISTORY_TTL_MS) return cached.open;
  if (quote.source === "demo") {
    const drift = range === "7D" ? 0.02 : range === "1M" ? 0.05 : 0.08;
    const open = quote.price / (1 + drift);
    historyCache.set(key, { at: Date.now(), open });
    return open;
  }
  const window = rangeWindow(range);
  if (!window) return undefined;
  try {
    const open = await coinbasePeriodOpen(symbol, window.start, window.end);
    historyCache.set(key, { at: Date.now(), open });
    return open;
  } catch {
    if (cached?.open) return cached.open;
    return undefined;
  }
}

export async function getMarketSnapshot(
  symbols: string[],
  range: TimeRange,
  refresh: boolean,
  currency: Currency,
) {
  const unique = [...new Set(symbols.map((symbol) => symbol.toUpperCase()))].filter(Boolean);
  const rate = await usdRate(currency);
  const quotes: Record<string, AssetQuote> = {};
  await Promise.all(
    unique.map(async (symbol) => {
      const quote = await quoteForUsd(symbol, refresh);
      if (!quote) return;
      const open = await periodOpenUsd(symbol, range, refresh, quote);
      quotes[symbol] = {
        ...quote,
        price: quote.price * rate,
        periodOpen: open != null ? open * rate : undefined,
      };
    }),
  );
  return {
    currency,
    range,
    updatedAt: new Date().toISOString(),
    quotes,
  };
}
