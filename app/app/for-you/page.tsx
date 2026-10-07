import type { Metadata } from "next";
import { NewsFeed } from "@/components/news/news-feed";

export const metadata: Metadata = {
  title: "For You",
  description: "Crypto headlines from CoinDesk, Cointelegraph, Decrypt, and CryptoSlate.",
};

export default function ForYouPage() {
  return <NewsFeed />;
}
