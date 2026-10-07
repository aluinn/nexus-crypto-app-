import type { AssetQuote } from "@/types";

export interface MarketDataProvider {
  getPrices(
    symbols: string[],
    currency: string,
  ): Promise<Record<string, { price: number; change24h?: number; updatedAt: string }>>;
}

export type QuoteMap = Record<string, AssetQuote>;
