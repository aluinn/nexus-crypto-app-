import type { CalendarEvent, EventCategory } from "@/types";

/**
 * Illustrative crypto events. Nexus does not run a live events feed, so
 * every entry is a local demonstration, not a confirmed date.
 */
export const SEED_EVENTS: CalendarEvent[] = [
  {
    id: "evt-eth-fusaka",
    title: "Ethereum “Fusaka” upgrade targeted for mainnet",
    description:
      "Client teams have coordinated around this window for the next scheduled network upgrade. This is a demonstration entry, not a confirmed date.",
    category: "Network Upgrade",
    date: "2026-11-18T14:00:00.000Z",
    assets: ["ETH"],
    demo: true,
  },
  {
    id: "evt-btc-core-v29",
    title: "Bitcoin Core v29 soft fork signaling begins",
    description:
      "A signaling period for a proposed soft fork would open around this date. This is a demonstration entry, not a confirmed date.",
    category: "Network Upgrade",
    date: "2026-09-29T00:00:00.000Z",
    assets: ["BTC"],
    demo: true,
  },
  {
    id: "evt-arb-unlock",
    title: "ARB token unlock: ~92.6M tokens",
    description:
      "A scheduled unlock would release vested tokens into circulating supply. This is a demonstration entry, not a confirmed date.",
    category: "Token Unlock",
    date: "2026-10-16T16:00:00.000Z",
    assets: ["ARB"],
    demo: true,
  },
  {
    id: "evt-op-cliff",
    title: "OP core-contributor cliff unlock",
    description:
      "Core contributor allocations would reach their vesting cliff under this illustrative schedule. This is a demonstration entry.",
    category: "Token Unlock",
    date: "2026-11-30T16:00:00.000Z",
    assets: ["OP"],
    demo: true,
  },
  {
    id: "evt-uni-fee-switch",
    title: "Uniswap DAO vote: protocol fee switch",
    description:
      "A governance proposal to activate protocol-level fees would go to a token-holder vote around this time. This is a demonstration entry.",
    category: "Governance Vote",
    date: "2026-10-14T18:00:00.000Z",
    assets: ["UNI"],
    demo: true,
  },
  {
    id: "evt-aave-risk",
    title: "Aave governance: risk parameter update",
    description:
      "A proposal to adjust collateral and risk parameters for newer markets. This is a demonstration entry, not a confirmed date.",
    category: "Governance Vote",
    date: "2026-11-05T17:00:00.000Z",
    assets: ["AAVE"],
    demo: true,
  },
  {
    id: "evt-sec-sol-etf",
    title: "SEC decision window: spot Solana ETF filings",
    description:
      "Regulators are expected to rule on pending spot ETF applications around this window. This is a demonstration entry, not a confirmed date.",
    category: "Regulatory Decision",
    date: "2026-11-10T00:00:00.000Z",
    assets: ["SOL"],
    demo: true,
  },
  {
    id: "evt-mica-stablecoin",
    title: "EU stablecoin reserve rules take effect",
    description:
      "Updated reserve and disclosure requirements for stablecoin issuers under this illustrative timeline. This is a demonstration entry.",
    category: "Regulatory Decision",
    date: "2026-09-30T00:00:00.000Z",
    assets: [],
    demo: true,
  },
  {
    id: "evt-coinbase-apt-perps",
    title: "Coinbase opens APT perpetual futures",
    description:
      "A major exchange could open a new derivatives market around this date. This is a demonstration entry, not a confirmed date.",
    category: "Exchange Listing",
    date: "2026-10-20T13:00:00.000Z",
    assets: ["APT"],
    demo: true,
  },
  {
    id: "evt-sui-spot-review",
    title: "Exchange spot-listing review: SUI",
    description:
      "Exchanges periodically review spot listing applications. This is an illustrative example, not a confirmed date.",
    category: "Exchange Listing",
    date: "2026-11-25T00:00:00.000Z",
    assets: ["SUI"],
    demo: true,
  },
  {
    id: "evt-near-sharded",
    title: "NEAR mainnet launch: sharded execution",
    description:
      "An example mainnet milestone for a new execution design, shown here for illustration. This is a demonstration entry.",
    category: "Project Launch",
    date: "2026-12-02T15:00:00.000Z",
    assets: ["NEAR"],
    demo: true,
  },
  {
    id: "evt-defi-tge",
    title: "New lending protocol token generation event",
    description:
      "An example token-generation event for a new protocol launch. This is a demonstration entry, not a confirmed date.",
    category: "Project Launch",
    date: "2026-10-01T15:00:00.000Z",
    assets: ["ARB"],
    demo: true,
  },
  {
    id: "evt-us-cpi",
    title: "US CPI inflation print",
    description:
      "Macro data releases often move crypto markets alongside equities. This is a demonstration entry, not a confirmed date.",
    category: "Economic Announcement",
    date: "2026-10-14T12:30:00.000Z",
    assets: [],
    demo: true,
  },
  {
    id: "evt-fomc",
    title: "FOMC interest rate decision",
    description:
      "Central bank rate decisions are a recurring macro catalyst for risk assets. This is a demonstration entry, not a confirmed date.",
    category: "Economic Announcement",
    date: "2026-11-04T18:00:00.000Z",
    assets: [],
    demo: true,
  },
];

export const CATEGORY_STYLES: Record<EventCategory, { text: string; bg: string }> = {
  "Network Upgrade": { text: "#6ad09d", bg: "#0f1a1d" },
  "Token Unlock": { text: "#e89838", bg: "#24180f" },
  "Governance Vote": { text: "#c4b5fd", bg: "#1a1732" },
  "Regulatory Decision": { text: "#f3867d", bg: "#2a1414" },
  "Exchange Listing": { text: "#8ecae6", bg: "#101820" },
  "Project Launch": { text: "#93c5fd", bg: "#101a2e" },
  "Economic Announcement": { text: "#e5c07b", bg: "#241c12" },
};
