import { DEMO_PRICES_USD } from "@/data/assets";
import type { MarketDataProvider } from "@/lib/market/types";

export class MockMarketDataProvider implements MarketDataProvider {
  async getPrices(symbols: string[]) {
    const quotes: Record<string, { price: number; change24h?: number; updatedAt: string }> = {};
    const updatedAt = new Date().toISOString();
    for (const symbol of symbols) {
      const demo = DEMO_PRICES_USD[symbol.toUpperCase()];
      if (!demo) continue;
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
