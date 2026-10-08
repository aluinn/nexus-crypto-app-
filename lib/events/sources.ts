/**
 * Well-known governance spaces, queried live via Snapshot's public GraphQL
 * API (hub.snapshot.org — no key required). A rough symbol is attached for
 * tagging; omit it rather than guess for spaces without one obvious ticker.
 */
export const SNAPSHOT_SPACES: { id: string; symbol?: string }[] = [
  { id: "uniswapgovernance.eth", symbol: "UNI" },
  { id: "aavedao.eth", symbol: "AAVE" },
  { id: "ens.eth", symbol: "ENS" },
  { id: "arbitrumfoundation.eth", symbol: "ARB" },
  { id: "opcollective.eth", symbol: "OP" },
  { id: "gitcoindao.eth", symbol: "GTC" },
  { id: "curve.eth", symbol: "CRV" },
  { id: "lido-snapshot.eth", symbol: "LDO" },
  { id: "balancer.eth", symbol: "BAL" },
  { id: "stgdao.eth", symbol: "STG" },
];

/** Binance's public announcements CMS (no key required). */
export const BINANCE_CATALOGS = [
  { id: 48, category: "Exchange Listing" as const },
  { id: 128, category: "Project Launch" as const },
];

export const EVENTS_FETCH_TIMEOUT_MS = 8000;
export const EVENTS_CACHE_MS = 15 * 60 * 1000;
