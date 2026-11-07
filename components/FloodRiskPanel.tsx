import type { FloodLevel, FloodRisk } from "@/lib/veto/types";

const LEVEL_COPY: Record<
  FloodLevel,
  { label: string; tone: string; bar: string }
> = {
  none: {
    label: "Clear at pin",
    tone: "text-clear",
    bar: "bg-clear",
  },
  low: {
    label: "Low context",
    tone: "text-tide",
    bar: "bg-tide",
  },
  residual: {
    label: "Residual / historical",
    tone: "text-negotiate",
    bar: "bg-negotiate",
  },
  moderate: {
    label: "Moderate",
    tone: "text-negotiate",
    bar: "bg-negotiate",
  },
  significant: {
    label: "Significant",
    tone: "text-veto",
    bar: "bg-veto",
  },
  high: {
    label: "High",
    tone: "text-veto",
    bar: "bg-veto",
  },
  unknown: {
    label: "Unavailable",
    tone: "text-mute",
    bar: "bg-mute",
  },
};

export function FloodRiskPanel({ flood }: { flood: FloodRisk }) {
  const meta = LEVEL_COPY[flood.level];
  const barWidth = Math.max(6, Math.min(100, flood.score || 8));

  return (
    <section className="animate-rise border-t border-ink/10 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium tracking-[0.2em] text-mute uppercase">
            Flood risk · OPW floodinfo.ie
          </p>
          <h2 className="section-title text-2xl">River & coastal check</h2>
        </div>
        <div className="text-right">
          <p className={`font-display text-2xl font-semibold ${meta.tone}`}>
            {meta.label}
          </p>
          <p className="text-xs text-mute">
            Indicative score {flood.score}/100
          </p>
        </div>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden bg-ink/10">
        <div
          className={`h-full ${meta.bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-ink/80">
        {flood.summary}
      </p>

      {(flood.level === "high" || flood.level === "significant") && (
        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="mb-2 text-[11px] tracking-[0.14em] text-mute uppercase">
            Before you sign
          </p>
          <ul className="space-y-2 text-sm text-ink/80">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-veto" />
              <span>
                Confirm which floor the room is on. Ground floor and basements
                take floodwater first.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-veto" />
              <span>
                Ask what contents insurance covers, and whether the landlord has
                flood cover on the building.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-veto" />
              <span>
                Ask the landlord (and neighbours if you can) whether this
                address has flooded before, and what happened.
              </span>
            </li>
          </ul>
        </div>
      )}

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] tracking-[0.14em] text-mute uppercase">
            Modelled extents at pin
          </p>
          {flood.fluvial.length === 0 && flood.coastal.length === 0 ? (
            <p className="text-sm text-ink/65">None hit for this coordinate.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {flood.fluvial.map((h) => (
                <li key={`f-${h.returnYears}`} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-tide" />
                  <span>
                    River · {h.aepLabel}
                    <span className="text-mute">
                      {" "}
                      (~1 in {h.returnYears} years)
                    </span>
                  </span>
                </li>
              ))}
              {flood.coastal.map((h) => (
                <li key={`c-${h.returnYears}`} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-negotiate" />
                  <span>
                    Coastal · {h.aepLabel}
                    <span className="text-mute">
                      {" "}
                      (~1 in {h.returnYears} years)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-[11px] tracking-[0.14em] text-mute uppercase">
            Recorded events within 500m
          </p>
          {flood.pastEvents.length === 0 ? (
            <p className="text-sm text-ink/65">None in the OPW archive nearby.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {flood.pastEvents.slice(0, 3).map((ev) => (
                <li key={`${ev.name}-${ev.distanceM}`} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-ink/40" />
                  <span>
                    {ev.name}
                    <span className="text-mute">
                      {" "}
                      · ~{ev.distanceM}m
                      {ev.date ? ` · ${ev.date}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {flood.details.length > 0 && (
        <ul className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-xs leading-relaxed text-mute">
          {flood.details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-sm">
        <a
          href={flood.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-tide underline-offset-4 hover:underline"
        >
          Open official floodinfo.ie map
        </a>
        <span className="text-mute">
          {" "}
          · CFRAM extents, not a building survey
        </span>
      </p>
    </section>
  );
}
