import { sanitizeText, stableId } from "@/lib/news/sanitize";
import { calendarEventSchema } from "@/lib/validation/schemas";
import { SNAPSHOT_SPACES, EVENTS_FETCH_TIMEOUT_MS } from "@/lib/events/sources";
import type { CalendarEvent, EventSourceStatus } from "@/types";

const HUB_URL = "https://hub.snapshot.org/graphql";

type ProposalNode = {
  id: string;
  title: string;
  body: string;
  start: number;
  end: number;
  space: { id: string; name: string };
};

function stripMarkdown(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]{1,3}/g, "");
}

export async function fetchSnapshotEvents(): Promise<{ status: EventSourceStatus; events: CalendarEvent[] }> {
  const spaceIds = SNAPSHOT_SPACES.map((space) => space.id);
  const symbolBySpace = new Map(SNAPSHOT_SPACES.map((space) => [space.id, space.symbol]));
  const query = `{
    proposals(
      first: 60,
      skip: 0,
      where: { space_in: ${JSON.stringify(spaceIds)} },
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      title
      body
      start
      end
      space { id name }
    }
  }`;

  try {
    const response = await fetch(HUB_URL, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(EVENTS_FETCH_TIMEOUT_MS),
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      return { status: { source: "Snapshot", ok: false, error: "http" }, events: [] };
    }
    const payload = (await response.json()) as { data?: { proposals?: ProposalNode[] }; errors?: unknown };
    const proposals = payload.data?.proposals ?? [];
    if (payload.errors || proposals.length === 0) {
      return { status: { source: "Snapshot", ok: false, error: "empty" }, events: [] };
    }

    const events: CalendarEvent[] = [];
    for (const proposal of proposals) {
      if (!proposal.end || Number.isNaN(proposal.end)) continue;
      const symbol = symbolBySpace.get(proposal.space.id);
      const candidate = {
        id: stableId(`snapshot:${proposal.id}`),
        title: sanitizeText(proposal.title, 120),
        description: sanitizeText(stripMarkdown(proposal.body ?? ""), 300),
        category: "Governance Vote" as const,
        date: new Date(proposal.end * 1000).toISOString(),
        assets: symbol ? [symbol] : [],
        url: `https://snapshot.org/#/${proposal.space.id}/proposal/${proposal.id}`,
        source: "Snapshot" as const,
      };
      const parsed = calendarEventSchema.safeParse(candidate);
      if (parsed.success) events.push(parsed.data);
    }

    if (events.length === 0) {
      return { status: { source: "Snapshot", ok: false, error: "empty" }, events: [] };
    }
    return { status: { source: "Snapshot", ok: true }, events };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError" || error instanceof Error && error.name === "TimeoutError";
    return {
      status: { source: "Snapshot", ok: false, error: aborted ? "timeout" : "unavailable" },
      events: [],
    };
  }
}
