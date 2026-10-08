export const NEWS_SOURCES = [
  "CoinDesk",
  "Cointelegraph",
  "Decrypt",
  "CryptoSlate",
  "The Block",
  "Bitcoin Magazine",
  "The Defiant",
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

export const CURRENCIES = ["GBP", "USD", "EUR", "JPY", "CAD", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Holding = {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchaseValue?: number;
  /** Currency `purchaseValue` was recorded in. Absent on legacy entries. */
  purchaseCurrency?: Currency;
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
  currency: Currency;
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

export const EVENT_CATEGORIES = [
  "Network Upgrade",
  "Token Unlock",
  "Governance Vote",
  "Regulatory Decision",
  "Exchange Listing",
  "Project Launch",
  "Economic Announcement",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  /** ISO datetime. */
  date: string;
  /** Related asset symbols. Empty for broad macro events. */
  assets: string[];
  /** Link to the original proposal or announcement. Absent for your own entries. */
  url?: string;
  /** Where this was pulled from live. Absent for your own entries. */
  source?: "Snapshot" | "Binance";
};

export const EVENT_SOURCES = ["Snapshot", "Binance"] as const;

export type EventSourceStatus = {
  source: (typeof EVENT_SOURCES)[number];
  ok: boolean;
  error?: string;
};

export type EventsResponse = {
  events: CalendarEvent[];
  cached: boolean;
  fetchedAt: string;
  sources: EventSourceStatus[];
};
