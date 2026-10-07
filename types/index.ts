export const NEWS_SOURCES = [
  "CoinDesk",
  "Cointelegraph",
  "Decrypt",
  "CryptoSlate",
] as const;

export type NewsSource = (typeof NEWS_SOURCES)[number];

export type NewsArticle = {
  id: string;
  source: NewsSource;
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  tags: string[];
};

export type NewsSourceStatus = {
  source: NewsSource;
  ok: boolean;
  error?: string;
};

export type NewsResponse = {
  articles: NewsArticle[];
  cached: boolean;
  fetchedAt: string;
  sources: NewsSourceStatus[];
};

export type Holding = {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchaseValue?: number;
  createdAt: string;
};

export type PriceSource = "live" | "cached" | "demo";

export type AssetQuote = {
  price: number;
  change24h?: number;
  /** Price at the start of the selected range, when known. */
  periodOpen?: number;
  updatedAt: string;
  source: PriceSource;
};

export type PriceResponse = {
  currency: "GBP";
  range: TimeRange;
  updatedAt: string;
  quotes: Record<string, AssetQuote>;
};

export const TIME_RANGES = ["1D", "7D", "1M", "3M", "1Y", "ALL"] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

export type JournalType = "buy" | "sell" | "note" | "idea";

export type JournalEntry = {
  id: string;
  type: JournalType;
  asset?: string;
  price?: number;
  amount?: number;
  notes: string;
  tags: string[];
  /** Calendar date, YYYY-MM-DD. */
  date: string;
  createdAt: string;
};

export type SavedArticle = NewsArticle & {
  savedAt: string;
};

export type Collection = {
  id: string;
  name: string;
  articleIds: string[];
  createdAt: string;
};

export type SavedState = {
  articles: SavedArticle[];
  collections: Collection[];
};

export type DemoNotification = {
  id: string;
  title: string;
  body: string;
  kind: "news" | "portfolio" | "research";
  createdAt: string;
  demo: true;
};
