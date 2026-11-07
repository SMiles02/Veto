import areaCache from "@/data/areaCache.json";
import { assessFloodRisk } from "./flood";
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

/** Connectivity check only. Does not power planning distances or summaries. */
async function pingCorkOpenData(): Promise<boolean> {
  try {
    const resourceId = "8d5bbfa9-3b0c-40ac-8630-4243bed94b2d";
    const url = `https://data.corkcity.ie/api/3/action/datastore_search?resource_id=${resourceId}&limit=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAreaIntel(
  lat?: number,
  lng?: number,
  address?: string
): Promise<AreaIntel | undefined> {
  if (lat == null || lng == null) return undefined;

  const cached = cache[keyFor(lat, lng)] ?? nearestCache(lat, lng);
  const [openDataReachable, flood] = await Promise.all([
    pingCorkOpenData(),
    assessFloodRisk(lat, lng),
  ]);

  if (cached) {
    const notes = [
      ...cached.notes,
      "Planning notes are curated for this neighbourhood, not live-matched filings.",
    ];
    if (openDataReachable) {
      notes.push("Cork City open data API is reachable (connection check only).");
    } else {
      notes.push("Cork City open data API was not reachable for this scan.");
    }

    return {
      ...cached,
      address: address ?? cached.address,
      notes,
      source: "curated",
      openDataReachable,
      flood,
    };
  }

  return {
    address: address ?? "Cork",
    lat,
    lng,
    commuteMinutesToUcc: commuteFromCoords(lat, lng),
    neighbourhood: "Cork City",
    planning: [],
    notes: [
      "No curated planning notes for this pin yet. Commute is estimated from coordinates.",
      openDataReachable
        ? "Cork City open data API is reachable (connection check only)."
        : "Cork City open data API was not reachable for this scan.",
    ],
    source: "computed",
    openDataReachable,
    flood,
  };
}
