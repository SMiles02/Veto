import comps from "@/data/comps.json";
import type { FairRentResult, ListingInput } from "./types";

function normalizeArea(area?: string, address?: string): string {
  const source = `${area ?? ""} ${address ?? ""}`.toLowerCase();
  if (source.includes("college")) return "College Road";
  if (source.includes("western")) return "Western Road";
  if (source.includes("sunday")) return "Sunday's Well";
  if (source.includes("blackpool")) return "Blackpool";
  if (source.includes("ballincollig")) return "Ballincollig";
  if (source.includes("city") || source.includes("patrick") || source.includes("mall")) {
    return "City Centre";
  }
  return area?.trim() || "Cork";
}

export function assessFairRent(listing: ListingInput): FairRentResult {
  const area = normalizeArea(listing.area, listing.address);
  const areaComps = comps.filter(
    (c) => c.area.toLowerCase() === area.toLowerCase() && c.beds === listing.beds
  );
  const pool =
    areaComps.length >= 2
      ? areaComps
      : comps.filter((c) => c.beds === listing.beds);

  const rents = pool.map((c) => c.rent).sort((a, b) => a - b);
  const mid = Math.floor(rents.length / 2);
  const median =
    rents.length === 0
      ? listing.rent
      : rents.length % 2 === 0
        ? Math.round((rents[mid - 1] + rents[mid]) / 2)
        : rents[mid];

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
    area,
    verdict,
  };
}
