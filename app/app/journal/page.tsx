import type { Metadata } from "next";
import { JournalView } from "@/components/journal/journal-view";

export const metadata: Metadata = {
  title: "Trade Journal",
  description: "Record buys, sells, notes, and ideas on this device.",
};

export default function JournalPage() {
  return <JournalView />;
}
