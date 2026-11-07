"use client";

import { ListingForm } from "@/components/ListingForm";
import { Nav } from "@/components/Nav";
import { VetoResultPanel } from "@/components/VetoResultPanel";
import type { ListingInput, VetoResult } from "@/lib/veto/types";
import { useState } from "react";

export default function HomePage() {
  const [result, setResult] = useState<VetoResult | null>(null);
  const [listing, setListing] = useState<ListingInput | null>(null);

  return (
    <div className="min-h-screen">
      <Nav active="/" />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {!result || !listing ? (
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <section className="space-y-5">
              <p className="text-sm font-medium text-veto">Cork student housing</p>
              <h1 className="max-w-xl font-display text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl">
                Veto
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-ink/70">
                Bad listings hope you panic-pay. Paste the ad. Get walk, negotiate, or
                proceed - with evidence - before money leaves your account.
              </p>
            </section>

            <section className="rounded-xl border border-ink/10 bg-white/70 p-5 sm:p-6">
              <h2 className="mb-4 font-display text-2xl text-ink">Scan a listing</h2>
              <ListingForm
                onResult={(next, input) => {
                  setResult(next);
                  setListing(input);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </section>
          </div>
        ) : (
          <VetoResultPanel
            result={result}
            listing={listing}
            onReset={() => {
              setResult(null);
              setListing(null);
            }}
            onUpdate={(next, nextListing) => {
              setResult(next);
              setListing(nextListing);
            }}
          />
        )}
      </main>
    </div>
  );
}
