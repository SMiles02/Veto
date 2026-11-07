import type { ScoreReason } from "@/lib/veto/types";

const severityMark: Record<ScoreReason["severity"], string> = {
  high: "bg-veto",
  medium: "bg-negotiate",
  low: "bg-tide",
};

export function ReasonList({ reasons }: { reasons: ScoreReason[] }) {
  return (
    <ul className="divide-y divide-ink/10 border-y border-ink/10">
      {reasons.map((reason, index) => (
        <li
          key={reason.id}
          className="animate-rise py-4"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 ${severityMark[reason.severity]}`}
            />
            <p className="font-medium text-ink">{reason.label}</p>
            <span className="ml-auto text-[10px] tracking-[0.14em] text-mute uppercase">
              {reason.category}
            </span>
          </div>
          <p className="pl-4 text-sm leading-relaxed text-ink/65">
            {reason.detail}
          </p>
        </li>
      ))}
    </ul>
  );
}
