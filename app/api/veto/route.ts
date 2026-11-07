import { getAreaIntel } from "@/lib/veto/area";
import { scoreListing } from "@/lib/veto/score";
import type { ListingInput } from "@/lib/veto/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ListingInput;
    if (!body?.address || !body?.rent || !body?.description) {
      return NextResponse.json(
        { error: "address, rent, and description are required" },
        { status: 400 }
      );
    }

    const listing: ListingInput = {
      ...body,
      rent: Number(body.rent),
      beds: Number(body.beds || 1),
    };

    const area = await getAreaIntel(listing.lat, listing.lng, listing.address);
    const result = scoreListing(listing, area);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to score listing" }, { status: 500 });
  }
}
