"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pencil, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ArticleCard } from "@/components/news/article-card";
import { InterestsPicker } from "@/components/for-you/interests-picker";
import { FALLBACK_NEWS } from "@/data/fallback-news";
import { assetBySymbol, TAG_STYLES } from "@/data/assets";
import { cn } from "@/lib/cn";
import { EASE, listStagger } from "@/lib/motion";
import { primaryTag } from "@/lib/news/tags";
import { STORAGE_KEYS } from "@/lib/storage/local";
import { useStoredState } from "@/lib/storage/use-stored";
import {
  holdingsSchema,
  interestsSchema,
  newsResponseSchema,
  savedStateSchema,
} from "@/lib/validation/schemas";
import type { Holding, NewsArticle, SavedArticle, SavedState } from "@/types";

const DEFAULT_FILTERS = ["BTC", "SOL", "ETH", "NEAR", "ADA"];
const EMPTY_SAVED: SavedState = { articles: [], collections: [] };
const EMPTY_INTERESTS: string[] = [];
const EMPTY_HOLDINGS: Holding[] = [];

function scoreArticle(article: NewsArticle, symbols: string[], now: number) {
  const ageHours = (now - new Date(article.publishedAt).getTime()) / 36e5;
  const recency = Math.max(0, 96 - ageHours);
  const relevant = article.tags.some((tag) => symbols.includes(tag)) ? 36 : 0;
  const specific = article.tags.some((tag) => tag !== "CRYPTO") ? 6 : 0;
  return recency + relevant + specific;
}

