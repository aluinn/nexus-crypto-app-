import type { Metadata } from "next";
import { NewsFeed } from "@/components/news/news-feed";

export const metadata: Metadata = {
  title: "For You",
  description:
    "Crypto headlines from CoinDesk, Cointelegraph, Decrypt, CryptoSlate, The Block, Bitcoin Magazine, and The Defiant.",
};

export default function ForYouPage() {
  return <NewsFeed />;
}
