import type { ScoreReason } from "@/lib/veto/types";

const severityDot: Record<ScoreReason["severity"], string> = {
  high: "bg-veto",
  medium: "bg-negotiate",
  low: "bg-clear",
};

export function ReasonList({ reasons }: { reasons: ScoreReason[] }) {
  return (
    <ul className="space-y-3">
      {reasons.map((reason, index) => (
        <li
          key={reason.id}
          className="animate-rise rounded-lg border border-ink/10 bg-white/70 p-4"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${severityDot[reason.severity]}`}
            />
            <p className="font-medium text-ink">{reason.label}</p>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-mute">
              {reason.category}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink/70">{reason.detail}</p>
        </li>
      ))}
    </ul>
  );
}
