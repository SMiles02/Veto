"use client";

import type { LeaseClause } from "@/lib/veto/types";
import { useState } from "react";

const severityStyles = {
  high: "border-veto/40 bg-veto/5",
  medium: "border-negotiate/40 bg-negotiate/5",
  low: "border-clear/40 bg-clear/5",
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
      className={`rounded-lg border p-4 ${severityStyles[clause.severity]}`}
    >
      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-mute">
        {clause.severity} risk
      </p>
      <blockquote className="mb-3 border-l-2 border-ink/20 pl-3 font-display text-sm italic text-ink/80">
        “{clause.quote}”
      </blockquote>
      <p className="mb-3 text-sm text-ink/80">{clause.issue}</p>
      <div className="rounded-md bg-white/80 p-3">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-mute">
          Suggested reply
        </p>
        <p className="mb-3 text-sm text-ink">{clause.reply}</p>
        <button
          type="button"
          onClick={copyReply}
          className="rounded-md bg-ink px-3 py-1.5 text-xs text-paper transition hover:bg-ink/85"
        >
          {copied ? "Copied" : "Copy reply"}
        </button>
      </div>
    </article>
  );
}
