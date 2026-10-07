"use client";

import { Bookmark, ExternalLink, Globe } from "lucide-react";
import { TAG_STYLES } from "@/data/assets";
import { formatRelativeTime } from "@/lib/format";
import { primaryTag } from "@/lib/news/tags";
import { useNow } from "@/lib/use-now";
import type { NewsArticle } from "@/types";

export function ArticleCard({
  article,
  saved,
  onToggleSave,
  timeLabel,
}: {
  article: NewsArticle;
  saved: boolean;
  onToggleSave: () => void;
  timeLabel?: string;
}) {
  const now = useNow();
  const tag = primaryTag(article.tags);
  const style = TAG_STYLES[tag] ?? TAG_STYLES.CRYPTO;
  const when = timeLabel ?? (now == null ? "recently" : formatRelativeTime(article.publishedAt, now));

  return (
    <article className="rounded-2xl border border-white/10 bg-panel p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 text-sm text-muted">
        <p className="flex min-w-0 items-center gap-2">
          <Globe className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate text-foreground">{article.source}</span>
        </p>
        <time dateTime={article.publishedAt} className="shrink-0">
          {when}
        </time>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{article.title}</h3>
      {article.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p> : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide"
          style={{ color: style.text, background: style.bg }}
        >
          {tag}
        </span>
        <div className="flex items-center gap-1">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-foreground"
            aria-label={`Open “${article.title}” from ${article.source} in a new tab`}
          >
            <ExternalLink className="size-4" />
          </a>
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-foreground"
            aria-label={saved ? `Remove “${article.title}” from saved articles` : `Save “${article.title}”`}
          >
            <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </article>
  );
}
