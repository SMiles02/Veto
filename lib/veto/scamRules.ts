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
        detail: "Asking for money before you view in person is a common Cork student housing scam.",
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
        detail: 'Phrases like "today only", "wire now", or "first to pay" are there to rush you past checks.',
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
        detail: "If they can't show the place in person, treat that as a serious red flag.",
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
        detail: "If they will only talk on Messenger or WhatsApp and avoid phone or email, be careful.",
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
        detail: "Without a clear street address, it is hard to check the place is real.",
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
        detail: `Listed about ${Math.abs(Math.round(rentPercentDiff))}% under the local median. If it looks too good to be true, it often is.`,
        severity: "high",
        category: "scam",
      },
      24,
      score
    );
  }

  // Soft RTB signals only. Never enough alone to auto-veto.
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
        "You confirmed Found = Y on Check the Register. Still view in person. Registration does not mean it is safe.",
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
        "Finish Check the Register, or ask for an RT number, before you pay anything.",
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
