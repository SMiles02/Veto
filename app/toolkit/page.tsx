import { Nav } from "@/components/Nav";
import Link from "next/link";

const checklist = [
  "Exact address matches Google Street View / maps",
  "View in person before any deposit",
  "Test the keys yourself on viewing day",
  "Check the Register on RTB (Found = Y/N) or digs explanation",
  "Ask for RTB number if the register returns Found = N",
  "Get a written lease and a receipt. Never cash only.",
  "Compare rent to nearby ads before accepting",
  "Photograph metre readings and room condition on move-in",
];

const rights = [
  {
    name: "RTB Check the Register",
    href: "https://rtb.ie/compliance/check-the-register/",
    blurb: "Official Found = Y/N check for a rented address / Eircode",
  },
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
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-14">
          <p className="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
            Toolkit
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            From the listing to getting your deposit back
          </h1>
          <p className="mt-3 max-w-lg text-ink/65">
            Use this for viewing and signing. More tools for living in and
            moving out are next.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="section-title text-2xl">ViewKit</h2>
          <p className="mt-2 mb-5 text-sm text-mute">
            Checklist for viewing day.
          </p>
          <ol className="space-y-3">
            {checklist.map((item, i) => (
              <li key={item} className="flex gap-4 text-sm text-ink/80">
                <span className="w-6 shrink-0 font-display font-semibold text-tide">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-14 border-t border-ink/10 pt-10">
          <h2 className="section-title text-2xl">RightsRail</h2>
          <p className="mt-2 mb-5 text-sm text-mute">
            Places to go if something feels wrong.
          </p>
          <ul className="space-y-5">
            {rights.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-tide"
                >
                  {item.name}
                </a>
                <p className="mt-1 text-sm text-ink/60">{item.blurb}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-ink/10 pt-10">
          <h2 className="section-title text-2xl">Coming next</h2>
          <p className="mt-2 mb-5 text-sm text-mute">
            Not built yet. Saving these for after the demo.
          </p>
          <ul className="space-y-4">
            {roadmap.map((item) => (
              <li key={item.name} className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="text-sm text-ink/60">{item.blurb}</p>
                </div>
                <span className="shrink-0 text-[10px] tracking-[0.14em] text-mute uppercase">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn-primary py-2.5">
              Scan a listing
            </Link>
            <Link href="/lease" className="btn-ghost py-2.5">
              Open LeaseLens
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
