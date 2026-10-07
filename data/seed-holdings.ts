import type { Holding } from "@/types";

/**
 * Quantities are chosen so a portfolio priced near the October 2026 public
 * GBP prints (ETH ~£1,948, SOL ~£88, BTC ~£63,200) lands near £754 with
 * roughly a 66.7 / 26.7 / 6.7 split. Live prices replace that snapshot.
 */
export const SEED_HOLDINGS: Holding[] = [
  {
    id: "seed-eth",
    symbol: "ETH",
    name: "Ethereum",
    quantity: 0.258,
    purchaseValue: 500,
    createdAt: "2024-05-20T09:00:00.000Z",
  },
  {
    id: "seed-sol",
    symbol: "SOL",
    name: "Solana",
    quantity: 2.282,
    purchaseValue: 200,
    createdAt: "2024-05-18T09:00:00.000Z",
  },
  {
    id: "seed-btc",
    symbol: "BTC",
    name: "Bitcoin",
    quantity: 0.000796,
    purchaseValue: 50,
    createdAt: "2024-05-12T09:00:00.000Z",
  },
];
