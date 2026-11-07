"use client";

import type { ListingInput, VetoResult } from "@/lib/veto/types";
import Link from "next/link";
import { FloodRiskPanel } from "./FloodRiskPanel";
import { MapPin } from "./MapPin";
import { ReasonList } from "./ReasonList";
import { RtbVerifyPanel } from "./RtbVerifyPanel";
import { ScoreStamp } from "./ScoreStamp";

export function VetoResultPanel({
  result,
  listing,
  onReset,
  onUpdate,
}: {
  result: VetoResult;
  listing: ListingInput;
  onReset: () => void;
  onUpdate: (next: VetoResult, nextListing: ListingInput) => void;
}) {
  return (
    <section className="space-y-10 animate-rise">
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-5 text-xs font-medium tracking-[0.2em] text-mute uppercase">
            Decision · {listing.address}
          </p>
          <div className="py-2">
            <ScoreStamp
              key={`${result.decision}-${result.stampLabel}`}
              decision={result.decision}
              stampLabel={result.stampLabel}
            />
          </div>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/75">
            {result.summary}
          </p>
          <p className="mt-3 max-w-xl text-xs text-mute">
            This isn&apos;t perfect. Always view in person before you pay.
          </p>
        </div>
        <dl className="grid min-w-[11rem] grid-cols-2 gap-x-8 gap-y-3 border-t border-ink/10 pt-4 text-sm sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
          <div>
            <dt className="text-mute">Scam risk</dt>
            <dd className="font-display text-3xl font-semibold text-ink">
              {result.scamScore}
              <span className="text-base text-mute">/100</span>
            </dd>
          </div>
          <div>
            <dt className="text-mute">Fair rent</dt>
            <dd className="text-ink">
              {result.fairRent.percentDiff > 0 ? "+" : ""}
              {result.fairRent.percentDiff}% vs €{result.fairRent.median}
            </dd>
          </div>
          {result.area?.flood && (
            <div className="col-span-2">
              <dt className="text-mute">Flood</dt>
              <dd className="capitalize text-ink">
                {result.area.flood.level === "none"
                  ? "Clear at pin"
                  : result.area.flood.level}
                <span className="text-mute">
                  {" "}
                  · {result.area.flood.score}/100
                </span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <RtbVerifyPanel listing={listing} result={result} onUpdate={onUpdate} />

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="section-title mb-4 text-2xl">Why</h2>
          <ReasonList reasons={result.reasons} />
        </div>
        <div className="space-y-4">
          <h2 className="section-title text-2xl">Nearby rents</h2>
          {result.area ? (
            <>
              <MapPin
                area={result.area}
                comps={result.nearbyComps || []}
                listingRent={result.listingRent ?? listing.rent}
              />
              <div className="border-t border-ink/10 pt-4 text-sm">
                <p className="font-medium text-ink">
                  {result.area.neighbourhood} · {result.area.commuteMinutesToUcc}{" "}
                  min to UCC
                </p>
                <p className="mt-1 text-mute">
                  {(result.nearbyComps || []).length} similar {listing.beds}-bed
                  comps near this pin (median €{result.fairRent.median})
                </p>
                {result.area.planning[0] && (
                  <p className="mt-3 text-ink/75">
                    Nearby planning: {result.area.planning[0].title} (
                    {result.area.planning[0].status})
                  </p>
                )}
                <p className="mt-3 text-xs text-mute">
                  Area notes:{" "}
                  {result.area.source === "curated"
                    ? "curated neighbourhood cache"
                    : "computed from coordinates"}
                  {result.area.openDataReachable
                    ? " · Cork open data reachable (ping only)"
                    : " · Cork open data unreachable"}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-mute">No map pin for this listing.</p>
          )}
        </div>
      </div>

      {result.area?.flood && <FloodRiskPanel flood={result.area.flood} />}

      <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-6">
        <button type="button" onClick={onReset} className="btn-ghost py-2.5">
          Scan another
        </button>
        <Link href="/lease" className="btn-ink py-2.5">
          Check the lease next
        </Link>
      </div>
    </section>
  );
}
