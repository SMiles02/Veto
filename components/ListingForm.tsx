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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {demoListings.map((demo) => (
          <button
            key={demo.id}
            type="button"
            onClick={() => loadDemo(demo.id)}
            className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink/80 transition hover:border-ink/40 hover:text-ink"
          >
            {demo.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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
          <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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
          <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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
          <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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
          <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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
          <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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
          <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
            Listing URL (optional)
          </span>
          <input
            className="field"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-mute">
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

      <div className="flex flex-wrap gap-4 text-sm text-ink/80">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-veto px-6 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-veto/90 disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Scanning..." : "Run Veto"}
      </button>
    </form>
  );
}
