"use client";

import type { LeaseClause } from "@/lib/veto/types";
import { useState } from "react";

const severityStyles = {
  high: "border-l-veto",
  medium: "border-l-negotiate",
  low: "border-l-tide",
};

export function ClauseCard({ clause }: { clause: LeaseClause }) {
  const [copied, setCopied] = useState(false);

  async function copyReply() {
    await navigator.clipboard.writeText(clause.reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article
      className={`border-l-4 border-y border-r border-ink/10 bg-paper/80 p-4 ${severityStyles[clause.severity]}`}
    >
      <p className="mb-2 text-[10px] font-medium tracking-[0.16em] text-mute uppercase">
        {clause.severity} risk
      </p>
      <blockquote className="mb-3 border-l border-ink/15 pl-3 text-sm text-ink/80 italic">
        &ldquo;{clause.quote}&rdquo;
      </blockquote>
      <p className="mb-3 text-sm text-ink/75">{clause.issue}</p>
      <div className="border-t border-ink/10 pt-3">
        <p className="mb-2 text-[10px] font-medium tracking-[0.14em] text-mute uppercase">
          Suggested reply
        </p>
        <p className="mb-3 text-sm text-ink">{clause.reply}</p>
        <button type="button" onClick={copyReply} className="btn-ink px-3 py-1.5 text-xs">
          {copied ? "Copied" : "Copy reply"}
        </button>
      </div>
    </article>
  );
}
