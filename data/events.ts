import type { EventCategory } from "@/types";

export const CATEGORY_STYLES: Record<EventCategory, { text: string; bg: string }> = {
  "Network Upgrade": { text: "#6ad09d", bg: "#0f1a1d" },
  "Token Unlock": { text: "#e89838", bg: "#24180f" },
  "Governance Vote": { text: "#c4b5fd", bg: "#1a1732" },
  "Regulatory Decision": { text: "#f3867d", bg: "#2a1414" },
  "Exchange Listing": { text: "#8ecae6", bg: "#101820" },
  "Project Launch": { text: "#93c5fd", bg: "#101a2e" },
  "Economic Announcement": { text: "#e5c07b", bg: "#241c12" },
};
