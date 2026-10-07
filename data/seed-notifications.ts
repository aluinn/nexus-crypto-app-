import type { DemoNotification } from "@/types";

export const SEED_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "demo-eth-stories",
    title: "New stories mention Ethereum",
    body: "For You can surface recent ETH headlines from CoinDesk, Cointelegraph, Decrypt, and CryptoSlate. This item is a local demonstration, not a live alert.",
    kind: "news",
    createdAt: "2026-10-07T10:15:00.000Z",
    demo: true,
  },
  {
    id: "demo-portfolio-move",
    title: "Portfolio movement example",
    body: "A large daily move would appear here if Nexus ran a background alert service. It does not. This card is a demonstration only.",
    kind: "portfolio",
    createdAt: "2026-10-07T08:40:00.000Z",
    demo: true,
  },
  {
    id: "demo-saved-reminder",
    title: "Saved research is waiting",
    body: "Articles you save stay on this device, including after the live feed refreshes. This reminder is a demonstration.",
    kind: "research",
    createdAt: "2026-10-06T18:00:00.000Z",
    demo: true,
  },
];
