import { sanitizeText, stableId } from "@/lib/news/sanitize";
import { calendarEventSchema } from "@/lib/validation/schemas";
import { BINANCE_CATALOGS, EVENTS_FETCH_TIMEOUT_MS } from "@/lib/events/sources";
import type { CalendarEvent, EventSourceStatus } from "@/types";

const BASE = "https://www.binance.com/bapi/composite/v1/public/cms/article/list/query";

type Article = {
  code: string;
  title: string;
  releaseDate: number;
};

const TICKER_PATTERN = /\(([A-Z0-9]{2,10})\)/;

function symbolFrom(title: string) {
  const match = title.match(TICKER_PATTERN);
  return match ? [match[1]] : [];
}

async function fetchCatalog(catalogId: number): Promise<Article[]> {
  const url = `${BASE}?type=1&catalogId=${catalogId}&pageNo=1&pageSize=10`;
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(EVENTS_FETCH_TIMEOUT_MS),
    headers: { Accept: "application/json", "User-Agent": "Nexus/1.0 (events reader)" },
  });
  if (!response.ok) throw new Error("http");
  const payload = (await response.json()) as {
    data?: { catalogs?: { articles?: Article[] }[] };
  };
  return payload.data?.catalogs?.[0]?.articles ?? [];
}

export async function fetchBinanceEvents(): Promise<{ status: EventSourceStatus; events: CalendarEvent[] }> {
  try {
    const results = await Promise.all(
      BINANCE_CATALOGS.map(async (catalog) => ({
        catalog,
        articles: await fetchCatalog(catalog.id),
      })),
    );

    const events: CalendarEvent[] = [];
    for (const { catalog, articles } of results) {
      for (const article of articles) {
        if (!article.title || !article.releaseDate) continue;
        const title = sanitizeText(article.title, 120);
        const candidate = {
          id: stableId(`binance:${article.code}`),
          title,
          description: "",
          category: catalog.category,
          date: new Date(article.releaseDate).toISOString(),
          assets: symbolFrom(title),
          url: `https://www.binance.com/en/support/announcement/${article.code}`,
          source: "Binance" as const,
        };
        const parsed = calendarEventSchema.safeParse(candidate);
        if (parsed.success) events.push(parsed.data);
      }
    }

    if (events.length === 0) {
      return { status: { source: "Binance", ok: false, error: "empty" }, events: [] };
    }
    return { status: { source: "Binance", ok: true }, events };
  } catch (error) {
    const aborted = error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
    return {
      status: { source: "Binance", ok: false, error: aborted ? "timeout" : "unavailable" },
      events: [],
    };
  }
}
