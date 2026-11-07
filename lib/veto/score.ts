import { assessFairRent, getNearbyComps } from "./fairRent";
import { scoreScamRisk } from "./scamRules";
import type {
  AreaIntel,
  ListingInput,
  ScoreReason,
  VetoDecision,
  VetoResult,
} from "./types";

function decide(
  scamScore: number,
  fairRentPercent: number,
  area?: AreaIntel
): { decision: VetoDecision; stampLabel: string } {
  const majorPlanning = area?.planning.some((p) => p.distanceM <= 150) ?? false;

  if (scamScore >= 45) {
    return { decision: "WALK_AWAY", stampLabel: "VETO" };
  }

  if (fairRentPercent >= 12 || (fairRentPercent >= 8 && majorPlanning)) {
    return { decision: "NEGOTIATE", stampLabel: "NEGOTIATE" };
  }

  if (scamScore >= 25) {
    return { decision: "NEGOTIATE", stampLabel: "NEGOTIATE" };
  }

  return { decision: "PROCEED", stampLabel: "CLEAR" };
}

function areaReasons(area?: AreaIntel): ScoreReason[] {
  if (!area) return [];
  const reasons: ScoreReason[] = [];

  const near = area.planning.filter((p) => p.distanceM <= 200);
  if (near.length > 0) {
    const top = near[0];
    reasons.push({
      id: "planning",
      label: "Active planning nearby",
      detail: `${top.title} (~${top.distanceM}m). ${top.summary}`,
      severity: top.distanceM <= 120 ? "high" : "medium",
      category: "area",
    });
  }

  if (area.commuteMinutesToUcc <= 10) {
    reasons.push({
      id: "commute",
      label: `${area.commuteMinutesToUcc} min to UCC`,
      detail: `${area.neighbourhood} is walkable to campus - expect higher student demand and firmer rents.`,
      severity: "low",
      category: "area",
    });
  } else if (area.commuteMinutesToUcc >= 20) {
    reasons.push({
      id: "commute-long",
      label: `${area.commuteMinutesToUcc} min commute to UCC`,
      detail: "Factor bus reliability and late-night return when judging the rent.",
      severity: "low",
      category: "area",
    });
  }

  return reasons;
}

function rentReasons(fair: ReturnType<typeof assessFairRent>): ScoreReason[] {
  if (fair.verdict === "overpriced") {
    return [
      {
        id: "overpriced",
        label: `${fair.percentDiff}% above ${fair.area} median`,
        detail: `Local ${fair.sampleSize}-listing median is €${fair.median}. Push to negotiate ~€${fair.negotiateBy}/mo off.`,
        severity: fair.percentDiff >= 20 ? "high" : "medium",
        category: "rent",
      },
    ];
  }

  if (fair.verdict === "underpriced") {
    return [
      {
        id: "underpriced",
        label: `${Math.abs(fair.percentDiff)}% under ${fair.area} median`,
        detail: `Median nearby is €${fair.median}. Verify hard before celebrating - underpricing often tracks scams.`,
        severity: "medium",
        category: "rent",
      },
    ];
  }

  return [
    {
      id: "fair-rent",
      label: `Within range of ${fair.area} comps`,
      detail: `Asking rent sits near the €${fair.median} median from ${fair.sampleSize} local comps.`,
      severity: "low",
      category: "rent",
    },
  ];
}

function pickTopReasons(reasons: ScoreReason[], max = 4): ScoreReason[] {
  const rank = { high: 0, medium: 1, low: 2 };
  return [...reasons]
    .sort((a, b) => rank[a.severity] - rank[b.severity])
    .slice(0, max);
}

export function scoreListing(
  listing: ListingInput,
  area?: AreaIntel
): VetoResult {
  const fairRent = assessFairRent(listing);
  const { scamScore, reasons: scamReasons } = scoreScamRisk(
    listing,
    fairRent.percentDiff
  );
  const reasons = pickTopReasons([
    ...scamReasons,
    ...rentReasons(fairRent),
    ...areaReasons(area),
  ]);

  const { decision, stampLabel } = decide(
    scamScore,
    fairRent.percentDiff,
    area
  );

  const summary =
    decision === "WALK_AWAY"
      ? "Do not send money. This listing fails basic Cork scam checks."
      : decision === "NEGOTIATE"
        ? "Not an automatic veto - but do not accept the asking terms as-is."
        : "No major scam markers. Still view in person and get a written lease before paying.";

  return {
    decision,
    stampLabel,
    scamScore,
    fairRent,
    reasons,
    area,
    nearbyComps: getNearbyComps(listing),
    listingRent: listing.rent,
    summary,
  };
}
