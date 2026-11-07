"use client";

import type { AreaIntel } from "@/lib/veto/types";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function MapPinInner({ area }: { area: AreaIntel }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10">
      <MapContainer
        center={[area.lat, area.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-56 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[area.lat, area.lng]} icon={icon}>
          <Popup>
            {area.neighbourhood}
            <br />
            {area.commuteMinutesToUcc} min to UCC
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
