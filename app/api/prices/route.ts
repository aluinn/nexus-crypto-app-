import { connection } from "next/server";
import { getMarketSnapshot } from "@/lib/market/service";
import { priceResponseSchema, timeRangeSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  const symbols = (url.searchParams.get("symbols") ?? "BTC,ETH,SOL")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z0-9]{2,10}$/.test(symbol))
    .slice(0, 30);
  const rangeParsed = timeRangeSchema.safeParse(url.searchParams.get("range") ?? "1D");
  const range = rangeParsed.success ? rangeParsed.data : "1D";
  const refresh = url.searchParams.get("refresh") === "1";
  const snapshot = await getMarketSnapshot(symbols.length ? symbols : ["BTC", "ETH", "SOL"], range, refresh);
  const parsed = priceResponseSchema.safeParse(snapshot);
  if (!parsed.success) {
    return Response.json({ currency: "GBP", range, updatedAt: new Date().toISOString(), quotes: {} });
  }
  return Response.json(parsed.data, {
    headers: { "Cache-Control": "public, max-age=30, s-maxage=60" },
  });
}
