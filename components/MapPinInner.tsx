"use client";

import type { AreaIntel, NearbyComp } from "@/lib/veto/types";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  WMSTileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/** OPW CFRAM 1% fluvial + 0.5% coastal extents for map context. */
const FLOOD_OVERLAY =
  "esds_floodmaps:ext_f_c_0100,esds_floodmaps:ext_c_c_0200";

const listingIcon = L.divIcon({
  className: "",
  html: `<div style="
    background:#d7263d;
    color:#fff;
    font:700 11px/1 system-ui,sans-serif;
    padding:6px 8px;
    border-radius:6px;
    border:2px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,.25);
    white-space:nowrap;
  ">This listing</div>`,
  iconSize: [84, 28],
  iconAnchor: [42, 28],
});

function rentIcon(rent: number, listingRent: number) {
  const cheaper = rent < listingRent * 0.95;
  const dearer = rent > listingRent * 1.05;
  const bg = cheaper ? "#1f7a4c" : dearer ? "#e5a100" : "#0a0a0a";
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${bg};
      color:#fff;
      font:700 11px/1 system-ui,sans-serif;
      padding:5px 7px;
      border-radius:999px;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.2);
      white-space:nowrap;
    ">€${rent}</div>`,
    iconSize: [52, 24],
    iconAnchor: [26, 24],
  });
}

function FitBounds({
  area,
  comps,
}: {
  area: AreaIntel;
  comps: NearbyComp[];
}) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [
      [area.lat, area.lng],
      ...comps.map((c) => [c.lat, c.lng] as [number, number]),
    ];
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(points, { padding: [28, 28], maxZoom: 15 });
  }, [area.lat, area.lng, comps, map]);
  return null;
}

export function MapPinInner({
  area,
  comps,
  listingRent,
}: {
  area: AreaIntel;
  comps: NearbyComp[];
  listingRent: number;
}) {
  const showFloodDefault =
    area.flood != null &&
    area.flood.level !== "none" &&
    area.flood.level !== "unknown" &&
    area.flood.level !== "low";
  const [showFlood, setShowFlood] = useState(showFloodDefault);

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10">
      <MapContainer
        center={[area.lat, area.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-64 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showFlood && (
          <WMSTileLayer
            url="https://www.floodinfo.ie/geoserver/wms"
            layers={FLOOD_OVERLAY}
            format="image/png"
            transparent
            opacity={0.55}
            version="1.1.1"
            attribution='Flood extents &copy; <a href="https://www.floodinfo.ie">OPW</a>'
          />
        )}
        <FitBounds area={area} comps={comps} />
        <Marker position={[area.lat, area.lng]} icon={listingIcon}>
          <Popup>
            <strong>This listing</strong>
            <br />
            Asking €{listingRent}/mo
            <br />
            {area.neighbourhood} · {area.commuteMinutesToUcc} min to UCC
            {area.flood ? (
              <>
                <br />
                Flood: {area.flood.level}
              </>
            ) : null}
          </Popup>
        </Marker>
        {comps.map((comp) => (
          <Marker
            key={comp.id}
            position={[comp.lat, comp.lng]}
            icon={rentIcon(comp.rent, listingRent)}
          >
            <Popup>
              <strong>€{comp.rent}/mo</strong>
              <br />
              {comp.address}
              <br />
              {comp.area} · ~{comp.distanceM}m away
              <br />
              Source: {comp.source}
              {comp.listedAs ? ` (${comp.listedAs})` : ""}
              {comp.sourceUrl ? (
                <>
                  <br />
                  <a href={comp.sourceUrl} target="_blank" rel="noreferrer">
                    Open listing
                  </a>
                </>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 bg-paper/90 px-3 py-2 text-[11px] text-ink/70">
        <span>
          <span className="mr-1 inline-block h-2 w-2 bg-veto" />
          This listing
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 bg-clear" />
          Cheaper comps
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 bg-negotiate" />
          Dearer comps
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 bg-ink" />
          Similar
        </span>
        {area.flood && (
          <button
            type="button"
            onClick={() => setShowFlood((v) => !v)}
            className={`ml-auto rounded-sm border px-2 py-0.5 transition ${
              showFlood
                ? "border-tide/40 bg-tide/10 text-tide"
                : "border-ink/15 text-mute hover:border-ink/30"
            }`}
          >
            {showFlood ? "Flood overlay on" : "Flood overlay"}
          </button>
        )}
      </div>
    </div>
  );
}
