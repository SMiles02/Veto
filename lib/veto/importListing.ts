import type { ListingInput } from "./types";

export type ImportResult = {
  listing: Partial<ListingInput>;
  source: "daft-url" | "html" | "paste" | "mixed";
  warnings: string[];
  fetched: boolean;
};

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  "college road": { lat: 51.8925, lng: -8.4912 },
  "western road": { lat: 51.8952, lng: -8.4985 },
  "sunday's well": { lat: 51.9012, lng: -8.505 },
  "sundays well": { lat: 51.9012, lng: -8.505 },
  glasheen: { lat: 51.8905, lng: -8.508 },
  gillabbey: { lat: 51.8938, lng: -8.4865 },
  blackpool: { lat: 51.9115, lng: -8.47 },
  ballincollig: { lat: 51.889, lng: -8.588 },
  "city centre": { lat: 51.898, lng: -8.475 },
  magazine: { lat: 51.891, lng: -8.505 },
  wilton: { lat: 51.882, lng: -8.51 },
  bishopstown: { lat: 51.886, lng: -8.54 },
};

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => {
      if (["co", "ucc", "cuh", "mtu"].includes(w.toLowerCase())) {
        return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ")
    .replace(/\bCo Cork\b/i, "Co. Cork")
    .replace(/\bCork City Centre\b/i, "Cork City Centre");
}

function guessArea(text: string): string | undefined {
  const lower = text.toLowerCase();
  const keys = [
    "college road",
    "western road",
    "sunday's well",
    "sundays well",
    "glasheen",
    "gillabbey",
    "blackpool",
    "ballincollig",
    "city centre",
    "magazine",
    "wilton",
    "bishopstown",
  ];
  return keys.find((k) => lower.includes(k));
}

function attachCoords(partial: Partial<ListingInput>): Partial<ListingInput> {
  const areaKey = guessArea(`${partial.area ?? ""} ${partial.address ?? ""}`);
  if (!areaKey || !AREA_COORDS[areaKey]) return partial;
  return {
    ...partial,
    area: partial.area || titleCaseSlug(areaKey.replace(/\s+/g, "-")),
    lat: AREA_COORDS[areaKey].lat,
    lng: AREA_COORDS[areaKey].lng,
  };
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function metaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]).trim();
  }
  return undefined;
}

function extractJsonLd(html: string): Array<Record<string, unknown>> {
  const blocks = Array.from(
    html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  );
  const out: Array<Record<string, unknown>> = [];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1]);
      if (Array.isArray(parsed)) out.push(...parsed);
      else if (parsed && typeof parsed === "object") out.push(parsed);
    } catch {
      // ignore bad json-ld
    }
  }
  return out;
}

export function parseRent(text: string): {
  rent?: number;
  period?: "month" | "week";
} {
  const cleaned = text.replace(/,/g, " ");
  const month = cleaned.match(
    /€\s*(\d[\d\s]*)\s*(?:per\s*)?(?:month|pcm|\/mo|monthly)/i
  );
  if (month) {
    return {
      rent: Number(month[1].replace(/\s/g, "")),
      period: "month",
    };
  }
  const week = cleaned.match(
    /€\s*(\d[\d\s]*)\s*(?:per\s*)?(?:week|pw|\/wk|weekly)/i
  );
  if (week) {
    const weekly = Number(week[1].replace(/\s/g, ""));
    return {
      rent: Math.round((weekly * 52) / 12),
      period: "week",
    };
  }
  const bare = cleaned.match(/€\s*(\d[\d\s]{2,})/);
  if (bare) {
    return { rent: Number(bare[1].replace(/\s/g, "")), period: "month" };
  }
  return {};
}

export function parseBeds(text: string): number | undefined {
  const double = /\bdouble room\b/i.test(text);
  const single = /\bsingle room\b/i.test(text);
  if (double || single) return 1;
  const bedMatch = text.match(/(\d+)\s*(?:bed|bedroom|beds|bedrooms)\b/i);
  if (bedMatch) return Number(bedMatch[1]);
  const rooms = text.match(/bedrooms available:\s*(\d+)/i);
  if (rooms) return Number(rooms[1]);
  return undefined;
}

export function parseDaftUrl(url: string): Partial<ListingInput> {
  try {
    const parsed = new URL(url);
    if (!/daft\.ie$/i.test(parsed.hostname.replace(/^www\./, ""))) return {};
    const parts = parsed.pathname.split("/").filter(Boolean);
    // /share/slug/id or /property-for-rent/slug/id
    const slugIdx = parts.findIndex((p) =>
      ["share", "property-for-rent", "sharing", "rental"].includes(p)
    );
    const slug =
      slugIdx >= 0 && parts[slugIdx + 1] && !/^\d+$/.test(parts[slugIdx + 1])
        ? parts[slugIdx + 1]
        : parts.find((p) => p.includes("-") && !/^\d+$/.test(p));
    if (!slug) return { url };
    const address = titleCaseSlug(slug)
      .replace(/\s+Cork City Centre/i, ", Cork City Centre")
      .replace(/\s+Co\. Cork/i, ", Co. Cork")
      .replace(/\s+Cork(?=,|$)/i, ", Cork")
      .replace(/,\s*,/g, ",")
      .replace(/^,\s*/, "");
    const area = guessArea(address);
    return attachCoords({
      url,
      title: address,
      address,
      area: area ? titleCaseSlug(area.replace(/\s+/g, "-")) : undefined,
      contact: "via Daft.ie",
      beds: 1,
    });
  } catch {
    return { url };
  }
}

