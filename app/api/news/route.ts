import { connection } from "next/server";
import { getNews } from "@/lib/news/aggregate";
import { newsResponseSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  const refresh = url.searchParams.get("refresh") === "1";
  const payload = await getNews(refresh);
  const parsed = newsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ articles: [], cached: true, fetchedAt: new Date().toISOString(), sources: [] }, { status: 200 });
  }
  return Response.json(parsed.data, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=720, stale-while-revalidate=60",
    },
  });
}
