export type AssetInfo = {
  symbol: string;
  name: string;
  color: string;
  /** Public Coinbase GBP pair was available when this catalog was written. */
  liveGbp: boolean;
};

export const ASSETS: AssetInfo[] = [
  { symbol: "BTC", name: "Bitcoin", color: "#e89838", liveGbp: true },
  { symbol: "ETH", name: "Ethereum", color: "#6878e0", liveGbp: true },
  { symbol: "SOL", name: "Solana", color: "#8848f0", liveGbp: true },
  { symbol: "LINK", name: "Chainlink", color: "#6aa2ff", liveGbp: true },
  { symbol: "ADA", name: "Cardano", color: "#4c6fff", liveGbp: true },
  { symbol: "DOT", name: "Polkadot", color: "#e879f9", liveGbp: true },
  { symbol: "AVAX", name: "Avalanche", color: "#f87171", liveGbp: false },
  { symbol: "ATOM", name: "Cosmos", color: "#94a3b8", liveGbp: true },
  { symbol: "XRP", name: "XRP", color: "#7eb6d6", liveGbp: false },
  { symbol: "BNB", name: "BNB", color: "#f5d76e", liveGbp: false },
  { symbol: "DOGE", name: "Dogecoin", color: "#d4b45a", liveGbp: true },
  { symbol: "UNI", name: "Uniswap", color: "#ff6b9a", liveGbp: true },
  { symbol: "AAVE", name: "Aave", color: "#b794f6", liveGbp: true },
  { symbol: "ARB", name: "Arbitrum", color: "#7dd3fc", liveGbp: false },
  { symbol: "OP", name: "Optimism", color: "#fb7185", liveGbp: false },
  { symbol: "NEAR", name: "NEAR", color: "#5dce9c", liveGbp: false },
  { symbol: "APT", name: "Aptos", color: "#34d399", liveGbp: false },
  { symbol: "SUI", name: "Sui", color: "#93c5fd", liveGbp: false },
  { symbol: "FIL", name: "Filecoin", color: "#67e8f9", liveGbp: true },
  { symbol: "LTC", name: "Litecoin", color: "#cbd5e1", liveGbp: true },
  { symbol: "MATIC", name: "Polygon", color: "#a78bfa", liveGbp: false },
];

export const ASSET_MAP = Object.fromEntries(ASSETS.map((asset) => [asset.symbol, asset]));

export function assetBySymbol(symbol: string) {
  return ASSET_MAP[symbol.toUpperCase()];
}

/**
 * Illustrative GBP prices used only when Coinbase does not return a quote.
 * Supported assets use a recent public print as the fallback number.
 * Unsupported assets use round placeholders and must be labelled Demo.
 */
export const DEMO_PRICES_GBP: Record<string, { price: number; change24h: number }> = {
  BTC: { price: 63196.3, change24h: -2.6 },
  ETH: { price: 1948.26, change24h: -4.1 },
  SOL: { price: 88.14, change24h: 1.4 },
  LINK: { price: 10.12, change24h: -1.1 },
  ADA: { price: 0.192, change24h: -0.8 },
  DOT: { price: 0.837, change24h: 0.4 },
  ATOM: { price: 1.27, change24h: -0.6 },
  DOGE: { price: 0.067, change24h: 0.9 },
  UNI: { price: 6.04, change24h: 1.1 },
  AAVE: { price: 130.31, change24h: -0.4 },
  FIL: { price: 0.796, change24h: 0.2 },
  LTC: { price: 50.67, change24h: -1.5 },
  XRP: { price: 1.5, change24h: 0 },
  NEAR: { price: 3, change24h: 0 },
  AVAX: { price: 20, change24h: 0 },
  APT: { price: 5, change24h: 0 },
  SUI: { price: 2, change24h: 0 },
  OP: { price: 0.8, change24h: 0 },
  ARB: { price: 0.4, change24h: 0 },
  BNB: { price: 400, change24h: 0 },
  MATIC: { price: 0.3, change24h: 0 },
};

export const TAG_STYLES: Record<string, { text: string; bg: string }> = {
  ALL: { text: "#c4b5fd", bg: "#201a3e" },
  BTC: { text: "#e89838", bg: "#24180f" },
  SOL: { text: "#c4b5fd", bg: "#140f26" },
  ETH: { text: "#9eb0f0", bg: "#101424" },
  NEAR: { text: "#6ad09d", bg: "#0f1a1d" },
  ADA: { text: "#8eb4ff", bg: "#0c1428" },
  XRP: { text: "#8ecae6", bg: "#101820" },
  CRYPTO: { text: "#c4b5fd", bg: "#1a1732" },
  LINK: { text: "#93c5fd", bg: "#101820" },
};
