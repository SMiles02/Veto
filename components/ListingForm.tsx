"use client";

import demoListings from "@/data/demoListings.json";
import type { ListingInput, VetoResult } from "@/lib/veto/types";
import { FormEvent, useState } from "react";

const empty: ListingInput = {
  title: "",
  address: "",
  area: "",
  rent: 0,
  beds: 1,
  description: "",
  contact: "",
  url: "",
  paymentBeforeViewing: false,
};

export function ListingForm({
  onResult,
}: {
  onResult: (result: VetoResult, listing: ListingInput) => void;
}) {
  const [form, setForm] = useState<ListingInput>(empty);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importNote, setImportNote] = useState<string | null>(null);

  function loadDemo(id: string) {
    const demo = demoListings.find((d) => d.id === id);
    if (!demo) return;
    setForm({
      title: demo.title,
      address: demo.address,
      area: demo.area,
      rent: demo.rent,
      beds: demo.beds,
      description: demo.description,
      contact: demo.contact,
      url: demo.url,
      lat: demo.lat,
      lng: demo.lng,
      rtbClaimed: demo.rtbClaimed,
      paymentBeforeViewing: demo.paymentBeforeViewing,
    });
    setError(null);
    setImportNote(null);
  }

  function applyImport(listing: Partial<ListingInput>, warnings: string[]) {
    setForm((prev) => ({
      ...prev,
      ...listing,
      title: listing.title ?? prev.title,
      address: listing.address ?? prev.address,
      area: listing.area ?? prev.area,
      rent: listing.rent ?? prev.rent,
      beds: listing.beds ?? prev.beds,
      description: listing.description ?? prev.description,
      contact: listing.contact ?? prev.contact,
      url: listing.url ?? prev.url,
      lat: listing.lat ?? prev.lat,
      lng: listing.lng ?? prev.lng,
      rtbClaimed: listing.rtbClaimed ?? prev.rtbClaimed,
      paymentBeforeViewing:
        listing.paymentBeforeViewing ?? prev.paymentBeforeViewing,
    }));

    const needsPaste =
      warnings.some((w) => /blocked|paste/i.test(w)) || !listing.rent;
    if (needsPaste) setShowPaste(true);

    setImportNote(
      warnings.length
        ? warnings[0]
        : "Fields filled. Check them, then run Veto."
    );
  }

  async function autofill() {
    if (!form.url?.trim() && !pasteText.trim()) {
      setError("Add a Daft/MyHome/Rent.ie URL or paste listing text first");
      return;
    }
    setImporting(true);
    setError(null);
    setImportNote(null);
    try {
      const res = await fetch("/api/listing/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url?.trim() || undefined,
          text: pasteText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Autofill failed");
      applyImport(data.listing || {}, data.warnings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autofill failed");
    } finally {
      setImporting(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/veto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      onResult(data as VetoResult, form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm">
        <span className="text-mute">Try a sample</span>
        {demoListings.map((demo) => (
          <button
            key={demo.id}
            type="button"
            onClick={() => loadDemo(demo.id)}
            className="text-ink underline decoration-ink/25 underline-offset-4 transition hover:decoration-tide"
          >
            {demo.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 border-l-2 border-tide/40 pl-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
            Listing URL
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="field"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://www.daft.ie/share/..."
            />
            <button
              type="button"
              onClick={autofill}
              disabled={importing}
              className="btn-ink shrink-0 py-2.5"
            >
              {importing ? "Filling..." : "Autofill"}
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={() => setShowPaste((v) => !v)}
          className="text-xs text-ink/55 underline underline-offset-2 hover:text-ink"
        >
          {showPaste
            ? "Hide paste box"
            : "Daft blocked the fetch? Paste listing text"}
        </button>

        {showPaste && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
              Paste listing text
            </span>
            <textarea
              rows={5}
              className="field resize-y text-xs"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Copy title, price, and description from Daft and paste here, then Autofill again..."
            />
          </label>
        )}

        {importNote && (
          <p className="text-xs leading-relaxed text-tide">{importNote}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
            Listing title
          </span>
          <input
            className="field"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Double room near UCC"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
            Address
          </span>
          <input
            required
            className="field"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="18 College Road, Cork"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
            Area
          </span>
          <input
            className="field"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            placeholder="College Road"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
            Monthly rent (EUR)
          </span>
          <input
            required
            type="number"
            min={1}
            className="field"
            value={form.rent || ""}
            onChange={(e) =>
              setForm({ ...form, rent: Number(e.target.value) || 0 })
            }
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
            Beds / rooms
          </span>
          <input
            type="number"
            min={1}
            className="field"
            value={form.beds}
            onChange={(e) =>
              setForm({ ...form, beds: Number(e.target.value) || 1 })
            }
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
            Contact channel
          </span>
          <input
            className="field"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="phone + email"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.14em] text-mute uppercase">
            Listing description
          </span>
          <textarea
            required
            rows={5}
            className="field resize-y"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Paste the ad text here..."
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-5 text-sm text-ink/75">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-tide"
            checked={!!form.paymentBeforeViewing}
            onChange={(e) =>
              setForm({ ...form, paymentBeforeViewing: e.target.checked })
            }
          />
          Asks for payment before viewing
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-tide"
            checked={form.rtbClaimed === true}
            onChange={(e) =>
              setForm({
                ...form,
                rtbClaimed: e.target.checked ? true : undefined,
              })
            }
          />
          Claims RTB registration
        </label>
      </div>

      {error && <p className="text-sm text-veto">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Scanning..." : "Run Veto"}
      </button>
    </form>
  );
}
