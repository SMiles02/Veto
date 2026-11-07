import type { LeaseAnalysis, LeaseClause } from "./types";

interface Trap {
  id: string;
  pattern: RegExp;
  issue: string;
  severity: LeaseClause["severity"];
  reply: string;
}

const TRAPS: Trap[] = [
  {
    id: "deposit-2mo",
    pattern: /deposit.*(two months|2 months)|two months['’]? rent/i,
    issue: "Deposit appears to exceed a typical one-month student deposit and may be unfairly high.",
    severity: "high",
    reply:
      "Happy to proceed with a standard one-month deposit held against the inventory. Two months is higher than I'm comfortable with - can we revise clause 3?",
  },
  {
    id: "non-refundable",
    pattern: /deposit is non-refundable|non-refundable.*deposit/i,
    issue: "Calling a deposit non-refundable is a major red flag under Irish tenancy norms.",
    severity: "high",
    reply:
      "A deposit should be refundable subject to dilapidations. Please remove the non-refundable wording before I sign.",
  },
  {
    id: "enter-anytime",
    pattern: /enter.*(any time|anytime).*without notice|without notice to inspect/i,
    issue: "Unrestricted landlord entry without notice undermines quiet enjoyment.",
    severity: "high",
    reply:
      "Please change access to reasonable written notice (e.g. 24–48 hours) except true emergencies.",
  },
  {
    id: "foreign-account",
    pattern: /account.*outside ireland|located outside ireland|foreign (bank )?account/i,
    issue: "Paying deposits to an overseas account is a common scam / recovery risk.",
    severity: "high",
    reply:
      "I can only pay to an Irish account in the landlord/agent’s name, with a written receipt, after viewing.",
  },
  {
    id: "cash-only",
    pattern: /must be made in cash|cash only|payments must be made in cash/i,
    issue: "Cash-only rent/deposit reduces your paper trail if something goes wrong.",
    severity: "medium",
    reply:
      "I’ll pay by card or Irish bank transfer only so there’s a clear record for both of us.",
  },
  {
    id: "short-notice",
    pattern: /7 days['’]? notice|seven days['’]? notice/i,
    issue: "Seven days’ notice for landlord termination is unusually harsh for a fixed-term student let.",
    severity: "medium",
    reply:
      "Please align notice periods with standard RTB / lease norms rather than 7 days for any reason.",
  },
  {
    id: "no-rtb",
    pattern: /not obliged to register.*residential tenancies board|not.*register this tenancy with the rtb/i,
    issue: "Avoiding RTB registration weakens your protections on deposits and disputes.",
    severity: "high",
    reply:
      "Please confirm RTB registration (or explain if this is digs / owner-occupied). I need that in writing before paying a deposit.",
  },
  {
    id: "waive-mould",
    pattern: /waives any claim.*(damp|mould|heating)|as seen.*mould/i,
    issue: "Trying to waive damp/mould/heating claims after move-in is aggressive and tenant-hostile.",
    severity: "medium",
    reply:
      "I’ll sign an inventory on move-in, but I won’t waive claims for serious habitability issues like mould or no heat.",
  },
];

export function analyzeLeaseWithRules(text: string): LeaseAnalysis {
  const clauses: LeaseClause[] = [];

  for (const trap of TRAPS) {
    const match = text.match(trap.pattern);
    if (!match) continue;

    const idx = match.index ?? 0;
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + match[0].length + 80);
    const quote = text.slice(start, end).replace(/\s+/g, " ").trim();

    clauses.push({
      quote: quote.length > 180 ? `${quote.slice(0, 177)}...` : quote,
      issue: trap.issue,
      severity: trap.severity,
      reply: trap.reply,
    });
  }

  return {
    clauses: clauses.slice(0, 5),
    summary:
      clauses.length === 0
        ? "No obvious trap clauses matched our Irish student lease rules - still read the full agreement."
        : `Found ${clauses.length} clause trap${clauses.length === 1 ? "" : "s"} worth challenging before you sign.`,
    source: "rules",
  };
}

export async function analyzeLease(text: string): Promise<LeaseAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ...analyzeLeaseWithRules(text),
      llmFallbackReason: "OPENAI_API_KEY missing in runtime env",
    };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You analyse Irish student residential leases. Return JSON { summary: string, clauses: [{ quote, issue, severity: high|medium|low, reply }] }. Flag unfair deposit, entry without notice, cash/overseas payments, no RTB, extreme notice, habitability waivers. Max 5 clauses. Replies should be short tenant messages.",
          },
          {
            role: "user",
            content: text.slice(0, 12000),
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        ...analyzeLeaseWithRules(text),
        llmFallbackReason: `OpenAI HTTP ${res.status}: ${body.slice(0, 180)}`,
      };
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        ...analyzeLeaseWithRules(text),
        llmFallbackReason: "OpenAI returned empty content",
      };
    }
    const parsed = JSON.parse(content) as LeaseAnalysis;
    if (!parsed.clauses?.length) {
      return {
        ...analyzeLeaseWithRules(text),
        llmFallbackReason: "OpenAI JSON had no clauses",
      };
    }
    return { ...parsed, source: "llm" };
  } catch (error) {
    return {
      ...analyzeLeaseWithRules(text),
      llmFallbackReason:
        error instanceof Error ? error.message : "OpenAI request failed",
    };
  }
}
