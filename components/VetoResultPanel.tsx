"use client";

import type { ListingInput, VetoResult } from "@/lib/veto/types";
import Link from "next/link";
import { MapPin } from "./MapPin";
import { ReasonList } from "./ReasonList";
import { ScoreStamp } from "./ScoreStamp";

export function VetoResultPanel({
  result,
  listing,
  onReset,
}: {
  result: VetoResult;
  listing: ListingInput;
  onReset: () => void;
}) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-mute">
            Decision for {listing.address}
          </p>
          <ScoreStamp
            decision={result.decision}
            stampLabel={result.stampLabel}
          />
          <p className="mt-4 max-w-xl text-ink/75">{result.summary}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white/70 px-4 py-3 text-sm">
          <p className="text-mute">Scam risk</p>
          <p className="font-display text-3xl text-ink">{result.scamScore}/100</p>
          <p className="mt-2 text-mute">Fair rent</p>
          <p className="text-ink">
            {result.fairRent.percentDiff > 0 ? "+" : ""}
            {result.fairRent.percentDiff}% vs €{result.fairRent.median} median
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-2xl text-ink">Why</h2>
          <ReasonList reasons={result.reasons} />
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-ink">Area intel</h2>
          {result.area ? (
            <>
              <MapPin area={result.area} />
              <div className="rounded-lg border border-ink/10 bg-white/70 p-4 text-sm">
                <p className="font-medium text-ink">
                  {result.area.neighbourhood} · {result.area.commuteMinutesToUcc}{" "}
                  min to UCC
                </p>
                <p className="mt-1 text-mute">
                  Source:{" "}
                  {result.area.source === "live"
                    ? "cached pin + Cork open data"
                    : "cached Cork intel"}
                </p>
                {result.area.planning[0] && (
                  <p className="mt-3 text-ink/80">
                    Nearby planning: {result.area.planning[0].title} (
                    {result.area.planning[0].status})
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-mute">No map pin for this listing.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-ink/20 px-4 py-2 text-sm text-ink hover:bg-ink/5"
        >
          Scan another
        </button>
        <Link
          href="/lease"
          className="rounded-md bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/90"
        >
          Check the lease next
        </Link>
      </div>
    </section>
  );
}
