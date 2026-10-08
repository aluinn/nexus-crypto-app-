import type { Metadata } from "next";
import { EventsView } from "@/components/events/events-view";

export const metadata: Metadata = {
  title: "Events",
  description: "Illustrative crypto events: network upgrades, token unlocks, governance votes, regulatory decisions, exchange listings, project launches, and economic announcements.",
};

export default function EventsPage() {
  return <EventsView />;
}
