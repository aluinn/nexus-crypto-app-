import type { Currency } from "@/types";

export const CURRENCY_INFO: Record<Currency, { symbol: string; label: string }> = {
  GBP: { symbol: "£", label: "British Pound" },
  USD: { symbol: "$", label: "US Dollar" },
  EUR: { symbol: "€", label: "Euro" },
  JPY: { symbol: "¥", label: "Japanese Yen" },
  CAD: { symbol: "CA$", label: "Canadian Dollar" },
  AUD: { symbol: "A$", label: "Australian Dollar" },
};
