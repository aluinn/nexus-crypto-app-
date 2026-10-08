const FX_URL = "https://api.frankfurter.dev/v1/latest?from=USD";
const FX_TTL_MS = 60 * 60_000;
const FX_TIMEOUT_MS = 7000;

/** Approximate rates used only if the live FX endpoint is unreachable. */
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  GBP: 0.76,
  EUR: 0.89,
  JPY: 158,
  CAD: 1.43,
  AUD: 1.44,
};

let cache: { at: number; rates: Record<string, number> } | null = null;

async function fetchRates(): Promise<Record<string, number>> {
  const response = await fetch(FX_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(FX_TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(String(response.status));
  const data = (await response.json()) as { rates?: Record<string, number> };
  if (!data.rates || typeof data.rates !== "object") throw new Error("shape");
  return { USD: 1, ...data.rates };
}

/** USD → `currency` exchange rate, cached for an hour. Falls back to an
 * approximate static table if the live rate can't be fetched. */
export async function usdRate(currency: string): Promise<number> {
  const upper = currency.toUpperCase();
  if (upper === "USD") return 1;
  if (cache && Date.now() - cache.at < FX_TTL_MS && cache.rates[upper]) {
    return cache.rates[upper];
  }
  try {
    const rates = await fetchRates();
    cache = { at: Date.now(), rates };
    return rates[upper] ?? FALLBACK_RATES[upper] ?? 1;
  } catch {
    return cache?.rates[upper] ?? FALLBACK_RATES[upper] ?? 1;
  }
}