export function NewsFeed() {
  const reduce = useReducedMotion();
  const stagger = listStagger(Boolean(reduce));
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [cached, setCached] = useState(false);
  const [partial, setPartial] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [tab, setTab] = useState<"top" | "latest">("top");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [rankedAt, setRankedAt] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useStoredState(STORAGE_KEYS.saved, savedStateSchema, EMPTY_SAVED);
  const [holdings] = useStoredState(STORAGE_KEYS.holdings, holdingsSchema, EMPTY_HOLDINGS);
  const [interests, setInterests] = useStoredState(
    STORAGE_KEYS.interests,
    interestsSchema,
    EMPTY_INTERESTS,
  );

  const load = async (refresh = false) => {
    setStatus("loading");
    try {
      const response = await fetch(refresh ? "/api/news?refresh=1" : "/api/news");
      if (!response.ok) throw new Error("status");
      const parsed = newsResponseSchema.safeParse(await response.json());
      if (!parsed.success || parsed.data.articles.length === 0) throw new Error("shape");
      setArticles(parsed.data.articles);
      setCached(parsed.data.cached);
      setPartial(parsed.data.sources.some((source) => !source.ok));
      setRankedAt(Date.now());
      setStatus("ready");
    } catch {
      setArticles(FALLBACK_NEWS);
      setCached(true);
      setPartial(false);
      setRankedAt(Date.now());
      setStatus("ready");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const symbols = useMemo(
    () => Array.from(new Set([...holdings.map((holding) => holding.symbol), ...interests])),
    [holdings, interests],
  );
  const filters = useMemo(() => {
    const chosen = interests.length > 0 ? interests : DEFAULT_FILTERS;
    const hasXrp = articles.some((article) => article.tags.includes("XRP"));
    const list = hasXrp && !chosen.includes("XRP") ? [...chosen, "XRP"] : chosen;
    return ["ALL", ...list];
  }, [articles, interests]);

  const activeFilter = filters.includes(filter) ? filter : "ALL";

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = articles.filter((article) => {
      const tagMatch = activeFilter === "ALL" || article.tags.includes(activeFilter);
      const text = `${article.title} ${article.excerpt} ${article.source}`.toLowerCase();
      return tagMatch && (needle.length === 0 || text.includes(needle));
    });
    if (tab === "latest") {
      return [...filtered].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    }
    return [...filtered].sort(
      (a, b) => scoreArticle(b, symbols, rankedAt) - scoreArticle(a, symbols, rankedAt),
    );
  }, [activeFilter, articles, query, rankedAt, symbols, tab]);

  const savedIds = new Set(saved.articles.map((article) => article.id));

  const toggleSave = (article: NewsArticle) => {
    setSaved((current) => {
      const exists = current.articles.some((item) => item.id === article.id);
      if (exists) {
        return {
          articles: current.articles.filter((item) => item.id !== article.id),
          collections: current.collections.map((collection) => ({
            ...collection,
            articleIds: collection.articleIds.filter((id) => id !== article.id),
          })),
        };
      }
      const next: SavedArticle = { ...article, savedAt: new Date().toISOString() };
      return { ...current, articles: [next, ...current.articles] };
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">For You</h1>
          <p className="mt-1 text-sm text-muted">News related to your assets</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void load(true)}
            className="grid size-11 place-items-center rounded-full border border-white/10 text-muted hover:text-foreground"
            aria-label="Refresh news"
          >
            <RefreshCw className={cn("size-4", status === "loading" && "motion-safe:animate-spin")} />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-expanded={searchOpen}
            className="grid size-11 place-items-center rounded-full border border-white/10 text-muted hover:text-foreground"
            aria-label="Search news"
          >
            <Search className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        {interests.length === 0 ? (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex min-h-11 w-full items-center justify-between rounded-2xl border border-white/15 bg-panel px-4 py-3 text-left"
          >
            <span>
              <span className="block text-sm font-medium text-foreground">Personalize your feed</span>
              <span className="block text-xs text-muted">Pick up to 5 coins you care about</span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-primary">Choose coins</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="scroll-row -mx-4 flex flex-1 gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {interests.map((symbol) => {
                const asset = assetBySymbol(symbol);
                if (!asset) return null;
                return (
                  <span
                    key={symbol}
                    className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ color: asset.color, background: `${asset.color}22` }}
                  >
                    {asset.symbol}
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-muted hover:text-foreground"
              aria-label="Edit your coins"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {searchOpen ? (
          <motion.label
            className="mt-4 block"
            initial={reduce ? false : { opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <span className="sr-only">Search headlines</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search headlines"
              className="min-h-11 w-full rounded-xl border border-white/10 bg-input px-3 text-sm outline-none"
              autoFocus
            />
          </motion.label>
        ) : null}
      </AnimatePresence>

      <div className="scroll-row -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="toolbar" aria-label="Filter stories by asset">
        {filters.map((item) => {
          const style = TAG_STYLES[item] ?? TAG_STYLES.CRYPTO;
          const active = activeFilter === item;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item)}
              className="min-h-10 shrink-0 rounded-full px-3 text-xs font-semibold tracking-wide"
              style={{
                color: style.text,
                background: style.bg,
                boxShadow: active ? `0 0 0 1px ${style.text}, 0 0 18px ${style.bg}` : undefined,
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div role="tablist" aria-label="Story order" className="mt-5 flex gap-5 border-b border-white/10">
        {(
          [
            ["top", "Top Stories"],
            ["latest", "Latest"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`news-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`news-panel-${id}`}
            onClick={() => setTab(id)}
            className={cn(
              "min-h-11 border-b-2 px-1 text-sm",
              tab === id ? "border-primary text-foreground" : "border-transparent text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <motion.div
        className="mt-4 space-y-3"
        role="tabpanel"
        id={`news-panel-${tab}`}
        aria-labelledby={`news-tab-${tab}`}
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
        {cached ? (
          <p className="rounded-xl border border-white/10 bg-[#121624] px-3 py-2 text-sm text-muted" role="status">
            Showing cached stories
          </p>
        ) : null}
        {partial && !cached ? (
          <p className="text-sm text-muted" role="status">
            Some publications could not be reached. Stories from the others are shown.
          </p>
        ) : null}
        {status === "loading" && articles.length === 0
          ? Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="motion-safe:animate-pulse rounded-2xl border border-white/10 bg-panel p-5">
                <div className="h-3 w-24 rounded bg-white/10" />
                <div className="mt-4 h-5 w-4/5 rounded bg-white/10" />
                <div className="mt-3 h-4 w-full rounded bg-white/5" />
                <div className="mt-2 h-4 w-2/3 rounded bg-white/5" />
              </div>
            ))
          : null}
        {status !== "loading" && visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
            <p className="text-base font-medium">No stories in this view</p>
            <p className="mt-2 text-sm text-muted">Try another asset filter or clear the search.</p>
          </div>
        ) : null}
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((article) => (
            <motion.div key={article.id} layout variants={stagger.item} initial="hidden" animate="show" exit="exit">
              <ArticleCard
                article={article}
                saved={savedIds.has(article.id)}
                onToggleSave={() => toggleSave(article)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <p className="sr-only">Primary tags include {visible.map((article) => primaryTag(article.tags)).join(", ")}</p>
      <InterestsPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={interests}
        onSave={(next) => setInterests(next)}
      />
    </div>
  );
}
