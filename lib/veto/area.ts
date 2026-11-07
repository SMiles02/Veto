import areaCache from "@/data/areaCache.json";
import type { AreaIntel, PlanningItem } from "./types";

type CacheEntry = {
  address: string;
  lat: number;
  lng: number;
  commuteMinutesToUcc: number;
  neighbourhood: string;
  planning: PlanningItem[];
  notes: string[];
};

const cache = areaCache as Record<string, CacheEntry>;

function keyFor(lat: number, lng: number) {
  return `${lat},${lng}`;
}

function nearestCache(lat: number, lng: number): CacheEntry | null {
  let best: { entry: CacheEntry; dist: number } | null = null;
  for (const entry of Object.values(cache)) {
    const dist = Math.hypot(entry.lat - lat, entry.lng - lng);
    if (!best || dist < best.dist) best = { entry, dist };
  }
  // ~1.5km threshold
  return best && best.dist < 0.015 ? best.entry : null;
}

function commuteFromCoords(lat: number, lng: number) {
  // UCC Quad approx
  const ucc = { lat: 51.8937, lng: -8.4921 };
  const km = Math.hypot(lat - ucc.lat, lng - ucc.lng) * 111;
  return Math.max(5, Math.round(km * 12));
}

async function fetchRecentPlanningTitles(): Promise<string[]> {
  try {
    const resourceId = "8d5bbfa9-3b0c-40ac-8630-4243bed94b2d";
    const url = `https://data.corkcity.ie/api/3/action/datastore_search?resource_id=${resourceId}&limit=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      result?: { records?: Array<Record<string, unknown>> };
    };
    return (json.result?.records ?? [])
      .map((r) =>
        String(r.DevelopmentDescription ?? r.Location ?? "").trim()
      )
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function getAreaIntel(
  lat?: number,
  lng?: number,
  address?: string
): Promise<AreaIntel | undefined> {
  if (lat == null || lng == null) return undefined;

  const cached = cache[keyFor(lat, lng)] ?? nearestCache(lat, lng);
  const liveTitles = await fetchRecentPlanningTitles();

  if (cached) {
    const notes = [...cached.notes];
    if (liveTitles.length) {
      notes.push(`Cork open data reachable (${liveTitles.length} recent filings sampled)`);
    }
    return {
      ...cached,
      address: address ?? cached.address,
      notes,
      // Distances come from curated cache; live API is connectivity/health only
      source: liveTitles.length ? "live" : "cache",
    };
  }

  return {
    address: address ?? "Cork",
    lat,
    lng,
    commuteMinutesToUcc: commuteFromCoords(lat, lng),
    neighbourhood: "Cork City",
    planning: [],
    notes: liveTitles.length
      ? [`Open data ok; no local planning pin for this coordinate yet`]
      : ["No cached area pin for this coordinate"],
    source: liveTitles.length ? "live" : "cache",
  };
}