export function parseListingText(text: string): Partial<ListingInput> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const { rent, period } = parseRent(text);
  const beds = parseBeds(text) ?? 1;

  let title = lines[0] ?? "";
  if (/^€/.test(title) && lines[1]) title = lines[1];

  const descIdx = lines.findIndex((l) =>
    /about |description|private room|available|furnished/i.test(l)
  );
  const description =
    descIdx >= 0
      ? lines.slice(descIdx).join("\n")
      : lines.slice(0, 12).join("\n");

  const addressLine =
    lines.find((l) => /cork|dublin|galway|limerick|road|street|avenue/i.test(l)) ??
    title;

  const paymentBeforeViewing =
    /deposit.*(before|prior).*(view|seeing)|pay.*(before|prior).*view|wire.*(today|now)|first to pay/i.test(
      text
    );
  const rtbClaimed = /\brtb\b/i.test(text) ? true : undefined;

  return attachCoords({
    title: title.slice(0, 140),
    address: addressLine.slice(0, 160),
    area: guessArea(`${addressLine} ${text}`)
      ? titleCaseSlug((guessArea(`${addressLine} ${text}`) || "").replace(/\s+/g, "-"))
      : undefined,
    rent,
    beds,
    description:
      period === "week" && rent
        ? `${description}\n\n(Converted from weekly rent to ~€${rent}/mo)`
        : description,
    paymentBeforeViewing,
    rtbClaimed,
    contact: /whatsapp|messenger/i.test(text)
      ? "WhatsApp / Messenger"
      : /email only/i.test(text)
        ? "email"
        : undefined,
  });
}

export function parseHtmlListing(
  html: string,
  url: string
): Partial<ListingInput> {
  if (/Security Check|Just a moment|cf-challenge/i.test(html)) {
    return {};
  }

  const ogTitle = metaContent(html, "og:title");
  const ogDesc = metaContent(html, "og:description");
  const titleTag = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
  const title = decodeHtml(ogTitle || titleTag || "").replace(/\s+/g, " ").trim();

  const jsonLd = extractJsonLd(html);
  let rent: number | undefined;
  let description = ogDesc ? decodeHtml(ogDesc) : undefined;
  let address: string | undefined;

  for (const node of jsonLd) {
    const offers = node.offers as Record<string, unknown> | undefined;
    const price = Number(offers?.price ?? node.price);
    if (!Number.isNaN(price) && price > 0) rent = price;
    if (typeof node.description === "string" && node.description.length > 40) {
      description = node.description;
    }
    const addr = node.address as Record<string, unknown> | string | undefined;
    if (typeof addr === "string") address = addr;
    else if (addr && typeof addr === "object") {
      address = [addr.streetAddress, addr.addressLocality, addr.addressRegion]
        .filter(Boolean)
        .join(", ");
    }
  }

  const blob = `${title}\n${description ?? ""}\n${html.slice(0, 20000)}`;
  if (!rent) rent = parseRent(blob).rent;
  const beds = parseBeds(blob) ?? 1;

  return attachCoords({
    url,
    title: title || undefined,
    address: address || title || undefined,
    area: guessArea(`${address ?? ""} ${title}`)
      ? titleCaseSlug(
          (guessArea(`${address ?? ""} ${title}`) || "").replace(/\s+/g, "-")
        )
      : undefined,
    rent,
    beds,
    description: description?.slice(0, 4000),
    contact: /daft\.ie/i.test(url)
      ? "via Daft.ie"
      : /myhome\.ie/i.test(url)
        ? "via MyHome.ie"
        : /rent\.ie/i.test(url)
          ? "via Rent.ie"
          : undefined,
  });
}

function mergePartial(
  ...parts: Array<Partial<ListingInput>>
): Partial<ListingInput> {
  const out: Partial<ListingInput> = {};
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      if (value === undefined || value === null || value === "") continue;
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

export async function importListingFromUrl(url: string): Promise<ImportResult> {
  const warnings: string[] = [];
  let fetched = false;
  const fromUrl = /daft\.ie/i.test(url) ? parseDaftUrl(url) : { url };

  let fromHtml: Partial<ListingInput> = {};
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-IE,en;q=0.9",
      },
      redirect: "follow",
      next: { revalidate: 0 },
    });
    const html = await res.text();
    fetched = res.ok;
    if (!res.ok) {
      warnings.push(`Listing site returned ${res.status}`);
    } else if (/Security Check|Just a moment|cf-challenge/i.test(html)) {
      warnings.push(
        "Site blocked automated fetch (common on Daft). Address was filled from the URL - paste the listing text to complete rent and description."
      );
    } else {
      fromHtml = parseHtmlListing(html, url);
      if (!fromHtml.rent && !fromHtml.description) {
        warnings.push(
          "Fetched the page but found little structured data. Paste the ad text to improve autofill."
        );
      }
    }
  } catch {
    warnings.push(
      "Could not fetch the URL. Filled what we could from the link - paste listing text for rent and description."
    );
  }

  const listing = mergePartial({ url }, fromUrl, fromHtml);
  const source =
    fromHtml.rent || fromHtml.description
      ? fromUrl.address
        ? "mixed"
        : "html"
      : /daft\.ie/i.test(url)
        ? "daft-url"
        : "html";

  if (!listing.rent) {
    warnings.push("Rent not found yet - paste the price section or enter it manually.");
  }

  return { listing, source, warnings, fetched };
}

export function importListingFromPaste(
  text: string,
  url?: string
): ImportResult {
  const fromPaste = parseListingText(text);
  const fromUrl = url && /daft\.ie/i.test(url) ? parseDaftUrl(url) : { url };
  return {
    listing: mergePartial(fromUrl, fromPaste, url ? { url } : {}),
    source: "paste",
    warnings: [],
    fetched: false,
  };
}
