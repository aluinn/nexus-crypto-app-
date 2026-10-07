import type { Metadata } from "next";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Demonstration notices for Nexus. These are not live price alerts.",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
