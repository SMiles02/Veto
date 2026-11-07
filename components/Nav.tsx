import Link from "next/link";

const links = [
  { href: "/", label: "Scan" },
  { href: "/lease", label: "Lease" },
  { href: "/toolkit", label: "Toolkit" },
];

export function Nav({
  active,
  tone = "solid",
}: {
  active?: string;
  tone?: "solid" | "hero";
}) {
  const hero = tone === "hero";

  return (
    <header
      className={`sticky top-0 z-40 ${
        hero
          ? "border-b border-white/10 bg-ink/25 backdrop-blur-md"
          : "border-b border-ink/10 bg-paper/90 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span
            className={`font-display text-2xl font-extrabold tracking-tight sm:text-3xl ${
              hero ? "text-white" : "text-ink"
            }`}
          >
            Veto
          </span>
          <span
            className={`hidden text-[11px] tracking-[0.18em] uppercase sm:inline ${
              hero ? "text-white/55" : "text-mute"
            }`}
          >
            before you pay
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive = active === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-sm px-3 py-1.5 text-sm transition ${
                  hero
                    ? isActive
                      ? "bg-white text-ink"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                    : isActive
                      ? "bg-ink text-paper"
                      : "text-ink/65 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
