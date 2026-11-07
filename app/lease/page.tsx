"use client";

import { ClauseCard } from "@/components/ClauseCard";
import { Nav } from "@/components/Nav";
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
    <div className="min-h-screen">
      <Nav active="/lease" />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 max-w-2xl">
          <p className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
            LeaseLens
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Find the traps in the lease
          </h1>
          <p className="mt-3 max-w-lg text-ink/65">
            Paste a lease or upload a PDF. We highlight unfair clauses and draft
            a short reply you can send.
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-2">
          <form onSubmit={onSubmit} className="space-y-5">
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

          <section className="space-y-4">
            {!analysis ? (
              <p className="border-l-2 border-mist pl-4 text-sm text-mute">
                Results show up here. Things like deposits, entry rights,
                overseas accounts, and missing RTB.
              </p>
            ) : (
              <>
                <div className="border-b border-ink/10 pb-4">
                  <p className="text-xs font-medium tracking-[0.14em] text-mute uppercase">
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
