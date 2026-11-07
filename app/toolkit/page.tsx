import { Nav } from "@/components/Nav";
import Link from "next/link";

const checklist = [
  "Exact address matches Google Street View / maps",
  "View in person before any deposit",
  "Test the keys yourself on viewing day",
  "Ask for RTB number (or digs/owner-occupied explanation)",
  "Get a written lease + receipt - never cash-only",
  "Compare rent to nearby ads before accepting",
  "Photograph metre readings and room condition on move-in",
];

const rights = [
  {
    name: "RTB",
    href: "https://www.rtb.ie/",
    blurb: "Register / dispute deposits and tenancy issues",
  },
  {
    name: "Threshold",
    href: "https://threshold.ie/",
    blurb: "Housing charity advice for renters in trouble",
  },
  {
    name: "UCC accommodation advice",
    href: "https://www.ucc.ie/en/accommodation/privaterentals/",
    blurb: "Official scam checks and StudentPad guidance",
  },
  {
    name: "CCPC scam tips",
    href: "https://www.ccpc.ie/",
    blurb: "Consumer protection guidance on rental fraud",
  },
];

const roadmap = [
  {
    name: "RepairLog",
    status: "Next",
    blurb: "Photo evidence diary + landlord chase templates",
  },
  {
    name: "DepositBack",
    status: "Next",
    blurb: "Move-out pack and reclaim letter when deposits stick",
  },
  {
    name: "Watchlist",
    status: "Soon",
    blurb: "Planning alerts on streets you care about",
  },
];

export default function ToolkitPage() {
  return (
    <div className="min-h-screen">
      <Nav active="/toolkit" />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-veto">Toolkit</p>
          <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
            From listing to deposit back
          </h1>
          <p className="mt-3 text-ink/70">
            Today covers verify and sign. Live-in and move-out tools are next.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-ink/10 bg-white/70 p-5">
            <h2 className="font-display text-2xl text-ink">ViewKit</h2>
            <p className="mt-1 mb-4 text-sm text-mute">
              Keep this list in your head on viewing day.
            </p>
            <ul className="space-y-3">
              {checklist.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-ink/80">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-veto" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-ink/10 bg-white/70 p-5">
            <h2 className="font-display text-2xl text-ink">RightsRail</h2>
            <p className="mt-1 mb-4 text-sm text-mute">Useful links when something feels off.</p>
            <ul className="space-y-4">
              {rights.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-veto"
                  >
                    {item.name}
                  </a>
                  <p className="text-sm text-ink/65">{item.blurb}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-ink/10 bg-white/70 p-5">
            <h2 className="font-display text-2xl text-ink">Coming next</h2>
            <p className="mt-1 mb-4 text-sm text-mute">Not built yet - parked for after the demo.</p>
            <ul className="space-y-4">
              {roadmap.map((item) => (
                <li
                  key={item.name}
                  className="rounded-lg border border-dashed border-ink/15 bg-paper/50 p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-medium text-ink">{item.name}</p>
                    <span className="text-[10px] uppercase tracking-wider text-mute">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink/65">{item.blurb}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/"
                className="rounded-md bg-veto px-4 py-2 text-xs font-semibold tracking-wide text-white"
              >
                Scan a listing
              </Link>
              <Link
                href="/lease"
                className="rounded-md border border-ink/20 px-4 py-2 text-xs tracking-wide text-ink"
              >
                Open LeaseLens
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
