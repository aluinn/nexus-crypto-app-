export type AssetInfo = {
  symbol: string;
  name: string;
  color: string;
};

export const ASSETS: AssetInfo[] = [
  { symbol: "BTC", name: "Bitcoin", color: "#e89838" },
  { symbol: "ETH", name: "Ethereum", color: "#6878e0" },
  { symbol: "SOL", name: "Solana", color: "#8848f0" },
  { symbol: "LINK", name: "Chainlink", color: "#6aa2ff" },
  { symbol: "ADA", name: "Cardano", color: "#4c6fff" },
  { symbol: "DOT", name: "Polkadot", color: "#e879f9" },
  { symbol: "AVAX", name: "Avalanche", color: "#f87171" },
  { symbol: "ATOM", name: "Cosmos", color: "#94a3b8" },
  { symbol: "XRP", name: "XRP", color: "#7eb6d6" },
  { symbol: "BNB", name: "BNB", color: "#f5d76e" },
  { symbol: "DOGE", name: "Dogecoin", color: "#d4b45a" },
  { symbol: "UNI", name: "Uniswap", color: "#ff6b9a" },
  { symbol: "AAVE", name: "Aave", color: "#b794f6" },
  { symbol: "ARB", name: "Arbitrum", color: "#7dd3fc" },
  { symbol: "OP", name: "Optimism", color: "#fb7185" },
  { symbol: "NEAR", name: "NEAR", color: "#5dce9c" },
  { symbol: "APT", name: "Aptos", color: "#34d399" },
  { symbol: "SUI", name: "Sui", color: "#93c5fd" },
  { symbol: "FIL", name: "Filecoin", color: "#67e8f9" },
  { symbol: "LTC", name: "Litecoin", color: "#cbd5e1" },
  { symbol: "MATIC", name: "Polygon", color: "#a78bfa" },
];

export const ASSET_MAP = Object.fromEntries(ASSETS.map((asset) => [asset.symbol, asset]));

export function assetBySymbol(symbol: string) {
  return ASSET_MAP[symbol.toUpperCase()];
}

/**
 * Illustrative USD prices used only when Coinbase does not return a quote.
 * USD is the pricing base for every asset (converted to the display
 * currency centrally); supported assets use a recent public print as the
 * fallback number, unsupported ones use round placeholders and are always
 * labelled Demo.
 */
export const DEMO_PRICES_USD: Record<string, { price: number; change24h: number }> = {
  BTC: { price: 83420, change24h: -2.6 },
  ETH: { price: 2572, change24h: -4.1 },
  SOL: { price: 116.3, change24h: 1.4 },
  LINK: { price: 13.36, change24h: -1.1 },
  ADA: { price: 0.253, change24h: -0.8 },
  DOT: { price: 1.11, change24h: 0.4 },
  ATOM: { price: 1.68, change24h: -0.6 },
  DOGE: { price: 0.088, change24h: 0.9 },
  UNI: { price: 7.97, change24h: 1.1 },
  AAVE: { price: 172, change24h: -0.4 },
  FIL: { price: 1.05, change24h: 0.2 },
  LTC: { price: 66.9, change24h: -1.5 },
  XRP: { price: 1.98, change24h: 0 },
  NEAR: { price: 3.96, change24h: 0 },
  AVAX: { price: 26.4, change24h: 0 },
  APT: { price: 6.6, change24h: 0 },
  SUI: { price: 2.64, change24h: 0 },
  OP: { price: 1.06, change24h: 0 },
  ARB: { price: 0.53, change24h: 0 },
  BNB: { price: 528, change24h: 0 },
  MATIC: { price: 0.4, change24h: 0 },
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
