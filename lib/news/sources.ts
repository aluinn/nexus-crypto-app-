import type { NewsSource } from "@/types";

export type FeedSource = {
  source: NewsSource;
  url: string;
};

/**
 * Official publication RSS feeds. Add another source by appending an entry
 * and extending the NewsSource union in types/index.ts.
 */
export const FEEDS: FeedSource[] = [
  { source: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { source: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { source: "Decrypt", url: "https://decrypt.co/feed" },
  { source: "CryptoSlate", url: "https://cryptoslate.com/feed/" },
];

export const FEED_TIMEOUT_MS = 8000;
export const NEWS_CACHE_MS = 12 * 60 * 1000;
