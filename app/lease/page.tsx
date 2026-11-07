"use client";

import { ClauseCard } from "@/components/ClauseCard";
import { Nav } from "@/components/Nav";
import { PageMasthead } from "@/components/PageMasthead";
import { DEMO_LEASE } from "@/data/demoLease";
import type { LeaseAnalysis } from "@/lib/veto/types";
import { FormEvent, useState } from "react";

export default function LeasePage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LeaseAnalysis | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("text", text);
      if (file) form.set("file", file);
      const res = await fetch("/api/lease", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data as LeaseAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#e4ebe7]">
      <Nav active="/lease" />
      <PageMasthead
        brand="LeaseLens"
        headline="Find the traps in the lease"
        blurb="Paste a lease or upload a PDF. We highlight unfair clauses and draft a short reply you can send."
        accent="tide"
      />

      <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute inset-x-0 -top-8 h-24 bg-gradient-to-b from-ink/5 to-transparent" />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <form
            onSubmit={onSubmit}
            className="space-y-5 border border-ink/10 bg-paper/95 p-5 shadow-[0_12px_40px_rgba(14,18,24,0.06)] sm:p-6"
          >
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-4">
              <p className="text-xs font-medium tracking-[0.16em] text-tide uppercase">
                Your lease
              </p>
              <button
                type="button"
                onClick={() => {
                  setText(DEMO_LEASE);
                  setFile(null);
                  setAnalysis(null);
                }}
                className="text-sm text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-tide"
              >
                Load demo lease
              </button>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
                Paste lease text
              </span>
              <textarea
                rows={14}
                className="field resize-y font-mono text-xs leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the agreement..."
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
                Or upload PDF / TXT
              </span>
              <input
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-ink/70"
              />
            </label>
            {error && <p className="text-sm text-veto">{error}</p>}
            <button type="submit" disabled={loading} className="btn-ink">
              {loading ? "Reading..." : "Find clause traps"}
            </button>
          </form>

          <section className="space-y-4 border border-ink/10 bg-paper/80 p-5 sm:p-6">
            <p className="text-xs font-medium tracking-[0.16em] text-mute uppercase">
              Findings
            </p>
            {!analysis ? (
              <div className="border-l-4 border-tide/50 bg-tide/5 px-4 py-5 text-sm text-ink/70">
                Results show up here. Things like deposits, entry rights,
                overseas accounts, and missing RTB.
              </div>
            ) : (
              <>
                <div className="border-b border-ink/10 pb-4">
                  <p className="text-xs font-medium tracking-[0.14em] text-tide uppercase">
                    Analysis · {analysis.source}
                    {analysis.llmFallbackReason
                      ? ` · ${analysis.llmFallbackReason}`
                      : ""}
                  </p>
                  <p className="mt-2 text-ink">{analysis.summary}</p>
                </div>
                <div className="space-y-3">
                  {analysis.clauses.map((clause, i) => (
                    <ClauseCard key={`${clause.quote}-${i}`} clause={clause} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
