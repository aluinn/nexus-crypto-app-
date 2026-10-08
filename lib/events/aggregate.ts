import { fetchBinanceEvents } from "@/lib/events/binance";
import { fetchSnapshotEvents } from "@/lib/events/snapshot";
import { EVENTS_CACHE_MS } from "@/lib/events/sources";
import type { CalendarEvent, EventSourceStatus, EventsResponse } from "@/types";

type Memory = { at: number; events: CalendarEvent[]; sources: EventSourceStatus[] };
let memory: Memory | null = null;

function dedupe(events: CalendarEvent[]) {
  const seen = new Set<string>();
  const unique: CalendarEvent[] = [];
  for (const event of events) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    unique.push(event);
  }
  return unique;
}

export async function getLiveEvents(refresh: boolean): Promise<EventsResponse> {
  if (!refresh && memory && Date.now() - memory.at < EVENTS_CACHE_MS) {
    return {
      events: memory.events,
      cached: false,
      fetchedAt: new Date(memory.at).toISOString(),
      sources: memory.sources,
    };
  }

  const [snapshot, binance] = await Promise.all([fetchSnapshotEvents(), fetchBinanceEvents()]);
  const statuses = [snapshot.status, binance.status];
  const events = dedupe([...snapshot.events, ...binance.events]);

  if (events.length === 0) {
    if (memory) {
      return {
        events: memory.events,
        cached: true,
        fetchedAt: new Date(memory.at).toISOString(),
        sources: statuses,
      };
    }
    return { events: [], cached: false, fetchedAt: new Date().toISOString(), sources: statuses };
  }

  memory = { at: Date.now(), events, sources: statuses };
  return {
    events,
    cached: false,
    fetchedAt: new Date(memory.at).toISOString(),
    sources: statuses,
  };
}
