# Nexus — Crypto Intelligence

Nexus is an investment workspace for digital-asset investors. It combines a portfolio view, live crypto headlines, saved research, and a personal trade journal.

Information in Nexus is for organisation and reference. It is not financial advice, and it does not place trades.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first visit in a browser session plays the opening wordmark. Later visits in the same session use a short fade. `prefers-reduced-motion` skips the blur, letter-spacing, and long hold.

If the dev server is bound to all interfaces and you open it at `127.0.0.1`, that host must stay in `allowedDevOrigins`. Next.js otherwise refuses the development websocket, and the pages stay on the server-rendered shell.

Other checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## How live news works

`/app/for-you` asks the server route `/api/news`. The browser never calls publisher feeds itself.

The route fetches these RSS feeds at the same time, each with its own timeout:

- CoinDesk — `https://www.coindesk.com/arc/outboundfeeds/rss/`
- Cointelegraph — `https://cointelegraph.com/rss`
- Decrypt — `https://decrypt.co/feed`
- CryptoSlate — `https://cryptoslate.com/feed/`

A failed source is dropped. The others are still returned. Titles and excerpts are stripped to plain text, checked with Zod, deduplicated, and sorted newest first. Successful results stay in memory for 12 minutes. The refresh button calls `/api/news?refresh=1`.

If every feed fails, the route returns local fallback stories and the page says **Showing cached stories**.

Excerpts are the feed text. Nexus does not write summaries and does not fetch article pages.

## How live pricing works

`/app/portfolio` asks `/api/prices`. `CoinbaseMarketDataProvider` reads Coinbase’s public Exchange endpoints for GBP pairs (`/products/{SYMBOL}-GBP/ticker` and `/stats`). No API key, account, or trading permission is used.

Quotes are cached for about 60 seconds. The portfolio page refreshes about once a minute while it is visible and pauses while the tab is hidden.

If a pair is missing or the request fails:

- the last successful quote is reused and labelled **Cached**
- otherwise a fallback number is used and labelled **Demo**

**Live** appears only when the figure came from Coinbase. Range buttons (1D, 7D, 1M, 3M, 1Y, ALL) use the 24 hour open or public daily candles. 1Y and ALL are limited to Coinbase’s 300-candle window.

Holdings are quantities. Value is `quantity × price`. Allocation is each value divided by the portfolio total.

## What stays in this browser

These keys live in `localStorage` and are validated on read. A broken value falls back to the built-in sample:

| Key | Contents |
| --- | --- |
| `nexus.holdings.v1` | Portfolio holdings |
| `nexus.journal.v1` | Trade journal entries |
| `nexus.saved.v1` | Saved articles and collections |
| `nexus.notifications.dismissed.v1` | Dismissed demonstration notices |

The opening animation flag is `sessionStorage` key `nexus-intro-complete`.

Saved articles keep the normalised story, so they remain after the live feed refreshes.

## Add another RSS source

1. Add the publication name to `NEWS_SOURCES` in `types/index.ts`.
2. Append `{ source, url }` to `FEEDS` in `lib/news/sources.ts`.
3. Use the publisher’s official feed. Do not scrape article pages.

## Replace the price provider

`MarketDataProvider` in `lib/market/types.ts` is the seam. `lib/market/service.ts` calls `CoinbaseMarketDataProvider` and falls back through `MockMarketDataProvider`.

To swap providers, implement `getPrices(symbols, currency)` and use that class from `quoteFor` in `lib/market/service.ts`. Keep the `live` / `cached` / `demo` labels honest.

## Known limitations

- Holdings, journal entries, saved stories, and dismissed notices stay on one browser. There is no account sync.
- Only public GBP pairs from Coinbase are live. Other assets use labelled demo prices.
- News is headlines and short excerpts, not full articles.
- Notifications are demonstrations. There is no background alert service.
- Portfolio history for 1Y and ALL covers up to 300 daily candles.
- Nexus does not connect to wallets or exchanges and cannot place orders.
