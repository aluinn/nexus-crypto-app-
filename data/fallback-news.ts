import type { NewsArticle } from "@/types";

/** Local stories used only when every live feed fails. */
export const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: "fallback-eth",
    source: "CoinDesk",
    title: "Ethereum Foundation talent exodus sparks fresh debate over leadership",
    excerpt:
      "The Ethereum community is once again debating the future of the foundation after a leadership change. This is a stored example, not a live report.",
    url: "https://www.coindesk.com/tag/ethereum/",
    publishedAt: "2026-10-05T12:00:00.000Z",
    tags: ["ETH", "CRYPTO"],
  },
  {
    id: "fallback-crypto",
    source: "CryptoSlate",
    title: "UK political shake-up keeps crypto policy in the headlines",
    excerpt:
      "A change in Westminster has the industry watching for a policy reset. This is a stored example, not a live report.",
    url: "https://cryptoslate.com/",
    publishedAt: "2026-10-05T10:00:00.000Z",
    tags: ["CRYPTO"],
  },
  {
    id: "fallback-xrp",
    source: "Cointelegraph",
    title: "XRP ledger activity draws fresh attention as price stays rangebound",
    excerpt:
      "Wallet growth and resistance levels are back in the XRP conversation. This is a stored example, not a live report.",
    url: "https://cointelegraph.com/tags/xrp",
    publishedAt: "2026-10-04T16:00:00.000Z",
    tags: ["XRP", "CRYPTO"],
  },
  {
    id: "fallback-polymarket",
    source: "Decrypt",
    title: "Prediction markets face another security conversation",
    excerpt:
      "Platforms say user funds stayed protected while they reviewed an incident. This is a stored example, not a live report.",
    url: "https://decrypt.co/",
    publishedAt: "2026-10-04T12:00:00.000Z",
    tags: ["CRYPTO"],
  },
  {
    id: "fallback-btc",
    source: "CoinDesk",
    title: "Bitcoin traders watch liquidity as the pound price swings",
    excerpt:
      "Spot activity and macro data are setting the tone for BTC this week. This is a stored example, not a live report.",
    url: "https://www.coindesk.com/tag/bitcoin/",
    publishedAt: "2026-10-03T15:00:00.000Z",
    tags: ["BTC", "CRYPTO"],
  },
  {
    id: "fallback-sol",
    source: "Decrypt",
    title: "Solana ecosystem updates keep builders and traders busy",
    excerpt:
      "Network usage and application launches remain the story around SOL. This is a stored example, not a live report.",
    url: "https://decrypt.co/news",
    publishedAt: "2026-10-03T11:00:00.000Z",
    tags: ["SOL", "CRYPTO"],
  },
  {
    id: "fallback-ada",
    source: "CryptoSlate",
    title: "Cardano developers outline the next round of protocol work",
    excerpt:
      "Research notes and upgrade timelines are circulating around ADA. This is a stored example, not a live report.",
    url: "https://cryptoslate.com/coins/cardano/",
    publishedAt: "2026-10-02T09:00:00.000Z",
    tags: ["ADA"],
  },
  {
    id: "fallback-near",
    source: "Cointelegraph",
    title: "Near Protocol ecosystem grants stay on research desks",
    excerpt:
      "Users are watching application growth around Near Protocol before sizing a position. This is a stored example, not a live report.",
    url: "https://cointelegraph.com/tags/near-protocol",
    publishedAt: "2026-10-01T09:00:00.000Z",
    tags: ["NEAR"],
  },
];
