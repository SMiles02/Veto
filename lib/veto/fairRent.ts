import comps from "@/data/comps.json";
import type { FairRentResult, ListingInput } from "./types";

function normalizeArea(area?: string, address?: string): string {
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
