"use client";

import { ListingForm } from "@/components/ListingForm";
import { Nav } from "@/components/Nav";
import { VetoResultPanel } from "@/components/VetoResultPanel";
import type { ListingInput, VetoResult } from "@/lib/veto/types";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [result, setResult] = useState<VetoResult | null>(null);
  const [listing, setListing] = useState<ListingInput | null>(null);
  const [overHero, setOverHero] = useState(true);
  const showingResult = Boolean(result && listing);

  useEffect(() => {
    if (showingResult) return;

    function onScroll() {
      // Stay in hero tone while the photo still sits behind the sticky bar.
      setOverHero(window.scrollY < window.innerHeight * 0.72);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [showingResult]);

  return (
    <div className="min-h-screen">
      <Nav
        active="/"
        tone={showingResult || !overHero ? "solid" : "hero"}
      />

      {!showingResult ? (
        <>
          {/* Pull hero under the sticky nav so the photo shows through the bar. */}
          <section className="relative isolate -mt-[4.25rem] min-h-[100svh] overflow-hidden pt-[4.25rem]">
            <div
              className="absolute inset-0 animate-drift bg-cover bg-center"
              style={{ backgroundImage: "url(/cork-hero.jpg)" }}
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/25"
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-20 mix-blend-soft-light"
              style={{
                backgroundImage:
                  "linear-gradient(115deg, transparent 40%, rgba(15,118,110,0.4) 100%)",
              }}
              aria-hidden
            />

            <div className="relative mx-auto flex min-h-[calc(100svh-4.25rem)] max-w-6xl flex-col justify-end px-4 pb-10 pt-8 sm:px-6 sm:pb-14">
              <p
                className="animate-hero-in font-display text-5xl leading-[0.9] font-extrabold tracking-tight text-white sm:text-7xl md:text-8xl"
                style={{ animationDelay: "80ms" }}
              >
                Veto
              </p>
              <h1
                className="mt-2 max-w-xl animate-hero-in font-display text-xl leading-tight font-semibold tracking-tight text-white sm:mt-3 sm:text-3xl"
                style={{ animationDelay: "180ms" }}
              >
                Before the deposit.
              </h1>
              <p
                className="mt-2 max-w-md animate-hero-in text-sm leading-snug text-white/80 sm:mt-3 sm:text-base"
                style={{ animationDelay: "280ms" }}
              >
                Scan a Cork student listing. See if you should walk, negotiate,
                or go ahead.
              </p>
              <div
                className="mt-5 flex animate-hero-in flex-wrap items-center gap-3"
                style={{ animationDelay: "380ms" }}
              >
                <a href="#scan" className="btn-primary py-2.5">
                  Scan a listing
                </a>
                <a
                  href="/lease"
                  className="rounded-sm border border-white/40 px-4 py-2.5 text-sm tracking-wide text-white transition hover:bg-white/10"
                >
                  Check a lease
                </a>
              </div>
            </div>
          </section>

          <main id="scan" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="mb-8">
              <h2 className="section-title">Scan a listing</h2>
              <p className="mt-2 max-w-xl text-ink/65">
                Paste a Daft, MyHome, or Rent.ie ad. We flag risk, rent, and what
                to do next.
              </p>
            </div>
            <ListingForm
              onResult={(next, input) => {
                setResult(next);
                setListing(input);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </main>
        </>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <VetoResultPanel
            result={result!}
            listing={listing!}
            onReset={() => {
              setResult(null);
              setListing(null);
            }}
            onUpdate={(next, nextListing) => {
              setResult(next);
              setListing(nextListing);
            }}
          />
        </main>
      )}
    </div>
  );
}
