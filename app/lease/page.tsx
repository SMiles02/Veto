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
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-veto">LeaseLens</p>
          <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            Catch the clause before it catches you
          </h1>
          <p className="mt-3 text-ink/70">
            Upload a lease PDF or paste the text. Veto flags unfair Irish student
            tenancy traps and drafts a reply.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-xl border border-ink/10 bg-white/70 p-5 sm:p-6"
          >
            <button
              type="button"
              onClick={() => {
                setText(DEMO_LEASE);
                setFile(null);
                setAnalysis(null);
              }}
              className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink/80 hover:border-ink/40"
            >
              Load demo lease
            </button>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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
              <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold tracking-wide text-paper disabled:opacity-60"
            >
              {loading ? "Reading..." : "Find clause traps"}
            </button>
          </form>

          <section className="space-y-4">
            {!analysis ? (
              <div className="rounded-xl border border-dashed border-ink/15 bg-white/40 p-8 text-sm text-mute">
                Results show up here: deposits, entry rights, overseas accounts, RTB
                dodges.
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-wider text-mute">
                    Analysis · {analysis.source}
                  </p>
                  <p className="mt-1 text-ink">{analysis.summary}</p>
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
