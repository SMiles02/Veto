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
    hint: "Owner-occupied (register may not apply)",
  },
  {
    value: "unsure",
    label: "Unsure",
    hint: "Could not finish the check yet",
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
    <section className="border-y border-ink/10 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="section-title text-2xl">Before you pay</h2>
          <p className="mt-2 max-w-xl text-sm text-ink/65">
            We don&apos;t scrape the RTB. Open Check the Register, then report
            what you saw. It nudges the score; it doesn&apos;t decide alone.
          </p>
        </div>
        <a
          href={RTB_CHECK_REGISTER_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-ink py-2.5"
        >
          Verify on RTB
        </a>
      </div>

      <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm text-ink/75">
        <li>
          Copy the listing address{eircode ? " / Eircode" : ""} and search on
          Check the Register.
        </li>
        <li>Note Found = Y or Found = N (try address variants if empty).</li>
        <li>Report the result below so Veto can add it to your score.</li>
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <code className="bg-mist/60 px-2 py-1 text-xs text-ink">
          {searchHint}
        </code>
        <button
          type="button"
          onClick={copySearchHint}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          {copied ? "Copied" : eircode ? "Copy Eircode" : "Copy address"}
        </button>
      </div>

      <p className="mt-6 text-xs font-medium tracking-[0.16em] text-mute uppercase">
        What did Check the Register say?
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => applyCheck(opt.value)}
              className={`rounded-sm border px-3 py-2.5 text-left transition ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-paper/70 text-ink hover:border-tide/50"
              }`}
            >
              <span className="block text-sm font-medium">{opt.label}</span>
              <span
                className={`mt-0.5 block text-xs ${
                  active ? "text-paper/65" : "text-mute"
                }`}
              >
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>

      {selected === "not_found" && (
        <p className="mt-3 text-sm text-ink/70">
          Soft risk added. Ask for an RT number before any deposit. Found = N
          alone is not an automatic walk-away.
        </p>
      )}
      {selected === "found" && (
        <p className="mt-3 text-sm text-ink/70">
          Registration confirmed on your check. Still view in person and get a
          written lease.
        </p>
      )}
    </section>
  );
}
