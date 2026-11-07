"use client";

import type { AreaIntel } from "@/lib/veto/types";
import { ComponentType, useEffect, useState } from "react";

export function MapPin({ area }: { area: AreaIntel }) {
  const [MapView, setMapView] = useState<ComponentType<{
    area: AreaIntel;
  }> | null>(null);

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
      <div className="flex h-56 items-center justify-center rounded-lg border border-ink/10 bg-ink/5 text-sm text-mute">
        Loading map...
      </div>
    );
  }

  return <MapView area={area} />;
}
