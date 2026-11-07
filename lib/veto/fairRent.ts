import comps from "@/data/comps.json";
import type { FairRentResult, ListingInput, NearbyComp } from "./types";

export function normalizeArea(area?: string, address?: string): string {
  const source = `${area ?? ""} ${address ?? ""}`.toLowerCase();
  if (source.includes("college") || source.includes("donovan") || source.includes("connaught")) {
    return "College Road";
  }
  if (source.includes("western") || source.includes("lancaster")) {
    return "Western Road";
  }
  if (source.includes("sunday")) return "Sunday's Well";
  if (source.includes("gillabbey") || source.includes("st mary")) return "Gillabbey";
  if (source.includes("magazine") || source.includes("dorgan")) return "Magazine Road";
  if (source.includes("glasheen") || source.includes("clashduv")) return "Glasheen";
  if (source.includes("wilton") || source.includes("sarsfield") || source.includes("cuh")) {
    return "Wilton";
  }
  if (source.includes("bishopstown") || source.includes("curraheen") || source.includes("mtu")) {
    return "Bishopstown";
  }
  if (source.includes("blackpool") || source.includes("dublin hill")) return "Blackpool";
  if (source.includes("ballincollig")) return "Ballincollig";
  if (source.includes("douglas") || source.includes("grange")) return "Douglas";
  if (source.includes("blackrock") || source.includes("marina")) return "Blackrock";
  if (source.includes("mahon")) return "Mahon";
  if (source.includes("ballyphehane") || source.includes("pearse")) return "Ballyphehane";
  if (source.includes("turners") || source.includes("curragh")) return "Turners Cross";
  if (
    source.includes("city") ||
    source.includes("patrick") ||
    source.includes("mall") ||
    source.includes("washington")
  ) {
    return "City Centre";
  }
  return area?.trim() || "Cork";
}

function medianOf(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export function assessFairRent(listing: ListingInput): FairRentResult {
  const area = normalizeArea(listing.area, listing.address);
  const areaComps = comps.filter(
    (c) => c.area.toLowerCase() === area.toLowerCase() && c.beds === listing.beds
  );
  // Prefer local comps whenever we have any; only fall back citywide if none
  const usedLocal = areaComps.length > 0;
  const pool = usedLocal
    ? areaComps
    : comps.filter((c) => c.beds === listing.beds);

  const rents = pool.map((c) => c.rent);
  const median = rents.length === 0 ? listing.rent : medianOf(rents);

  const percentDiff =
    median === 0 ? 0 : Math.round(((listing.rent - median) / median) * 1000) / 10;

  let verdict: FairRentResult["verdict"] = "fair";
  if (percentDiff <= -12) verdict = "underpriced";
  else if (percentDiff >= 12) verdict = "overpriced";

  const negotiateBy =
    verdict === "overpriced" ? Math.max(0, listing.rent - median) : 0;

  return {
    median,
    sampleSize: rents.length,
    percentDiff,
    negotiateBy,
    area: usedLocal ? area : `${area} (Cork-wide fallback)`,
    verdict,
  };
}

function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

/** Nearby rent comps for the map — same bed count, closest first. */
export function getNearbyComps(
  listing: ListingInput,
  limit = 8
): NearbyComp[] {
  const lat = listing.lat;
  const lng = listing.lng;
  const area = normalizeArea(listing.area, listing.address);
  const sameBeds = comps.filter((c) => c.beds === (listing.beds || 1));

  const withDistance = sameBeds.map((c) => {
    const distanceM =
      lat != null && lng != null
        ? haversineM(lat, lng, c.lat, c.lng)
        : c.area.toLowerCase() === area.toLowerCase()
          ? 200
          : 5000;
    return {
      id: c.id,
      address: c.address,
      area: c.area,
      rent: c.rent,
      beds: c.beds,
      lat: c.lat,
      lng: c.lng,
      distanceM,
      source: c.source,
      sourceUrl: c.sourceUrl,
      listedAs: c.listedAs,
      rentBasis: c.rentBasis,
    };
  });

  return withDistance
    .sort((a, b) => a.distanceM - b.distanceM)
    .filter((c) => c.distanceM <= 3500 || c.area.toLowerCase() === area.toLowerCase())
    .slice(0, limit);
}
