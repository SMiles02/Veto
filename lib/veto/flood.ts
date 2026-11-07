import type { FloodPastEvent, FloodRisk } from "./types";

const WMS_BASE = "https://www.floodinfo.ie/geoserver/wms";
const WFS_BASE = "https://www.floodinfo.ie/geoserver/ows";

/** OPW ESDS CFRAM modelled flood extent layers (current scenario). */
const FLUVIAL_LAYERS = [
  {
    id: "f10",
    layer: "esds_floodmaps:ext_f_c_0010",
    aepLabel: "10% AEP",
    returnYears: 10,
    source: "fluvial" as const,
  },
  {
    id: "f100",
    layer: "esds_floodmaps:ext_f_c_0100",
    aepLabel: "1% AEP",
    returnYears: 100,
    source: "fluvial" as const,
  },
  {
    id: "f1000",
    layer: "esds_floodmaps:ext_f_c_1000",
    aepLabel: "0.1% AEP",
    returnYears: 1000,
    source: "fluvial" as const,
  },
] as const;

const COASTAL_LAYERS = [
  {
    id: "c200",
    layer: "esds_floodmaps:ext_c_c_0200",
    aepLabel: "0.5% AEP",
    returnYears: 200,
    source: "coastal" as const,
  },
  {
    id: "c1000",
    layer: "esds_floodmaps:ext_c_c_1000",
    aepLabel: "0.1% AEP",
    returnYears: 1000,
    source: "coastal" as const,
  },
] as const;

const ALL_LAYERS = [...FLUVIAL_LAYERS, ...COASTAL_LAYERS];

const PAST_EVENT_RADIUS_M = 500;
const UA = "VetoCorkHousing/1.0 (hackathon; student flood check)";

type LayerHit = {
  id: string;
  layer: string;
  aepLabel: string;
  returnYears: number;
  source: "fluvial" | "coastal";
  projectName?: string;
};

