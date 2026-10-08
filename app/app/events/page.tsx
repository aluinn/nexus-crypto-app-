import type { Metadata } from "next";
import { EventsView } from "@/components/events/events-view";

export const metadata: Metadata = {
  title: "Events",
  description: "Live governance votes from Snapshot and exchange activity from Binance, plus your own network upgrades, token unlocks, regulatory decisions, and other catalysts.",
};

export default function EventsPage() {
  return <EventsView />;
}
