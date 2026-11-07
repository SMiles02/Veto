import { getAreaIntel } from "@/lib/veto/area";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const address = searchParams.get("address") ?? undefined;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const area = await getAreaIntel(lat, lng, address);
  return NextResponse.json(area ?? {});
}
