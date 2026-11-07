"use client";

import { RTB_CHECK_REGISTER_URL, extractEircode } from "@/lib/veto/rtb";
import { scoreListing } from "@/lib/veto/score";
import type {
  ListingInput,
  RtbRegisterCheck,
  VetoResult,
} from "@/lib/veto/types";
import { useState } from "react";

const OPTIONS: { value: RtbRegisterCheck; label: string; hint: string }[] = [
  {
    value: "found",
    label: "Found = Y",
    hint: "Tenancy shows as registered",
  },
  {
    value: "not_found",
    label: "Found = N",
    hint: "No match on the register",
  },
  {
    value: "digs_exempt",
    label: "Digs / exempt",
    hint: "Owner-occupied — register may not apply",
  },
  {
    value: "unsure",
    label: "Unsure",
    hint: "Couldn’t finish the check yet",
  },
];

export function RtbVerifyPanel({
  listing,
  result,
  onUpdate,
}: {
  listing: ListingInput;
  result: VetoResult;
  onUpdate: (next: VetoResult, nextListing: ListingInput) => void;
}) {
  const [copied, setCopied] = useState(false);
  const eircode = extractEircode(
    `${listing.address} ${listing.description} ${listing.area ?? ""}`
  );
  const searchHint = eircode || listing.address;
  const selected = listing.rtbRegisterCheck;

  async function copySearchHint() {
    try {
      await navigator.clipboard.writeText(searchHint);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function applyCheck(value: RtbRegisterCheck) {
    const nextListing: ListingInput = {
      ...listing,
      rtbRegisterCheck: value,
    };
    const next = scoreListing(nextListing, result.area);
    onUpdate(next, nextListing);
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Before you pay</h2>
          <p className="mt-1 max-w-xl text-sm text-ink/70">
            We don’t scrape the RTB. Open the official Check the Register tool,
            then tell Veto what you saw — soft signal only, not a hard veto.
          </p>
        </div>
        <a
          href={RTB_CHECK_REGISTER_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/90"
        >
          Verify on RTB
        </a>
      </div>

      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-ink/80">
        <li>
          Copy the listing address{eircode ? " / Eircode" : ""} and search on
          Check the Register.
        </li>
        <li>Note Found = Y or Found = N (try address variants if empty).</li>
        <li>Report the result below so Veto can fold it into the score.</li>
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <code className="rounded bg-ink/5 px-2 py-1 text-xs text-ink">
          {searchHint}
        </code>
        <button
          type="button"
          onClick={copySearchHint}
          className="rounded-md border border-ink/20 px-3 py-1.5 text-xs text-ink hover:bg-ink/5"
        >
          {copied ? "Copied" : eircode ? "Copy Eircode" : "Copy address"}
        </button>
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-mute">
        What did Check the Register say?
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyCheck(opt.value)}
              className={`rounded-md border px-3 py-2 text-left transition ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-paper/60 text-ink hover:border-ink/40"
              }`}
            >
              <span className="block text-sm font-medium">{opt.label}</span>
              <span
                className={`mt-0.5 block text-xs ${
                  active ? "text-paper/70" : "text-mute"
                }`}
              >
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>

      {selected === "not_found" && (
        <p className="mt-3 text-sm text-ink/75">
          Soft risk added. Ask for an RT number in writing before any deposit —
          Found = N alone is not an automatic walk-away.
        </p>
      )}
      {selected === "found" && (
        <p className="mt-3 text-sm text-ink/75">
          Registration confirmed on your check. Still view in person and get a
          written lease.
        </p>
      )}
    </section>
  );
}