function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function fetchPastEvents(
  lat: number,
  lng: number
): Promise<FloodPastEvent[]> {
  const rKm = PAST_EVENT_RADIUS_M / 1000 + 0.15;
  const dLat = rKm / 111;
  const dLng = rKm / (111 * Math.cos((lat * Math.PI) / 180));
  const bbox = `${lng - dLng},${lat - dLat},${lng + dLng},${lat + dLat},EPSG:4326`;

  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: "opw:past_flood_event_app_fhmfloods_point_view",
    outputFormat: "application/json",
    count: "40",
    srsName: "EPSG:4326",
    bbox,
  });

  try {
    const res = await fetch(`${WFS_BASE}?${params}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      features?: Array<{
        geometry?: { coordinates?: number[][] };
        properties?: {
          flood_name?: string;
          start_date?: string | null;
          flood_record_type?: string | null;
          severity_index?: number | null;
        };
      }>;
    };

    const events: FloodPastEvent[] = [];
    for (const feature of data.features ?? []) {
      const coords = feature.geometry?.coordinates?.[0];
      if (!coords || coords.length < 2) continue;
      const [elng, elat] = coords;
      const distanceM = Math.round(haversineM(lat, lng, elat, elng));
      if (distanceM > PAST_EVENT_RADIUS_M) continue;
      const p = feature.properties ?? {};
      events.push({
        name: p.flood_name || "Recorded flood event",
        date: p.start_date || undefined,
        distanceM,
        recordType: p.flood_record_type || undefined,
        severityIndex:
          typeof p.severity_index === "number" ? p.severity_index : undefined,
      });
    }

    events.sort((a, b) => a.distanceM - b.distanceM);
    return events.slice(0, 5);
  } catch {
    return [];
  }
}

function bandFromHits(
  hits: LayerHit[],
  pastEvents: FloodPastEvent[]
): {
  level: FloodRisk["level"];
  score: number;
  summary: string;
} {
  const fluvial = hits.filter((h) => h.source === "fluvial");
  const coastal = hits.filter((h) => h.source === "coastal");
  const rarestFluvial = fluvial.length
    ? Math.min(...fluvial.map((h) => h.returnYears))
    : null;
  const rarestCoastal = coastal.length
    ? Math.min(...coastal.map((h) => h.returnYears))
    : null;

  const nearPast = pastEvents.filter((e) => e.distanceM <= 300);
  const bothSources = fluvial.length > 0 && coastal.length > 0;

  // Most frequent modelled event at the pin drives the band.
  if (rarestFluvial === 10) {
    return {
      level: "high",
      score: bothSources ? 92 : 86,
      summary:
        "Pin sits inside a modelled river flood extent for a relatively frequent event (about 1 in 10 years). Ask hard questions about ground-floor risk and insurance before you sign.",
    };
  }

  if (rarestFluvial === 100 || rarestCoastal === 200) {
    const parts: string[] = [];
    if (rarestFluvial === 100) parts.push("1-in-100-year river flooding");
    if (rarestCoastal === 200) parts.push("1-in-200-year coastal flooding");
    return {
      level: "significant",
      score: bothSources ? 74 : 66,
      summary: `Pin sits inside a modelled extent for ${parts.join(" and ")}. Not every winter, but serious enough to check floor level, basements, and landlord insurance.`,
    };
  }

  if (rarestFluvial === 1000 || rarestCoastal === 1000) {
    return {
      level: "moderate",
      score: bothSources ? 48 : 42,
      summary:
        "Pin only appears in an extreme (about 1 in 1,000 years) modelled flood extent. Low day-to-day chance, but still worth a glance at floodinfo.ie before you commit.",
    };
  }

  if (nearPast.length > 0) {
    const closest = nearPast[0];
    return {
      level: "residual",
      score: 28,
      summary: `No current CFRAM modelled extent at this pin, but OPW has a recorded flood about ${closest.distanceM}m away (${closest.name}). Treat as residual / historical context, not a clean all-clear.`,
    };
  }

  if (pastEvents.length > 0) {
    return {
      level: "low",
      score: 14,
      summary: `No modelled flood extent at this pin. There are older OPW records within ${PAST_EVENT_RADIUS_M}m, so keep an eye on local knowledge, but the modelled maps do not flag the building footprint.`,
    };
  }

  return {
    level: "none",
    score: 6,
    summary:
      "No OPW CFRAM modelled river or coastal flood extent at this pin, and no recorded flood events within 500m. Still check floodinfo.ie yourself; models miss some surface-water and drain failures.",
  };
}

function detailLines(
  hits: LayerHit[],
  pastEvents: FloodPastEvent[],
  level: FloodRisk["level"]
): string[] {
  const lines: string[] = [];

  const fluvial = hits.filter((h) => h.source === "fluvial");
  const coastal = hits.filter((h) => h.source === "coastal");

  if (fluvial.length) {
    lines.push(
      `River (fluvial) extents hit: ${fluvial.map((h) => h.aepLabel).join(", ")}.`
    );
  }
  if (coastal.length) {
    lines.push(
      `Coastal extents hit: ${coastal.map((h) => h.aepLabel).join(", ")}.`
    );
  }

  const project = hits.find((h) => h.projectName)?.projectName;
  if (project) {
    lines.push(`Source study: ${project}.`);
  }

  if (pastEvents.length) {
    const top = pastEvents[0];
    const when = top.date ? ` (${top.date})` : "";
    lines.push(
      `Closest recorded event: ${top.name}${when}, ~${top.distanceM}m away.`
    );
  }

  if (level === "high" || level === "significant") {
    lines.push(
      "Before you sign: confirm which floor the room is on (ground floor and basements take the hit first)."
    );
    lines.push(
      "Ask what contents insurance covers, and whether the landlord has cover for flood damage."
    );
    lines.push(
      "Ask the landlord (and neighbours if you can) whether this address has flooded before, and what happened."
    );
  }

  if (level === "none" || level === "low") {
    lines.push(
      "Surface water / blocked drains are not fully covered by these CFRAM extents."
    );
  }

  lines.push(
    "Indicative only. Not a site survey. Confirm on floodinfo.ie before you decide."
  );

  return lines;
}

export function floodinfoUrl(lat: number, lng: number): string {
  // Public map viewer; coordinates help the student land near the pin.
  return `https://www.floodinfo.ie/map/floodmaps/?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}`;
}

async function getFeatureInfoTracked(
  lat: number,
  lng: number,
  layer: string
): Promise<{ hit: boolean; projectName?: string; ok: boolean }> {
  const delta = 0.0008;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    LAYERS: layer,
    QUERY_LAYERS: layer,
    STYLES: "",
    SRS: "EPSG:4326",
    BBOX: bbox,
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    INFO_FORMAT: "application/json",
    FEATURE_COUNT: "3",
  });

  try {
    const res = await fetch(`${WMS_BASE}?${params}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { hit: false, ok: false };
    const data = (await res.json()) as {
      features?: Array<{ properties?: { proj_name?: string } }>;
    };
    const features = data.features ?? [];
    if (features.length === 0) return { hit: false, ok: true };
    return {
      hit: true,
      ok: true,
      projectName: features[0]?.properties?.proj_name || undefined,
    };
  } catch {
    return { hit: false, ok: false };
  }
}

export async function assessFloodRisk(
  lat: number,
  lng: number
): Promise<FloodRisk> {
  const [layerResults, pastEvents] = await Promise.all([
    Promise.all(
      ALL_LAYERS.map(async (def) => {
        const result = await getFeatureInfoTracked(lat, lng, def.layer);
        return { def, result };
      })
    ),
    fetchPastEvents(lat, lng),
  ]);

  const reachable = layerResults.some(({ result }) => result.ok);

  const hits: LayerHit[] = [];
  for (const { def, result } of layerResults) {
    if (!result.hit) continue;
    hits.push({
      id: def.id,
      layer: def.layer,
      aepLabel: def.aepLabel,
      returnYears: def.returnYears,
      source: def.source,
      projectName: result.projectName,
    });
  }

  if (!reachable && hits.length === 0) {
    return {
      level: "unknown",
      score: 0,
      summary:
        "Could not reach OPW floodinfo.ie for this scan. Open the official map yourself before you treat flood risk as clear.",
      details: [
        "Flood check uses OPW GeoServer GetFeatureInfo on CFRAM extents.",
        "Network or service issue for this request.",
      ],
      fluvial: [],
      coastal: [],
      pastEvents: [],
      source: "opw-floodinfo",
      checkedAt: new Date().toISOString(),
      mapUrl: floodinfoUrl(lat, lng),
      reachable: false,
    };
  }

  const { level, score, summary } = bandFromHits(hits, pastEvents);
  const fluvial = hits
    .filter((h) => h.source === "fluvial")
    .map((h) => ({
      aepLabel: h.aepLabel,
      returnYears: h.returnYears,
      layer: h.layer,
    }));
  const coastal = hits
    .filter((h) => h.source === "coastal")
    .map((h) => ({
      aepLabel: h.aepLabel,
      returnYears: h.returnYears,
      layer: h.layer,
    }));

  return {
    level,
    score,
    summary,
    details: detailLines(hits, pastEvents, level),
    fluvial,
    coastal,
    pastEvents,
    source: "opw-floodinfo",
    checkedAt: new Date().toISOString(),
    mapUrl: floodinfoUrl(lat, lng),
    reachable: true,
  };
}
