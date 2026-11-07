import type { VetoDecision } from "@/lib/veto/types";

const styles: Record<
  VetoDecision,
  { ring: string; text: string; bg: string; shadow: string }
> = {
  WALK_AWAY: {
    ring: "border-veto",
    text: "text-veto",
    bg: "bg-veto/10",
    shadow: "shadow-[0_10px_0_rgba(185,28,28,0.18)]",
  },
  NEGOTIATE: {
    ring: "border-negotiate",
    text: "text-negotiate",
    bg: "bg-negotiate/15",
    shadow: "shadow-[0_10px_0_rgba(194,65,12,0.18)]",
  },
  PROCEED: {
    ring: "border-clear",
    text: "text-clear",
    bg: "bg-clear/10",
    shadow: "shadow-[0_10px_0_rgba(4,120,87,0.18)]",
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
      key={`${decision}-${stampLabel}`}
      className={`score-stamp inline-flex origin-center items-center justify-center border-[5px] ${style.ring} ${style.bg} ${style.shadow} px-10 py-6 sm:px-12 sm:py-7`}
      aria-label={`Decision ${stampLabel}`}
    >
      <span
        className={`font-display text-5xl font-extrabold tracking-[0.12em] uppercase sm:text-6xl ${style.text}`}
      >
        {stampLabel}
      </span>
    </div>
  );
}
