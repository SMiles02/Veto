import {
  importListingFromPaste,
  importListingFromUrl,
} from "@/lib/veto/importListing";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!url && !text) {
      return NextResponse.json(
        { error: "Provide a listing URL and/or pasted listing text" },
        { status: 400 }
      );
    }

    if (url) {
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
    }

    if (text && text.length >= 40) {
      const pasted = importListingFromPaste(text, url || undefined);
      // If URL also given, try fetch to enrich missing fields
      if (url) {
        const fetched = await importListingFromUrl(url);
        const listing = {
          ...fetched.listing,
          ...Object.fromEntries(
            Object.entries(pasted.listing).filter(
              ([, v]) => v !== undefined && v !== "" && v !== 0
            )
          ),
          url,
        };
        const warnings = [...fetched.warnings, ...pasted.warnings].filter(
          (w) => !(listing.rent && /Rent not found/i.test(w))
        );
        return NextResponse.json({
          listing,
          source: "mixed",
          warnings,
          fetched: fetched.fetched,
        });
      }
      return NextResponse.json(pasted);
    }

    const result = await importListingFromUrl(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
