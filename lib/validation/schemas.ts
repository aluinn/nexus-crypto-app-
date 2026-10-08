import { z } from "zod";
import { CURRENCIES, NEWS_SOURCES, TIME_RANGES } from "@/types";

const httpUrl = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "Expected an http(s) URL");

const isoTime = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Expected a date");

export const newsArticleSchema = z.object({
  id: z.string().min(1),
  source: z.enum(NEWS_SOURCES),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(600),
  url: httpUrl,
  imageUrl: httpUrl.optional(),
  publishedAt: isoTime,
  tags: z.array(z.string().min(1).max(24)).max(8),
});

export const newsResponseSchema = z.object({
  articles: z.array(newsArticleSchema),
  cached: z.boolean(),
  fetchedAt: isoTime,
  sources: z.array(
    z.object({
      source: z.enum(NEWS_SOURCES),
      ok: z.boolean(),
      error: z.string().optional(),
    }),
  ),
});

export const currencySchema = z.enum(CURRENCIES);

export const holdingSchema = z.object({
  id: z.string().min(1),
  symbol: z.string().min(2).max(10),
  name: z.string().min(1).max(40),
  quantity: z.number().positive().finite(),
  purchaseValue: z.number().nonnegative().finite().optional(),
  purchaseCurrency: currencySchema.optional(),
  createdAt: isoTime,
});

export const holdingsSchema = z.array(holdingSchema).max(100);

export const journalEntrySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["buy", "sell", "note", "idea"]),
  asset: z.string().min(2).max(10).optional(),
  price: z.number().positive().finite().optional(),
  amount: z.number().positive().finite().optional(),
  notes: z.string().max(2000),
  tags: z.array(z.string().min(1).max(24)).max(8),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: isoTime,
});

export const journalSchema = z.array(journalEntrySchema).max(500);

export const savedArticleSchema = newsArticleSchema.extend({
  savedAt: isoTime,
});

export const collectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  articleIds: z.array(z.string()).max(200),
  createdAt: isoTime,
});

export const savedStateSchema = z.object({
  articles: z.array(savedArticleSchema).max(200),
  collections: z.array(collectionSchema).max(50),
});

export const dismissedNotificationsSchema = z.array(z.string()).max(100);

export const interestsSchema = z.array(z.string().min(2).max(10)).max(5);

export const timeRangeSchema = z.enum(TIME_RANGES);

export const quoteSchema = z.object({
  price: z.number().positive().finite(),
  change24h: z.number().finite().optional(),
  periodOpen: z.number().positive().finite().optional(),
  updatedAt: isoTime,
  source: z.enum(["live", "cached", "demo"]),
});

export const priceResponseSchema = z.object({
  currency: currencySchema,
  range: timeRangeSchema,
  updatedAt: isoTime,
  quotes: z.record(z.string(), quoteSchema),
});
