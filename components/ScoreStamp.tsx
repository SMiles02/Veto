import type { VetoDecision } from "@/lib/veto/types";

const styles: Record<
  VetoDecision,
  { ring: string; text: string; bg: string }
> = {
  WALK_AWAY: {
    ring: "border-veto",
    text: "text-veto",
    bg: "bg-veto/5",
  },
  NEGOTIATE: {
    ring: "border-negotiate",
    text: "text-negotiate",
    bg: "bg-negotiate/10",
  },
  PROCEED: {
    ring: "border-clear",
    text: "text-clear",
    bg: "bg-clear/5",
  },
};

export function ScoreStamp({
  decision,
  stampLabel,
}: {
  decision: VetoDecision;
  stampLabel: string;
}) {
  const style = styles[decision];
  return (
    <div
      className={`inline-flex animate-stamp items-center justify-center rounded-sm border-4 ${style.ring} ${style.bg} px-6 py-3`}
      aria-label={`Decision ${stampLabel}`}
    >
      <span
        className={`font-display text-4xl font-bold tracking-wide sm:text-5xl ${style.text}`}
      >
        {stampLabel}
      </span>
    </div>
  );
}
