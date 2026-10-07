import { DEMO_PRICES_GBP } from "@/data/assets";
import type { MarketDataProvider } from "@/lib/market/types";

export class MockMarketDataProvider implements MarketDataProvider {
  async getPrices(symbols: string[], currency: string) {
    const upper = currency.toUpperCase();
    const quotes: Record<string, { price: number; change24h?: number; updatedAt: string }> = {};
    const updatedAt = new Date().toISOString();
    for (const symbol of symbols) {
      const demo = DEMO_PRICES_GBP[symbol.toUpperCase()];
      if (!demo || upper !== "GBP") continue;
      quotes[symbol.toUpperCase()] = {
        price: demo.price,
        change24h: demo.change24h,
        updatedAt,
      };
    }
    return quotes;
  }
}

export const mockMarketData = new MockMarketDataProvider();
