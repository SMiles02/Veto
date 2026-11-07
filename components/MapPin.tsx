"use client";

import type { AreaIntel, NearbyComp } from "@/lib/veto/types";
import { ComponentType, useEffect, useState } from "react";

type MapProps = {
  area: AreaIntel;
  comps: NearbyComp[];
  listingRent: number;
};

export function MapPin({ area, comps, listingRent }: MapProps) {
  const [MapView, setMapView] = useState<ComponentType<MapProps> | null>(null);

  useEffect(() => {
    let mounted = true;
    import("./MapPinInner").then((mod) => {
      if (mounted) setMapView(() => mod.MapPinInner);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!MapView) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-ink/10 bg-ink/5 text-sm text-mute">
        Loading map...
      </div>
    );
  }

  return <MapView area={area} comps={comps} listingRent={listingRent} />;
}
