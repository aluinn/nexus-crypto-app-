import type { AssetQuote } from "@/types";

/** Providers always price in USD; the service layer converts to the display currency. */
export interface MarketDataProvider {
  getPrices(
    symbols: string[],
  ): Promise<Record<string, { price: number; change24h?: number; updatedAt: string }>>;
}

export type QuoteMap = Record<string, AssetQuote>;
