import { connection } from "next/server";
import { getLiveEvents } from "@/lib/events/aggregate";
import { eventsResponseSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  const refresh = url.searchParams.get("refresh") === "1";
  const payload = await getLiveEvents(refresh);
  const parsed = eventsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ events: [], cached: true, fetchedAt: new Date().toISOString(), sources: [] }, { status: 200 });
  }
  return Response.json(parsed.data, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=300",
    },
  });
}
