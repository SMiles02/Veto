import type { ListingInput, ScoreReason } from "./types";

const PRESSURE_PATTERNS = [
  /today only/i,
  /must go today/i,
  /wire (the )?deposit/i,
  /bank transfer today/i,
  /first to pay/i,
  /lots of interest/i,
  /no questions asked/i,
  /urgent/i,
  /act (fast|now)/i,
];

const ABROAD_PATTERNS = [
  /i('|'| a)?m (currently )?abroad/i,
  /out of (the )?country/i,
  /can'?t show( the)? property/i,
  /unable to (meet|show|view)/i,
  /living in (spain|uk|dubai|usa|america)/i,
];

const SOCIAL_ONLY_PATTERNS = [
  /whatsapp only/i,
  /messenger only/i,
  /contact on messenger/i,
  /facebook only/i,
  /dm me only/i,
];

function pushReason(
  reasons: ScoreReason[],
  reason: ScoreReason,
  weight: number,
  score: { value: number }
) {
  reasons.push(reason);
  score.value = Math.min(100, score.value + weight);
}

export function scoreScamRisk(
  listing: ListingInput,
  rentPercentDiff: number
): { scamScore: number; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = [];
  const score = { value: 0 };
  const blob = `${listing.title ?? ""} ${listing.description} ${listing.contact ?? ""} ${listing.url ?? ""}`;

  if (listing.paymentBeforeViewing || /pay.*(before|prior).*(view|seeing)|deposit before (you )?view/i.test(blob)) {
    pushReason(
      reasons,
      {
        id: "pay-before-view",
        label: "Payment before viewing",
        detail: "Asking for money before an in-person viewing is a classic Cork student housing scam pattern.",
        severity: "high",
        category: "scam",
      },
      28,
      score
    );
  }

  if (PRESSURE_PATTERNS.some((p) => p.test(blob))) {
    pushReason(
      reasons,
      {
        id: "pressure",
        label: "High-pressure language",
        detail: 'Urgency tactics ("today only", "wire now", "first to pay") are used to skip checks.',
        severity: "high",
        category: "scam",
      },
      18,
      score
    );
  }

  if (ABROAD_PATTERNS.some((p) => p.test(blob))) {
    pushReason(
      reasons,
      {
        id: "abroad",
        label: "Landlord claims to be abroad",
        detail: "Unable to show the property in person is a major CCPC / Garda red flag.",
        severity: "high",
        category: "scam",
      },
      22,
      score
    );
  }

  const socialOnly =
    SOCIAL_ONLY_PATTERNS.some((p) => p.test(blob)) ||
    /facebook\.com\/groups/i.test(listing.url ?? "") ||
    /messenger only|whatsapp \/ messenger/i.test(listing.contact ?? "");

  if (socialOnly) {
    pushReason(
      reasons,
      {
        id: "social-only",
        label: "Social-only contact channel",
        detail: "Listings that only communicate via Messenger/WhatsApp and avoid phone/email are higher risk.",
        severity: "medium",
        category: "scam",
      },
      14,
      score
    );
  }

  const vagueAddress =
    !listing.address ||
    /area,? cork$/i.test(listing.address.trim()) ||
    listing.address.split(" ").length < 3;

  if (vagueAddress) {
    pushReason(
      reasons,
      {
        id: "vague-address",
        label: "Vague address",
        detail: "No exact street address makes it hard to verify the property exists.",
        severity: "medium",
        category: "scam",
      },
      12,
      score
    );
  }

  if (rentPercentDiff <= -25) {
    pushReason(
      reasons,
      {
        id: "too-cheap",
        label: "Rent far below area comps",
        detail: `Listed ~${Math.abs(Math.round(rentPercentDiff))}% under local median - too good to be true is a top scam signal in Cork.`,
        severity: "high",
        category: "scam",
      },
      24,
      score
    );
  }

  // Soft RTB signals only — never enough alone to auto-veto.
  if (listing.rtbRegisterCheck === "not_found") {
    pushReason(
      reasons,
      {
        id: "rtb-not-found",
        label: "RTB register: not found",
        detail:
          "Check the Register returned Found = N. Ask for an RT number (or digs/owner-occupied explanation) before paying a deposit. Address typos can also miss matches.",
        severity: "medium",
        category: "scam",
      },
      10,
      score
    );
  } else if (listing.rtbRegisterCheck === "found") {
    reasons.push({
      id: "rtb-found",
      label: "RTB register: found",
      detail:
        "You confirmed Found = Y on Check the Register. Still view in person — registration is not a scam-free guarantee.",
      severity: "low",
      category: "scam",
    });
  } else if (listing.rtbRegisterCheck === "digs_exempt") {
    reasons.push({
      id: "rtb-digs",
      label: "Digs / likely RTB-exempt",
      detail:
        "Owner-occupied digs often do not appear on the RTB register. Confirm the living arrangement in writing.",
      severity: "low",
      category: "scam",
    });
  } else if (listing.rtbRegisterCheck === "unsure") {
    reasons.push({
      id: "rtb-unsure",
      label: "RTB check unfinished",
      detail:
        "Finish Check the Register (or ask for an RT number) before money leaves your account.",
      severity: "low",
      category: "scam",
    });
  } else if (listing.rtbClaimed === false) {
    pushReason(
      reasons,
      {
        id: "no-rtb",
        label: "No RTB registration claimed",
        detail:
          "For a full private tenancy, open Check the Register and verify before paying a deposit.",
        severity: "medium",
        category: "scam",
      },
      8,
      score
    );
  }

  if (/crypto|western union|moneygram|gift card/i.test(blob)) {
    pushReason(
      reasons,
      {
        id: "odd-payment",
        label: "Unusual payment method",
        detail: "Crypto, wire services, or gift cards are not normal for Irish student deposits.",
        severity: "high",
        category: "scam",
      },
      20,
      score
    );
  }

  return { scamScore: score.value, reasons };
}
