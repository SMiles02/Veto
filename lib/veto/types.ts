export type VetoDecision = "WALK_AWAY" | "NEGOTIATE" | "PROCEED";

export type Severity = "high" | "medium" | "low";

export interface ListingInput {
  title?: string;
  address: string;
  area?: string;
  rent: number;
  beds: number;
  description: string;
  contact?: string;
  url?: string;
  lat?: number;
  lng?: number;
  rtbClaimed?: boolean;
  paymentBeforeViewing?: boolean;
}

export interface ScoreReason {
  id: string;
  label: string;
  detail: string;
  severity: Severity;
  category: "scam" | "rent" | "area";
}

export interface FairRentResult {
  median: number;
  sampleSize: number;
  percentDiff: number;
  negotiateBy: number;
  area: string;
  verdict: "underpriced" | "fair" | "overpriced";
}

export interface NearbyComp {
  id: string;
  address: string;
  area: string;
  rent: number;
  beds: number;
  lat: number;
  lng: number;
  distanceM: number;
}

export interface PlanningItem {
  id: string;
  title: string;
  summary: string;
  distanceM: number;
  status: string;
}

export interface AreaIntel {
  address: string;
  lat: number;
  lng: number;
  commuteMinutesToUcc: number;
  neighbourhood: string;
  planning: PlanningItem[];
  notes: string[];
  source: "live" | "cache";
}

export interface VetoResult {
  decision: VetoDecision;
  stampLabel: string;
  scamScore: number;
  fairRent: FairRentResult;
  reasons: ScoreReason[];
  area?: AreaIntel;
  nearbyComps: NearbyComp[];
  listingRent: number;
  summary: string;
}

export interface LeaseClause {
  quote: string;
  issue: string;
  severity: Severity;
  reply: string;
}

export interface LeaseAnalysis {
  clauses: LeaseClause[];
  summary: string;
  source: "llm" | "rules";
  llmFallbackReason?: string;
}
