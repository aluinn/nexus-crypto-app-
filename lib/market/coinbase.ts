import { z } from "zod";
import type { MarketDataProvider } from "@/lib/market/types";

const BASE = "https://api.exchange.coinbase.com";
const TIMEOUT_MS = 7000;

const tickerSchema = z.object({
  price: z.string(),
  time: z.string(),
});

const statsSchema = z.object({
  open: z.string(),
  last: z.string(),
});

const candleSchema = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

async function readJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json", "User-Agent": "Nexus/1.0" },
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

export class CoinbaseMarketDataProvider implements MarketDataProvider {
  async getPrices(symbols: string[]) {
    const entries = await Promise.all(
      symbols.map(async (symbol) => {
        const product = `${symbol.toUpperCase()}-USD`;
        try {
          const [tickerRaw, statsRaw] = await Promise.all([
            readJson(`${BASE}/products/${product}/ticker`),
            readJson(`${BASE}/products/${product}/stats`).catch(() => null),
          ]);
          const ticker = tickerSchema.parse(tickerRaw);
          const price = Number(ticker.price);
          if (!Number.isFinite(price) || price <= 0) return null;
          const parsedTime = new Date(ticker.time);
          const updatedAt = Number.isNaN(parsedTime.getTime()) ? new Date().toISOString() : parsedTime.toISOString();
          let change24h: number | undefined;
          if (statsRaw) {
            const stats = statsSchema.safeParse(statsRaw);
            if (stats.success) {
              const open = Number(stats.data.open);
              const last = Number(stats.data.last);
              if (open > 0 && Number.isFinite(last)) change24h = ((last - open) / open) * 100;
            }
          }
          return [
            symbol.toUpperCase(),
            { price, change24h, updatedAt },
          ] as const;
        } catch {
          return null;
        }
      }),
    );
    return Object.fromEntries(entries.filter((entry) => entry !== null));
  }
}

export async function coinbasePeriodOpen(symbol: string, startSec: number, endSec: number) {
  const product = `${symbol.toUpperCase()}-USD`;
  const url = `${BASE}/products/${product}/candles?granularity=86400&start=${startSec}&end=${endSec}`;
  const raw = await readJson(url);
  const candles = z.array(candleSchema).parse(raw);
  if (candles.length === 0) return undefined;
  const oldest = [...candles].sort((a, b) => a[0] - b[0])[0];
  const open = oldest[3];
  return open > 0 ? open : undefined;
}

export const coinbaseMarketData = new CoinbaseMarketDataProvider();
