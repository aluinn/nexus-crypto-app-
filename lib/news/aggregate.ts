import Parser from "rss-parser";
import { FALLBACK_NEWS } from "@/data/fallback-news";
import { FEEDS, FEED_TIMEOUT_MS, NEWS_CACHE_MS, type FeedSource } from "@/lib/news/sources";
import { canonicalUrl, normalizeHeadline, safeHttpUrl, sanitizeText, stableId } from "@/lib/news/sanitize";
import { tagsFor } from "@/lib/news/tags";
import { newsArticleSchema } from "@/lib/validation/schemas";
import type { NewsArticle, NewsResponse, NewsSourceStatus } from "@/types";

type FeedItem = {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  enclosure?: { url?: string; type?: string };
  mediaContent?: { $?: { url?: string }; url?: string };
};

const parser = new Parser<Record<string, unknown>, FeedItem>({
  customFields: {
    item: [["media:content", "mediaContent"]],
  },
  timeout: FEED_TIMEOUT_MS,
});

type Memory = { at: number; articles: NewsArticle[]; sources: NewsSourceStatus[] };
let memory: Memory | null = null;

function imageFrom(item: FeedItem) {
  const enclosure = item.enclosure;
  const enclosureUrl = enclosure?.url;
  const enclosureType = enclosure?.type ?? "";
  if (enclosureUrl && (enclosureType.startsWith("image/") || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(enclosureUrl))) {
    return safeHttpUrl(enclosureUrl);
  }
  const media = item.mediaContent;
  const mediaUrl = media?.url ?? media?.$?.url;
  return safeHttpUrl(mediaUrl);
}

async function readFeed(source: FeedSource, xml: string) {
  const feed = await parser.parseString(xml);
  const articles: NewsArticle[] = [];
  for (const item of feed.items ?? []) {
    const title = sanitizeText(item.title ?? "", 220);
    const link = safeHttpUrl(item.link);
    const published = item.isoDate ?? item.pubDate;
    if (!title || !link || !published || Number.isNaN(Date.parse(published))) continue;
    const canonical = canonicalUrl(link);
    if (!canonical) continue;
    const rawExcerpt = item.contentSnippet || item.summary || item.content || "";
    const excerpt = sanitizeText(rawExcerpt, 240);
    const imageUrl = imageFrom(item);
    const candidate = {
      id: stableId(canonical),
      source: source.source,
      title,
      excerpt,
      url: canonical,
      ...(imageUrl ? { imageUrl } : {}),
      publishedAt: new Date(published).toISOString(),
      tags: tagsFor(title, excerpt),
    };
    const parsed = newsArticleSchema.safeParse(candidate);
    if (parsed.success) articles.push(parsed.data);
  }
  return articles;
}

async function fetchSource(source: FeedSource): Promise<{ status: NewsSourceStatus; articles: NewsArticle[] }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Nexus/1.0 (news reader; excerpts only)",
      },
    });
    if (!response.ok) {
      return { status: { source: source.source, ok: false, error: "http" }, articles: [] };
    }
    const xml = await response.text();
    if (xml.length > 1_500_000) {
      return { status: { source: source.source, ok: false, error: "too-large" }, articles: [] };
    }
    const articles = await readFeed(source, xml);
    if (articles.length === 0) {
      return { status: { source: source.source, ok: false, error: "empty" }, articles: [] };
    }
    return { status: { source: source.source, ok: true }, articles };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      status: { source: source.source, ok: false, error: aborted ? "timeout" : "unavailable" },
      articles: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

function dedupe(articles: NewsArticle[]) {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: NewsArticle[] = [];
  for (const article of sorted) {
    const canonical = canonicalUrl(article.url) ?? article.url;
    const headline = normalizeHeadline(article.title);
    if (seenUrls.has(canonical) || (headline && seenTitles.has(headline))) continue;
    seenUrls.add(canonical);
    if (headline) seenTitles.add(headline);
    unique.push(article);
  }
  return unique.slice(0, 80);
}

function fallbackResponse(sources: NewsSourceStatus[]): NewsResponse {
  return {
    articles: FALLBACK_NEWS,
    cached: true,
    fetchedAt: new Date().toISOString(),
    sources,
  };
}

export async function getNews(refresh: boolean): Promise<NewsResponse> {
  if (!refresh && memory && Date.now() - memory.at < NEWS_CACHE_MS) {
    return {
      articles: memory.articles,
      cached: false,
      fetchedAt: new Date(memory.at).toISOString(),
      sources: memory.sources,
    };
  }

  const results = await Promise.all(FEEDS.map((source) => fetchSource(source)));
  const statuses = results.map((result) => result.status);
  const articles = dedupe(results.flatMap((result) => result.articles));

  if (articles.length === 0) {
    if (memory) {
      return {
        articles: memory.articles,
        cached: true,
        fetchedAt: new Date(memory.at).toISOString(),
        sources: statuses,
      };
    }
    return fallbackResponse(statuses);
  }

  memory = { at: Date.now(), articles, sources: statuses };
  return {
    articles,
    cached: false,
    fetchedAt: new Date(memory.at).toISOString(),
    sources: statuses,
  };
}
